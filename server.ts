import 'dotenv/config';
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Load Firebase Config to interact with Firestore REST API
  let firebaseConfig: any = null;
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8');
    firebaseConfig = JSON.parse(raw);
  } catch (e) {
    console.warn("Could not read firebase-applet-config.json in server.ts:", e);
  }

  app.get("/api/attachments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!firebaseConfig) {
        throw new Error("Firebase configuration not found on server.");
      }
      const projectId = firebaseConfig.projectId;
      const dbId = firebaseConfig.firestoreDatabaseId || "(default)";
      
      // Query Firestore REST API
      const rootUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/doc_attachments/${id}`;
      const docResponse = await fetch(rootUrl);
      
      if (!docResponse.ok) {
         return res.status(docResponse.status).send(`Failed to retrieve attachment from database: ${docResponse.statusText}`);
      }
      
      const docData: any = await docResponse.json();
      const fields = docData.fields;
      if (!fields || !fields.data || !fields.data.stringValue) {
         return res.status(404).send("Document Attachment data could not be parsed.");
      }
      
      const base64Str = fields.data.stringValue;
      const filename = fields.filename?.stringValue || "attachment";
      
      const commaIndex = base64Str.indexOf(',');
      let contentType = "application/octet-stream";
      let dataPayload = base64Str;
      
      if (commaIndex !== -1) {
         const meta = base64Str.substring(0, commaIndex);
         const match = meta.match(/data:([^;]+);base64/);
         if (match) {
            contentType = match[1];
         }
         dataPayload = base64Str.substring(commaIndex + 1);
      }
      
      const buffer = Buffer.from(dataPayload, 'base64');
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      res.send(buffer);
    } catch (err: any) {
      console.error("[Attachment Serv] error:", err);
      res.status(500).send(`Server error: ${err.message}`);
    }
  });

  app.get("/api/video-proxy", async (req, res) => {
    try {
      const fileId = "1ZukrOqNACYHCrq8euKUTayf1u5jvyXvw";
      const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const response = await fetch(driveUrl);
      if (!response.ok) {
        throw new Error(`Google Drive fetch failed: ${response.statusText}`);
      }
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      
      const reader = response.body?.getReader();
      if (!reader) {
        return res.status(500).send("Failed to get stream reader from Google Drive.");
      }
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      res.end();
    } catch (err: any) {
      console.error("[Video Proxy] error:", err);
      res.status(500).send(`Server error: ${err.message}`);
    }
  });

  app.post("/api/support", async (req, res) => {
    try {
      const { username, email, issue } = req.body;
      console.log(`[Support Ticket] From: ${username} (${email})\nIssue: ${issue}`);
      // In a real app, you would use an email service like SendGrid, Resend, or Nodemailer here to send the email to leonpresistforever@gmail.com
      res.json({ success: true, message: "Support ticket logged successfully." });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/proxy/chat/json", async (req, res) => {
    try {
      const { baseUrl, apiKey, modelName, messages, temperature, max_tokens } = req.body;
      let fetchUrl = baseUrl ? baseUrl.trim() : (process.env.CUSTOM_AI_BASE_URL || "https://models.inference.ai.azure.com/chat/completions");
      const serverKey = process.env.GITHUB_MODEL_API_KEY || process.env.CUSTOM_AI_API_KEY || process.env.AI_SHEETS_API_KEY || "";
      const finalKey = apiKey ? apiKey.trim() : serverKey;
      const defaultModel = fetchUrl.includes('azure') || fetchUrl.includes('github') ? 'gpt-4o' : 'glm-4';
      const trimmedModelName = modelName ? modelName.trim() : (process.env.CUSTOM_AI_MODEL_NAME || defaultModel);

      if (fetchUrl.endsWith('/')) fetchUrl = fetchUrl.slice(0, -1);
      if (!fetchUrl.endsWith('/chat/completions') && !fetchUrl.endsWith('/api/chat') && !fetchUrl.endsWith('/v1/chat')) {
         fetchUrl = `${fetchUrl}/chat/completions`;
      }
      
      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${finalKey}`
        },
        body: JSON.stringify({
          model: trimmedModelName,
          messages,
          temperature,
          max_tokens
        })
      });
      
      if (!response.ok) {
        const err = await response.text();
        return res.status(response.status).json({ error: err });
      }

      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/proxy/chat", async (req, res) => {
    try {
      const { baseUrl, apiKey, modelName, finalPrompt, compiledContext, messages: _messages } = req.body;
      
      let fetchUrl = baseUrl ? baseUrl.trim() : (process.env.CUSTOM_AI_BASE_URL || "https://models.inference.ai.azure.com/chat/completions");
      
      const serverKey = process.env.GITHUB_MODEL_API_KEY || process.env.CUSTOM_AI_API_KEY || process.env.GLM_API_KEY || "";
      const finalKey = apiKey ? apiKey.trim() : serverKey;
      
      const defaultModel = fetchUrl.includes('azure') || fetchUrl.includes('github') ? 'gpt-4o' : 'glm-4';
      const trimmedModelName = modelName ? modelName.trim() : (process.env.CUSTOM_AI_MODEL_NAME || defaultModel);

      // Remove trailing slash if present to normalize
      if (fetchUrl.endsWith('/')) {
         fetchUrl = fetchUrl.slice(0, -1);
      }
      if (!fetchUrl.endsWith('/chat/completions') && !fetchUrl.endsWith('/api/chat') && !fetchUrl.endsWith('/v1/chat') && !fetchUrl.endsWith('/api/generate')) {
         fetchUrl = `${fetchUrl}/chat/completions`;
      }
      
      console.log("[AI Proxy] Requesting URL:", fetchUrl, "Model:", trimmedModelName);
      
      const bodyPayload: any = {
         ...(trimmedModelName ? { model: trimmedModelName } : {}),
         stream: true
      };
      
      if (_messages && Array.isArray(_messages)) {
         bodyPayload.messages = _messages;
      } else {
         bodyPayload.messages = [
            { role: 'system', content: finalPrompt },
            { role: 'user', content: compiledContext }
         ];
      }

      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${finalKey}`
        },
        body: JSON.stringify(bodyPayload)
      });
      
      if (!response.ok) {
        const err = await response.text();
        console.error("[AI Proxy] Target returned error:", response.status, err);
        return res.status(response.status).json({ error: err });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      
      if (response.body) {
         const reader = response.body.getReader();
         const readStream = async () => {
            while (true) {
               const { done, value } = await reader.read();
               if (done) break;
               res.write(value);
            }
            res.end();
         };
         readStream().catch(err => {
            console.error("Stream error:", err);
            res.end();
         });
      } else {
         res.end();
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/assembly/transcribe", express.raw({ type: '*/*', limit: '50mb' }), async (req, res) => {
    try {
      const customKey = req.headers["x-custom-assembly-key"] as string;
      const apiKey = customKey || process.env.ASSEMBLY_AI_API_KEY;
      if (!apiKey) {
        throw new Error("ASSEMBLY_AI_API_KEY environment variable is required");
      }
      
      const audioData = req.body;
      if (!audioData || audioData.length === 0) {
        return res.status(400).json({ error: "No audio data provided" });
      }

      console.log(`[Assembly] Received audio block of size ${audioData.length} bytes`);

      // 1. Upload the audio file to AssemblyAI
      const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: {
          "Authorization": apiKey,
          "Content-Type": "application/octet-stream"
        },
        body: audioData
      });
      
      if (!uploadRes.ok) {
        throw new Error("Failed to upload audio to AssemblyAI: " + await uploadRes.text());
      }
      
      const uploadData = await uploadRes.json();
      const audioUrl = uploadData.upload_url;
      
      console.log(`[Assembly] Uploaded audio: ${audioUrl}`);

      // 2. Transcribe the audio
      const transcriptRes = await fetch("https://api.assemblyai.com/v2/transcript", {
         method: "POST",
         headers: {
            "Authorization": apiKey,
            "Content-Type": "application/json"
         },
         body: JSON.stringify({
             audio_url: audioUrl,
             speech_models: ["universal-2"]
         })
      });
      
      if (!transcriptRes.ok) {
        throw new Error("Failed to start transcription: " + await transcriptRes.text());
      }
      
      const transcriptData = await transcriptRes.json();
      const transcriptId = transcriptData.id;
      
      console.log(`[Assembly] Started transcription: ${transcriptId}`);
      
      return res.json({ transcriptId });
    } catch (e: any) {
      console.error("[Assembly] exception:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/assembly/poll/:transcriptId", async (req, res) => {
    try {
      const customKey = req.headers["x-custom-assembly-key"] as string;
      const apiKey = customKey || process.env.ASSEMBLY_AI_API_KEY;
      if (!apiKey) {
        throw new Error("ASSEMBLY_AI_API_KEY environment variable is required");
      }
      const { transcriptId } = req.params;

      const pollingEndpoint = `https://api.assemblyai.com/v2/transcript/${transcriptId}`;
      const pollRes = await fetch(pollingEndpoint, {
        headers: { "Authorization": apiKey }
      });
      const pollData = await pollRes.json();
      
      if (pollData.status === 'completed') {
         return res.json({ status: 'completed', text: pollData.text });
      } else if (pollData.status === 'error') {
         return res.json({ status: 'error', error: pollData.error });
      }
      
      return res.json({ status: pollData.status || 'processing' });
    } catch (e: any) {
      console.error("[Assembly] poll exception:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { prompt, customApiKey, isComplex, customModel } = req.body;
      const systemKey = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY;
      const apiKey = customApiKey || systemKey;

      if (!apiKey) {
         throw new Error("API Key configuration is missing. Please provide a BYOK key.");
      }
      
      let responseText = "";

      if (apiKey.startsWith("gsk_")) {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                  model: customModel || "llama-3.3-70b-versatile",
                  messages: [{ role: "user", content: prompt }]
              })
          });
          const data = await response.json();
          responseText = data.choices[0]?.message?.content || "";
      } else if (apiKey.startsWith("sk-or-")) {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                  model: customModel || "qwen/qwen-2.5-72b-instruct",
                  messages: [{ role: "user", content: prompt }]
              })
          });
          const data = await response.json();
          responseText = data.choices[0]?.message?.content || "";
      } else if (apiKey.includes("-") && apiKey.length > 50) {
          const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
              method: "POST",
              headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                  model: customModel || "Meta-Llama-3.3-70B-Instruct",
                  messages: [{ role: "user", content: prompt }]
              })
          });
          const data = await response.json();
          responseText = data.choices[0]?.message?.content || "";
      } else {
          // Gemini
          const ai = new GoogleGenAI({ apiKey: apiKey });
          
          let config: any = {};
          if (isComplex) {
              config.thinkingConfig = { thinkingLevel: 'HIGH' };
          }
          
          const result = await ai.models.generateContent({
              model: customModel || (isComplex ? 'gemini-3.1-pro-preview' : 'gemini-3.5-flash'),
              contents: prompt,
              config: Object.keys(config).length > 0 ? config : undefined
          });
          responseText = result.text || "";
      }
      
      res.json({ result: responseText.trim() });
    } catch (e: any) {
      console.error("AI Generate Error:", e);
      res.status(500).json({ error: e.message || 'AI API failed' });
    }
  });

  app.post("/api/ai/process-transcript", async (req, res) => {
    try {
      const { text, customApiKey, customModel } = req.body;
      const systemKey = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY || process.env.SAMBANOVA_API_KEY;
      const apiKey = customApiKey || systemKey;

      if (!apiKey) {
         throw new Error("API Key configuration is missing. Please provide a BYOK key.");
      }
      
      const systemInstruction = `You are an expert technical writer and AI assistant helping a user build a comprehensive document from their dictated thoughts.
Take the provided raw voice transcript, research the core concepts, and structure it into a highly refined document.
Please do the following:
1. Understand the core concepts described and elaborate on them logically.
2. Structure the output with a clear, engaging Title.
3. Use semantic HTML tags (<h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <mark>) to build comprehensive sections that make the information flow seamlessly. Use <mark> to highlight key concepts.
4. Correct any grammar mistakes and rearrange facts so they are clear and structured.
5. Include a "Resources & Context" section at the end if there is relevant information to share (especially from the provided Context below).
6. CRITICAL: Only output the raw, valid HTML document. Do not include markdown formatting, code blocks (such as HTML blocks), or conversational filler like "Here is the document...". The output must be purely clean HTML ready to be injected.`;
                    
      let correctedText = "";

      if (apiKey.startsWith("gsk_")) {
          // Groq
          console.log("[AI] Using Groq (" + (customModel || "llama-3.3-70b-versatile") + ")");
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                  "Authorization": `Bearer ${apiKey}`,
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({
                  model: customModel || "llama-3.3-70b-versatile",
                  messages: [
                      { role: "system", content: systemInstruction },
                      { role: "user", content: "Transcript:\n" + text }
                  ]
              })
          });
          const data = await response.json();
          correctedText = data.choices[0]?.message?.content || "";
      } else if (apiKey.startsWith("sk-or-")) {
          // OpenRouter
          console.log("[AI] Using OpenRouter (" + (customModel || "qwen/qwen-2.5-72b-instruct") + ")");
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                  "Authorization": `Bearer ${apiKey}`,
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({
                  model: customModel || "qwen/qwen-2.5-72b-instruct",
                  messages: [
                      { role: "system", content: systemInstruction },
                      { role: "user", content: "Transcript:\n" + text }
                  ]
              })
          });
          const data = await response.json();
          correctedText = data.choices[0]?.message?.content || "";
      } else if (apiKey.includes("-") && apiKey.length > 50) {
          // SambaNova
          console.log("[AI] Using SambaNova");
          const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
              method: "POST",
              headers: {
                  "Authorization": `Bearer ${apiKey}`,
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({
                  model: customModel || "Meta-Llama-3.3-70B-Instruct",
                  messages: [
                      { role: "system", content: systemInstruction },
                      { role: "user", content: "Transcript:\n" + text }
                  ]
              })
          });
          const data = await response.json();
          correctedText = data.choices[0]?.message?.content || "";
      } else {
          // Gemini
          console.log("[AI] Using Gemini Default");
          const ai = new GoogleGenAI({ apiKey: apiKey });
          const result = await ai.models.generateContent({
              model: customModel || 'gemini-3.5-flash',
              contents: text,
              config: {
                  systemInstruction: systemInstruction
              }
          });
          correctedText = result.text || "";
      }
      
      // Strip potential markdown backticks that AI might still output
      if (correctedText.startsWith('```html')) {
        correctedText = correctedText.substring(7);
      } else if (correctedText.startsWith('```')) {
        correctedText = correctedText.substring(3);
      }
      if (correctedText.endsWith('```')) {
        correctedText = correctedText.substring(0, correctedText.length - 3);
      }
      res.json({ correctedText: correctedText.trim() });
    } catch (e: any) {
      console.error("AI SDK Error:", e);
      res.status(500).json({ error: e.message || 'AI API failed' });
    }
  });

  app.post("/api/ai/enhance-text", async (req, res) => {
    try {
      const { text, customApiKey } = req.body;
      const systemKey = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY || process.env.SAMBANOVA_API_KEY;
      const apiKey = customApiKey || systemKey;
      
      if (!apiKey) {
        throw new Error("API Key configuration is missing. Please provide a BYOK key.");
      }
      
      const systemInstruction = `You are a professional editor and document architect. Your task is to analyze and profoundly enhance the provided text for maximum readability, clarity, and impact.
Requirements:
1. Structure into beautiful appropriate headings (<h1>, <h2>, <h3>) and elegantly arrange large heading titles. Add inline CSS to make heading texts have beautiful colors.
2. Apply inline CSS to paragraph text to create beautiful text colors.
3. Highlight important text, key concepts, or critical information using the <mark> semantic HTML tag. Apply inline CSS to these <mark> tags to have beautiful background colors, smooth edges (border-radius: 6px), but transparent smooth highlights (e.g. rgba(..., 0.3) background).
4. Arrange thoughts logically and create compelling bulleted or numbered lists where appropriate.
5. Improve wording and rewrite awkward phrasing efficiently.
6. Create an HTML table containing data from the text, if applicable.
7. CRITICAL: Add beautiful insightful charts using Mermaid.js where appropriate if the text contains comparison data. Format mermaid code blocks inside HTML like <pre><code class="language-mermaid">...</code></pre>
8. CRITICAL: Only output the raw, valid HTML document. Do not include markdown formatting, code blocks (other than mermaid inside HTML), or conversational filler. The output must be purely clean.`;
      
      let enhancedText = "";

      if (apiKey.startsWith("gsk_")) {
          console.log("[AI Enhance] Using Groq (llama-3.3-70b-versatile)");
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                  model: "llama-3.3-70b-versatile",
                  messages: [{ role: "system", content: systemInstruction }, { role: "user", content: "Text:\n" + text }]
              })
          });
          const data = await response.json();
          enhancedText = data.choices[0]?.message?.content || "";
      } else if (apiKey.startsWith("sk-or-")) {
          console.log("[AI Enhance] Using OpenRouter (google/gemini-2.5-flash)");
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                  model: "google/gemini-2.5-flash",
                  messages: [{ role: "system", content: systemInstruction }, { role: "user", content: "Text:\n" + text }]
              })
          });
          const data = await response.json();
          enhancedText = data.choices[0]?.message?.content || "";
      } else if (apiKey.includes("-") && apiKey.length > 50) {
          console.log("[AI Enhance] Using SambaNova");
          const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
              method: "POST",
              headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                  model: "Meta-Llama-3.3-70B-Instruct",
                  messages: [{ role: "system", content: systemInstruction }, { role: "user", content: "Text:\n" + text }]
              })
          });
          const data = await response.json();
          enhancedText = data.choices[0]?.message?.content || "";
      } else {
          console.log("[AI Enhance] Using Gemini Default");
          const ai = new GoogleGenAI({ apiKey: apiKey });
          const result = await ai.models.generateContent({
              model: 'gemini-3.5-flash',
              contents: text,
              config: { systemInstruction: systemInstruction }
          });
          enhancedText = result.text || "";
      }
      
      // Strip potential markdown backticks that AI might output
      if (enhancedText.startsWith('```html')) {
        enhancedText = enhancedText.substring(7);
      } else if (enhancedText.startsWith('```')) {
        enhancedText = enhancedText.substring(3);
      }
      if (enhancedText.endsWith('```')) {
        enhancedText = enhancedText.substring(0, enhancedText.length - 3);
      }
      
      res.json({ enhancedText: enhancedText.trim() });
    } catch (e: any) {
      console.error("AI Error during enhancement:", e);
      res.status(500).json({ error: e.message || 'AI API failed' });
    }
  });

  app.post("/api/ai/generate-image", async (req, res) => {
    try {
      const { prompt, size, aspectRatio, customApiKey } = req.body;
      const systemKey = process.env.GEMINI_API_KEY;
      const apiKey = customApiKey || systemKey;
      if (!apiKey) {
        throw new Error("API Key configuration is missing. Please provide a BYOK key.");
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || "1:1",
            imageSize: size || "1K"
          }
        },
      });
      let resultUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          resultUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          break;
        }
      }
      res.json({ result: resultUrl });
    } catch (e: any) {
      console.error("Generate Image error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ai/text-to-speech", async (req, res) => {
    try {
      const { text, customApiKey } = req.body;
      const systemKey = process.env.GEMINI_API_KEY;
      const apiKey = customApiKey || systemKey;
      if (!apiKey) {
        throw new Error("API Key configuration is missing.");
      }
      const ai = new GoogleGenAI({ apiKey });
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
      res.json({ result: base64Audio });
    } catch (e: any) {
      console.error("TTS error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ai/generate-video", async (req, res) => {
    try {
      const { prompt, aspectRatio, customApiKey } = req.body;
      const systemKey = process.env.GEMINI_API_KEY;
      const apiKey = customApiKey || systemKey;
      if (!apiKey) {
        throw new Error("API Key configuration is missing.");
      }
      const ai = new GoogleGenAI({ apiKey });
      const operation = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: aspectRatio || '16:9'
        }
      });
      res.json({ result: operation });
    } catch (e: any) {
      console.error("Video error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ai/poll-video", async (req, res) => {
    try {
      const { operation, customApiKey } = req.body;
      const systemKey = process.env.GEMINI_API_KEY;
      const apiKey = customApiKey || systemKey;
      if (!apiKey) {
        throw new Error("API Key configuration is missing.");
      }
      if (!operation) {
        throw new Error("Missing operation payload.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const updated = await ai.operations.getVideosOperation({ operation });

      if (!updated.done) {
        return res.json({ done: false, operation: updated });
      }

      const generated = updated.response?.generatedVideos?.[0];
      const videoFile = generated?.video;
      if (!videoFile) {
        return res.json({ done: true, error: "Video generation completed but no file was returned." });
      }

      const mimeType = videoFile.mimeType || 'video/mp4';
      let base64: string;

      if (videoFile.videoBytes) {
        base64 = videoFile.videoBytes;
      } else if (videoFile.uri) {
        const os = await import('os');
        const fs = await import('fs/promises');
        const path = await import('path');
        const tmpPath = path.join(os.tmpdir(), `veo-${Date.now()}.mp4`);
        await ai.files.download({ file: videoFile, downloadPath: tmpPath });
        const bytes = await fs.readFile(tmpPath);
        await fs.unlink(tmpPath).catch(() => {});
        base64 = Buffer.from(bytes).toString('base64');
      } else {
        return res.json({ done: true, error: "Video file has no downloadable content." });
      }

      res.json({
        done: true,
        videoUrl: `data:${mimeType};base64,${base64}`,
        operation: updated,
      });
    } catch (e: any) {
      console.error("Video poll error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ai/generate-music", async (req, res) => {
    try {
      const { prompt, customApiKey } = req.body;
      const systemKey = process.env.GEMINI_API_KEY;
      const apiKey = customApiKey || systemKey;
      if (!apiKey) {
        throw new Error("API Key configuration is missing.");
      }
      const ai = new GoogleGenAI({ apiKey });
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
      res.json({ result: { audioBase64, mimeType } });
    } catch (e: any) {
      console.error("Music error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/create-tip-checkout", async (req, res) => {
    try {
      const { amount } = req.body;
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      
      if (!stripeSecretKey) {
        return res.status(400).json({ error: "Stripe configuration is missing. Please set STRIPE_SECRET_KEY." });
      }

      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeSecretKey);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Tip for DocCraft',
                description: 'Thank you for supporting us!',
              },
              unit_amount: amount * 100, // Amount in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.origin}/tip?success=true`,
        cancel_url: `${req.headers.origin}/tip?canceled=true`,
      });

      res.json({ url: session.url });
    } catch (e: any) {
      console.error("Stripe Checkout Error:", e);
      res.status(500).json({ error: e.message || 'Payment processing failed' });
    }
  });

  // VIBECODING CUSTOM DOCKER ARCHITECTURE ROUTES (Replaces E2B)
  
  // 1. Dynamic Proxy for Hardware/Software preview iframe
  // Routes matching /preview/session-uuid/ to the specific docker container (assuming it's available internally on port 3000)
  app.use('/preview/:sessionUuid', async (req, res, next) => {
    // In a real environment, you'd use a robust proxy like http-proxy.
    // For this architectural implementation, we simulate the proxy mapping:
    const sessionUuid = req.params.sessionUuid;
    console.log(`[Reverse Proxy] Routing traffic for session ${sessionUuid} to internal Docker container...`);
    // Example: proxy.web(req, res, { target: `http://vibe-${sessionUuid}:3000` });
    // Since we don't have http-proxy installed here, we return a mock success for the architectural demo:
    res.send(`<!DOCTYPE html><html><head><title>Vibecoding Preview (${sessionUuid})</title></head><body><h1>Live Preview Connected</h1><p>Rendering application from container vibe-${sessionUuid} on port 3000.</p></body></html>`);
  });

  // 2. The Agent Loop API Route
  app.post('/api/vibecoding/run', async (req, res) => {
    try {
      // Lazy load to avoid module issues if not used
      const { backendOrchestrator } = await import('./src/lib/vibecoding/BackendOrchestrator.ts');
      
      const { sessionUuid, prompt, chatHistory } = req.body;
      const authHeader = req.headers.authorization || '';
      const apiKey = authHeader.replace('Bearer ', '').trim();
      
      if (!apiKey) throw new Error("Missing Authorization header with Gemini API Key");
      
      const result = await backendOrchestrator.runAgentLoop(sessionUuid, prompt, apiKey, chatHistory || []);
      res.json(result);
    } catch (e: any) {
      console.error("[Vibecoding Run Error]", e);
      res.status(500).json({ error: e.message || "Failed to run vibecoding agent" });
    }
  });

  // 3. The Agent Loop Resume Route
  app.post('/api/vibecoding/resume', async (req, res) => {
    try {
      const { backendOrchestrator } = await import('./src/lib/vibecoding/BackendOrchestrator.ts');
      const { sessionUuid } = req.body;
      backendOrchestrator.resetStepCount(sessionUuid);
      res.json({ success: true, message: "Agent loop resumed" });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to resume" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Note: On Vercel, static files are served natively by Vercel before hitting the server.ts function,
    // so this else block is mostly a fallback.
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

// Support Vercel serverless environment (export standard listener)
const appPromise = startServer();
export default async function (req: any, res: any) {
  const app = await appPromise;
  app(req, res);
}

// Start local server if not running in Vercel
if (!process.env.VERCEL) {
  appPromise.then(app => {
    app.listen(3000, "0.0.0.0", () => {
      console.log(`Nexus Docs Cognitive Engine running at http://localhost:3000`);
    });
  });
}
