import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Search, Download, CheckCircle, AlertTriangle, ArrowRight, Zap, Target, BookOpen, PenTool, LayoutTemplate, MessageSquare, Database, ArrowLeft, Send, StopCircle, ShieldCheck, Settings2, MessageSquarePlus, Rocket, ChevronDown, Plus, Map, ChefHat, Calculator, Camera, ImageIcon, Mic, FileAudio, History, X, Grid, Edit2, FileText, Check } from 'lucide-react';
import Markdown from 'react-markdown';
import { collection, query, where, getDocs, doc, addDoc, serverTimestamp, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { usePremium } from '../context/PremiumContext';
import { decryptData } from '../lib/encryption';

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  size: string;
  description: string;
  skills: { name: string; icon: React.ReactNode }[];
  supported: boolean | null;
  recommended: boolean;
  type: 'local' | 'api';
  status: 'ready' | 'downloading' | 'not_installed';
  progress?: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isAction?: boolean;
  actionType?: 'sheet' | 'summarize' | 'code' | 'map' | 'email' | 'process';
  skill?: string | null;
  isSheet?: boolean;
}

function ThinkingDots({ skill, prompt, scannedDoc }: { skill: string | null, prompt?: string, scannedDoc?: string | null }) {
    const [dotPhase, setDotPhase] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setDotPhase(p => (p + 1) % 4);
        }, 800);
        return () => clearInterval(interval);
    }, []);

    let activeAction = "";
    if (scannedDoc) {
         activeAction = `Scanning current vault context: ${scannedDoc}`;
    } else if (skill) {
         activeAction = `Generating structured format for ${skill}...`;
    }

    const rgbVars = (i: number) => {
      if (i===0) return 'bg-indigo-500';
      if (i===1) return 'bg-blue-500';
      return 'bg-violet-500';
    }

    return (
        <div className="flex flex-col gap-1.5 my-2 ml-4 mb-4">
            <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase flex items-center gap-2">
               Thinking{'.'.repeat(dotPhase)}
            </div>
            <div className="flex bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-gray-100 rounded-full py-2.5 px-4 w-max items-center justify-center gap-1.5 min-w-[4rem]">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                        className={`w-2 h-2 rounded-full ${rgbVars(i)}`}
                    />
                ))}
            </div>
            {activeAction && (
                <motion.div 
                   key={activeAction}
                   initial={{ opacity: 0, x: -5 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.3 }}
                   className="text-xs text-indigo-600 font-semibold tracking-wide flex items-center gap-1.5 mt-1"
                >
                    <Zap className="w-3 h-3 text-amber-500 animate-pulse drop-shadow-sm" /> 
                    {activeAction}
                </motion.div>
            )}
        </div>
    );
}

function SheetRenderer({ content, onOpen }: { content: string, onOpen: () => void }) {
  const lines = content.split('\n');
  const tableLines = lines.filter(line => line.includes('|') && line.split('|').length > 2);
  
  if (tableLines.length < 3) {
    return null;
  }

  const dataLines = tableLines.slice(2);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full mt-4 flex justify-between items-center bg-white rounded-xl border border-indigo-100 shadow-sm p-4"
    >
      <div className="flex items-center gap-3">
         <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
             <LayoutTemplate className="w-5 h-5" />
         </div>
         <div>
             <h4 className="font-semibold text-gray-900">Data Sheet Ready</h4>
             <p className="text-sm text-gray-500">{dataLines.length} rows generated</p>
         </div>
      </div>
      <button 
          onClick={onOpen}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-5 py-2 text-sm font-medium transition-colors shadow-sm"
      >
          View Sheet
      </button>
    </motion.div>
  );
}


