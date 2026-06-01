import React, { useState, useEffect, useRef } from 'react';
import { InitProgressReport, MLCEngineInterface, deleteModelAllInfoInCache, hasModelInCache } from '@mlc-ai/web-llm';
import { Terminal, Play, Loader2, CheckCircle2, Cpu, AlertTriangle, Sparkles, Database, Trash2, ChevronDown, Check, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LocalGemmaTerminalProps {
  onEngineReady: (engine: any) => void;
  isActive: boolean;
}

const AVAILABLE_MODELS = [
  { id: 'gemma-2-2b-it-q4f16_1-MLC', name: 'Gemma 2 (2B) IT - Smooth Low-Latency ⭐' },
  { id: 'gemma-2-2b-it-q8f16_1-MLC', name: 'Gemma 2 (2B) IT - High-Quality Smooth' },
  { id: 'gemma-2-9b-it-q4f16_1-MLC', name: 'Gemma 2 (9B) IT - Deep Understanding' },
  { id: 'gemma-2-9b-it-q8f16_1-MLC', name: 'Gemma 2 (9B) IT - High-Precision IT' },
  { id: 'SmolLM2-135M-Instruct-q4f16_1-MLC', name: 'SmolLM 2 (135M) - Ultra Fast' },
  { id: 'SmolLM2-360M-Instruct-q4f16_1-MLC', name: 'SmolLM 2 (360M) - Efficient' },
  { id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC', name: 'SmolLM 2 (1.7B) - Balanced' },
  { id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC', name: 'Qwen 2.5 (0.5B)' },
  { id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC', name: 'Qwen 2.5 (1.5B) - Recommended' },
  { id: 'Qwen2.5-7B-Instruct-q4f16_1-MLC', name: 'Qwen 2.5 (7B)' },
  { id: 'DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC', name: 'DeepSeek R1 (7B)' },
  { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', name: 'Llama 3.2 (1B)' },
  { id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC', name: 'Llama 3.2 (3B)' },
  { id: 'Llama-3.2-11B-Vision-Instruct-q4f16_1-MLC', name: 'Llama 3.2 (11B) Vision' }
];

export function LocalGemmaTerminal({ onEngineReady, isActive }: LocalGemmaTerminalProps) {
  const [initProgress, setInitProgress] = useState<any>(null);
  const [engineState, setEngineState] = useState<'idle' | 'initializing' | 'ready' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<any>(null);
  const workerRef = useRef<Worker | null>(null);

  const [selectedModelId, setSelectedModelId] = useState<string>('gemma-2-2b-it-q4f16_1-MLC');
  const [cachedModels, setCachedModels] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkCache = async () => {
      const cached = [];
      for (const m of AVAILABLE_MODELS) {
        try {
          const isCached = await hasModelInCache(m.id);
          if (isCached) cached.push(m.id);
        } catch(e) {}
      }
      setCachedModels(cached);
      // Default to cache model if available
      if (cached.length > 0 && !cached.includes(selectedModelId)) {
         setSelectedModelId(cached[0]);
      }
    };
    checkCache();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, initProgress]);

  const initEngine = async () => {
    try {
      if (!(navigator as any).gpu) {
         throw new Error("WebGPU is not supported or disabled on this browser. Open in Chrome/Edge natively (not inside nested iframes) to activate local offline GPU acceleration!");
      }
      
      setEngineState('initializing');
      setLogs([]);
      setErrorMsg('');
      addLog("Initializing high-speed WebGPU connection...");
      addLog(`Querying browser Cache Storage and requesting ${selectedModelId} weight chunks...`);
      
      const { CreateWebWorkerMLCEngine } = await import('@mlc-ai/web-llm');
      const worker = new Worker(new URL('../lib/web-llm-worker.ts', import.meta.url), { type: 'module' });
      workerRef.current = worker;
      
      const engine = await CreateWebWorkerMLCEngine(
        worker,
        selectedModelId,
        { 
          initProgressCallback: (progress: any) => {
            setInitProgress(progress);
            if (progress.text) {
               setLogs(prev => {
                 const newLogs = [...prev];
                 const cleanText = progress.text.replace("Fetching", "Downloading").replace("Loading", "Structuring");
                 if (newLogs.length > 0 && (newLogs[newLogs.length - 1].includes("Downloading") || newLogs[newLogs.length - 1].includes("Structuring"))) {
                    newLogs[newLogs.length - 1] = `[EngineProgress] ${cleanText}`;
                 } else {
                    newLogs.push(`[EngineProgress] ${cleanText}`);
                 }
                 return newLogs;
               });
            }
          }
        }
      );
      
      addLog("Model compilation succeeded! Synapses mapped into WebGPU memory perfectly.");
      setEngineState('ready');
      engineRef.current = engine;
      onEngineReady(engine);
      
      // Update downloaded list
      if (!cachedModels.includes(selectedModelId)) {
        setCachedModels(prev => [...prev, selectedModelId]);
      }
    } catch (err: any) {
      console.error(err);
      setEngineState('error');
      const fullError = err.message || 'Unknown error during initialization';
      setErrorMsg(fullError);
      addLog(`[ERROR] ${fullError}`);
    }
  };

  const handleClearCache = async () => {
    try {
      addLog(`Purging local cache files for ${selectedModelId}...`);
      if (engineState !== 'idle') {
        setEngineState('initializing');
      }
      
      if (engineRef.current) {
        try { await engineRef.current.interruptGenerate(); } catch(e) {}
        try { await engineRef.current.unload(); } catch(e) {}
        engineRef.current = null;
        onEngineReady(null);
      }
      await deleteModelAllInfoInCache(selectedModelId);
      addLog("Synaptic cache cleared successfully!");
      setInitProgress(null);
      
      setCachedModels(prev => prev.filter(id => id !== selectedModelId));
      setEngineState('idle');
    } catch (e: any) {
      addLog(`Error clearing cache: ${e.message}`);
      setEngineState('idle');
    }
  };

  const handleRestoreEngine = () => {
    try {
      addLog("Aborting weight download, terminating worker and restoring components...");
      if (workerRef.current) {
        try { workerRef.current.terminate(); } catch(e) {}
        workerRef.current = null;
      }
      if (engineRef.current) {
        try { engineRef.current.unload(); } catch(e) {}
        engineRef.current = null;
        onEngineReady(null);
      }
      setInitProgress(null);
      setEngineState('idle');
      addLog("Local sandbox webLLM engine restored successfully. Ready to build cleanly!");
    } catch (e: any) {
      addLog(`Error during restore: ${e.message}`);
      setEngineState('idle');
    }
  };

  if (!isActive) return null;

  const currentModelName = AVAILABLE_MODELS.find(m => m.id === selectedModelId)?.name || selectedModelId;

  return (
    <div className="relative max-w-4xl mx-auto my-10 p-[1px] rounded-2xl group overflow-visible">
       
       {/* 1. Enhanced Premium Flowing RGB Rim Light Frame */}
       <div 
         className="absolute -inset-[3.5px] rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#f43f5e] via-[#a855f7] to-[#3b82f6] opacity-35 group-hover:opacity-75 blur-md transition duration-700 animate-rgb-wave z-0 pointer-events-none" 
         style={{ backgroundSize: '300% 300%' }} 
       />
       <div 
         className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#f43f5e] via-[#a855f7] to-[#3b82f6] opacity-55 group-hover:opacity-100 animate-rgb-wave z-0 pointer-events-none" 
         style={{ backgroundSize: '300% 300%' }} 
       />

       {/* Outer Frame Wrapper */}
       <div className="relative bg-white rounded-[14px] overflow-hidden text-slate-800 z-10 p-5 flex flex-col transition-all duration-300">
         
         {/* Top Header */}
         <div className="flex items-center justify-between border-b border-rose-100 pb-3.5 mb-5 relative z-20">
           <div className="flex items-center gap-2.5">
             <div className="p-1.5 bg-rose-600 rounded-lg text-white flex items-center justify-center shadow-sm">
                <Cpu className="w-4 h-4" />
             </div>
             <span className="tracking-wide text-sm font-extrabold uppercase bg-gradient-to-r from-rose-700 to-indigo-850 bg-clip-text text-transparent">
               Local WebLLM Model Library
             </span>
           </div>
           
           <div className="flex items-center gap-3">
              <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-rose-50 text-red-600 border border-rose-100">
                {cachedModels.includes(selectedModelId) ? 'Stored Offline ⭐' : 'Cloud Available'}
              </span>
              <div className={`w-3.5 h-3.5 rounded-full shadow-lg ${
                engineState === 'ready' ? 'bg-emerald-500 ring-4 ring-emerald-100 animate-pulse' : 
                engineState === 'error' ? 'bg-rose-500 ring-4 ring-rose-100 animate-bounce' : 
                engineState === 'initializing' ? 'bg-amber-400 ring-4 ring-amber-100 animate-spin' : 
                'bg-rose-200'
              }`}></div>
           </div>
         </div>

         <div className="flex flex-col md:flex-row gap-5 relative z-10">
            
            {/* Controls Panel */}
            <div className="w-full md:w-80 flex-shrink-0 flex flex-col gap-4">
                <div className="bg-gradient-to-b from-rose-50/50/50 to-white p-4.5 rounded-xl border border-rose-100/60 shadow-xs space-y-4">
                  <div>
                     <h4 className="text-xs font-black text-rose-950 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-pink-500" /> Choose AI Model
                     </h4>
                     <p className="text-[11px] text-slate-500 leading-relaxed">
                       Run directly inside your browser on GPU with 100% data confidentiality. No cloud leaks.
                     </p>
                  </div>
                  
                  {/* BEAUTIFUL CUSTOM POP-UP DROPDOWN SELECTION */}
                  <div className="relative font-sans" ref={dropdownRef}>
                    <button
                      type="button"
                      disabled={engineState !== 'idle' && engineState !== 'error'}
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="w-full bg-white hover:bg-rose-50/40 border-2 border-rose-100/80 active:border-rose-300 rounded-xl p-3 text-xs text-slate-700 font-bold outline-none shadow-xs flex items-center justify-between transition-all pr-4 disabled:opacity-50 text-left cursor-pointer"
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-pink-500 inline shrink-0" />
                        {currentModelName}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-rose-400 transition-transform duration-200 shrink-0 ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {showDropdown && (
                        <div className="absolute left-0 right-0 top-full mt-2.5 z-[9000]">
                          {/* Subtle clean dropdown shadow */}
                          <div className="absolute -inset-[1px] bg-rose-100 rounded-2xl shadow-xl pointer-events-none" />
                          
                          <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 350, damping: 22 }}
                            className="relative bg-white border border-rose-100 shadow-2xl rounded-xl max-h-72 overflow-y-auto overflow-x-hidden p-2 space-y-1 backdrop-blur-md"
                          >
                            <div className="px-2.5 py-1.5 text-[9px] uppercase font-bold tracking-widest text-pink-600 bg-pink-50/50 border-b border-rose-100/50 mb-1.5 rounded-lg flex items-center justify-between">
                              <span>Select Gemma & Local Models</span>
                              <Sparkles className="w-3 h-3 text-pink-500 animate-pulse" />
                            </div>
                            
                            {AVAILABLE_MODELS.map(m => {
                              const isCached = cachedModels.includes(m.id);
                              const isSelected = m.id === selectedModelId;
                              return (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedModelId(m.id);
                                    setShowDropdown(false);
                                  }}
                                  className={`w-full flex items-center justify-between text-left p-2.5 rounded-lg text-xs font-semibold transition-all border border-transparent ${
                                    isSelected 
                                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md shadow-rose-500/15' 
                                      : 'text-slate-700 hover:bg-rose-50/60 hover:text-rose-600 hover:border-rose-100/50'
                                  }`}
                                >
                                  <span className="truncate flex items-baseline gap-1.5 pr-2">
                                    {m.name}
                                  </span>
                                  <div className="flex items-center gap-1 shrink-0">
                                    {isCached && (
                                      <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-red-50 border border-red-100 text-red-500'}`}>
                                        LOCAL
                                      </span>
                                    )}
                                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                                  </div>
                                </button>
                              );
                            })}
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  {(!['135M', '360M', '0.5B', '1.5B'].some(size => selectedModelId.includes(size))) && (
                      <div className="text-[10.5px] text-rose-800 p-3 bg-rose-50/70 border border-rose-250/60 rounded-xl flex items-start gap-2 leading-relaxed">
                        <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-red-500 mt-0.5 animate-pulse" />
                        <div>
                          <strong className="text-rose-950 block mb-0.5">⚠️ Local Memory & Crash Warning</strong>
                          Large local models (2B+ parameters) execute entirely inside your browser's WebGPU context. They require heavy GPU VRAM and <strong>may crash your browser tab</strong> or freeze lighter computers. Please use <strong>SmolLM (135M/360M)</strong> or <strong>Qwen (0.5B/1.5B)</strong> on standard developer rigs for maximum stability.
                        </div>
                      </div>
                  )}
                  
                  <div className="flex flex-col gap-2 pt-1">
                    {engineState === 'idle' && (
                      <button 
                        onClick={initEngine}
                        className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#b08d2b] text-white font-extrabold py-3.5 px-4 rounded-xl border border-[#ffebaf]/40 shadow-[0_0_15px_rgba(212,175,55,0.45)] hover:shadow-[0_0_25px_rgba(212,175,55,0.85)] hover:scale-[1.02] active:scale-98 transition-all duration-300 cursor-pointer text-xs uppercase tracking-wider relative overflow-hidden group"
                      >
                        {/* Glowing dynamic rim lighting ring wrapper */}
                        <span className="absolute inset-0 rounded-xl border border-yellow-300/50 animate-pulse pointer-events-none" />
                        <span className="relative z-10 flex items-center gap-2">
                          <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform duration-200" /> Start Local Model
                        </span>
                      </button>
                    )}
                    {engineState === 'initializing' && (
                      <div className="space-y-2 w-full">
                        <div className="w-full flex items-center justify-center gap-2 bg-pink-50/80 text-pink-700 font-extrabold py-3 rounded-lg border border-pink-150 animate-pulse text-xs">
                          <Loader2 className="w-4 h-4 animate-spin text-pink-600" /> Connecting Synapses...
                        </div>
                        <button 
                          onClick={handleRestoreEngine}
                          className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-lg border border-slate-700 shadow-sm cursor-pointer hover:scale-101 active:scale-99 transition-all text-xs"
                          title="Stop weight download and restore engine setup"
                        >
                          <X className="w-3.5 h-3.5 text-rose-500 font-bold" /> Stop & Restore Setup
                        </button>
                        <div className="p-2.5 bg-amber-50 text-amber-800/90 border border-amber-100 rounded-lg text-[10px] leading-relaxed flex items-start gap-1.5 shadow-xs">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <span>
                            <strong>Advisory:</strong> Larger weights can stall rendering pipelines. Click "Stop & Restore Setup" if your download is stuck or if you want to select another size.
                          </span>
                        </div>
                      </div>
                    )}
                    {engineState === 'ready' && (
                      <div className="w-full flex items-center justify-center gap-2 bg-gradient-to-tr from-emerald-500 to-green-500 text-white font-extrabold py-3 rounded-lg border border-emerald-600 shadow-md text-xs">
                        <CheckCircle2 className="w-4 h-4" /> Native GPU Active
                      </div>
                    )}
                    {engineState === 'error' && (
                      <button 
                        onClick={initEngine}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 rounded-lg shadow-md transition-colors cursor-pointer text-xs"
                      >
                        Retry Engine Boot
                      </button>
                    )}

                    <div className="flex gap-2 w-full pt-1.5">
                      {cachedModels.includes(selectedModelId) && (
                        <button
                          onClick={handleClearCache}
                          disabled={engineState === 'initializing'}
                          className="flex-1 flex items-center justify-center gap-1 bg-white border border-rose-100 hover:bg-rose-50 text-rose-600 font-bold py-1.5 rounded-lg transition-colors text-[10px] disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Evict Cache
                        </button>
                      )}
                      
                      <button
                        onClick={handleRestoreEngine}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-1.5 rounded-lg transition-colors text-[10px] cursor-pointer"
                        title="Restore model downloader and reset MLC state"
                      >
                        <RefreshCw className="w-3 h-3 text-amber-600" /> Restore Engine
                      </button>
                    </div>
                  </div>
                </div>
            </div>

            {/* Console / Installation Log Streamer */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Dynamic Progress Indicator */}
                <AnimatePresence>
                  {engineState === 'initializing' && initProgress && (
                     <motion.div 
                       initial={{ opacity: 0, y: -10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       className="bg-rose-50/40 p-4 rounded-xl border border-rose-100 shadow-xs space-y-2"
                     >
                       <div className="flex justify-between text-xs text-rose-950 font-extrabold">
                         <span className="flex items-center gap-1.5">
                           <Database className="w-3.5 h-3.5 text-pink-500 animate-bounce" /> 
                           Downloading Weights...
                         </span>
                         <span className="font-mono">{Math.round(initProgress.progress * 100)}%</span>
                       </div>
                       <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner border border-slate-200">
                         <motion.div 
                            className="bg-gradient-to-r from-red-500 via-pink-500 to-indigo-500 h-full rounded-full animate-pulse"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round(initProgress.progress * 100)}%` }}
                            transition={{ bounce: 0 }}
                         />
                       </div>
                       <div className="text-[9px] text-pink-600 font-bold font-mono truncate">
                         {initProgress.text || 'Connecting to model distribution networks...'}
                       </div>
                     </motion.div>
                  )}
                </AnimatePresence>

                {/* Console logs view */}
                <div 
                   ref={scrollRef}
                   className="flex-1 bg-slate-900 border border-slate-950 p-4.5 rounded-xl overflow-y-auto max-h-56 min-h-[180px] text-xs text-rose-50 font-mono leading-relaxed relative shadow-2xl"
                >
                   {logs.length === 0 ? (
                      <div className="text-rose-400 italic h-full flex flex-col items-center justify-center gap-1.5 font-sans">
                        <Terminal className="w-6 h-6 opacity-60 animate-pulse text-pink-500" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">WebGPU Local Console</span>
                        <span className="text-[10px] text-slate-500 text-center max-w-[250px]">Select a model and click "Start Local Model" to allocate local cache and initialize inference pipelines</span>
                      </div>
                   ) : (
                      <div className="space-y-1">
                        {logs.map((log, i) => (
                           <div key={i} className="opacity-90 capitalize font-mono border-l-2 border-pink-500/50 pl-2 text-rose-100">
                             {log.replace("[EngineProgress]", "⚡").replace("structuring", "Synapsing")}
                           </div>
                        ))}
                      </div>
                   )}
                </div>

                {/* Conditional Sandbox/GPU Error Notice */}
                {engineState === 'error' && (
                   <motion.div 
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700 flex items-start gap-2.5 leading-relaxed shadow-xs"
                   >
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5 animate-bounce" />
                      <div>
                         <span className="font-extrabold">Initialization Notice:</span> Verify that your device supports WebGPU natively. If you are inside a restricted iframe preview tab, click <span className="font-extrabold underline text-red-800">"Open in New Tab" ↗️</span> to run WebGPU model contexts with native hardware driver permissions!
                      </div>
                   </motion.div>
                )}
            </div>

         </div>
      </div>
    </div>
  );
}
