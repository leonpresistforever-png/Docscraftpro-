import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

// In-browser helper to clean and optimize prompts for local execution
export function compactPromptForLocal(promptText: string): string {
  if (!promptText) return "";
  
  // High-density trimming to avoid WebGPU VRAM crash
  let cleaned = promptText.trim();
  
  // If the prompt is too long, truncate it to avoid overflowing local model context windows (roughly ~1000 tokens / 4000 characters)
  if (cleaned.length > 4000) {
    cleaned = cleaned.substring(0, 4000) + "...\n[Content truncated for WebGPU model performance]";
  }
  
  return cleaned;
}

// LangChain runnable sequence for local LLM processing
export async function runLocalChain(
  localEngine: any,
  systemText: string,
  userPrompt: string,
  maxLength: number = 800
): Promise<string> {
  if (!localEngine) {
    throw new Error("Local WebGPU AI engine is not initialized.");
  }

  try {
    // 1. Setup Prompt Template using LangChain core structures
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", compactPromptForLocal(systemText)],
      ["user", "{input}"]
    ]);

    // 2. Simple output parser
    const outputParser = new StringOutputParser();

    // 3. Compact the user input
    const compactedInput = compactPromptForLocal(userPrompt);

    // 4. Run chain-style execution safely
    console.log("[LangChain Local Engine] Formatting local prompt sequence to prevent GPU crash...");
    const formattedPrompt = await promptTemplate.format({ input: compactedInput });
    
    // Convert formatted prompt back to chat array compatible with WebLLM OpenAI interface
    const messages = [
      { role: "system", content: compactPromptForLocal(systemText) },
      { role: "user", content: compactedInput }
    ];

    // WebLLM API execution inside our safety wrapper
    const response = await localEngine.chat.completions.create({
      messages,
      max_tokens: Math.min(maxLength, 1024), // Do not exceed 1024 to protect local GPU threads
      temperature: 0.3, // Lower temp for more stable structured outputs
    });

    const result = response.choices[0]?.message?.content || "";
    return result;
  } catch (error: any) {
    console.error("[LangChain Local Engine Error]", error);
    throw new Error(`WebGPU Execution failed: ${error.message || error}`);
  }
}
