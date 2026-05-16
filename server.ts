import 'dotenv/config';
import express from "express";
import path from "path";
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
      const { prompt, customApiKey, isComplex } = req.body;
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
                  model: "llama-3.3-70b-versatile",
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
                  model: isComplex ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash",
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
                  model: "Meta-Llama-3.3-70B-Instruct",
                  messages: [{ role: "user", content: prompt }]
              })
          });
          const data = await response.json();
          responseText = data.choices[0]?.message?.content || "";
      } else {
          // Gemini
          const ai = new GoogleGenAI({ apiKey: apiKey });
          const result = await ai.models.generateContent({
              model: isComplex ? 'gemini-2.5-pro' : 'gemini-2.5-flash',
              contents: prompt
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
      const { text, customApiKey } = req.body;
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
          console.log("[AI] Using Groq (llama-3.3-70b-versatile)");
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                  "Authorization": `Bearer ${apiKey}`,
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({
                  model: "llama-3.3-70b-versatile",
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
          console.log("[AI] Using OpenRouter (google/gemini-2.5-flash)");
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                  "Authorization": `Bearer ${apiKey}`,
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({
                  model: "google/gemini-2.5-flash",
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
                  model: "Meta-Llama-3.3-70B-Instruct",
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
              model: 'gemini-2.5-flash',
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
              model: 'gemini-2.5-flash',
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
    app.get('*', (req, res) => {
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
