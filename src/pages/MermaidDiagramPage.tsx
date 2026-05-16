import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Download, Code2, Bot, Send, Loader2, Cpu, Sparkles, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import mermaid from 'mermaid';
import { LocalGemmaTerminal } from '../components/LocalGemmaTerminal';
import { MLCEngineInterface } from '@mlc-ai/web-llm';

const DEFAULT_CHART = `graph TD
  A[Client] --> B(Load Balancer)
  B --> C{App Servers}
  C -->|One| D[Server 1]
  C -->|Two| E[Server 2]
  C -->|Three| F[Server 3]
  D --> G[(Database)]
  E --> G
  F --> G`;

export function MermaidDiagramPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(DEFAULT_CHART);
  const [renderCode, setRenderCode] = useState(DEFAULT_CHART);
  const mermaidRef = useRef<HTMLDivElement>(null);
  
  // AI Chat State
  const [engine, setEngine] = useState<MLCEngineInterface | null>(null);
  const [showAiConfig, setShowAiConfig] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([]);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'default' });
  }, []);

  useEffect(() => {
    let active = true;
    const renderDiagram = async () => {
      try {
        if (!renderCode || !renderCode.trim()) return;
        const id = 'mermaid-svg-' + Math.random().toString(36).substr(2, 9);
        const { svg } = await mermaid.render(id, renderCode);
        if (active && mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
        }
      } catch (e: any) {
        console.error("Mermaid syntax error", e);
        if (active && mermaidRef.current) {
          mermaidRef.current.innerHTML = `<div class="text-red-500 font-mono text-xs p-4 bg-red-50 rounded border border-red-200 w-full overflow-auto">Failed to render diagram:<br/>${e.message || e}</div>`;
        }
      }
    };
    renderDiagram();
    
    return () => {
      active = false;
    };
  }, [renderCode]);

  const handleRender = () => {
    setRenderCode(code);
  };

  const handleDownload = () => {
    const svg = document.querySelector('.mermaid svg');
    if (!svg) return alert('No diagram found to download.');
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.download = 'diagram.png';
        a.href = url;
        a.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const isGeneratingRef = useRef<boolean>(false);

  const handleChatSubmit = async () => {
    if (!engine || !chatInput.trim() || isGenerating) return;
    
    isGeneratingRef.current = true;
    const userPrompt = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userPrompt }]);
    setIsGenerating(true);
    
    const messages = [
      { 
        role: "system", 
        content: "You are an expert at writing Mermaid diagram syntax. Generate ONLY the valid raw Mermaid code for the user's request. NEVER output markdown codeblocks (```). ALWAYS start with a valid diagram type like 'graph TD', 'flowchart LR', or 'sequenceDiagram'. Do NOT output conversational text. Output ONLY the code, nothing else."
      },
      ...chatHistory,
      { role: "user", content: userPrompt }
    ];

    try {
      let fullReply = "";
      const chunks = await engine.chat.completions.create({
        //@ts-ignore
        messages,
        stream: true,
        temperature: 0.1,
      });

      for await (const chunk of chunks) {
        if (!isGeneratingRef.current) {
           break;
        }
        const text = chunk.choices[0]?.delta?.content || "";
        fullReply += text;
        // Clean up markdown block if model stubborn
        let cleaned = fullReply.replace(/```mermaid/g, '').replace(/```/g, '').trim();
        setCode(cleaned);
      }
      
      let finalCleaned = fullReply.replace(/```mermaid/g, '').replace(/```/g, '').trim();
      
      // Auto-fix if the AI forgot the diagram type
      if (!finalCleaned.startsWith('graph') && !finalCleaned.startsWith('flowchart') && !finalCleaned.startsWith('sequenceDiagram') && !finalCleaned.startsWith('stateDiagram') && !finalCleaned.startsWith('classDiagram') && !finalCleaned.startsWith('pie')) {
         finalCleaned = "graph TD\n" + finalCleaned;
         setCode(finalCleaned);
      }
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: finalCleaned }]);
      setRenderCode(finalCleaned);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] flex flex-col font-sans">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/doc/${id}/summarize`)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-500" />
            Live Architecture & Flowcharts
          </h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAiConfig(!showAiConfig)}
            className={`flex items-center gap-2 px-4 py-2 ${engine ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-700 border-gray-200'} border rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors`}
          >
            <Bot className="w-4 h-4" />
            {engine ? 'AI Active' : 'Setup AI'}
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export PNG
          </button>
          <button 
            onClick={handleRender}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm"
          >
            <Play className="w-4 h-4" />
            Render Diagram
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAiConfig && !engine && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-900 p-6 shadow-inner">
               <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                 <Cpu className="w-5 h-5 text-blue-400" /> WebGPU Local Diagram Generator
               </h3>
               <LocalGemmaTerminal onEngineReady={(e) => setEngine(e)} isActive={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col shadow-sm z-0">
          <div className="p-4 bg-gray-50 border-b border-gray-200 text-sm font-bold text-gray-700 uppercase tracking-wider flex justify-between items-center">
            <span>Mermaid Syntax</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 text-gray-800 bg-gray-50/50"
            spellCheck={false}
          />
          
          {/* AI Chat Box */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Auto-Generate with Local AI
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                disabled={!engine || isGenerating}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                placeholder={engine ? "e.g. Draw a login flow..." : "Click 'Setup AI' to boot local model first..."}
                className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 disabled:bg-gray-100"
              />
              <button
                disabled={!engine || (!isGenerating && !chatInput.trim())}
                onClick={() => {
                  if (isGenerating && engine) {
                    isGeneratingRef.current = false;
                    try { engine.interruptGenerate(); } catch (e) {}
                    setIsGenerating(false);
                  } else {
                    handleChatSubmit();
                  }
                }}
                className={`p-2.5 text-white rounded-lg transition-colors shadow-sm ${isGenerating ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600'}`}
              >
                {isGenerating ? <Square className="w-4 h-4 fill-current" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            {engine && (
              <p className="text-[10px] text-green-600 mt-2 font-medium flex items-center gap-1">
                <Bot className="w-3 h-3" /> Model active & loaded in GPU VRAM
              </p>
            )}
          </div>
        </div>
        <div className="w-2/3 bg-gray-100 flex flex-col overflow-auto p-8 relative">
          <motion.div 
            key={renderCode}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="m-auto bg-white p-8 rounded-3xl shadow-md border border-gray-100 min-w-[500px] min-h-[400px] flex items-center justify-center overflow-auto"
          >
            <div className="mermaid flex justify-center items-center w-full h-full" ref={mermaidRef}>
               {renderCode}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
