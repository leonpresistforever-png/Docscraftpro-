import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Cpu, Sparkles, Zap, Check, Hexagon } from 'lucide-react';

export interface AIModel {
  id: string;
  name: string;
  provider: 'Google' | 'Anthropic' | 'OpenAI';
  description: string;
  icon: React.ReactNode;
}

export function ModelSelector({ selectedModel, setSelectedModel }: { selectedModel: string, setSelectedModel: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const models: AIModel[] = [
    // Google Gemini Models
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', provider: 'Google', description: 'Fast, lightweight multimodal', icon: <Zap className="w-3 h-3 text-amber-500" /> },
    { id: 'gemini-3.5-medium', name: 'Gemini 3.5 Medium', provider: 'Google', description: 'Balanced speed and intelligence', icon: <Sparkles className="w-3 h-3 text-indigo-500" /> },
    { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', provider: 'Google', description: 'Advanced reasoning, deep context', icon: <Cpu className="w-3 h-3 text-purple-500" /> },
    
    // Anthropic Claude Models
    { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Industry standard coding intelligence', icon: <Hexagon className="w-3 h-3 text-orange-500" /> },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', description: 'Deep conceptual reasoning', icon: <Hexagon className="w-3 h-3 text-rose-500" /> },
    { id: 'claude-4.6-sonnet', name: 'Claude 4.6 Sonnet', provider: 'Anthropic', description: 'Advanced agentic core model', icon: <Hexagon className="w-3 h-3 text-rose-600 animate-pulse" /> },
    { id: 'claude-4.7-opus', name: 'Claude 4.7 Opus', provider: 'Anthropic', description: 'Peak system architectural reasoning', icon: <Hexagon className="w-3 h-3 text-rose-700" /> },
    { id: 'claude-5-fable', name: 'Claude 5 Fable', provider: 'Anthropic', description: 'Next-gen experimental logic core', icon: <Sparkles className="w-3 h-3 text-indigo-600" /> },

    // OpenAI GPT Models
    { id: 'gpt-4o', name: 'GPT-4o Omni', provider: 'OpenAI', description: 'High speed, multimodal production core', icon: <Cpu className="w-3 h-3 text-green-500" /> },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', description: 'Efficient lightweight intelligence', icon: <Zap className="w-3 h-3 text-emerald-400" /> },
    { id: 'gpt-5-preview', name: 'GPT-5 Preview', provider: 'OpenAI', description: 'Advanced next-gen thinking', icon: <Sparkles className="w-3 h-3 text-green-600 animate-pulse" /> },
    { id: 'gpt-5-omni', name: 'GPT-5 Omni', provider: 'OpenAI', description: 'Sovereign agent brain core', icon: <Cpu className="w-3 h-3 text-emerald-600" /> },
    { id: 'o1-pro', name: 'o1 Pro Reasoning', provider: 'OpenAI', description: 'Full chain-of-thought advanced logic', icon: <Cpu className="w-3 h-3 text-emerald-500" /> },
    { id: 'o1-mini', name: 'o1 Mini', provider: 'OpenAI', description: 'Fast mathematical reasoning', icon: <Zap className="w-3 h-3 text-emerald-400" /> },
    { id: 'o3-mini', name: 'o3 Mini', provider: 'OpenAI', description: 'Autonomous coding & thinking reasoning', icon: <Zap className="w-3 h-3 text-cyan-500" /> },
  ];

  const current = models.find(m => m.id === selectedModel) || models[0];

  // Group by provider for clean presentation
  const providers = ['Google', 'Anthropic', 'OpenAI'] as const;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/90 hover:bg-white border border-slate-200 shadow-sm text-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 outline-none transition-all hover:shadow-md"
      >
        <div className="bg-slate-100 p-1 rounded-md shrink-0">
           {current.icon}
         </div>
        <span className="font-mono truncate max-w-[120px]">{current.name}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
            className="absolute top-full mt-2 right-0 w-72 bg-white border border-slate-200 shadow-2xl rounded-2xl p-2.5 z-[9999] flex flex-col gap-2 max-h-[420px] overflow-y-auto custom-scrollbar"
          >
            <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 tracking-wider border-b border-slate-100 pb-1.5">
              Select AI Sandbox Model
            </div>
            
            {providers.map(prov => {
              const provModels = models.filter(m => m.provider === prov);
              return (
                <div key={prov} className="space-y-1">
                  <div className="text-[9px] font-black uppercase text-indigo-600/70 tracking-widest px-2 py-0.5">
                    {prov === 'Google' ? 'Google Gemini' : prov === 'Anthropic' ? 'Anthropic Claude' : 'OpenAI GPT'}
                  </div>
                  {provModels.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => { setSelectedModel(m.id); setIsOpen(false); }}
                      className={`flex items-start gap-2.5 w-full text-left px-2 py-2 rounded-xl text-xs transition-all ${
                        selectedModel === m.id 
                          ? 'bg-indigo-50 text-indigo-800 font-bold' 
                          : 'hover:bg-slate-50 text-slate-600 font-medium'
                      }`}
                    >
                      <div className="bg-slate-100/80 p-1.5 rounded-lg mt-0.5 shrink-0">
                        {m.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono truncate">{m.name}</span>
                          {selectedModel === m.id && (
                            <span className="text-[8px] bg-indigo-200 text-indigo-800 font-bold px-1 py-0.2 rounded-md">
                              active
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 font-normal leading-normal truncate">
                          {m.description}
                        </p>
                      </div>
                      {selectedModel === m.id && (
                        <Check className="w-3.5 h-3.5 text-indigo-500 mt-1 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
