import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Cpu, Sparkles, Zap, ZapOff, Check, Hexagon } from 'lucide-react';

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

  const models = [
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', icon: <Zap className="w-3 h-3 text-amber-500" /> },
    { id: 'gemini-3.5-medium', name: 'Gemini 3.5 Medium', icon: <Sparkles className="w-3 h-3 text-blue-500" /> },
    { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', icon: <Cpu className="w-3 h-3 text-purple-500" /> },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', icon: <Hexagon className="w-3 h-3 text-rose-500" /> },
    { id: 'gpt-4o', name: 'GPT-4 Omni', icon: <ZapOff className="w-3 h-3 text-green-500" /> },
  ];

  const current = models.find(m => m.id === selectedModel) || models[2];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/80 hover:bg-white border border-slate-200/60 shadow-sm text-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 outline-none transition-all hover:shadow-md"
      >
        <div className="bg-slate-100 p-1 rounded-md">
           {current.icon}
        </div>
        <span className="font-mono">{current.name}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.4 }}
            className="absolute bottom-full mb-2 left-0 w-56 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-[100] flex flex-col gap-1"
          >
            <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider">Select AI Model</div>
            {models.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setSelectedModel(m.id); setIsOpen(false); }}
                className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-xl text-xs transition-all ${
                  selectedModel === m.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-600 font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  {m.icon}
                  <span>{m.name}</span>
                </div>
                {selectedModel === m.id && <Check className="w-3 h-3 text-indigo-500" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
