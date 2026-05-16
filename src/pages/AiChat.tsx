import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { Send, Map as MapIcon, Globe, Brain, Zap, Image as ImageIcon, Video, Paperclip, X, StopCircle } from 'lucide-react';
import { ai } from '../lib/gemini';
import { ThinkingLevel, Type } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  content: string;
  skill?: string;
  isSheet?: boolean;
}

const AVAILABLE_SKILLS = [
  { id: 'none', label: 'No Skill' },
  { id: 'summarize', label: 'Summarize Docs' },
  { id: 'sheets', label: 'Create Sheets' },
  { id: 'extract', label: 'Extract Data' }
];

function rgbVars(index: number) {
  if (index === 0) return 'text-red-500';
  if (index === 1) return 'text-green-500';
  return 'text-blue-500';
}

function ThinkingIndicator({ skill }: { skill: string }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => (p + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const topText = 
    phase === 0 ? "Thinking..." :
    phase === 1 ? "Still thinking..." :
    `Executing ${skill !== 'none' ? skill : 'general'} based on what he actually doing...`;

  const bottomText = skill === 'summarize' ? "Task: Summarizing this doc that doc..." 
    : skill === 'sheets' ? "Task: Processing data to generate sheet layout..."
    : "Task: Analyzing prompt and retrieving knowledge...";

  return (
    <div className="flex flex-col items-start max-w-[85%] space-y-2 mb-8 ml-4">
      <motion.div 
        initial={{ opacity: 0, y: 5 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-xs font-bold text-dc-text-muted uppercase tracking-wider"
      >
        {topText}
      </motion.div>
      <div className="flex items-center gap-2 p-4 bg-white border border-dc-border rounded-2xl shadow-sm">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
            className={`w-3 h-3 rounded-full bg-current ${rgbVars(i)}`}
          />
        ))}
      </div>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="text-xs text-dc-text opacity-70 flex items-center gap-2"
      >
        <Zap className="w-3 h-3 text-dc-gold" /> {bottomText}
      </motion.div>
    </div>
  );
}

function SheetRenderer({ content }: { content: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full mt-4 overflow-x-auto rounded-xl border border-dc-border shadow-md"
    >
      <table className="w-full text-sm text-left">
        <thead className="bg-[#f3f4f6] text-gray-700 uppercase">
          <tr>
            <th className="px-6 py-3 font-bold text-[#2563eb]">Header A</th>
            <th className="px-6 py-3 font-bold text-[#dc2626]">Header B</th>
            <th className="px-6 py-3 font-bold text-[#16a34a]">Header C</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          <tr className="border-b">
            <td className="px-6 py-4">Data 1</td>
            <td className="px-6 py-4 text-gray-500">Value X</td>
            <td className="px-6 py-4 font-semibold">Active</td>
          </tr>
          <tr className="border-b bg-gray-50">
            <td className="px-6 py-4">Data 2</td>
            <td className="px-6 py-4 text-gray-500">Value Y</td>
            <td className="px-6 py-4 font-semibold">Pending</td>
          </tr>
        </tbody>
      </table>
      <div className="p-3 text-xs text-gray-400 bg-white border-t border-dc-border">
        Auto-generated animated sheet preview from content: {content.substring(0, 30)}...
      </div>
    </motion.div>
  );
}

