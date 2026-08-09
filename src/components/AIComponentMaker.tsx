import React, { useState } from 'react';
import { Bot, Check, Code, LayoutTemplate, Loader2, Sparkles, X, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import * as webllm from "@mlc-ai/web-llm";

export function AIComponentMaker({ onInsert, onClose }: { onInsert: (html: string) => void, onClose: () => void }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('Llama-3.2-1B-Instruct-q4f16_1-MLC');
  const [progressMsg, setProgressMsg] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      // Initialize an engine with the selected model
      const engine = new webllm.MLCEngine();
      engine.setInitProgressCallback((progress: any) => {
        setProgressMsg(progress.text);
      });
      
      // Load OpenUI or Llama explicitly
      await engine.reload(model);

      setProgressMsg('Generating components design...');
      
      const systemPrompt = `You are a professional UI Developer engine (OpenUI/Llama component maker) that outputs ONLY valid HTML code styled with Tailwind CSS utility classes. 
      Do NOT include markdown backticks like \`\`\`html. 
      Only return the raw HTML string for the requested component. 
      Ensure it looks beautiful, modern, and responsive. Use cards, buttons, lists, tables as needed.`;

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: `Create this component: ${prompt}` }
      ];

      const response = await engine.chat.completions.create({ messages });
      const rawHtml = response.choices[0].message.content || '';
      
      // Clean up the markdown if the model hallucinated it
      const cleanedHtml = rawHtml.replace(/```html/i, '').replace(/```/g, '').trim();
      
      onInsert(cleanedHtml);
      onClose();
    } catch (err) {
      console.error(err);
      setProgressMsg('Model generation failed. Please try again or check console logic.');
    } finally {
      if(progressMsg !== 'Model generation failed. Please try again or check console logic.'){
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
              <LayoutTemplate size={16} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">AI Components UI Maker</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Llama & OpenUI Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shadow-sm cursor-pointer border border-gray-100">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div>
             <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">Choose Local Generator Engine</label>
             <div className="grid grid-cols-2 gap-3 mb-4">
                <button 
                  onClick={() => setModel('Llama-3.2-1B-Instruct-q4f16_1-MLC')}
                  className={`p-3 rounded-xl border text-left transition-all ${model === 'Llama-3.2-1B-Instruct-q4f16_1-MLC' ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                >
                   <div className="flex items-center gap-1.5 mb-1 text-sm font-bold text-gray-900 border-b border-gray-200/50 pb-1 w-max">
                     <Bot size={14} className="text-indigo-500" />
                     Llama 3.2 (1B)
                   </div>
                   <p className="text-[10px] text-gray-500 leading-tight">Fast inference, standard layouts</p>
                </button>
                <button 
                  onClick={() => setModel('Llama-3.2-3B-Instruct-q4f16_1-MLC')}
                  className={`p-3 rounded-xl border text-left transition-all ${model === 'Llama-3.2-3B-Instruct-q4f16_1-MLC' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                >
                   <div className="flex items-center gap-1.5 mb-1 text-sm font-bold text-gray-900 border-b border-gray-200/50 pb-1 w-max">
                     <Layers size={14} className="text-emerald-500" />
                     Llama 3.2 (3B)
                   </div>
                   <p className="text-[10px] text-gray-500 leading-tight">Complex JSON structural grids</p>
                </button>
             </div>
          </div>

          <div>
             <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 block">Component Description</label>
             <textarea 
               autoFocus
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               disabled={loading}
               placeholder="Example: A professional pricing table with 3 tiers, styled in high-contract corporate blue with checkmarks... or a 2x2 grid of feature cards."
               className="w-full text-sm resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all text-gray-800 placeholder:text-gray-400 min-h-[120px]"
             />
          </div>

          <button 
            disabled={loading || !prompt}
            onClick={handleGenerate}
            className="w-full mt-2 bg-gradient-to-r from-gray-900 to-gray-800 hover:to-gray-700 text-white font-medium py-3.5 px-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgb(0,0,0,39%)] hover:shadow-[0_6px_20px_rgba(0,0,0,23%)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden"
          >
            {loading ? (
              <>
                 <Loader2 size={18} className="animate-spin relative z-10" />
                 <span className="relative z-10">Running Engine...</span>
                 
                 {/* Progress Overlay */}
                 <div className="absolute top-0 left-0 h-full bg-white/10 animate-pulse w-full"></div>
              </>
            ) : (
              <>
                 <Sparkles size={18} />
                 <span>Generate Live Component</span>
              </>
            )}
          </button>
          
          {loading && (
             <div className="text-center mt-2 px-4 shadow-inner bg-slate-50 border border-slate-100 rounded-lg py-2">
                <p className="text-[10px] font-mono text-indigo-500 truncate">{progressMsg || "Initializing WebLLM environment..."}</p>
             </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
