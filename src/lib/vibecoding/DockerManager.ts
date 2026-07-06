import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export class DockerManager {
  private containerMap: Map<string, string> = new Map();

  /**
   * Provisions a new Docker container for the given session UUID.
   */
  async provisionContainer(sessionUuid: string): Promise<string> {
    if (this.containerMap.has(sessionUuid)) {
      return this.containerMap.get(sessionUuid)!;
    }

    const hostProjectsDir = process.env.HOST_PROJECTS_DIR || path.join(process.cwd(), 'projects');
    const projectDir = path.join(hostProjectsDir, sessionUuid);

    // Ensure the project directory exists on the host
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    // Start a long-running, lightweight container (node:alpine)
    // We bind port 3000 -> 3000 for preview server
    // We use -v to map the host directory to /workspace
    const cmd = `docker run -d --name vibe-${sessionUuid} -p 3000:3000 -v ${projectDir}:/workspace -w /workspace node:18-alpine tail -f /dev/null`;
    
    try {
      const { stdout } = await execAsync(cmd);
      const containerId = stdout.trim();
      this.containerMap.set(sessionUuid, containerId);
      console.log(`[DockerManager] Provisioned container ${containerId} for session ${sessionUuid}`);
      
      // Install basic tools
      await this.executeCommand(sessionUuid, 'apk add --no-cache git build-base python3 py3-pip');
      
      return containerId;
    } catch (error: any) {
      console.error(`[DockerManager] Failed to provision container:`, error);
      throw new Error(`Failed to provision Docker container: ${error.message}`);
    }
  }

  /**
   * Executes a terminal command inside the specified session's container.
   */
  async executeCommand(sessionUuid: string, command: string): Promise<{ stdout: string, stderr: string }> {
    const containerId = this.containerMap.get(sessionUuid);
    if (!containerId) {
      throw new Error(`Container not found for session ${sessionUuid}`);
    }

    // Escaping double quotes for the shell command inside docker exec
    const escapedCommand = command.replace(/"/g, '\\"');
    const cmd = `docker exec -w /workspace ${containerId} sh -c "${escapedCommand}"`;

    try {
      const { stdout, stderr } = await execAsync(cmd);
      return { stdout, stderr };
    } catch (error: any) {
      // exec throws an error if exit code is not 0, but we want to capture stdout/stderr to send to Gemini
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message
      };
    }
  }

  /**
   * Writes a file to the container volume.
   */
  async writeFile(sessionUuid: string, filePath: string, content: string): Promise<void> {
    const hostProjectsDir = process.env.HOST_PROJECTS_DIR || path.join(process.cwd(), 'projects');
    const fullPath = path.join(hostProjectsDir, sessionUuid, filePath);
    
    // Ensure directories exist
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, content, 'utf8');
  }

  /**
   * Reads a file from the container volume.
   */
  async readFile(sessionUuid: string, filePath: string): Promise<string> {
    const hostProjectsDir = process.env.HOST_PROJECTS_DIR || path.join(process.cwd(), 'projects');
    const fullPath = path.join(hostProjectsDir, sessionUuid, filePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    return fs.readFileSync(fullPath, 'utf8');
  }

  /**
   * Cleans up idle containers (to be called via cron/interval).
   */
  async cleanupContainer(sessionUuid: string): Promise<void> {
    const containerId = this.containerMap.get(sessionUuid);
    if (containerId) {
      try {
        await execAsync(`docker rm -f ${containerId}`);
        this.containerMap.delete(sessionUuid);
        console.log(`[DockerManager] Cleaned up container ${containerId}`);
      } catch (e) {
        console.error(`[DockerManager] Error removing container ${containerId}:`, e);
      }
    }
  }
}

export const dockerManager = new DockerManager();
