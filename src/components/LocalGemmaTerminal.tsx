import React, { useState, useEffect, useRef } from 'react';
import { InitProgressReport, MLCEngineInterface, deleteModelAllInfoInCache, hasModelInCache } from '@mlc-ai/web-llm';
import { Terminal, Play, Loader2, CheckCircle2, Cpu, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LocalGemmaTerminalProps {
  onEngineReady: (engine: MLCEngineInterface | null) => void;
  isActive: boolean;
}

const AVAILABLE_MODELS = [
  { id: 'SmolLM2-135M-Instruct-q4f16_1-MLC', name: 'SmolLM 2 (135M)' },
  { id: 'SmolLM2-360M-Instruct-q4f16_1-MLC', name: 'SmolLM 2 (360M)' },
  { id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC', name: 'SmolLM 2 (1.7B)' },
  { id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC', name: 'Qwen 2.5 (0.5B)' },
  { id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC', name: 'Qwen 2.5 (1.5B)' },
  { id: 'Qwen2.5-7B-Instruct-q4f16_1-MLC', name: 'Qwen 2.5 (7B)' },
  { id: 'DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC', name: 'DeepSeek R1 (7B)' },
  { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', name: 'Llama 3.2 (1B)' },
  { id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC', name: 'Llama 3.2 (3B)' },
  { id: 'Llama-3.1-8B-Instruct-q4f16_1-MLC', name: 'Llama 3.1 (8B)' },
  { id: 'Qwen2-0.5B-Instruct-q4f16_1-MLC', name: 'Qwen 2 (0.5B - Legacy)' }
];

export function LocalGemmaTerminal({ onEngineReady, isActive }: LocalGemmaTerminalProps) {
  const [initProgress, setInitProgress] = useState<InitProgressReport | null>(null);
  const [engineState, setEngineState] = useState<'idle' | 'initializing' | 'ready' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<MLCEngineInterface | null>(null);

  const [selectedModelId, setSelectedModelId] = useState<string>('Qwen2.5-0.5B-Instruct-q4f16_1-MLC');
  const [cachedModels, setCachedModels] = useState<string[]>([]);

  useEffect(() => {
    // Check which models are pre-downloaded
    const checkCache = async () => {
      const cached = [];
      for (const m of AVAILABLE_MODELS) {
        try {
          const isCached = await hasModelInCache(m.id);
          if (isCached) cached.push(m.id);
        } catch(e) {}
      }
      setCachedModels(cached);
      if (cached.length > 0 && !cached.includes(selectedModelId)) {
         setSelectedModelId(cached[0]); // auto select first downloaded
      }
    };
    checkCache();
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
         throw new Error("WebGPU is not supported on this browser/device. Please try Chrome/Edge on a supported device.");
      }
      
      setEngineState('initializing');
      setLogs([]);
      addLog("Initializing WebGPU connection...");
      addLog(`Requesting ${selectedModelId} chunks...`);
      
      const { CreateWebWorkerMLCEngine } = await import('@mlc-ai/web-llm');
      const worker = new Worker(new URL('../lib/web-llm-worker.ts', import.meta.url), { type: 'module' });
      
      let engine = await CreateWebWorkerMLCEngine(
        worker,
        selectedModelId,
        { 
          initProgressCallback: (progress) => {
            setInitProgress(progress);
            if (progress.text) {
               setLogs(prev => {
                 const newLogs = [...prev];
                 if (newLogs.length > 0 && newLogs[newLogs.length - 1].includes("Fetching")) {
                    newLogs[newLogs.length - 1] = `[LOCAL] ${progress.text}`;
                 } else {
                    newLogs.push(`[LOCAL] ${progress.text}`);
                 }
                 return newLogs;
               });
            }
          }
        }
      );
      
      addLog("Engine successfully compiled and loaded into GPU VRAM!");
      setEngineState('ready');
      engineRef.current = engine;
      onEngineReady(engine);
      
    } catch (err: any) {
      console.error(err);
      setEngineState('error');
      setErrorMsg(err.message || 'Unknown error during initialization');
      addLog(`ERROR: ${err.message || 'Initialization failed'}`);
    }
  };

  const handleClearCache = async () => {
    try {
      addLog("Clearing browser cache for WebLLM models...");
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
      addLog("Cache cleared successfully! Reloading engine...");
      setInitProgress(null);
      
      setCachedModels(prev => prev.filter(id => id !== selectedModelId));
      
      setEngineState('idle');
      // Timeout lightly to allow state updates to settle before heavy init
      setTimeout(() => {
        initEngine();
      }, 500);
    } catch (e: any) {
      addLog(`Error clearing cache: ${e.message}`);
      setEngineState('idle');
    }
  };

  if (!isActive) return null;

  return (
    <div className="bg-[#0a0a0a] rounded-xl overflow-hidden border border-gray-800 shadow-2xl font-mono text-sm max-w-4xl mx-auto my-6 text-green-400">
       <div className="bg-[#1a1a1a] px-4 py-2 flex items-center justify-between border-b border-gray-800">
         <div className="flex items-center gap-2 text-gray-400 text-xs">
           <Terminal className="w-4 h-4" />
           <span>WebGPU Runtime : {selectedModelId}</span>
         </div>
         <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${engineState === 'ready' ? 'bg-green-500' : engineState === 'error' ? 'bg-red-500' : engineState === 'initializing' ? 'bg-yellow-500' : 'bg-gray-600'}`}></div>
         </div>
       </div>

       <div className="p-4 flex flex-col md:flex-row gap-6">
         {/* Control Panel */}
         <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4">
             <div className="bg-[#111] p-4 rounded-lg border border-gray-800">
               <h4 className="text-gray-300 font-bold mb-2 flex items-center gap-2"><Cpu className="w-4 h-4 text-blue-400" /> WebLLM Engine</h4>
               <p className="text-xs text-gray-500 mb-2">Run the AI model directly on your device's GPU natively in browser. No data leaves your machine.</p>
               <p className="text-[10px] text-amber-500/80 mb-4 flex items-start gap-1"><AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" /> Warning: These local models are very heavy and require high VRAM. On lower-end devices, they may cause your browser or device to crash. Use precisely.</p>
               
               <div className="mb-4">
                 <select
                   value={selectedModelId}
                   onChange={(e) => setSelectedModelId(e.target.value)}
                   disabled={engineState !== 'idle' && engineState !== 'error'}
                   className="w-full bg-[#1a1a1a] border border-gray-700 rounded p-1.5 text-xs text-gray-300 outline-none disabled:opacity-50"
                 >
                   {AVAILABLE_MODELS.map(m => (
                     <option key={m.id} value={m.id}>
                       {m.name} {cachedModels.includes(m.id) ? '(Downloaded)' : ''}
                     </option>
                   ))}
                 </select>
                 
               </div>
               
               {(!['135M', '360M', '0.5B', '1B', '1.5B'].some(size => selectedModelId.includes(size))) && (
                   <p className="text-[10px] text-red-400 mb-4 flex items-start gap-1 font-semibold p-2 bg-red-900/20 border border-red-900/50 rounded-md">
                     <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                     WARNING: This model requires a powerful dedicated GPU. Ensure you have enough VRAM otherwise your browser may crash!
                   </p>
               )}
               
               <div className="flex flex-col gap-2">
                 {engineState === 'idle' && (
                   <button 
                     onClick={initEngine}
                     className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md transition-colors"
                   >
                     <Play className="w-4 h-4" /> Boot Model
                   </button>
                 )}
                 {engineState === 'initializing' && (
                   <div className="w-full flex items-center justify-center gap-2 bg-yellow-600/20 border border-yellow-600/50 text-yellow-500 py-2 rounded-md">
                     <Loader2 className="w-4 h-4 animate-spin" /> Loading Weights...
                   </div>
                 )}
                 {engineState === 'ready' && (
                   <div className="w-full flex items-center justify-center gap-2 bg-green-900/40 border border-green-800 text-green-400 py-2 rounded-md">
                     <CheckCircle2 className="w-4 h-4" /> Active on GPU
                   </div>
                 )}
                 {engineState === 'error' && (
                   <button 
                     onClick={initEngine}
                     className="w-full flex items-center justify-center gap-2 bg-red-900/40 border border-red-800 hover:bg-red-900 text-red-400 py-2 rounded-md transition-colors"
                   >
                     Retry Initialization
                   </button>
                 )}

                 <button
                   onClick={handleClearCache}
                   disabled={engineState === 'initializing'}
                   className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-semibold py-2 rounded-md transition-colors text-xs disabled:opacity-50"
                 >
                   <RefreshCw className="w-3 h-3" /> Clear Local Data & Reload
                 </button>
               </div>
            </div>
            
            {engineState === 'initializing' && initProgress && (
               <div className="bg-[#111] p-3 rounded-lg border border-gray-800">
                 <div className="flex justify-between text-xs text-gray-400 mb-2">
                   <span>Progress</span>
                   <span>{Math.round(initProgress.progress * 100)}%</span>
                 </div>
                 <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                   <motion.div 
                      className="bg-blue-500 h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(initProgress.progress * 100)}%` }}
                      transition={{ bounce: 0 }}
                   />
                 </div>
               </div>
            )}
            
            {engineState === 'error' && (
               <div className="bg-red-950/20 p-3 rounded-lg border border-red-900/50 text-xs text-red-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
               </div>
            )}
         </div>

         {/* Console Logs */}
         <div 
            ref={scrollRef}
            className="flex-1 bg-[#050505] p-3 rounded-lg border border-gray-800 overflow-y-auto max-h-48 text-[11px] leading-relaxed relative"
         >
            {logs.length === 0 ? (
               <div className="text-gray-600 italic h-full flex items-center justify-center">Awaiting initialization command...</div>
            ) : (
               logs.map((log, i) => (
                  <div key={i} className="mb-1 opacity-90">{log}</div>
               ))
            )}
         </div>
       </div>
    </div>
  );
}
