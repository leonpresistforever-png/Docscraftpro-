/**
 * FrontendAPI Wrapper for the Vibecoding Architecture
 * Handles BYOK, localStorage management, and communicating with the Backend Orchestrator.
 */

export class VibecodingAPI {
  private static readonly API_KEY_STORAGE = 'gemini_byok_key';
  
  /**
   * Retrieves the user's BYOK from local storage.
   */
  static getApiKey(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.API_KEY_STORAGE);
    }
    return null;
  }

  /**
   * Saves the user's BYOK to local storage.
   */
  static saveApiKey(key: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.API_KEY_STORAGE, key);
    }
  }

  /**
   * Generates or retrieves a unique session UUID for the current workspace.
   */
  static getSessionUuid(): string {
    let session = sessionStorage.getItem('vibe_session_uuid');
    if (!session) {
      session = 'vibe-' + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('vibe_session_uuid', session);
    }
    return session;
  }

  /**
   * Sends a prompt to the backend orchestrator loop.
   */
  static async sendPrompt(prompt: string, chatHistory: any[] = []): Promise<any> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("Missing Gemini API Key. Please configure it in settings.");
    }

    const sessionUuid = this.getSessionUuid();

    const response = await fetch('/api/vibecoding/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        sessionUuid,
        prompt,
        chatHistory
      })
    });

    if (!response.ok) {
      let errorMsg = response.statusText;
      try {
        const errJson = await response.json();
        errorMsg = errJson.error || errorMsg;
      } catch (e) {}
      throw new Error(`Failed to run agent: ${errorMsg}`);
    }

    return response.json();
  }

  /**
   * Resumes the agent loop after human validation (e.g., when reaching max steps).
   */
  static async resumeAgent(): Promise<any> {
    const apiKey = this.getApiKey();
    const sessionUuid = this.getSessionUuid();

    const response = await fetch('/api/vibecoding/resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ sessionUuid })
    });

    if (!response.ok) {
      throw new Error("Failed to resume agent");
    }

    return response.json();
  }

  /**
   * Returns the dynamic preview URL for the iframe.
   */
  static getPreviewUrl(): string {
    const sessionUuid = this.getSessionUuid();
    // Assuming the backend has dynamic routing setup as requested
    return `/preview/${sessionUuid}/`; 
  }
}
