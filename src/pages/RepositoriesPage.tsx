import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, File, FileCode, Plus, Trash2, Play, RefreshCw, Send, Sparkles, Code2, 
  Terminal, Settings, Search, Layout, HelpCircle, LogOut, ArrowLeft, Key, ExternalLink, 
  Database, Server, Cloud, Shield, Check, Info, Cpu, PlayCircle, AppWindow, Gamepad2, Layers,
  BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface WorkspaceFile {
  path: string;
  content: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export function RepositoriesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Selected Active Tab in main editor zone
  const [activeTab, setActiveTab] = useState<'chat' | 'code' | 'preview'>('chat');
  
  // Active Sidebar Mode
  const [sidebarMode, setSidebarMode] = useState<'explorer' | 'search' | 'e2b' | 'settings'>('explorer');

  // Input code command prompt
  const [promptInput, setPromptInput] = useState('');
  const [isLlmGenerating, setIsLlmGenerating] = useState(false);
  const [isMultiAgent, setIsMultiAgent] = useState(false); // fast direct code vs slow multi-agent plan

  // State keys stored in state (BYOK keys for E2B / Gemini)
  const [e2bApiKey, setE2bApiKey] = useState(() => localStorage.getItem('dc_e2b_api_key') || '');
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('dc_custom_gemini_api_key') || '');
  const [isKeysSaved, setIsKeysSaved] = useState(false);

  // E2B Cloud instance simulator metrics
  const [e2bSandboxStatus, setE2bSandboxStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [e2bLogs, setE2bLogs] = useState<string[]>([]);
  const [e2bInstanceId, setE2bInstanceId] = useState('');

  // Workspace code files
  const [files, setFiles] = useState<WorkspaceFile[]>(() => {
    const saved = localStorage.getItem('dc_repos_files');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sovereign Sandbox Platform</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes pulse-glow {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.05); opacity: 1; }
        }
        .glow-btn {
            animation: pulse-glow 3s infinite ease-in-out;
        }
    </style>
</head>
<body class="bg-slate-50 min-h-screen flex flex-col items-center justify-center p-6 text-slate-800 font-sans">
    <div class="max-w-md w-full bg-white rounded-3xl border border-slate-200/60 p-8 shadow-xl text-center relative overflow-hidden">
        <div class="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
        
        <div class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-600/20 text-white text-3xl font-black">
            ✦
        </div>
        
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Workspace Ready</h1>
        <p class="text-slate-500 mb-6 text-sm">Describe a game, landing page, or utility panel. Our AI agent compiles, tests, and deploys it live.</p>
        
        <div class="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-left mb-6 font-mono text-xs text-slate-600">
            <span class="text-indigo-600 font-bold">● e2b-agent-cloud</span>: online<br>
            <span class="text-[#D4AF37] font-bold">● sandbox-id</span>: ${Math.random().toString(36).substring(2, 10)}
        </div>
        
        <button onclick="changeColor()" class="glow-btn bg-indigo-600 text-white font-bold text-sm py-4.5 px-6 rounded-full w-full hover:bg-indigo-700 transition-colors shadow-md active:scale-95 duration-200">
            Click to interact
        </button>
    </div>

    <script>
        function changeColor() {
            const colors = ['#4f46e5', '#16a34a', '#dc2626', '#ca8a04', '#9333ea', '#0891b2'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const btn = document.querySelector('button');
            btn.style.backgroundColor = randomColor;
            btn.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.1)';
        }
    </script>
</body>
</html>`
      },
      {
        path: 'app.js',
        content: `// Active interactions and state controller logic
console.log("Enterprise agent cloud sandbox initialized.");
`
      }
    ];
  });

  // Current selected active file path
  const [activeFilePath, setActiveFilePath] = useState('index.html');
  // Local temporary file edits string
  const [editingCode, setEditingCode] = useState('');

  // Chat message history logs
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('dc_repos_chat');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'initial',
        role: 'assistant',
        content: "Welcome to your Sovereign E2B Sandbox workspace! 💻\n\nI can build complex, interactive full-stack modules, HTML/JS/CSS websites, HTML5 games, and specialized APIs using the **E2B Enterprise AI Agent Cloud** sandbox instances. \n\nWhat would you like to build today? Try asking me to write a **Tic Tac Toe, Snake game, or a Pomodoro timer**!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  // File explorer search term
  const [searchTerm, setSearchTerm] = useState('');

  // Synchronize files to localstorage
  useEffect(() => {
    localStorage.setItem('dc_repos_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('dc_repos_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Synchronize edit code buffer when active file changes
  useEffect(() => {
    const file = files.find(f => f.path === activeFilePath);
    if (file) {
      setEditingCode(file.content);
    } else {
      setEditingCode('');
    }
  }, [activeFilePath, files]);

  // Handle saving the code text context of the active file
  const handleSaveActiveFile = () => {
    setFiles(prev => prev.map(f => {
      if (f.path === activeFilePath) {
        return { ...f, content: editingCode };
      }
      return f;
    }));
    // Flash message in log
    appendSystemLog(`File saved: ${activeFilePath}`);
  };

  // Add search filtering
  const filteredFiles = files.filter(f => f.path.toLowerCase().includes(searchTerm.toLowerCase()));

  // Active file creation model
  const [newFileNameInput, setNewFileNameInput] = useState('');
  const [showFileCreate, setShowFileCreate] = useState(false);

  const handleCreateNewFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileNameInput.trim()) return;
    const name = newFileNameInput.trim();
    if (files.some(f => f.path.toLowerCase() === name.toLowerCase())) {
      appendSystemLog(`File already exists: ${name}`);
      return;
    }
    setFiles(prev => [...prev, { path: name, content: `// File created: ${name}\n` }]);
    setActiveFilePath(name);
    setNewFileNameInput('');
    setShowFileCreate(false);
    appendSystemLog(`Created file ${name}`);
  };

  const handleDeleteFile = (pathToDelete: string) => {
    if (files.length <= 1) {
      appendSystemLog("Cannot delete the last remaining file in the sandbox workspace.");
      return;
    }
    setFiles(prev => prev.filter(f => f.path !== pathToDelete));
    if (activeFilePath === pathToDelete) {
      const remaining = files.filter(f => f.path !== pathToDelete);
      setActiveFilePath(remaining[0].path);
    }
    appendSystemLog(`Deleted file ${pathToDelete}`);
  };

  // Log system messages
  const appendSystemLog = (msg: string) => {
    setE2bLogs(prev => [...prev, `[system] ${new Date().toLocaleTimeString()} - ${msg}`]);
  };

  // Simulate remote E2B Sandbox connection on key change or initialization
  const triggerE2bCloudConnect = () => {
    if (!e2bApiKey) {
      appendSystemLog("Cannot connect to E2B Cloud Sandbox: E2B API Key is missing. Connect BYOK in settings.");
      return;
    }
    setE2bSandboxStatus('connecting');
    appendSystemLog("Contacting E2B Cloud Sandbox Controller... Initializing secure micro VM...");
    
    setTimeout(() => {
      setE2bSandboxStatus('connected');
      const mockId = `sandbox-${Math.random().toString(36).substring(2, 11)}`;
      setE2bInstanceId(mockId);
      appendSystemLog(`E2B Linux MicroVM Booted successfully on Agent Cloud. Sandbox ID: ${mockId}`);
      appendSystemLog("Node.js, python3, gcc and webserver runtimes activated. Ready for remote commands.");
    }, 2000);
  };

  // Auto connect E2B Simulation helper if api key is mock loaded
  useEffect(() => {
    if (e2bApiKey) {
      triggerE2bCloudConnect();
    } else {
      setE2bSandboxStatus('disconnected');
    }
  }, []);

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('dc_e2b_api_key', e2bApiKey);
    localStorage.setItem('dc_custom_gemini_api_key', geminiApiKey);
    setIsKeysSaved(true);
    appendSystemLog("Enterprise configuration keys saved and verified.");
    triggerE2bCloudConnect();
    setTimeout(() => setIsKeysSaved(false), 2600);
  };

  // Compile combined HTML preview strings to display beautifully inside the preview Frame!
  const generateUnifiedPreview = (): string => {
    const htmlFile = files.find(f => f.path === 'index.html') || { content: '' };
    const cssFile = files.find(f => f.path === 'style.css') || { content: '' };
    const jsFile = files.find(f => f.path === 'app.js') || { content: '' };
    
    let baseHtml = htmlFile.content;

    // Standard single-file sandboxing: Inject CSS and JS dynamic compilation files if index.html doesn't already reference them
    if (baseHtml) {
      if (cssFile.content && !baseHtml.includes('style.css')) {
        baseHtml = baseHtml.replace('</head>', `<style>${cssFile.content}</style></head>`);
      }
      if (jsFile.content && !baseHtml.includes('app.js')) {
        baseHtml = baseHtml.replace('</body>', `<script>${jsFile.content}</script></body>`);
      }
      return baseHtml;
    }

    // fallback raw code of current active file if not html
    const activeFile = files.find(f => f.path === activeFilePath);
    if (activeFile && activeFilePath.endsWith('.html')) {
      return activeFile.content;
    }

    return `<html><body class="bg-gray-50 flex items-center justify-center h-screen font-sans"><div class="p-8 bg-white border border-gray-100 shadow-xl rounded-2xl max-w-md text-center"><h2 class="font-extrabold text-gray-800 text-xl mb-2">Sandbox Viewer</h2><p class="text-sm text-gray-500">Currently viewing code file <code class="bg-slate-100 p-1 px-1.5 rounded">${activeFilePath}</code>. Switch to index.html or build files using the AI agent chat to render a live browser view.</p></div></body></html>`;
  };

  const previewFrameContent = generateUnifiedPreview();

  // Send request to Gemini API to perform file-level coding task
  const handleSendPromptMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim() || isLlmGenerating) return;

    const userMsg = promptInput.trim();
    setPromptInput('');

    // Append User Message to Chat layout
    const userMessageObj: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: userMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMessageObj]);
    setIsLlmGenerating(true);

    // Dynamic state logs
    appendSystemLog(`Deploying remote coding tasks sandbox Agent command: "${userMsg.substring(0, 40)}..."`);
    if (e2bSandboxStatus === 'connected') {
      appendSystemLog("E2B cloud instance spawning interactive bash console context...");
    }

    // Prompt compilation context
    const contextOverview = files.map(f => `--- FILE: ${f.path} ---\n${f.content}`).join('\n\n');
    const systemInstructions = `You are a world-class Full Stack Software Developer Coding Agent integrated inside a visual workspace sandboxed with E2B agent cloud.
Your task is to respond to the user's coding request by generating, updating, or expanding the file structure to build working apps, games, utilities, dashboards, etc.

You MUST reply with a valid global JSON block of files that we can write to the workspace, alongside a friendly developer message explaining what you built.
ALL paths should be simple like "index.html", "style.css", "app.js", or clean subpaths.

The JSON block you return MUST look exactly like this:
\`\`\`json
{
  "files": [
    { "path": "index.html", "content": "HTML structure with inline styles/CDN or custom tags" },
    { "path": "app.js", "content": "JavaScript script to handle dynamic events" }
  ],
  "message": "I have created the snake game sandbox perfectly."
}
\`\`\`
DO NOT return any text outside the JSON block. Let the JSON block stand alone in your response, so we can parse it programmatically. Give full complete runnable implementations, write beautiful design, clean UI and color gradients!`;

    const fullPrompt = `System Context:\n${systemInstructions}\n\nExisting files in sandbox workspace:\n${contextOverview}\n\nUser instructions: ${userMsg}`;

    try {
      const resp = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          customApiKey: geminiApiKey || undefined,
          isComplex: isMultiAgent
        })
      });

      if (!resp.ok) {
        throw new Error(`Failed to contact API: ${resp.statusText}`);
      }

      const resData = await resp.json();
      const rawText = resData.text || '';
      
      // Attempt to extract and parse the JSON block
      let parsedResponse: { files?: WorkspaceFile[]; message?: string } = {};
      try {
        // Clean markdown code blocks if present
        let cleanText = rawText;
        if (cleanText.includes('```json')) {
          cleanText = cleanText.split('```json')[1].split('```')[0];
        } else if (cleanText.includes('```')) {
          cleanText = cleanText.split('```')[1].split('```')[0];
        }
        parsedResponse = JSON.parse(cleanText.trim());
      } catch (parseErr) {
        console.warn("Failed to parse AI response as JSON block, falling back to simple presentation:", parseErr);
        parsedResponse = {
          message: rawText,
          files: []
        };
      }

      // If we received compiled files, update the sandbox files list directory!
      if (parsedResponse.files && parsedResponse.files.length > 0) {
        setFiles(prev => {
          // Merge or replace files from AI
          const updated = [...prev];
          parsedResponse.files?.forEach(newFile => {
            const idx = updated.findIndex(f => f.path.toLowerCase() === newFile.path.toLowerCase());
            if (idx !== -1) {
              updated[idx] = newFile;
            } else {
              updated.push(newFile);
            }
          });
          return updated;
        });

        // Automatically focus HTML or JS file
        const createdPaths = parsedResponse.files.map(f => f.path);
        if (createdPaths.includes('index.html')) {
          setActiveFilePath('index.html');
        } else if (createdPaths.length > 0) {
          setActiveFilePath(createdPaths[0]);
        }

        // Auto switch tab to show the wonderful preview result if index.html is updated!
        if (createdPaths.includes('index.html') || createdPaths.some(p => p.endsWith('.html'))) {
          setActiveTab('preview');
        } else {
          setActiveTab('code');
        }

        appendSystemLog(`Agent successfully completed compilation and file deployment inside current Sandbox environment. Files modified: ${createdPaths.join(', ')}`);
      }

      // Append Agent Response
      const assistantMessageObj: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        content: parsedResponse.message || "Files successfully updated in workspace sandbox.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, assistantMessageObj]);

    } catch (apiErr: any) {
      appendSystemLog(`Error running agent task: ${apiErr.message}`);
      const errorMessageObj: ChatMessage = {
        id: Math.random().toString(),
        role: 'system',
        content: `Could not complete workspace automation task: ${apiErr.message}. Make sure your API key configuration in settings is formatted correctly or wait a moment.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsLlmGenerating(false);
    }
  };

  const clearChatHistory = () => {
    setChatMessages([
      {
        id: 'initial',
        role: 'assistant',
        content: "Welcome to your Sovereign E2B Sandbox workspace! 💻\n\nI can build complex, interactive full-stack modules, HTML/JS/CSS websites, HTML5 games, and specialized APIs using the **E2B Enterprise AI Agent Cloud** sandbox instances. \n\nWhat would you like to build today? Try asking me to write a **Tic Tac Toe, Snake game, or a Pomodoro timer**!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    appendSystemLog("Chat history cleared.");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none antialiased selection:bg-indigo-600 selection:text-white">
      
      {/* 1. TOP HEADER MENU BAR LAYOUT */}
      <header className="h-13 bg-slate-900 text-white flex items-center justify-between px-4 text-xs font-semibold shrink-0 select-none border-b border-slate-950">
        
        {/* Left Side: Standard VSCode File Menus */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 hover:bg-slate-800 px-2 py-1 rounded-md transition-all text-slate-300">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Workspace Dashboard</span>
          </button>
          
          <div className="h-4 w-px bg-slate-800" />
          
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[280px] sm:max-w-none scrollbar-none">
            {['File', 'Edit', 'View', 'Terminal', 'Help'].map((menu) => (
              <button 
                key={menu} 
                onClick={() => appendSystemLog(`Simulated menu interaction - ${menu}`)}
                className="hover:bg-slate-800 px-2.5 py-1.5 rounded-md transition-colors text-slate-200"
              >
                {menu}
              </button>
            ))}
          </div>
        </div>

        {/* Center Name Title */}
        <div className="hidden md:flex items-center justify-center gap-2 text-slate-100 uppercase tracking-widest font-mono font-bold text-[11px] bg-slate-950 px-4 py-1.5 rounded-full border border-slate-800 shadow-inner">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          Agent Studio - workspace
        </div>

        {/* Right Side Settings Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 mr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-slate-400 hidden lg:inline uppercase font-mono tracking-tight font-bold">e2b-v3 secure VM sandbox</span>
          </div>
          
          <button 
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center gap-1 bg-red-950 border border-red-900/40 hover:bg-red-900 px-3 py-1.5 text-red-100 rounded-md transition-colors text-[11px] font-bold shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      {/* 2. BODY LAYOUT: SideBar Icons + Sidebar List + Main code/preview tabs */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        
        {/* Sidebar Mini Action Rails (Left aligned columns) */}
        <div className="w-14 bg-slate-900 shrink-0 flex flex-col items-center py-4 border-r border-slate-950 justify-between">
          <div className="space-y-4 w-full flex flex-col items-center">
            {/* Active page Explorer */}
            <button 
              onClick={() => setSidebarMode('explorer')}
              title="File Explorer tree"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                sidebarMode === 'explorer' 
                  ? 'bg-indigo-600 shadow-lg text-white font-bold' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Folder className="w-5 h-5" />
            </button>

            {/* Explore sandbox files */}
            <button 
              onClick={() => setSidebarMode('search')}
              title="Search Sandbox Files"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                sidebarMode === 'search' 
                  ? 'bg-indigo-600 shadow-lg text-white font-bold' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Configure E2B Settings */}
            <button 
              onClick={() => setSidebarMode('e2b')}
              title="E2B Sandbox Credentials"
              className={`w-10 h-10 relative flex items-center justify-center transition-all ${
                sidebarMode === 'e2b' 
                  ? 'bg-indigo-600 shadow-lg text-white font-bold' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Cloud className="w-5 h-5" />
              {e2bSandboxStatus === 'connected' && (
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-slate-900" />
              )}
            </button>
          </div>

          <div className="w-full flex flex-col items-center gap-3">
            <button 
              onClick={() => setSidebarMode('settings')}
              title="Workspace Settings"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                sidebarMode === 'settings' 
                  ? 'bg-indigo-600 shadow-lg text-white font-bold' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-6 h-px bg-slate-800 my-1" />
            <button 
              onClick={() => navigate('/dashboard')}
              title="Back to Dashboard"
              className="w-10 h-10 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <Layout className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Active Drawer: Left file list panel */}
        <AnimatePresence mode="wait">
          <div className="w-72 bg-white shrink-0 flex flex-col border-r border-slate-200 overflow-hidden select-none">
            
            {/* EXPLORER DRAWER CONTENT */}
            {sidebarMode === 'explorer' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500 flex items-center gap-1.5">
                    <Folder className="w-4 h-4 text-indigo-500" /> Explorer
                  </span>
                  
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setShowFileCreate(!showFileCreate)} 
                      title="New sandbox file" 
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => appendSystemLog("Reloaded code layout tree")} 
                      title="Reload Explorer" 
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* File Create Tray Form */}
                {showFileCreate && (
                  <form onSubmit={handleCreateNewFile} className="p-3 bg-slate-50 border-b border-indigo-100/60 flex gap-2">
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. index.html" 
                      value={newFileNameInput}
                      onChange={e => setNewFileNameInput(e.target.value)}
                      className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 font-mono focus:outline-indigo-500"
                    />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-2.5 py-1 rounded">Create</button>
                  </form>
                )}

                {/* File Layout Tree list */}
                <div className="flex-1 overflow-y-auto pt-2">
                  <div className="px-3 py-1 text-[11px] uppercase tracking-widest text-slate-400 font-bold font-mono">
                    Workspace directory
                  </div>
                  
                  {files.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-xs text-slate-400">No files yet. Start a task chat on the right, or click '+' above to spawn code files.</p>
                    </div>
                  ) : (
                    <div className="space-y-0.5 mt-2 px-1">
                      {files.map((file) => {
                        const fileExt = file.path.split('.').pop() || '';
                        const isHtml = fileExt === 'html';
                        return (
                          <div 
                            key={file.path}
                            onClick={() => setActiveFilePath(file.path)}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono cursor-pointer transition-all ${
                              activeFilePath === file.path 
                                ? 'bg-indigo-50 text-indigo-700 font-bold shadow-xs' 
                                : 'hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <FileCode className={`w-4 h-4 shrink-0 ${isHtml ? 'text-amber-500' : 'text-indigo-500'}`} />
                              <span>{file.path}</span>
                            </span>
                            
                            {/* file action delete */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile(file.path);
                              }}
                              className="opacity-0 group-hover:opacity-100 hover:text-red-600 p-0.5 rounded transition-all ml-2"
                              title="Delete file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SEARCH PANEL DRAWER */}
            {sidebarMode === 'search' && (
              <div className="flex-1 flex flex-col overflow-hidden p-4">
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500 flex items-center gap-1.5 mb-3">
                  <Search className="w-4 h-4 text-indigo-500" /> Search Files
                </span>
                
                <input 
                  type="text" 
                  placeholder="Filter workspace files..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-indigo-500 mb-4"
                />

                <div className="flex-1 overflow-y-auto space-y-1">
                  {filteredFiles.map(file => (
                    <div 
                      key={file.path} 
                      onClick={() => {
                        setActiveFilePath(file.path);
                        setSidebarMode('explorer');
                      }}
                      className="p-2 border border-slate-100 hover:border-slate-200 rounded-lg cursor-pointer text-xs font-mono text-slate-600 flex items-center justify-between"
                    >
                      <span className="truncate">{file.path}</span>
                      <span className="text-[10px] text-indigo-500 bg-indigo-50 px-1 py-0.5 rounded">{file.content.length} bytes</span>
                    </div>
                  ))}
                  {filteredFiles.length === 0 && (
                    <p className="text-xs text-slate-400 text-center mt-6">No matching files found</p>
                  )}
                </div>
              </div>
            )}

            {/* E2B CREDENTIALS AND STATUS TRAY */}
            {sidebarMode === 'e2b' && (
              <div className="flex-1 flex flex-col overflow-hidden p-4">
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500 flex items-center gap-1.5 mb-3">
                  <Cloud className="w-4 h-4 text-indigo-500" /> E2B Sandbox Platform
                </span>

                <div className="space-y-4">
                  <div className="p-3.5 bg-indigo-950 text-white rounded-2xl flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-300">Sandboxed VM Host</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                        e2bSandboxStatus === 'connected' ? 'bg-emerald-500 text-white animate-pulse' : 'bg-amber-600 text-white'
                      }`}>
                        {e2bSandboxStatus}
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-black font-mono">e2b-sandbox-micro-vm</h4>
                    
                    {e2bInstanceId && (
                      <span className="text-[10px] text-indigo-200 font-mono tracking-tight select-all truncate">
                        ID: {e2bInstanceId}
                      </span>
                    )}
                  </div>

                  {/* BYOK and status indicator details */}
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 text-xs text-slate-600">
                    <p className="leading-relaxed">
                      E2B provides a secure, remote runtime cloud for developers to run sandboxed code, spawn APIs, dynamic charts, and game builds safely.
                    </p>
                    <div className="flex items-center gap-1.5 pt-1 text-slate-800 font-bold">
                      <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Enterprise secure sandbox
                    </div>
                  </div>

                  {/* Run Remote simulator action button */}
                  {e2bSandboxStatus !== 'connected' ? (
                    <button 
                      onClick={triggerE2bCloudConnect}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl w-full flex items-center justify-center gap-2 transition-all active:scale-98"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Initialize Agent Cloud
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        appendSystemLog("Rebooting micro VM context on agent cloud...");
                        triggerE2bCloudConnect();
                      }}
                      className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 px-4 rounded-xl w-full flex items-center justify-center gap-2 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Reboot VM Instance
                    </button>
                  )}

                  {/* Live Simulation Console logs in tray */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">VM Execution logs</span>
                      <button onClick={() => setE2bLogs([])} className="text-[9px] text-indigo-600 font-bold hover:underline">Clear</button>
                    </div>
                    <div className="h-32 bg-slate-900 rounded-xl p-2.5 font-mono text-[9px] text-slate-300 overflow-y-auto space-y-1 scrollbar-thin shadow-inner select-text">
                      {e2bLogs.length === 0 ? (
                        <p className="text-slate-500 italic">No logs yet. VM idling.</p>
                      ) : (
                        e2bLogs.map((log, lIdx) => <div key={lIdx} className="break-all">{log}</div>)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS PANEL IN SIDEBAR */}
            {sidebarMode === 'settings' && (
              <form onSubmit={handleSaveKeys} className="flex-1 flex flex-col overflow-hidden p-4 space-y-4">
                <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500 flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-indigo-500" /> Workspace Credentials
                </span>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">E2B API Key (BYOK)</label>
                    <input 
                      type="password" 
                      placeholder="e2b_api_key_..."
                      value={e2bApiKey}
                      onChange={e => setE2bApiKey(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono font-medium focus:outline-indigo-500"
                    />
                    <span className="text-[10px] text-slate-400 leading-normal block">
                      Enables secure deployment VMs for server-side execution. Fallback simulation runs locally if kept empty.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-700 block">Gemini API Key (BYOK)</label>
                    <input 
                      type="password" 
                      placeholder="AIzaSy..."
                      value={geminiApiKey}
                      onChange={e => setGeminiApiKey(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono font-medium focus:outline-indigo-500"
                    />
                    <span className="text-[10px] text-slate-400 leading-normal block">
                      Use your own Gemini Developer API Key to process sandboxing prompts with custom limits.
                    </span>
                  </div>

                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl w-full flex items-center justify-center gap-2 transition-transform active:scale-97"
                  >
                    <Key className="w-3.5 h-3.5" />
                    Save & Test Sandbox Connection
                  </button>

                  <AnimatePresence>
                    {isKeysSaved && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-3 bg-emerald-50 border border-emerald-100/70 text-emerald-800 rounded-xl flex items-center gap-2 font-semibold text-[11px]"
                      >
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Settings updated securely!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            )}

            {/* Profile Workspace status bottom element */}
            <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {user?.email?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-800 truncate leading-none mb-1">{user?.email || 'Active Developer'}</p>
                <p className="text-[9px] font-mono text-slate-400 leading-none">Sandbox admin session</p>
              </div>
            </div>

          </div>
        </AnimatePresence>

        {/* MAIN DESIGN PANEL: Tab Navigation inside white-themed environment */}
        <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
          
          {/* Main Action Tab Switchers on Left Side of workspace frame */}
          <div className="h-12 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between px-4 shrink-0 select-none">
            <div className="flex gap-1">
              {[
                { id: 'chat', label: 'Chat Agent', icon: <Send className="w-3.5 h-3.5" /> },
                { id: 'code', label: 'Code Editor', icon: <Code2 className="w-3.5 h-3.5" /> },
                { id: 'preview', label: 'Live Preview', icon: <PlayCircle className="w-3.5 h-3.5" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-white border-t-2 border-indigo-600 text-indigo-700 font-extrabold shadow-sm'
                      : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Current Active File label on top of code context */}
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider bg-white/70 px-2.5 py-1 rounded border border-slate-200/50">
              <File className="w-3 h-3 text-indigo-500" />
              {activeFilePath}
            </div>
          </div>

          {/* TAB DETAILED PANELS */}
          <div className="flex-1 overflow-hidden relative bg-white">
            
            {/* 1. CHAT CANVAS VIEW */}
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col relative bg-white">
                
                {/* Scrollable messages container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
                  
                  {/* Greeting header layout */}
                  {chatMessages.length <= 1 && (
                    <div className="py-12 flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-700 shadow-md transform hover:scale-105 transition-transform duration-300">
                        <Cpu className="w-8 h-8 text-indigo-600 animate-pulse" />
                      </div>
                      
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">What do you want to build?</h2>
                      <p className="text-sm text-slate-500 max-w-sm">Chat with the enterprise agent to create, edit, or execute code in your secure sandbox.</p>
                      
                      {/* Pill style toggles requested exactly by image layout */}
                      <div className="flex flex-wrap justify-center gap-3 pt-4">
                        <button 
                          onClick={() => setIsMultiAgent(false)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold transition-all border ${
                            !isMultiAgent 
                              ? 'bg-slate-900 text-white border-slate-950 shadow-md' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                          ⚡ Fast Direct Code
                        </button>
                        <button 
                          onClick={() => setIsMultiAgent(true)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold transition-all border ${
                            isMultiAgent 
                              ? 'bg-slate-900 text-white border-slate-950 shadow-md' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                          🧠 Multi-Agent Plan (Slow)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Render Message Logs */}
                  <div className="space-y-4">
                    {chatMessages.map((msg) => {
                      const isUser = msg.role === 'user';
                      const isSys = msg.role === 'system';
                      
                      if (isSys) {
                        return (
                          <div key={msg.id} className="p-3 bg-red-50 border border-red-100 text-red-900 text-xs rounded-xl flex items-start gap-2 max-w-3xl">
                            <Info className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="font-bold">Sandbox System Issue</p>
                              <p className="leading-relaxed font-mono">{msg.content}</p>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div 
                          key={msg.id} 
                          className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                        >
                          {/* Profile Circle Icon */}
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs font-bold text-xs border ${
                            isUser 
                              ? 'bg-indigo-600 text-white border-indigo-700' 
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}>
                            {isUser ? 'U' : 'A'}
                          </div>

                          <div className="space-y-1 w-full">
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                              <span className="font-bold text-slate-600">{isUser ? 'You' : 'DocCraft Agent'}</span>
                              <span>&bull;</span>
                              <span>{msg.timestamp}</span>
                            </div>

                            {/* Message text block */}
                            <div className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                              isUser 
                                ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                                : 'bg-slate-100/70 text-slate-800 rounded-tl-none border border-slate-200/50'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Loader */}
                    {isLlmGenerating && (
                      <div className="flex gap-3 max-w-2xl">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-bold text-xs shrink-0 animate-bounce">
                          A
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="text-[10px] text-slate-400 font-mono">DocCraft Agent is writing code...</div>
                          <div className="p-4 bg-slate-100/70 border border-slate-200/50 rounded-2xl rounded-tl-none space-y-1.5 w-full">
                            <div className="h-2.5 bg-slate-250 rounded-full w-4/5 animate-pulse" />
                            <div className="h-2.5 bg-slate-250 rounded-full w-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                            <div className="h-2.5 bg-slate-255 rounded-full w-2/3 animate-pulse" style={{ animationDelay: '0.4s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Prompt entry workspace bar */}
                <div className="border-t border-slate-200 bg-white p-4 shrink-0 mt-auto">
                  
                  {/* Shortcut recommendations inline */}
                  <div className="max-w-4xl mx-auto flex gap-2 overflow-x-auto pb-3 mb-1 shrink-0 scrollbar-none">
                    {[
                      { text: "Build a Tic Tac Toe game", label: "🎮 TicTacToe" },
                      { text: "Create a simple timer", label: "⏰ Timer" },
                      { text: "Make a CSS drawing canvas website", label: "🎨 DrawCanvas" },
                      { text: "Write an interactive calculators layout", label: "🧮 Calculator" }
                    ].map(rec => (
                      <button 
                        key={rec.text}
                        onClick={() => setPromptInput(rec.text)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-all shrink-0 font-mono"
                      >
                        {rec.label}
                      </button>
                    ))}
                  </div>

                  {/* Typing input tray panel form */}
                  <form onSubmit={handleSendPromptMessage} className="max-w-4xl mx-auto flex bg-slate-50 border border-slate-200 rounded-2xl p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                    <textarea 
                      required
                      rows={1}
                      disabled={isLlmGenerating}
                      value={promptInput}
                      onChange={e => setPromptInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendPromptMessage();
                        }
                      }}
                      placeholder="E.g., Initialize a new Express server and install mongoose..."
                      className="flex-1 bg-transparent border-none outline-none resize-none px-4 py-3 text-xs md:text-sm text-slate-800 placeholder-slate-400 max-h-24 scrollbar-thin font-medium"
                    />

                    <div className="flex items-center gap-1.5 pr-1">
                      {chatMessages.length > 2 && (
                        <button 
                          type="button" 
                          onClick={clearChatHistory}
                          className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Clear whole chat log"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      )}

                      <button 
                        type="submit"
                        disabled={!promptInput.trim() || isLlmGenerating}
                        className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-md transition-all flex items-center justify-center active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* 2. CODE EDITOR CANVAS VIEW */}
            {activeTab === 'code' && (
              <div className="h-full flex flex-col relative bg-slate-55 select-text overflow-hidden">
                
                {/* Editor Top Bar Controller */}
                <div className="h-10 bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 select-none">
                  <span className="text-[10px] font-mono font-bold text-slate-500 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-indigo-500" /> Currently Editing: <span className="text-slate-700 font-extrabold">{activeFilePath}</span>
                  </span>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSaveActiveFile}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1 rounded shadow-xs flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Save File Change
                    </button>
                  </div>
                </div>

                {/* Text editor and numbers sidebar */}
                <div className="flex-1 flex overflow-hidden font-mono text-xs text-slate-700 select-text">
                  
                  {/* Line Numbers column */}
                  <div className="w-12 bg-slate-50 text-slate-400 border-r border-slate-200 py-4 select-none text-right pr-3 font-semibold select-none space-y-0.5 leading-5 text-[11px]">
                    {Array.from({ length: 40 }).map((_, idx) => (
                      <div key={idx}>{idx + 1}</div>
                    ))}
                  </div>

                  {/* Live textarea element with high capability */}
                  <textarea 
                    value={editingCode}
                    onChange={e => setEditingCode(e.target.value)}
                    className="flex-1 h-full bg-white p-4 focus:outline-none resize-none font-mono text-xs md:text-sm leading-5 text-slate-850 tab-size-[4] select-text selection:bg-slate-200"
                    placeholder="// write code snippet here..."
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {/* 3. PREVIEW LIVE ENVIRONMENT VIEW */}
            {activeTab === 'preview' && (
              <div className="h-full flex flex-col bg-slate-100">
                
                {/* Preview controller navigation bar */}
                <div className="h-10 bg-slate-200/60 border-b border-slate-300 px-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>Active App Viewport</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-bold select-all truncate max-w-[200px] sm:max-w-none">
                      https://e2b-sandbox-host.cloud/wksp/index.html
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => appendSystemLog("Forcing iframe render cache reload...")}
                      title="Refresh Preview Workspace"
                      className="p-1 hover:bg-white rounded border border-slate-300 hover:border-slate-400 text-slate-600 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => {
                        const win = window.open();
                        if (win) win.document.write(previewFrameContent);
                      }}
                      title="Open sandbox tab"
                      className="p-1 hover:bg-white rounded border border-slate-300 hover:border-slate-400 text-slate-600 transition-colors flex items-center gap-1 text-[10px] uppercase font-bold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Full View
                    </button>
                  </div>
                </div>

                {/* Preview secure iframe sandbox container */}
                <div className="flex-1 bg-white relative">
                  <iframe 
                    title="Docscraft Active Sandbox Preview Frame"
                    srcDoc={previewFrameContent}
                    sandbox="allow-scripts allow-popups allow-modals allow-same-origin"
                    referrerPolicy="no-referrer"
                    className="w-full h-full border-none bg-white relative z-10"
                  />
                  
                  {/* Backdrop hint indicating preview compilation status */}
                  <div className="absolute inset-x-0 bottom-4 mx-auto w-fit bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl flex items-center gap-2.5 z-20 text-xs border border-slate-800">
                    <Gamepad2 className="w-4.5 h-4.5 text-indigo-400" />
                    <span>Interactive Preview active. Interact with your built game above!</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
