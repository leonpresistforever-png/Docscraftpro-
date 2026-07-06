const fs = require('fs');
let code = fs.readFileSync('src/pages/RepositoriesPage.tsx', 'utf-8');

// Add import if needed
if (!code.includes('ModelSelector')) {
  code = code.replace("import { motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';\nimport { ModelSelector } from '../components/ModelSelector';");
}

const oldSelect = `<select 
                          value={selectedModel}
                          onChange={e => setSelectedModel(e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                        >
                          <optgroup label="Google Gemini" disabled={!geminiApiKey && !localStorage.getItem('dc_custom_gemini_api_key')}>
                            <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                            <option value="gemini-3.5-medium">Gemini 3.5 Medium</option>
                            <option value="gemini-3.1-pro">Gemini 3.1 Pro</option>
                            <option value="gemini-3.1-flash">Gemini 3.1 Flash</option>
                            <option value="gemini-3.1-lite">Gemini 3.1 Lite</option>
                            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                          </optgroup>
                          <optgroup label="Anthropic Claude" disabled={!claudeApiKey && !localStorage.getItem('dc_custom_claude_api_key')}>
                            <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                            <option value="claude-3-opus">Claude 3 Opus</option>
                            <option value="claude-3-haiku">Claude 3 Haiku</option>
                          </optgroup>
                          <optgroup label="OpenAI GPT" disabled={!gptApiKey && !localStorage.getItem('dc_custom_gpt_api_key')}>
                            <option value="gpt-4o">GPT-4 Omni</option>
                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                          </optgroup>
                          <optgroup label="Custom Provider" disabled={!customModelEndpoint || !customModelKey}>
                            <option value="custom">Custom Endpoint Model</option>
                          </optgroup>
                        </select>`;

code = code.replace(oldSelect, `<ModelSelector selectedModel={selectedModel} setSelectedModel={setSelectedModel} />`);

fs.writeFileSync('src/pages/RepositoriesPage.tsx', code);
