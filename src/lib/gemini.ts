import { GoogleGenAI } from "@google/genai";

// Safe wrapper to prevent crash in browser environments where process or env is not defined
let aiClient: any = null;
try {
  const isServer = typeof process !== 'undefined' && process.env;
  const apiKey = isServer ? process.env?.GEMINI_API_KEY : undefined;
  if (apiKey) {
    aiClient = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.log("SDK client init bypassed or deferred to client key", e);
}

export { aiClient as ai };

function handleGeminiError(e: any): string {
  console.error("Gemini API Client Error:", e);
  const errMsg = e?.message || String(e);
  if (errMsg.includes("403") || errMsg.toLowerCase().includes("access denied")) {
    return "Error: Add genuine key";
  }
  return "Error: " + errMsg;
}

/**
 * Direct Client-Side LLM Call using REST interfaces.
 * This completely bypasses backend server requirements when running on static hosts like Vercel.
 */
export async function directLlmCall(params: {
  prompt: string;
  systemInstruction?: string;
  customApiKey?: string;
  customModel?: string;
  isComplex?: boolean;
}) {
  const { prompt, systemInstruction, customApiKey, customModel, isComplex } = params;
  if (!customApiKey) {
    throw new Error("API Key configuration is missing. Please provide a BYOK key in settings.");
  }

  const apiKey = customApiKey.trim();

  // 1. Groq Direct REST
  if (apiKey.startsWith("gsk_")) {
    const model = customModel || "llama-3.3-70b-versatile";
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model, messages, temperature: 0.7 })
    });

    if (!response.ok) {
      throw new Error(`Groq Direct API error (Status ${response.status}): ${await response.text()}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } 
  
  // 2. OpenRouter Direct REST
  if (apiKey.startsWith("sk-or-")) {
    const model = customModel || "qwen/qwen-2.5-72b-instruct";
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model, messages, temperature: 0.7 })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter Direct API error (Status ${response.status}): ${await response.text()}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } 
  
  // 3. SambaNova Direct REST
  if (apiKey.includes("-") && apiKey.length > 50) {
    const model = customModel || "Meta-Llama-3.3-70B-Instruct";
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model, messages, temperature: 0.7 })
    });

    if (!response.ok) {
      throw new Error(`SambaNova Direct API error (Status ${response.status}): ${await response.text()}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } 

  // 4. Gemini Direct REST
  const modelName = customModel || (isComplex ? 'gemini-3.1-pro-preview' : 'gemini-3.5-flash');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const body: any = {
    contents: [{ parts: [{ text: prompt }] }]
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Gemini Direct API error (Status ${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (textResult === undefined) {
    throw new Error("No response text returned from Gemini Direct API. Response:\n" + JSON.stringify(data));
  }
  return textResult;
}

export async function askGeminiFlash(prompt: string, customApiKey?: string) {
  try {
    // 1. Try server-side proxy route first
    const response = await fetch('/api/ai/generate', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, customApiKey, isComplex: false }),
    });
    
    if (response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (data.result) return data.result;
      }
    }
    
    // 2. If response is not OK or not JSON, fallback gracefully to client direct REST when BYOK is configured
    if (customApiKey) {
      console.log("[Fallback] Server generated endpoint returned non-JSON. Invoking direct client REST API...");
      return await directLlmCall({
        prompt,
        customApiKey,
        isComplex: false
      });
    }
    
    throw new Error("Server API failed and no client-side BYOK key is configured.");
  } catch (e) {
    if (customApiKey) {
      console.warn("[Fallback] Calling server generated endpoint failed, invoking direct client REST API...", e);
      try {
        return await directLlmCall({
          prompt,
          customApiKey,
          isComplex: false
        });
      } catch (directErr: any) {
        return handleGeminiError(directErr);
      }
    }
    return handleGeminiError(e);
  }
}

export async function askGeminiProComplex(prompt: string, customApiKey?: string) {
  try {
    // 1. Try server-side proxy route first
    const response = await fetch('/api/ai/generate', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, customApiKey, isComplex: true }),
    });
    
    if (response.ok) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (data.result) return data.result;
      }
    }
    
    // 2. Fallback gracefully to client direct REST when BYOK is configured
    if (customApiKey) {
      console.log("[Fallback] Server generated endpoint returned non-JSON. Invoking direct client REST API...");
      return await directLlmCall({
        prompt,
        customApiKey,
        isComplex: true
      });
    }
    
    throw new Error("Server API failed and no client-side BYOK key is configured.");
  } catch (e) {
    if (customApiKey) {
      console.warn("[Fallback] Calling server generated endpoint failed, invoking direct client REST API...", e);
      try {
        return await directLlmCall({
          prompt,
          customApiKey,
          isComplex: true
        });
      } catch (directErr: any) {
        return handleGeminiError(directErr);
      }
    }
    return handleGeminiError(e);
  }
}

export async function analyzeImage(base64Image: string, mimeType: string, prompt: string) {
  try {
    const response = await fetch('/api/ai/generate', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        prompt: `Analyze the following image. Prompt: ${prompt}. Mime: ${mimeType}. Base64 data: ${base64Image.substring(0, 100)}...`, 
        isComplex: true 
      }),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data.result;
  } catch (e) {
    return handleGeminiError(e);
  }
}

export async function generateImage(prompt: string, size: "512px" | "1K" | "2K" | "4K" = "1K", aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "1:4" | "1:8" | "4:1" | "8:1" = "1:1") {
  try {
    const response = await fetch('/api/ai/generate-image', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, size, aspectRatio }),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data.result;
  } catch (e) {
    throw new Error(handleGeminiError(e));
  }
}

export async function textToSpeech(text: string) {
  try {
    const response = await fetch('/api/ai/text-to-speech', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data.result;
  } catch (e) {
    throw new Error(handleGeminiError(e));
  }
}

export async function generateVideo(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') {
  try {
    const response = await fetch('/api/ai/generate-video', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, aspectRatio }),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data.result;
  } catch (e) {
    throw new Error(handleGeminiError(e));
  }
}

export async function generateMusic(prompt: string) {
  try {
    const response = await fetch('/api/ai/generate-music', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data.result;
  } catch (e) {
    throw new Error(handleGeminiError(e));
  }
}

export async function searchGoogle(prompt: string) {
  try {
    const response = await fetch('/api/ai/generate', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: `Search Google: ${prompt}`, isComplex: false }),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data.result;
  } catch (e) {
    return handleGeminiError(e);
  }
}