export function AiChat() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [modelMode, setModelMode] = useState<'flash' | 'pro_thinking' | 'lite'>('flash');
  const [grounding, setGrounding] = useState<'none' | 'search' | 'maps'>('none');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('none');
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Setup chat session ref
  const chatSessionRef = useRef<any>(null);

  useEffect(() => {
    // Re-initialize chat if config changes
    const tools: any[] = [];
    if (grounding === 'search') tools.push({ googleSearch: {} });
    if (grounding === 'maps') tools.push({ googleMaps: {} });

    try {
      chatSessionRef.current = ai.chats.create({
        model: modelMode === 'pro_thinking' ? 'gemini-3.1-pro-preview' : modelMode === 'lite' ? 'gemini-3.1-flash-lite-preview' : 'gemini-3-flash-preview',
        config: {
          systemInstruction: systemInstruction || undefined,
          tools: tools.length > 0 ? tools as any : undefined,
          toolConfig: tools.length > 0 ? { includeServerSideToolInvocations: true } as any : undefined,
          thinkingConfig: modelMode === 'pro_thinking' ? { thinkingLevel: ThinkingLevel.HIGH } : undefined
        }
      });
    } catch(e) {
      console.error(e);
    }
  }, [modelMode, grounding, systemInstruction]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!userData?.subscription || userData?.subscription.toLowerCase() === 'free' || userData?.subscription.toLowerCase() === 'none') {
       navigate('/?scrollTo=subscription');
       return;
    }

    if (!input.trim() || loading || !chatSessionRef.current) return;

    const userMessage = input;
    const currentSkill = selectedSkill;
    setInput('');
    setMessages(p => [...p, { role: 'user', content: userMessage, skill: currentSkill }]);
    setLoading(true);
    
    abortControllerRef.current = new AbortController();

    try {
      let streamResponse = await chatSessionRef.current.sendMessageStream({
         message: userMessage,
         abortSignal: abortControllerRef.current.signal
      });
      
      let fullResponse = "";
      setMessages(p => [...p, { role: 'model', content: "", skill: currentSkill }]);

      for await (const chunk of streamResponse) {
        fullResponse += chunk.text;
        setMessages(p => {
          const newList = [...p];
          newList[newList.length - 1].content = fullResponse;
          return newList;
        });
      }
      
      if (currentSkill === 'sheets') {
         setMessages(p => {
           const newList = [...p];
           newList[newList.length - 1].isSheet = true;
           return newList;
         });
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
         setMessages(p => {
           const newList = [...p];
           if (newList[newList.length - 1].role === 'model' && !newList[newList.length - 1].content) {
              newList[newList.length - 1].content = "[Response interrupted by user]";
           } else {
              newList[newList.length - 1].content += "\n\n[Response interrupted by user]";
           }
           return newList;
         });
      } else {
         console.error(error);
         setMessages(p => [...p, { role: 'model', content: "Error: " + error.message }]);
      }
    } finally {
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-dc-bg-page font-sans text-dc-text relative">
      <Sidebar />
      <div className="flex-1 flex flex-col items-center pt-8">
        {/* Active Skill Indicator Top Right */}
        <AnimatePresence>
          {selectedSkill !== 'none' && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-4 right-8 bg-purple-600 text-white px-4 py-1.5 rounded-full shadow-lg text-xs font-bold tracking-wider uppercase flex items-center gap-2 z-50 pointer-events-none"
            >
              <Zap className="w-3 h-3 animate-pulse" />
              Active Skill: {AVAILABLE_SKILLS.find(s => s.id === selectedSkill)?.label}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Config */}
        <div className="w-full max-w-7xl px-8 pb-6 border-b border-dc-border flex flex-wrap gap-6 items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-3xl font-serif mr-4">Chat settings</h2>
            <select className="border border-dc-border rounded-lg px-4 py-2 text-sm bg-white" value={modelMode} onChange={(e) => setModelMode(e.target.value as any)}>
              <option value="flash">Flash (General)</option>
              <option value="pro_thinking">Pro (High Thinking)</option>
              <option value="lite">Lite (Low Latency)</option>
            </select>
            <select className="border border-dc-border rounded-lg px-4 py-2 text-sm bg-white" value={grounding} onChange={(e) => setGrounding(e.target.value as any)}>
              <option value="none">No Grounding</option>
              <option value="search">Google Search</option>
            </select>
            <select className="border border-dc-border rounded-lg px-4 py-2 text-sm bg-purple-50 text-purple-700 font-medium" value={selectedSkill} onChange={(e) => setSelectedSkill(e.target.value)}>
              {AVAILABLE_SKILLS.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <input 
              type="text" 
              placeholder="System instruction e.g. You are a pirate." 
              className="border border-dc-border rounded-lg px-4 py-2 text-sm w-96 bg-white outline-none focus:border-dc-gold"
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
            />
          </div>
        </div>

        {/* Chat Thread */}
        <div className="flex-1 w-full max-w-7xl p-8 overflow-y-auto" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-50">
              <Brain className="w-24 h-24 mb-6 text-dc-gold opacity-30" />
              <p className="text-xl">Ask any query to start testing multimodal capabilities</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`mb-8 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-6 rounded-2xl max-w-[85%] shadow-sm ${m.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white border border-dc-border'} relative`}>
                {m.skill && m.skill !== 'none' && m.role === 'user' && (
                  <div className="absolute -top-3 right-4 bg-purple-800 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full">
                    {AVAILABLE_SKILLS.find(s => s.id === m.skill)?.label}
                  </div>
                )}
                {m.role === 'model' && <p className="text-xs font-bold mb-2 opacity-50 uppercase tracking-wider text-dc-gold">Gemini</p>}
                <div className="whitespace-pre-wrap text-[15px] leading-relaxed markdown-body">{m.content}</div>
                {m.isSheet && <SheetRenderer content={m.content} />}
              </div>
            </div>
          ))}
          {loading && <ThinkingIndicator skill={selectedSkill} />}
        </div>

        {/* Input area */}
        <div className="w-full max-w-7xl p-8 pt-0 shadow-[0_-20px_40px_rgba(250,249,246,0.9)] bg-transparent z-10">
          <div className="bg-white border border-dc-border rounded-2xl p-4 flex flex-col shadow-lg focus-within:border-dc-gold/50 transition-colors">
            <textarea 
              className="w-full p-2 outline-none resize-none bg-transparent min-h-[100px] text-base"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="flex justify-between items-center px-2 pb-1 pt-4 border-t border-dc-border/50">
              <div className="flex gap-4 text-dc-text-muted">
                <button onClick={() => alert("File upload is in demo mode and would open local native filesystem.")} className="p-2 hover:bg-gray-100 rounded-full hover:text-dc-gold transition-colors" title="Upload Media (Images/Video to analyze - demo mode)">
                  <Paperclip className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                {loading && (
                    <Button onClick={handleStop} variant="outline" size="lg" className="rounded-xl px-4 text-red-500 border-red-200 hover:bg-red-50">
                      <StopCircle className="w-5 h-5 mr-2" /> Stop
                    </Button>
                )}
                <Button onClick={handleSend} disabled={!input.trim() || loading} variant="gold" size="lg" className="rounded-xl px-8 font-bold">
                  <Send className="w-5 h-5 mr-3" /> Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

