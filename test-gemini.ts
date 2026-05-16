import { GoogleGenAI } from "@google/genai";

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'test'
    });
    console.log(response.text);
  } catch(e: any) {
    console.error(e.message);
  }
}
test();
