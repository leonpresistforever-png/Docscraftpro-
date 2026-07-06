import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { dockerManager } from './DockerManager';

export class BackendOrchestrator {
  private sessions: Map<string, { stepCount: number }> = new Map();
  private maxAutonomousSteps = 5;

  private tools: FunctionDeclaration[] = [
    {
      name: "write_file",
      description: "Write content to a specific file path in the workspace.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          path: { type: Type.STRING, description: "The relative path to the file (e.g. src/index.js)" },
          content: { type: Type.STRING, description: "The complete file content to write" }
        },
        required: ["path", "content"]
      }
    },
    {
      name: "read_file",
      description: "Read the content of a specific file in the workspace.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          path: { type: Type.STRING, description: "The relative path to the file" }
        },
        required: ["path"]
      }
    },
    {
      name: "execute_terminal_command",
      description: "Execute a bash terminal command inside the docker workspace.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          command: { type: Type.STRING, description: "The terminal command to execute (e.g., npm install express)" }
        },
        required: ["command"]
      }
    },
    {
      name: "web_search",
      description: "Search the web for documentation or external information.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: { type: Type.STRING, description: "The search query" }
        },
        required: ["query"]
      }
    }
  ];

  async initializeSession(sessionUuid: string): Promise<void> {
    if (!this.sessions.has(sessionUuid)) {
      this.sessions.set(sessionUuid, { stepCount: 0 });
      await dockerManager.provisionContainer(sessionUuid);
    }
  }

  resetStepCount(sessionUuid: string) {
    if (this.sessions.has(sessionUuid)) {
      this.sessions.get(sessionUuid)!.stepCount = 0;
    }
  }

  async runAgentLoop(sessionUuid: string, prompt: string, apiKey: string, chatHistory: any[]): Promise<any> {
    await this.initializeSession(sessionUuid);
    const session = this.sessions.get(sessionUuid)!;

    if (session.stepCount >= this.maxAutonomousSteps) {
      return {
        status: "paused",
        message: "Maximum autonomous steps reached. Would you like the agent to continue?",
        requiresUserValidation: true
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const messages = [
      {
        role: "system",
        content: `You are a vibecoding agent. You have access to a Docker sandbox via tools. 
Always use tools to write files and execute commands. 
Start your preview server on port 3000.`
      },
      ...chatHistory,
      { role: "user", content: prompt }
    ];

    try {
      // Create chat session
      const chat = ai.chats.create({
        model: "gemini-3.1-pro-preview",
        config: {
          tools: [{ functionDeclarations: this.tools }]
        }
      });

      // We manually build history to pass into the chat
      // For simplicity in this architectural demo, we send a single message and handle function calls
      const response = await chat.sendMessage({ message: prompt });
      
      session.stepCount++;

      // Process function calls
      if (response.functionCalls && response.functionCalls.length > 0) {
        const functionResponses: any[] = [];
        
        for (const call of response.functionCalls) {
          const args = call.args as any;
          let result: any = {};
          
          if (call.name === "write_file") {
            await dockerManager.writeFile(sessionUuid, args.path, args.content);
            result = { success: true, message: `Wrote file ${args.path}` };
          } else if (call.name === "read_file") {
            try {
              const content = await dockerManager.readFile(sessionUuid, args.path);
              result = { success: true, content };
            } catch (e: any) {
              result = { success: false, error: e.message };
            }
          } else if (call.name === "execute_terminal_command") {
            const { stdout, stderr } = await dockerManager.executeCommand(sessionUuid, args.command);
            result = { success: true, stdout, stderr };
          } else if (call.name === "web_search") {
            // Mock web search
            result = { success: true, results: "Web search results mock..." };
          }
          
          functionResponses.push({
            id: call.id,
            name: call.name,
            response: result
          });
        }
        
        // After executing tools, send results back to Gemini (recursive loop)
        // In a full implementation, you would recursively call chat.sendMessage with functionResponses
        // Here we just return the tool execution info to the frontend for logging
        return {
          status: "tool_executed",
          toolResults: functionResponses,
          stepCount: session.stepCount
        };
      }

      return {
        status: "success",
        message: response.text,
        stepCount: session.stepCount
      };

    } catch (e: any) {
      console.error("[BackendOrchestrator] Error:", e);
      throw new Error(`Agent loop failed: ${e.message}`);
    }
  }
}

export const backendOrchestrator = new BackendOrchestrator();