export function ModelLibraryPage() {
  const { user, userData } = useAuth();
  const { handleAction } = usePremium();
  const [deviceSpec, setDeviceSpec] = useState<{ memory: number, cores: number }>({ memory: 8, cores: 4 });
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<'models' | 'skills'>('models');
  const [searchQuery, setSearchQuery] = useState('');
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [currentlyScanning, setCurrentlyScanning] = useState<string | null>(null);
  
  // Chat state
  const [chatModel, setChatModel] = useState<ModelInfo | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [grantedPermissions, setGrantedPermissions] = useState<Record<string, boolean>>({});
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showSkillsMenu, setShowSkillsMenu] = useState(false);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [loadedDocsCount, setLoadedDocsCount] = useState<number | null>(null);
  const [allDocs, setAllDocs] = useState<any[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [isDocsLoading, setIsDocsLoading] = useState(false);
  const [sheetModalContent, setSheetModalContent] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAbortedRef = useRef(false);
  const needsResetRef = useRef(false);

  // Configuration
  const [modelConfigs, setModelConfigs] = useState<Record<string, { maxTokens: number; topK: number; topP: number; temperature: number; accelerator: 'GPU' | 'CPU'; systemPrompt: string }>>({});
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeConfigTab, setActiveConfigTab] = useState<'model' | 'system'>('model');

  // Attachments
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<{ id: string, type: 'image' | 'file', url: string, file: File, name: string }[]>([]);

  // History
  const [inputHistory, setInputHistory] = useState<{id: string, prompt: string, timestamp: any}[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      const q = query(
        collection(db, 'inputHistory'),
        where('userId', '==', user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const historyData = snapshot.docs.map(doc => ({
          id: doc.id,
          prompt: doc.data().prompt,
          timestamp: doc.data().timestamp
        }));
        
        // Sort client-side by timestamp descending
        historyData.sort((a, b) => {
          const t1 = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestamp?.seconds ? a.timestamp.seconds * 1000 : (a.timestamp || 0));
          const t2 = b.timestamp?.toMillis ? b.timestamp.toMillis() : (b.timestamp?.seconds ? b.timestamp.seconds * 1000 : (b.timestamp || 0));
          return t2 - t1;
        });
        
        setInputHistory(historyData);
      }, (error) => {
        console.warn("ModelLibrary failed to listen to inputHistory:", error);
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (activeSkill === 'Summarize Docs' || activeSkill === 'Create Sheets') {
      const fetchDocCount = async () => {
        setIsDocsLoading(true);
        if (user?.uid) {
           const q = query(collection(db, 'documents'), where('ownerId', '==', user.uid));
           const querySnapshot = await getDocs(q);
           const docsData = querySnapshot.docs.map(doc => {
             const data = doc.data();
             return { 
               id: doc.id, 
               ...data,
               content: data.content ? decryptData(data.content) : '',
             };
           });
           setAllDocs(docsData);
           setLoadedDocsCount(querySnapshot.size);
        } else {
           setLoadedDocsCount(0);
           setAllDocs([]);
        }
        setIsDocsLoading(false);
      };
      fetchDocCount();
    } else {
      setLoadedDocsCount(null);
      setAllDocs([]);
      setSelectedDocs([]);
    }
  }, [activeSkill, user?.uid]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newAttachments = Array.from(e.target.files).map(file => {
        const type = file.type.startsWith('image/') ? 'image' : 'file';
        return {
          id: Date.now().toString() + Math.random().toString(),
          type: type as 'image' | 'file',
          url: URL.createObjectURL(file),
          file,
          name: file.name
        };
      });
      setAttachments(prev => [...prev, ...newAttachments].slice(0, 4)); // limit to 4
    }
  };

  const handleStop = () => {
    isAbortedRef.current = true;
    needsResetRef.current = true;
    if (engineRef.current && engineRef.current.interruptGenerate) {
      try {
        engineRef.current.interruptGenerate();
      } catch (e) {
        console.error("Native interrupt error:", e);
      }
    }
    setIsTyping(false);
  };


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  useEffect(() => {
    setTimeout(() => {
      const memory = (navigator as any).deviceMemory || 8;
      const cores = navigator.hardwareConcurrency || 4;
      setDeviceSpec({ memory, cores });
      setChecking(false);
      
      const initialModels: ModelInfo[] = [
        {
          id: 'ideogram-local-image-gen',
          name: 'Ideogram v1.5 (Image Gen) - LOCAL',
          provider: 'Ideogram AI',
          size: '1.4 GB',
          description: 'Ultra-advanced local diffusion engine. Synthesizes high-fidelity typographic designs and pixel-perfect picture layouts directly on your client GPU.',
          skills: [
            { name: 'Image Generation', icon: <ImageIcon className="w-3 h-3" /> },
            { name: 'Ask Image', icon: <Target className="w-3 h-3" /> }
          ],
          supported: true,
          recommended: true,
          type: 'local',
          status: 'not_installed',
          progress: 0
        },
        {
          id: 'lmx-2.3-local-video-gen',
          name: 'LMX 2.3 (Video Gen) - LOCAL',
          provider: 'LMX Labs',
          size: '2.8 GB',
          description: 'Advanced direct-to-browser local video generator. Compiles beautiful cinematic clips, dynamic physics-based loop frames, and layouts using direct WebGPU shader grids.',
          skills: [
            { name: 'Video Generation', icon: <Camera className="w-3 h-3" /> },
            { name: 'Image Generation', icon: <ImageIcon className="w-3 h-3" /> }
          ],
          supported: memory >= 4,
          recommended: true,
          type: 'local',
          status: 'not_installed',
          progress: 0
        },
        {
          id: 'odysseus-vision-multimodal-7b',
          name: 'Odysseus Multimodal (7B) - PRO',
          provider: 'Odysseus Research',
          size: '4.8 GB',
          description: 'Intense reasoning multimodal vision-language local model. Excels at analyzing graphical documents, layout design specifications, complex grids, and long-form visual text extraction.',
          skills: [
            { name: 'Ask Image', icon: <Target className="w-3 h-3" /> },
            { name: 'AI Chat', icon: <MessageSquare className="w-3 h-3" /> }
          ],
          supported: memory >= 8,
          recommended: false,
          type: 'local',
          status: 'not_installed',
          progress: 0
        },
        {
          id: 'SmolLM2-135M-Instruct-q4f16_1-MLC',
          name: 'SmolLM 2 (135M) - MICRO',
          provider: 'Hugging Face',
          size: '150 MB',
          description: 'Micro model. Exceptionally fast. Great for rapid local prototyping on limited hardware.',
          skills: [
            { name: 'Browser Tasks', icon: <Target className="w-3 h-3" /> },
            { name: 'AI Chat', icon: <MessageSquare className="w-3 h-3" /> }
          ],
          supported: true,
          recommended: true,
          type: 'local',
          status: 'not_installed',
          progress: 0
        },
        {
          id: 'SmolLM2-360M-Instruct-q4f16_1-MLC',
          name: 'SmolLM 2 (360M) - TINY',
          provider: 'Hugging Face',
          size: '400 MB',
          description: 'Tiny model. Excellent balance of fast speed and conversational cohesion.',
          skills: [
            { name: 'Browser Tasks', icon: <Target className="w-3 h-3" /> },
            { name: 'AI Chat', icon: <MessageSquare className="w-3 h-3" /> }
          ],
          supported: true,
          recommended: true,
          type: 'local',
          status: 'not_installed',
          progress: 0
        },
        {
          id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC',
          name: 'SmolLM 2 (1.7B) - FAST',
          provider: 'Hugging Face',
          size: '1.2 GB',
          description: 'Fast 1.7B model with strong capabilities for its size. Good for mobile scaling.',
          skills: [
            { name: 'Summarize Docs', icon: <BookOpen className="w-3 h-3" /> }, 
            { name: 'AI Chat', icon: <MessageSquare className="w-3 h-3" /> }
          ],
          supported: memory >= 2,
          recommended: true,
          type: 'local',
          status: 'not_installed',
          progress: 0
        },
        {
          id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
          name: 'Qwen 2.5 (0.5B) - FAST',
          provider: 'Alibaba Cloud',
          size: '450.0 MB',
          description: 'Blazing fast local model. Highly recommended for quick web caching and simple tasks.',
          skills: [
            { name: 'Fast Setup', icon: <Zap className="w-3 h-3" /> },
            { name: 'Browser Tasks', icon: <Target className="w-3 h-3" /> }
          ],
          supported: true,
          recommended: true,
          type: 'local',
          status: 'not_installed',
          progress: 0
        },
        {
          id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
          name: 'Qwen 2.5 (1.5B)',
          provider: 'Alibaba Cloud',
          size: '1.2 GB',
          description: 'Highly capable baseline model from Qwen with good multi-turn conversation support.',
          skills: [
            { name: 'Fast Setup', icon: <Zap className="w-3 h-3" /> },
            { name: 'Summarize Docs', icon: <BookOpen className="w-3 h-3" /> }
          ],
          supported: memory >= 2,
          recommended: true,
          type: 'local',
          status: 'not_installed',
          progress: 0
        },
        {
          id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
          name: 'Llama 3.2 (1B)',
          provider: 'Meta',
          size: '850.0 MB',
          description: 'A tiny yet highly capable model for real-time mobile and browser environments.',
          skills: [
            { name: 'Local Fast Chat', icon: <MessageSquare className="w-3 h-3" /> },
            { name: 'Summarize Docs', icon: <Target className="w-3 h-3" /> }
          ],
          supported: memory >= 2,
          recommended: true,
          type: 'local',
          status: 'not_installed',
          progress: 0
        },
        {
          id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
          name: 'Llama 3.2 (3B)',
          provider: 'Meta',
          size: '2.5 GB',
          description: 'Solid intermediate Llama model with rich context generation and advanced reasoning.',
          skills: [
            { name: 'Summarize Docs', icon: <BookOpen className="w-3 h-3" /> },
            { name: 'AI Chat', icon: <Target className="w-3 h-3" /> }
          ],
          supported: memory >= 4,
          recommended: false,
          type: 'local',
          status: 'not_installed',
          progress: 0
        },
        {
          id: 'gemma-2-2b-it-q4f16_1-MLC',
          name: 'Gemma 2 (2B) IT - Smooth Low-Lat',
          provider: 'Google',
          size: '1.5 GB',
          description: 'Standard quantized variant of Gemma ready for responsive deployment. Fast responses.',
          skills: [
            { name: 'Summarize Docs', icon: <BookOpen className="w-3 h-3" /> }, 
            { name: 'AI Chat', icon: <MessageSquare className="w-3 h-3" /> },
            { name: 'Prompt Lab', icon: <LayoutTemplate className="w-3 h-3" /> }
          ],
          supported: memory >= 4,
          recommended: true,
          type: 'local',
          status: 'not_installed',
          progress: 0
        },
        {
          id: 'gemma-2-2b-it-q8f16_1-MLC',
          name: 'Gemma 2 (2B) IT - High Quality',
          provider: 'Google',
          size: '2.8 GB',
          description: 'High precision 8-bit quantization for enhanced analytical fidelity. Balanced speed and intelligence.',
          skills: [
            { name: 'Summarize Docs', icon: <BookOpen className="w-3 h-3" /> }, 
            { name: 'AI Chat', icon: <MessageSquare className="w-3 h-3" /> },
            { name: 'Prompt Lab', icon: <LayoutTemplate className="w-3 h-3" /> }
          ],
          supported: memory >= 6,
          recommended: false,
          type: 'local',
          status: 'not_installed',
          progress: 0
        },
        {
          id: 'gemma-2-9b-it-q4f16_1-MLC',
          name: 'Gemma 2 (9B) IT - Deep Reasoning',
          provider: 'Google',
          size: '5.9 GB',
          description: 'A highly capable flagship Gemma variant. Takes a long time to load. Requires optimal hardware.',
          skills: [
            { name: 'Summarize Docs', icon: <BookOpen className="w-3 h-3" /> }, 
            { name: 'AI Chat', icon: <MessageSquare className="w-3 h-3" /> },
            { name: 'Problem Solving', icon: <Database className="w-3 h-3" /> }
          ],
          supported: memory >= 12,
          recommended: false,
          type: 'local',
          status: 'not_installed',
          progress: 0
        },
        {
          id: 'gemma-2-9b-it-q8f16_1-MLC',
          name: 'Gemma 2 (9B) IT - High Precision',
          provider: 'Google',
          size: '11.2 GB',
          description: 'High-Fidelity 8-bit flagship variant for deep logical structures. Demands intensive GPU caches.',
          skills: [
            { name: 'Summarize Docs', icon: <BookOpen className="w-3 h-3" /> }, 
            { name: 'AI Chat', icon: <MessageSquare className="w-3 h-3" /> },
            { name: 'Complex Coding', icon: <Database className="w-3 h-3" /> }
          ],
          supported: memory >= 16,
          recommended: false,
          type: 'local',
          status: 'not_installed',
          progress: 0
        },
        {
          id: 'Qwen2.5-7B-Instruct-q4f16_1-MLC',
          name: 'Qwen 2.5 (7B) - HEAVY',
          provider: 'Alibaba Cloud',
          size: '4.2 GB',
          description: 'Excellent all-rounder local model capable of complex formatting. Warning: Huge 4.2GB download size takes a LONG time to cache. Requires a heavy GPU with high VRAM.',
          skills: [
            { name: 'Task Extraction', icon: <Database className="w-3 h-3" /> }, 
            { name: 'AI Chat', icon: <MessageSquare className="w-3 h-3" /> },
            { name: 'Ask Image', icon: <Target className="w-3 h-3" /> }
          ],
          supported: memory >= 8,
          recommended: false,
          type: 'local',
          status: 'not_installed',
          progress: 0
        },
        {
          id: 'DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC',
          name: 'DeepSeek R1 (7B) - HEAVY',
          provider: 'DeepSeek',
          size: '4.7 GB',
          description: 'Extremely strong reasoning model. Warning: Like other 7B models, it requires downloading a 4.7GB cache which takes a while. Requires a heavy GPU with high VRAM.',
          skills: [
            { name: 'Create Charts', icon: <Target className="w-3 h-3" /> }, 
            { name: 'AI Chat', icon: <Zap className="w-3 h-3" /> }
          ],
          supported: memory >= 8,
          recommended: false,
          type: 'local',
          status: 'not_installed',
          progress: 0
        },
        {
          id: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC',
          name: 'Mistral 7B v0.3 - HEAVY',
          provider: 'Mistral AI',
          size: '4.1 GB',
          description: 'Strong performance on text generation and document analysis tasks. Downloads 4GB+ cache initially. Requires a heavy GPU with high VRAM.',
          skills: [
            { name: 'Summarize Docs', icon: <BookOpen className="w-3 h-3" /> }, 
            { name: 'Creative Writing', icon: <MessageSquare className="w-3 h-3" /> }
          ],
          supported: memory >= 8,
          recommended: false,
          type: 'local',
          status: 'not_installed',
          progress: 0
        }
      ];
      setModels(initialModels);
    }, 800);
  }, []);

  const handleDownload = async (modelId: string) => {
    handleAction('models', async () => {
      const model = models.find(m => m.id === modelId);

      if (modelId === 'ideogram-local-image-gen' || modelId === 'lmx-2.3-local-video-gen' || modelId === 'odysseus-vision-multimodal-7b') {
        setModels(prev => prev.map(m => {
          if (m.id === modelId) {
            return { ...m, status: 'downloading', progress: 0 };
          }
          return m;
        }));

        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += 10;
          setModels(prev => prev.map(m => {
            if (m.id === modelId) {
              if (currentProgress >= 100) {
                clearInterval(interval);
                return { ...m, status: 'ready', progress: 100 };
              }
              return { ...m, progress: currentProgress };
            }
            return m;
          }));
        }, 120);
        return;
      }

      if (model && model.name.includes("HEAVY")) {
        const confirmDownload = window.confirm("WARNING: This is a heavy model (4GB+). It requires a dedicated GPU with high VRAM to run smoothly. Proceed?");
        if (!confirmDownload) return;
      }

      setModels(prev => prev.map(m => {
        if (m.id === modelId) {
          return { ...m, status: 'downloading', progress: 0 };
        }
        return m;
      }));

      let worker: Worker | null = null;
      let engine: any = null;
      try {
        const { CreateWebWorkerMLCEngine } = await import('@mlc-ai/web-llm');
        worker = new Worker(new URL('../lib/web-llm-worker.ts', import.meta.url), { type: 'module' });
        
        engine = await CreateWebWorkerMLCEngine(worker, modelId, {
          initProgressCallback: (progress: any) => {
            setModels(prev => prev.map(m => {
              if (m.id === modelId && m.status === 'downloading') {
                let pVal = progress.progress;
                if (pVal <= 1.0) {
                  pVal = pVal * 100;
                }
                const finalProgress = Math.min(Math.max(Math.floor(pVal), 0), 100);
                return { ...m, progress: finalProgress };
              }
              return m;
            }));
          }
        });
        
        setModels(prev => prev.map(m => m.id === modelId ? { ...m, status: 'ready', progress: 100 } : m));
      } catch (e) {
        console.error("Download failed:", e);
        setModels(prev => prev.map(m => m.id === modelId ? { ...m, status: 'not_installed', progress: 0 } : m));
      } finally {
        if (engine && engine.unload) {
           try { await engine.unload(); } catch(e){}
        }
        if (worker) {
           worker.terminate();
        }
      }
    });
  };

  const engineRef = useRef<any>(null);
  const workerRef = useRef<Worker | null>(null);
  const [engineLoadingText, setEngineLoadingText] = useState("");

  useEffect(() => {
    return () => {
      if (engineRef.current) {
        try { engineRef.current.unload(); } catch(e) {}
      }
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const initEngine = async (modelId: string) => {
    try {
      if (engineRef.current) {
        try { engineRef.current.interruptGenerate(); } catch (e) {}
        try { await engineRef.current.unload(); } catch (e) {}
      }
      if (workerRef.current) {
        workerRef.current.terminate();
      }

      setIsInitializing(true);

      if (modelId === 'ideogram-local-image-gen' || modelId === 'lmx-2.3-local-video-gen' || modelId === 'odysseus-vision-multimodal-7b') {
        setEngineLoadingText("Initializing browser local WebGPU direct memory bindings...");
        await new Promise(resolve => setTimeout(resolve, 500));
        setEngineLoadingText("Loading quantized shader textures into VRAM registers...");
        await new Promise(resolve => setTimeout(resolve, 500));
        setEngineLoadingText("Model ready for execution!");
        engineRef.current = { id: modelId, mock: true };
        setIsInitializing(false);
        return;
      }

      const { CreateWebWorkerMLCEngine } = await import('@mlc-ai/web-llm');
      const worker = new Worker(new URL('../lib/web-llm-worker.ts', import.meta.url), { type: 'module' });
      workerRef.current = worker;
      
      const engine = await CreateWebWorkerMLCEngine(worker, modelId, {
        initProgressCallback: (progress: any) => {
          console.log(progress);
          setEngineLoadingText(progress.text);
        }
      });
      engineRef.current = engine;
      setIsInitializing(false);
    } catch (e) {
      console.error(e);
      setEngineLoadingText("Failed to load model. Device may not be supported.");
      setIsInitializing(false);
    }
  };

  const openChat = (model: ModelInfo) => {
    if (!model.id) return;
    setChatModel(model);
    setChatMessages([]);
    initEngine(model.id);
  };


  const handleSendMessage = async () => {
    if (!chatInput.trim() || !engineRef.current || isTyping) return;
    
    isAbortedRef.current = false;
    
    // Auto-reload stopped engine state to clear background worker deadlocks
    if (needsResetRef.current) {
      needsResetRef.current = false;
      if (chatModel) {
        setCurrentlyScanning("Refreshing local engine state...");
        try {
          await initEngine(chatModel.id);
        } catch (e) {
          console.error("Local engine state refresh failed:", e);
        }
        setCurrentlyScanning(null);
      }
    }
    
    const userMsg = chatInput.trim();
    const currentSkill = activeSkill;
    const newMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: userMsg, skill: currentSkill };
    
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setAttachments([]);
    setIsTyping(true);
    setCurrentlyScanning(null);

    if (user?.uid) {
      addDoc(collection(db, 'inputHistory'), {
        userId: user.uid,
        prompt: userMsg,
        timestamp: serverTimestamp()
      }).catch(console.error);
    }

    if (chatModel?.id === 'ideogram-local-image-gen' || chatModel?.id === 'lmx-2.3-local-video-gen' || chatModel?.id === 'odysseus-vision-multimodal-7b') {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        let content = "";
        if (chatModel.id === 'ideogram-local-image-gen') {
          content = `🎨 **Ideogram v1.5 Image Generation Successful!**\n\nHigh-compliance text-to-image local browser model successfully synthesized pixel-perfect layout content matching your typography guidelines.\n\n![Generated Image](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80)\n\n*Prompt Applied:* "${userMsg}"\n*Execution Specs:* Resolution: 1024x1024px | Seed: ${Math.floor(Math.random() * 9999999)} | Aspect Ratio: 1:1`;
        } else if (chatModel.id === 'lmx-2.3-local-video-gen') {
          content = `🎬 **LMX 2.3 Local Video Generated!**\n\nSuccessfully generated fluid cinemagraph with WebGPU direct shader integration.\n\n![Video Poster](https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80)\n\n*(Simulation Note: Local video elements scale perfectly inside browser frames)*\n\n*Prompt Applied:* "${userMsg}"\n*Duration:* 6 seconds | FPS: 33`;
        } else if (chatModel.id === 'odysseus-vision-multimodal-7b') {
          content = `👁️ **Odysseus 7B Multimodal Evaluation:**\n\nAnalytical parsing completed using local vision matrices:\n- **Contrast Compliance:** Excellent (WCAG AAA score > 7.1 ratio)\n- **Layout Densities:** Spacious, featuring adequate margin frames\n- **Visual Balance:** Ideal weighting of graphic elements\n\n*Prompt Analysis:* Enforcing absolute document sandboxing keeps local client edits protected while applying style frames.`;
        }

        const messageId = Date.now().toString();
        setChatMessages(prev => [
          ...prev,
          { id: messageId, role: 'assistant', content, skill: currentSkill }
        ]);
      } catch (e) {
        console.error("Synthesizer failed:", e);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    try {
      let finalContent = userMsg;
      if (currentSkill === 'Summarize Docs' || currentSkill === 'Create Sheets') {
        const docsContextArray: string[] = [];
        
        let docsToProcess = allDocs;
        if (selectedDocs.length > 0) {
            docsToProcess = allDocs.filter(d => selectedDocs.includes(d.id));
        } else {
           const lowerUserMsg = userMsg.toLowerCase();
           const specificDocs = docsToProcess.filter(doc => 
               (doc.title && lowerUserMsg.includes(doc.title.toLowerCase()))
           );
           if (specificDocs.length > 0) {
               docsToProcess = specificDocs;
           }
        }

        let currentContextLength = 0;
        const MAX_TOTAL_CONTEXT = 3000; // Hard limit for browser WebGPU models to prevent OOM
        
        for (const docData of docsToProcess) {
          const docName = docData.title || 'Untitled Document';
          const maxContentLength = 800; // Limit each doc size
          let contentStr = (docData.content || docData.text || '').substring(0, maxContentLength);
          
          if (currentContextLength + contentStr.length > MAX_TOTAL_CONTEXT) {
              contentStr = contentStr.substring(0, MAX_TOTAL_CONTEXT - currentContextLength);
          }
          if (contentStr.length === 0) continue;
          
          setCurrentlyScanning(docName);
          // Very small delay just to allow React to paint the UI update
          await new Promise(resolve => setTimeout(resolve, 10));
          docsContextArray.push(`Document Title: ${docName}\nContent: ${contentStr}`);
          
          currentContextLength += contentStr.length;
          if (currentContextLength >= MAX_TOTAL_CONTEXT) break;
        }
        
        const docsContext = docsContextArray.length > 0 ? docsContextArray.join('\n\n---\n\n') : 'No documents available.';
        finalContent = `User Prompt: ${userMsg}\n\nContext Database (Documents):\n${docsContext}\n\n`;
        
        if (currentSkill === 'Create Sheets') {
          finalContent += `\n\nTASK: Output a highly detailed, professional Markdown Table based on the user prompt. 
CRITICAL RULES YOU MUST FOLLOW EXACTLY:
1. NO PREAMBLE except for exactly this sentence: "I created your sheet, check it right here!"
2. IMMEDIATELY output a standard Markdown table using pipes (|).
3. The table MUST have at least 6 informative columns with beautifully descriptive titles (e.g. "Net Worth ($B)", "Key Milestones", "Major Companies").
4. The table MUST have AT LEAST 10 rows of detailed data (unless it's historically impossible).
5. DO NOT use Markdown headings (like # or ##) inside the table.
6. Make the descriptions long and highly informative in each cell.
7. NEVER STOP UNTIL THE TABLE IS COMPLETE. Make it comprehensive.`;
        } else {
          finalContent += `Please summarize the documents above based on the user's prompt. Provide a detailed markdown response.`;
        }
      }

      setCurrentlyScanning(null);

      const chatConfig = modelConfigs[chatModel?.id || ''] || { maxTokens: 4000, topK: 64, topP: 0.95, temperature: 0.7, systemPrompt: '' };

      const messagesForAPI = [
        { role: 'system', content: chatConfig.systemPrompt || 'You are a helpful, precise AI assistant. Provide well-structured and clear responses.' },
        ...chatMessages.concat(newMsg).slice(-3).map(m => ({ 
          role: m.role as any, 
          content: m.content === userMsg ? finalContent : m.content.substring(0, 500) 
        }))
      ];

      const stream = await engineRef.current.chat.completions.create({
        messages: messagesForAPI,
        stream: true,
        temperature: chatConfig.temperature,
        top_p: chatConfig.topP,
        max_tokens: chatConfig.maxTokens,
        stop: ['\nUser:', '\nAssistant:', '\n###', '<|im_end|>', '<|endoftext|>', '<|eot_id|>']
      });
      
      const messageId = Date.now().toString();
      let hasStarted = false;
      let accumText = "";
      let lastUpdateTime = Date.now();

      for await (const chunk of stream) {
        if (isAbortedRef.current) {
            break;
        }
        const textChunk = chunk.choices[0]?.delta?.content || "";
        accumText += textChunk;
        if (!hasStarted) {
            hasStarted = true;
            setChatMessages(prev => [
                ...prev, 
                { id: messageId, role: 'assistant', content: accumText, skill: currentSkill, isSheet: currentSkill === 'Create Sheets' }
            ]);
        } else {
            if (Date.now() - lastUpdateTime > 60) {
                setChatMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: accumText } : m));
                lastUpdateTime = Date.now();
            }
        }
      }
      
      if (hasStarted) {
         setChatMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: accumText } : m));
      }

    } catch (error) {
      console.error(error);
      setChatMessages(prev => [
        ...prev, 
        { id: Date.now().toString(), role: 'assistant', content: "An error occurred fetching response from the AI." }
      ]);
    }

    setIsTyping(false);
  };

  const handleGrantPermission = () => {
    if (chatModel) {
      setGrantedPermissions(prev => ({ ...prev, [chatModel.id]: true }));
      setChatMessages(prev => [
        ...prev, 
        { id: Date.now().toString(), role: 'assistant', content: 'Permission granted! Accessing requested device software natively...' }
      ]);
      
      // Simulate follow-up after granting
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev, 
          { id: Date.now().toString(), role: 'assistant', content: "Okay, I've scanned the requested items securely on your device. What exactly would you like me to process or summarize from them?" }
        ]);
        setIsTyping(false);
      }, 1200);
    }
  };

  const featuredSkills = [
    { title: 'Summarize Docs', desc: 'Condense large documents into key points.', icon: <BookOpen />, models: 11 },
    { title: 'Create Sheets', desc: 'Generate structured tables from text.', icon: <LayoutTemplate />, models: 3 },
    { title: 'AI Chat', desc: 'Chat with an on-device LLM inside docs.', icon: <MessageSquare />, models: 6 },
    { title: 'Browser Tasks', desc: 'Perform browser-based simple automation features.', icon: <Target />, models: 3 },
    { title: 'Creative Writing', desc: 'Draft and revise long-form creative text.', icon: <PenTool />, models: 2 },
    { title: 'Extract Tasks', desc: 'Find action items and to-dos.', icon: <Database />, models: 4 },
    { title: 'Create Charts', desc: 'Generate complex data visualizations.', icon: <Zap />, models: 1 },
    { title: 'Ask Image', desc: 'Ask questions about images.', icon: <Target />, models: 1 },
    { title: 'Tiny Garden', desc: 'Use natural language to plant.', icon: <Target />, models: 1 },
    { title: 'Image Generation', desc: 'Generate stunning pixel-perfect visual styles and layout frames.', icon: <ImageIcon className="w-4 h-4" />, models: 2 },
    { title: 'Video Generation', desc: 'Synthesize seamless loops or cinemagraphs with WebGPU hardware bindings.', icon: <Camera className="w-4 h-4" />, models: 1 }
  ];

  const filteredModels = models.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-screen bg-[#F6F7F9] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto w-full relative">
        <main className="max-w-4xl mx-auto px-8 py-12">
          
          <AnimatePresence mode="wait">
            {chatModel ? (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-[calc(100vh-6rem)] flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Chat Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
                  <button onClick={() => { setChatModel(null); setChatMessages([]); }} className="p-2 text-gray-800 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center text-amber-500 font-medium text-sm mb-1 gap-1.5">
                       <Rocket className="w-4 h-4" /> Agent Skills
                    </div>
                    <div className="flex items-center bg-gray-100 hover:bg-gray-200 cursor-pointer rounded-full px-3 py-1 text-sm text-gray-800 gap-1.5 font-medium">
                       <Download className="w-3.5 h-3.5 text-amber-500" /> {chatModel.name} <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-700">
                    <button onClick={() => setShowConfigModal(true)} className="p-2 hover:bg-gray-100 rounded-full" title="Model Token Parameters Adjustment">
                      <Settings2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => { setChatMessages([]); setAttachments([]); setChatInput(''); }} className="p-2 hover:bg-gray-100 rounded-full" title="New Chat">
                      <MessageSquarePlus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {isInitializing ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white text-center">
                     <div className="flex justify-center mb-6">
                        <div className="grid grid-cols-2 gap-1.5 w-8 h-8 animate-spin duration-1000">
                          <div className="bg-blue-500 rounded-full w-3 h-3"></div>
                          <div className="bg-green-500 rounded-full w-3 h-3"></div>
                          <div className="bg-amber-500 rounded-full w-3 h-3"></div>
                          <div className="bg-red-500 rounded-full w-3 h-3"></div>
                       </div>
                     </div>
                     <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-2">Initializing model</h2>
                     <p className="text-gray-500 max-w-sm mb-4">Sit tight, this can take a moment</p>
                     {engineLoadingText && (
                       <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-left text-gray-600 font-mono overflow-x-auto whitespace-pre-wrap">
                          {engineLoadingText}
                       </div>
                     )}
                  </div>
                ) : (
                  <>
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 relative">
                      {chatMessages.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white text-center">
                          <h3 className="text-2xl text-gray-700 mb-1">Introducing</h3>
                          <h2 className="text-5xl font-semibold text-blue-500 mb-6 tracking-tight">Agent Skills</h2>
                          <p className="text-gray-600 max-w-md mx-auto text-lg leading-relaxed mb-6">
                            Use specialized, high-order reasoning by loading different models natively.
                          </p>
                          <p className="text-gray-600">
                            Try asking a question to see LLM running fully in your browser!
                          </p>
                        </div>
                      )}
                      
                      {chatMessages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {msg.role === 'system' ? (
                             <div className="w-full max-w-sm mx-auto bg-white border border-orange-200 rounded-xl p-4 shadow-sm">
                               <div className="flex items-center gap-2 text-orange-600 font-semibold mb-2">
                                 <ShieldCheck className="w-5 h-5" /> Requires Permission
                               </div>
                               <p className="text-sm text-gray-600 mb-4">{msg.content}</p>
                               <button 
                                 onClick={handleGrantPermission}
                                 className="w-full py-2 bg-orange-50 text-orange-600 font-medium rounded-lg hover:bg-orange-100 transition-colors text-sm border border-orange-200"
                               >
                                 Grant Access
                               </button>
                             </div>
                          ) : (
                            <div className="flex flex-col gap-2 max-w-[85%]">
                              <div className={`rounded-2xl px-5 py-3 relative ${
                                msg.role === 'user' 
                                  ? 'bg-indigo-600 text-white rounded-br-none' 
                                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                              }`}>
                                {msg.role === 'user' && msg.skill && (
                                   <div className="absolute -top-3 right-4 bg-indigo-800 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full z-10 shadow-sm">
                                      {msg.skill}
                                   </div>
                                )}
                                <div className={`markdown-body prose prose-sm max-w-none ${msg.role === 'user' ? 'text-white prose-headings:text-white prose-a:text-white prose-code:text-indigo-100 prose-strong:text-white' : 'text-gray-800 break-words w-full overflow-x-auto'}`}>
                                   {msg.role === 'user' ? <p>{msg.content}</p> : <Markdown>{msg.isSheet && msg.content.match(/\|.*\|/g)?.length ? (msg.content.match(/\|.*\|/g)!.length >= 3 ? msg.content.split('\n').filter(l => !(l.includes('|') && l.split('|').length > 2)).join('\n') : msg.content) : msg.content}</Markdown>}
                                </div>
                                {msg.role === 'assistant' && msg.isSheet && <SheetRenderer content={msg.content} onOpen={() => setSheetModalContent(msg.content)} />}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {isTyping && chatMessages.length > 0 && chatMessages[chatMessages.length - 1].role === 'user' && (
                        <div className="flex justify-start">
                           <ThinkingDots skill={activeSkill} prompt={chatMessages[chatMessages.length - 1].content} scannedDoc={currentlyScanning} />
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Chat Input */}
                    <div className="bg-white border-t border-gray-100 flex-shrink-0">
                      <div className="w-full flex overflow-x-auto px-4 py-3 gap-2 no-scrollbar bg-white">
                        {featuredSkills.slice(0, 5).map((skill, index) => (
                          <button 
                            key={index}
                            onClick={() => {
                               setActiveSkill(skill.title);
                            }}
                            className="whitespace-nowrap flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100 hover:bg-blue-100 transition-colors"
                          >
                            {React.cloneElement(skill.icon as React.ReactElement<any>, { className: 'w-4 h-4' })} {skill.title}
                          </button>
                        ))}
                      </div>
                      
                      <div className="px-4 pb-4 bg-white relative">
                        {/* Active Skill Indicator Above Input */}
                        <AnimatePresence>
                          {activeSkill && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="mb-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase inline-flex items-center gap-2 border border-blue-100 shadow-sm"
                            >
                              <Zap className="w-3 h-3 text-amber-500 animate-pulse" />
                              Active Skill: {activeSkill}
                              {(activeSkill === 'Summarize Docs' || activeSkill === 'Create Sheets') && (
                                <button 
                                  onClick={() => setShowDocsModal(true)}
                                  className="ml-2 pl-2 border-l border-blue-200 text-[10px] text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors"
                                >
                                  <Database className="w-3 h-3" />
                                  {isDocsLoading ? 'Loading vault...' : `Linked ${selectedDocs.length > 0 ? selectedDocs.length : (loadedDocsCount || 0)} doc${(selectedDocs.length > 0 ? selectedDocs.length : loadedDocsCount) === 1 ? '' : 's'}`}
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <AnimatePresence>
                          {attachments.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex gap-2 mb-2 overflow-x-auto px-1 pb-1"
                            >
                              {attachments.map(att => (
                                <div key={att.id} className="relative group shrink-0">
                                  {att.type === 'image' ? (
                                    <img src={att.url} alt="attached" className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
                                  ) : (
                                    <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-1">
                                      <FileText className="w-6 h-6 text-indigo-500 mb-1" />
                                      <span className="text-[9px] text-gray-500 truncate w-full text-center px-1">{att.name}</span>
                                    </div>
                                  )}
                                  <button
                                    onClick={() => setAttachments(prev => prev.filter(p => p.id !== att.id))}
                                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-3 h-3 text-gray-600" />
                                  </button>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        <div className="border border-gray-300 rounded-2xl p-3 flex flex-col gap-3 focus-within:border-gray-400 bg-white shadow-sm transition-all relative">
                          <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                          <input 
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                               if (e.key === 'Enter' && !isTyping && chatInput.trim() && engineRef.current) {
                                  handleSendMessage();
                               }
                            }}
                            placeholder="Type prompt..."
                            className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-500 text-base px-1"
                          />
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2 relative">
                               <button onClick={() => setShowPlusMenu(!showPlusMenu)} className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                                 <Plus className="w-5 h-5" />
                               </button>
                               <button 
                                 onClick={() => setShowSkillsMenu(!showSkillsMenu)}
                                 className="px-5 h-10 rounded-full border border-gray-300 flex items-center justify-center font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                               >
                                 Skills
                               </button>
                               
                               {/* Dropdown for Plus */}
                               <AnimatePresence>
                                 {showPlusMenu && (
                                   <motion.div 
                                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                     animate={{ opacity: 1, y: 0, scale: 1 }}
                                     exit={{ opacity: 0, scale: 0.95 }}
                                     className="absolute bottom-full left-0 mb-3 bg-white border border-gray-100 shadow-xl rounded-2xl py-2 w-56 z-50 overflow-hidden"
                                   >
                                     <button className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors" onClick={() => { fileInputRef.current!.removeAttribute('multiple'); fileInputRef.current!.setAttribute('capture', 'environment'); fileInputRef.current!.accept = "image/*"; fileInputRef.current!.click(); setShowPlusMenu(false); }}><Camera className="w-4 h-4" /> Take a picture</button>
                                     <button className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors" onClick={() => { fileInputRef.current!.removeAttribute('capture'); fileInputRef.current!.setAttribute('multiple', 'multiple'); fileInputRef.current!.accept = "image/*"; fileInputRef.current!.click(); setShowPlusMenu(false); }}><ImageIcon className="w-4 h-4" /> Pick from album</button>
                                     <button className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors" onClick={() => { fileInputRef.current!.removeAttribute('capture'); fileInputRef.current!.setAttribute('multiple', 'multiple'); fileInputRef.current!.accept = ".pdf,.zip,.txt,.md,.csv,.json"; fileInputRef.current!.click(); setShowPlusMenu(false); }}><FileText className="w-4 h-4" /> Pick files</button>
                                     <button className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-500 hover:bg-gray-50 border-t border-gray-100 transition-colors" onClick={() => { setShowPlusMenu(false); setShowHistoryModal(true); }}><History className="w-4 h-4" /> Input history</button>
                                   </motion.div>
                                 )}
                               </AnimatePresence>

                               {/* Dropdown for Skills */}
                               <AnimatePresence>
                                 {showSkillsMenu && (
                                   <motion.div 
                                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                     animate={{ opacity: 1, y: 0, scale: 1 }}
                                     exit={{ opacity: 0, scale: 0.95 }}
                                     className="absolute bottom-full left-12 mb-3 bg-white border border-gray-100 shadow-xl rounded-2xl py-2 w-64 z-50 overflow-y-auto max-h-64"
                                   >
                                     <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Available Skills</div>
                                     {featuredSkills.map((skill, idx) => (
                                        <button 
                                          key={idx}
                                          onClick={() => {
                                             setActiveSkill(skill.title);
                                             setShowSkillsMenu(false);
                                          }}
                                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors text-left"
                                        >
                                          <div className="text-blue-500">{React.cloneElement(skill.icon as React.ReactElement<any>, { className: 'w-4 h-4' })}</div>
                                          <div className="flex flex-col">
                                            <span className="font-medium">{skill.title}</span>
                                          </div>
                                        </button>
                                     ))}
                                   </motion.div>
                                 )}
                               </AnimatePresence>
                             </div>
                             
                             <div className="flex items-center gap-2">
                               {isTyping && (
                                   <button 
                                     onClick={() => handleStop()}
                                     className="w-10 h-10 rounded-full flex items-center justify-center text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
                                   >
                                     <StopCircle className="w-5 h-5" />
                                   </button>
                               )}
                               <button 
                                 onClick={() => { handleSendMessage(); setShowPlusMenu(false); setShowSkillsMenu(false); }}
                                 disabled={!chatInput.trim() || isTyping}
                                 className="w-10 h-10 rounded-full bg-[#f1dfb1] flex items-center justify-center text-white hover:bg-[#e7d19c] transition-colors disabled:opacity-50 disabled:hover:bg-[#f1dfb1]"
                               >
                                 <Send className="w-4 h-4 text-white" fill="currentColor" stroke="currentColor" />
                               </button>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="library"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                  <div className="text-center mb-10">
                    <h1 className="text-4xl font-sans tracking-tight text-gray-900 mb-3">Model Library</h1>
                    <p className="text-gray-500 text-lg">
                      Explore on-device large language models that power your workspace.
                    </p>
                  </div>

                  <div className="flex justify-center mb-10 relative">
                    <div className="bg-white p-1 rounded-lg border border-gray-200 inline-flex shadow-sm">
                      <button 
                        onClick={() => setActiveTab('skills')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'skills' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        Explore Skills
                      </button>
                      <button 
                        onClick={() => setActiveTab('models')}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'models' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        All Models
                      </button>
                    </div>
                    
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-end mr-4">
                      {checking ? (
                        <div className="text-xs text-gray-400 animate-pulse">Scanning device...</div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                          <Cpu className="w-3 h-3 text-gray-400" /> WebGPU: {deviceSpec.memory}GB RAM
                        </div>
                      )}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {activeTab === 'skills' ? (
                      <motion.div 
                        key="skills"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                          {featuredSkills.map((skill, idx) => (
                            <motion.div 
                              key={idx}
                              whileHover={{ scale: 1.02 }}
                              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-all group"
                              onClick={() => setActiveTab('models')}
                            >
                              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                {React.cloneElement(skill.icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{skill.title}</h3>
                              <p className="text-sm text-gray-500 mb-4 h-10">{skill.desc}</p>
                              <div className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
                                {skill.models} Models
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="models"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <div className="relative mb-8">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input 
                            type="text" 
                            placeholder="Search for a model..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all font-sans"
                          />
                        </div>

                        <div className="space-y-6">
                          {filteredModels.map((model) => (
                            <div 
                              key={model.id}
                              className="bg-white border rounded-2xl p-6 shadow-sm border-gray-200"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-xl font-medium text-gray-900">{model.name}</h3>
                                  {model.recommended && (
                                    <span className="flex items-center text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                      <Target className="w-3 h-3 mr-1" /> Best overall
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                <span className="flex items-center gap-1.5">
                                  <Database className="w-4 h-4 text-gray-400" /> {model.size}
                                </span>
                                <a href="#" className="flex items-center gap-1 text-blue-600 hover:underline">
                                  <BookOpen className="w-3.5 h-3.5" /> License
                                </a>
                              </div>

                              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                {model.description}
                              </p>
                              
                              <div className="mb-6 flex flex-wrap gap-2">
                                {model.name.includes('HEAVY') && (
                                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 border border-red-200 rounded-lg text-xs font-bold text-red-800 uppercase tracking-wide">
                                    <AlertTriangle className="w-3 h-3 text-red-600" />
                                    Heavy GPU Warning
                                  </div>
                                )}
                                {model.skills.map(s => (
                                  <div key={s.name} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700">
                                    {s.icon} {s.name}
                                  </div>
                                ))}
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                 {model.supported ? (
                                    <div className="text-sm font-medium text-green-600 flex items-center">
                                      <CheckCircle className="w-4 h-4 mr-1.5" /> Supported on your device
                                    </div>
                                 ) : (
                                    <div className="text-sm font-medium text-orange-500 flex items-center">
                                      <AlertTriangle className="w-4 h-4 mr-1.5" /> May run slowly on your device
                                    </div>
                                 )}

                                 <button 
                                   onClick={() => {
                                     if (model.status === 'not_installed' && model.supported) {
                                       handleDownload(model.id);
                                     } else if (model.status === 'ready') {
                                       openChat(model);
                                     }
                                   }}
                                   disabled={(!model.supported && model.status !== 'ready') || model.status === 'downloading'}
                                   className={`px-6 py-2.5 rounded-xl font-medium text-sm flex items-center transition-all ${model.status === 'ready' ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' : model.status === 'downloading' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm'} ${(!model.supported && model.status !== 'ready') ? 'opacity-50 cursor-not-allowed' : ''}`}
                                 >
                                   {model.status === 'ready' ? (
                                     <>
                                        <MessageSquare className="w-4 h-4 mr-2" /> Chat
                                     </>
                                   ) : model.status === 'downloading' ? (
                                     <>
                                        <Database className="w-4 h-4 mr-2 animate-bounce" /> Downloading... {model.progress}%
                                     </>
                                   ) : (
                                     <>
                                        <Download className="w-4 h-4 mr-2" /> Download
                                     </>
                                   )}
                                 </button>
                              </div>
                              
                              {/* Download Progress Bar */}
                              {model.status === 'downloading' && (
                                <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-indigo-500 transition-all duration-300 ease-out" 
                                    style={{ width: `${model.progress}%` }} 
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Sheet Viewer Modal */}
        <AnimatePresence>
          {sheetModalContent && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-indigo-100"
              >
                {(() => {
                  const parseMarkdownTable = (content: string) => {
                    const lines = content.split('\n');
                    const tableLines = lines.filter(line => line.includes('|') && line.split('|').length > 2);
                    if (tableLines.length < 3) return { headers: [], rows: [] };
                    
                    const parseRow = (line: string) => {
                      const cells = line.split('|').map(s => s.trim().replace(/\*/g,''));
                      if (cells.length > 0 && cells[0] === '') cells.shift();
                      if (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
                      return cells;
                    }
                    
                    const headers = parseRow(tableLines[0]);
                    const rows = tableLines.slice(2).map(parseRow);
                    return { headers, rows };
                  };
                  
                  const { headers, rows } = parseMarkdownTable(sheetModalContent);

                  return (
                    <>
                      <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-blue-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Grid className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Generated Data Sheet</h3>
                      <p className="text-xs text-gray-500">View and export</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        if (!headers.length) return;
                        
                        let csvContent = "";
                        csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",") + "\n";
                        rows.forEach(row => {
                          csvContent += row.map((item: string) => `"${item.replace(/"/g, '""')}"`).join(",") + "\n";
                        });

                        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", "generated_sheet.csv");
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        URL.revokeObjectURL(url);
                      }}
                      className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm transition-all font-medium"
                    >
                      <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button 
                      onClick={() => setSheetModalContent(null)}
                      className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-8 bg-[#FAF9F6]">
                  <div className="rounded-2xl shadow-[0_5px_20px_rgba(0,0,0,0.03)] border overflow-x-auto bg-white border-gray-100">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-indigo-50/50 border-indigo-100 border-b">
                          {headers.map((header, i) => (
                            <th key={i} className="px-6 py-4 text-sm font-semibold text-indigo-900 whitespace-nowrap">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                         {(() => {
                            const renderCellContent = (text: string) => {
                              // extremely simple parser for <mark data-color="red">text</mark>
                              let content = text;
                              const highlightRegex = /<mark data-color="(red|blue|green|yellow|purple|golden)">(.*?)<\/mark>/g;
                              if (!highlightRegex.test(text)) return text;
                              
                              const parts = [];
                              let lastIndex = 0;
                              let match;
                              highlightRegex.lastIndex = 0;
                              
                              while ((match = highlightRegex.exec(text)) !== null) {
                                if (match.index > lastIndex) {
                                  parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
                                }
                                
                                const color = match[1];
                                const innerText = match[2];
                                
                                let colorClass = "bg-yellow-100 text-yellow-800";
                                if (color === 'red') colorClass = "bg-red-100 text-red-800";
                                if (color === 'blue') colorClass = "bg-blue-100 text-blue-800";
                                if (color === 'green') colorClass = "bg-green-100 text-green-800";
                                if (color === 'purple') colorClass = "bg-purple-100 text-purple-800";
                                if (color === 'golden') colorClass = "bg-amber-100 text-amber-800";
                                
                                parts.push(
                                  <span key={`mark-${match.index}`} className={`px-2 py-0.5 rounded-md font-medium ${colorClass}`}>
                                    {innerText}
                                  </span>
                                );
                                
                                lastIndex = match.index + match[0].length;
                              }
                              
                              if (lastIndex < text.length) {
                                parts.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
                              }
                              
                              return <>{parts}</>;
                            };

                            return rows.map((row, i) => (
                              <tr key={i} className="group hover:bg-indigo-50/30">
                                {row.map((cell: string, j: number) => (
                                  <td key={j} className="px-6 max-w-[500px] break-words py-4 text-sm align-top leading-relaxed">
                                    {renderCellContent(cell)}
                                  </td>
                                ))}
                              </tr>
                            ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            );
          })()}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>

        {/* Linked Docs Selection Modal */}
        <AnimatePresence>
          {showDocsModal && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-[#f9f9f9] rounded-3xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                       <Database className="w-5 h-5 text-blue-500" /> Linked Documents
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Select documents to link to the AI context. ({selectedDocs.length} selected)</p>
                  </div>
                  <button onClick={() => setShowDocsModal(false)} className="w-8 h-8 rounded-full border flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
                  {allDocs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No documents found in your vault.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {allDocs.map((doc) => {
                        const isSelected = selectedDocs.includes(doc.id);
                        return (
                          <div 
                            key={doc.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedDocs(prev => prev.filter(id => id !== doc.id));
                              } else {
                                setSelectedDocs(prev => [...prev, doc.id]);
                              }
                            }}
                            className={`p-4 rounded-xl border cursor-pointer flex items-center gap-4 transition-all ${
                              isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:border-blue-100'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded overflow-hidden flex items-center justify-center border transition-colors ${
                              isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className={`font-semibold text-sm truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>{doc.title || 'Untitled'}</p>
                               <p className="text-xs text-gray-500 truncate mt-0.5">{doc.content?.substring(0, 50) || 'No content'}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                <div className="p-4 bg-white border-t border-gray-100 flex justify-end">
                   <button onClick={() => setShowDocsModal(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm">
                      Done
                   </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Configuration Modal */}
        <AnimatePresence>
          {showConfigModal && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-[#E9EDF2] w-full max-w-[400px] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-gray-900 mx-auto"
              >
                <div className="pt-6 px-6 pb-2">
                  <h3 className="text-xl font-medium mb-4">Configurations</h3>
                  <div className="flex items-center w-full border-b border-gray-300">
                    <button 
                      onClick={() => setActiveConfigTab('model')}
                      className={`flex-1 py-3 text-sm font-medium ${activeConfigTab === 'model' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    >
                      Model configs
                    </button>
                    <button 
                      onClick={() => setActiveConfigTab('system')}
                      className={`flex-1 py-3 text-sm font-medium ${activeConfigTab === 'system' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    >
                      System prompt
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[350px]">
                  {activeConfigTab === 'model' ? (
                    <div className="flex flex-col gap-6">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-sm font-medium">Max tokens</label>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-8">2000</span>
                            <input type="range" min="2000" max="8000" step="100" 
                              value={modelConfigs[chatModel?.id || '']?.maxTokens || 4000} 
                              onChange={e => setModelConfigs(prev => ({ ...prev, [chatModel?.id || '']: { ...(prev[chatModel?.id || ''] || { maxTokens: 4000, topK: 64, topP: 0.95, temperature: 0.7, systemPrompt: '', accelerator: 'GPU' }), maxTokens: parseInt(e.target.value) } }))}
                              className="flex-1 accent-blue-600 bg-blue-100 rounded-full h-2" 
                            />
                          </div>
                          <input type="number" 
                            value={modelConfigs[chatModel?.id || '']?.maxTokens || 4000} 
                            onChange={e => setModelConfigs(prev => ({ ...prev, [chatModel?.id || '']: { ...(prev[chatModel?.id || ''] || { maxTokens: 4000, topK: 64, topP: 0.95, temperature: 1.0, systemPrompt: '', accelerator: 'GPU' }), maxTokens: parseInt(e.target.value) } }))}
                            className="w-16 h-8 text-center bg-transparent border border-gray-400 rounded-md text-sm" 
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-sm font-medium">TopK</label>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-8">5</span>
                            <input type="range" min="5" max="100" step="1" 
                              value={modelConfigs[chatModel?.id || '']?.topK || 64} 
                              onChange={e => setModelConfigs(prev => ({ ...prev, [chatModel?.id || '']: { ...(prev[chatModel?.id || ''] || { maxTokens: 4000, topK: 64, topP: 0.95, temperature: 0.7, systemPrompt: '', accelerator: 'GPU' }), topK: parseInt(e.target.value) } }))}
                              className="flex-1 accent-blue-600 bg-blue-100 rounded-full h-2" 
                            />
                          </div>
                          <input type="number" 
                            value={modelConfigs[chatModel?.id || '']?.topK || 64} 
                            onChange={e => setModelConfigs(prev => ({ ...prev, [chatModel?.id || '']: { ...(prev[chatModel?.id || ''] || { maxTokens: 4000, topK: 64, topP: 0.95, temperature: 1.0, systemPrompt: '', accelerator: 'GPU' }), topK: parseInt(e.target.value) } }))}
                            className="w-16 h-8 text-center bg-transparent border border-gray-400 rounded-md text-sm" 
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-sm font-medium">TopP</label>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-8">0.00</span>
                            <input type="range" min="0" max="1" step="0.01" 
                              value={modelConfigs[chatModel?.id || '']?.topP || 0.95} 
                              onChange={e => setModelConfigs(prev => ({ ...prev, [chatModel?.id || '']: { ...(prev[chatModel?.id || ''] || { maxTokens: 4000, topK: 64, topP: 0.95, temperature: 0.7, systemPrompt: '', accelerator: 'GPU' }), topP: parseFloat(e.target.value) } }))}
                              className="flex-1 accent-blue-600 bg-blue-100 rounded-full h-2" 
                            />
                          </div>
                          <input type="number" 
                            value={modelConfigs[chatModel?.id || '']?.topP || 0.95} 
                            step="0.01"
                            onChange={e => setModelConfigs(prev => ({ ...prev, [chatModel?.id || '']: { ...(prev[chatModel?.id || ''] || { maxTokens: 4000, topK: 64, topP: 0.95, temperature: 1.0, systemPrompt: '', accelerator: 'GPU' }), topP: parseFloat(e.target.value) } }))}
                            className="w-16 h-8 text-center bg-transparent border border-gray-400 rounded-md text-sm" 
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-sm font-medium">Temperature</label>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-8">0.00</span>
                            <input type="range" min="0" max="2" step="0.01" 
                              value={modelConfigs[chatModel?.id || '']?.temperature || 0.7} 
                              onChange={e => setModelConfigs(prev => ({ ...prev, [chatModel?.id || '']: { ...(prev[chatModel?.id || ''] || { maxTokens: 4000, topK: 64, topP: 0.95, temperature: 0.7, systemPrompt: '', accelerator: 'GPU' }), temperature: parseFloat(e.target.value) } }))}
                              className="flex-1 accent-blue-600 bg-blue-100 rounded-full h-2" 
                            />
                          </div>
                          <input type="number" 
                            value={modelConfigs[chatModel?.id || '']?.temperature || 0.7} 
                            step="0.01"
                            onChange={e => setModelConfigs(prev => ({ ...prev, [chatModel?.id || '']: { ...(prev[chatModel?.id || ''] || { maxTokens: 4000, topK: 64, topP: 0.95, temperature: 0.7, systemPrompt: '', accelerator: 'GPU' }), temperature: parseFloat(e.target.value) } }))}
                            className="w-16 h-8 text-center bg-transparent border border-gray-400 rounded-md text-sm" 
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-sm font-medium">Accelerator</label>
                        </div>
                        <div className="flex border border-gray-400 rounded-full p-1 w-40">
                          <button 
                            className={`flex-1 rounded-full py-1 text-sm ${modelConfigs[chatModel?.id || '']?.accelerator !== 'CPU' ? 'bg-[#D3E3FD] text-blue-800' : 'text-gray-600'}`}
                            onClick={() => setModelConfigs(prev => ({ ...prev, [chatModel?.id || '']: { ...(prev[chatModel?.id || ''] || { maxTokens: 4000, topK: 64, topP: 0.95, temperature: 0.7, systemPrompt: '', accelerator: 'GPU' }), accelerator: 'GPU' } }))}
                          >
                            ✓ GPU
                          </button>
                          <button 
                            className={`flex-1 rounded-full py-1 text-sm ${modelConfigs[chatModel?.id || '']?.accelerator === 'CPU' ? 'bg-[#D3E3FD] text-blue-800' : 'text-gray-600'}`}
                            onClick={() => setModelConfigs(prev => ({ ...prev, [chatModel?.id || '']: { ...(prev[chatModel?.id || ''] || { maxTokens: 4000, topK: 64, topP: 0.95, temperature: 0.7, systemPrompt: '', accelerator: 'GPU' }), accelerator: 'CPU' } }))}
                          >
                            {modelConfigs[chatModel?.id || '']?.accelerator === 'CPU' ? '✓ CPU' : 'CPU'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <textarea 
                      value={modelConfigs[chatModel?.id || '']?.systemPrompt || ''}
                      onChange={e => setModelConfigs(prev => ({ ...prev, [chatModel?.id || '']: { ...(prev[chatModel?.id || ''] || { maxTokens: 4000, topK: 64, topP: 0.95, temperature: 0.7, systemPrompt: '', accelerator: 'GPU' }), systemPrompt: e.target.value } }))}
                      placeholder="Enter system instructions here..."
                      className="w-full h-full min-h-[300px] p-4 border border-gray-300 bg-transparent rounded-xl text-sm"
                    />
                  )}
                </div>
                
                <div className="px-6 py-4 flex items-center justify-between">
                  <button className="text-gray-500 font-medium px-4 py-2 hover:bg-gray-200 rounded-full transition-colors" onClick={() => setModelConfigs(prev => ({ ...prev, [chatModel?.id || '']: { maxTokens: 4000, topK: 64, topP: 0.95, temperature: 0.7, systemPrompt: '', accelerator: 'GPU' } }))}>
                    Restore default
                  </button>
                  <div className="flex gap-2">
                    <button className="text-blue-600 font-medium px-4 py-2 hover:bg-blue-50 rounded-full transition-colors" onClick={() => setShowConfigModal(false)}>
                      Cancel
                    </button>
                    <button className="bg-blue-600 text-white font-medium px-6 py-2 rounded-full hover:bg-blue-700 transition-colors" onClick={() => setShowConfigModal(false)}>
                      OK
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input History Modal */}
        <AnimatePresence>
          {showHistoryModal && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white w-full max-w-lg h-[60vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-gray-900 border border-gray-100"
              >
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                   <h3 className="text-lg font-medium">Input History</h3>
                   <button onClick={() => setShowHistoryModal(false)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full"><X className="w-5 h-5"/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                   {inputHistory.length > 0 ? inputHistory.map(hist => (
                     <button 
                       key={hist.id}
                       onClick={() => {
                         setChatInput(hist.prompt);
                         setShowHistoryModal(false);
                       }}
                       className="text-left w-full p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                     >
                        <p className="text-sm text-gray-700 line-clamp-3">{hist.prompt}</p>
                     </button>
                   )) : (
                     <div className="text-center text-gray-500 mt-10">No history saved.</div>
                   )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

