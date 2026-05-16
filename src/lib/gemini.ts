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
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: prompt }
        ]
      }
    });
    return response.text;
  } catch (e) {
    return handleGeminiError(e);
  }
}

export async function generateImage(prompt: string, size: "512px" | "1K" | "2K" | "4K" = "1K", aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "1:4" | "1:8" | "4:1" | "8:1" = "1:1") {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: size
        }
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) {
    throw new Error(handleGeminiError(e));
  }
}

export async function textToSpeech(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (e) {
    throw new Error(handleGeminiError(e));
  }
}

export async function generateVideo(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') {
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-lite-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: aspectRatio
      }
    });
    return operation;
  } catch (e) {
    throw new Error(handleGeminiError(e));
  }
}

export async function generateMusic(prompt: string) {
  try {
    const response = await ai.models.generateContentStream({
      model: "lyria-3-clip-preview",
      contents: prompt,
    });

    let audioBase64 = "";
    let mimeType = "audio/wav";

    for await (const chunk of response) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
      }
    }
    return { audioBase64, mimeType };
  } catch (e) {
    throw new Error(handleGeminiError(e));
  }
}

export async function searchGoogle(prompt: string) {
  try {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} } as any],
            toolConfig: { includeServerSideToolInvocations: true } as any
        }
    });
    return response.text;
  } catch (e) {
    return handleGeminiError(e);
  }
}

export { ai };
