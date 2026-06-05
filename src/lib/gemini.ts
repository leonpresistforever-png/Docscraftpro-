import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function handleGeminiError(e: any): string {
  console.error("Gemini API Error:", e);
  if (e.message?.includes("403") || e.message?.toLowerCase().includes("access denied")) {
    return "Error: Add genuine key";
  }
  return "Error: " + e.message;
}

export async function askGeminiFlash(prompt: string, customApiKey?: string) {
  try {
    const response = await fetch('/api/ai/generate', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, customApiKey, isComplex: false }),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data.result;
  } catch (e) {
    return handleGeminiError(e);
  }
}

export async function askGeminiProComplex(prompt: string, customApiKey?: string) {
  try {
    const response = await fetch('/api/ai/generate', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, customApiKey, isComplex: true }),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data.result;
  } catch (e) {
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

export { ai };
