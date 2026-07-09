import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, File, FileCode, Plus, Trash2, Play, RefreshCw, Send, Sparkles, Code2, 
  Terminal, Settings, Search, Layout, HelpCircle, LogOut, ArrowLeft, Key, ExternalLink, 
  Database, Server, Cloud, Shield, Check, Copy, Info, Cpu, PlayCircle, AppWindow, Gamepad2, Layers,
  BrainCircuit, Loader2, Bot, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ModelSelector } from '../components/ModelSelector';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AgentStudioBackground } from '../components/AgentStudioBackground';
import { VibecodingAPI } from '../lib/vibecoding/FrontendAPI';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism.css';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

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

  const handleCopyToClipboard = (text: string, type?: string) => {
    navigator.clipboard.writeText(text);
    if (type) {
      setCopiedTextType(type);
      setTimeout(() => setCopiedTextType(null), 2000);
    }
  };

  // Selected Active Tab in main editor zone
  const [activeTab, setActiveTab] = useState<'chat' | 'code' | 'preview'>('chat');
  
  // Active Sidebar Mode
  const [sidebarMode, setSidebarMode] = useState<'chats' | 'explorer' | 'search' | 'e2b' | 'settings'>('explorer');

  // Input code command prompt
  const [promptInput, setPromptInput] = useState('');
  const [isLlmGenerating, setIsLlmGenerating] = useState(false);
  const [isMultiAgent, setIsMultiAgent] = useState(false); // fast direct code vs slow multi-agent plan
  const [agentStatus, setAgentStatus] = useState<string>('Thinking...');

  // State keys stored in state (BYOK keys for E2B / Gemini)
  const [e2bApiKey, setE2bApiKey] = useState(() => localStorage.getItem('dc_e2b_api_key') || import.meta.env.VITE_E2B_API_KEY || '');
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('dc_custom_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '');
  const [claudeApiKey, setClaudeApiKey] = useState(() => localStorage.getItem('dc_custom_claude_api_key') || '');
  const [gptApiKey, setGptApiKey] = useState(() => localStorage.getItem('dc_custom_gpt_api_key') || '');
  const [customModelEndpoint, setCustomModelEndpoint] = useState(() => localStorage.getItem('dc_custom_endpoint') || '');
  const [customModelKey, setCustomModelKey] = useState(() => localStorage.getItem('dc_custom_key') || '');
  const [isKeysSaved, setIsKeysSaved] = useState(false);

  // Model Selection
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.1-pro');

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
    <title>Docscraft-pro agent studio</title>
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
        content: "Welcome to Docscraft-pro agent studio 💻\n\nI can build complex, interactive full-stack modules, HTML/JS/CSS websites, HTML5 games, and specialized APIs using the **E2B Enterprise AI Agent Cloud** sandbox instances.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  // File explorer search term
  const [searchTerm, setSearchTerm] = useState('');

  // Active file creation model and project name
  const [newFileNameInput, setNewFileNameInput] = useState('');
  const [showFileCreate, setShowFileCreate] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [projectName, setProjectName] = useState('My Awesome Project');
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState<'prompt' | 'tools' | 'settings' | 'skills'>('prompt');
  const [copiedTextType, setCopiedTextType] = useState<string | null>(null);

  const [systemInstructionsInput, setSystemInstructionsInput] = useState(() => {
    const saved = localStorage.getItem('dc_system_instructions_input');
    if (saved) return saved;
    return `You are the autonomous backend core agent for AgentStudio. Your primary role is to act as a resource provisioning engine. You execute tasks by calling external functions to create projects, modify files, and handle builds within external environments like Lovable, mirroring the native integration between Google AI Studio and Firebase.

### OPERATIONAL CORE MANIFESTO

1. ZERO BOILERPLATE CONVERSATION
Do not explain your reasoning, do not write markdown descriptions, and do not apologize. Focus entirely on executing the technical task. If a user asks for a feature, immediately determine the technical steps and execute them using the provided tools.

2. LOGICAL SEQUENCING
Always execute your infrastructure setup in a logical order:
- Step A: Call 'provision_project' to establish the workspace environment and its associated data engine if it does not already exist.
- Step B: Call 'mutate_files' to write the complete layout, backend routes, components, and configurations. Never write incomplete placeholders or "// TODO" comments.
- Step C: Wait for the system's runtime compilation webhook response.

3. IDEMPOTENT MUTATIONS
When editing codebases, check file paths carefully. When applying changes using the 'UPDATE' action, modify only the relevant code blocks. Use the 'WRITE' action to replace entire file contents when a complete rewrite is cleaner.

4. AUTONOMOUS SELF-HEALING BUILD LOOP
If an external webhook returns a 'build.failed' event accompanied by compiler logs or error traces, you must treat this as a high-priority interrupt. Immediately analyze the error message, identify the root cause (such as a broken import path, type mismatch, or syntax bug), and execute a 'mutate_files' correction tool call to fix the codebase.`;
  });
  
  // Custom Workspace States
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Firebase Chat Sessions
  const [chatSessionsList, setChatSessionsList] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Real-time title syncing in sidebar on rename
  useEffect(() => {
    if (currentSessionId && projectName) {
      setChatSessionsList(prev => prev.map(s => s.id === currentSessionId ? { ...s, title: projectName } : s));
    }
  }, [projectName, currentSessionId]);

  useEffect(() => {
    if (!user) return;
    const loadSessions = async () => {
      try {
        const q = query(collection(db, 'chat_sessions'), where('ownerId', '==', user.uid), where('appType', '==', 'agentStudio'));
        const snapshot = await getDocs(q);
        const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort manually by createdAt if available, else local
        sessions.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setChatSessionsList(sessions);
      } catch (err) {
        console.error("Failed to load chat sessions from Firebase", err);
      }
    };
    loadSessions();
  }, [user]);

  // Synchronize files to localstorage
  useEffect(() => {
    localStorage.setItem('dc_repos_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('dc_repos_chat', JSON.stringify(chatMessages));
    
    // Also save to Firebase if we have a session
    if (user && currentSessionId) {
      updateDoc(doc(db, 'chat_sessions', currentSessionId), {
        messages: JSON.stringify(chatMessages),
        updatedAt: serverTimestamp(),
        title: projectName
      }).catch(e => console.error("Firebase update failed:", e));
    }
  }, [chatMessages, projectName, user, currentSessionId]);

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

  // Global physical Keyboard Shortcuts Listener for high productivity IDE
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + S (Save active file)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveActiveFile();
      }
      // Ctrl + B (Toggle sidebar collapse)
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
      // Alt + 1, Alt + 2, Alt + 3 (Switch tabs)
      if (e.altKey && e.key === '1') {
        e.preventDefault();
        setActiveTab('chat');
      }
      if (e.altKey && e.key === '2') {
        e.preventDefault();
        setActiveTab('code');
      }
      if (e.altKey && e.key === '3') {
        e.preventDefault();
        setActiveTab('preview');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingCode, activeFilePath]);

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('dc_e2b_api_key', e2bApiKey);
    localStorage.setItem('dc_custom_gemini_api_key', geminiApiKey);
    localStorage.setItem('dc_custom_claude_api_key', claudeApiKey);
    localStorage.setItem('dc_custom_gpt_api_key', gptApiKey);
    localStorage.setItem('dc_custom_endpoint', customModelEndpoint);
    localStorage.setItem('dc_custom_key', customModelKey);
    localStorage.setItem('dc_system_instructions_input', systemInstructionsInput);
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

    // Determine user intent: check if user is asking a general question vs requesting file/code generation.
    const lowerMsg = userMsg.toLowerCase().trim();
    const isQuestionOnly = lowerMsg.startsWith('/question') || 
                           lowerMsg.startsWith('/btw') || 
                           lowerMsg.endsWith('?') || 
                           lowerMsg.startsWith('why') || 
                           lowerMsg.startsWith('how') || 
                           lowerMsg.startsWith('explain') || 
                           lowerMsg.startsWith('what is') ||
                           (!lowerMsg.includes('build') && !lowerMsg.includes('make') && !lowerMsg.includes('create') && !lowerMsg.includes('write') && !lowerMsg.includes('add') && !lowerMsg.includes('implement') && !lowerMsg.includes('code') && !lowerMsg.includes('file') && !lowerMsg.includes('fix') && !lowerMsg.includes('generate'));

    // Prompt compilation context
    const contextOverview = files.map(f => `--- FILE: ${f.path} ---\n${f.content}`).join('\n\n');
    
    let systemInstructions = `You are a highly capable, autonomous Full Stack Developer Coding Agent inside an interactive E2B agent cloud sandbox.
Your absolute goal is to respond to the user's request with high-quality, professional code or helpful technical explanations.

### INTENT DETECTION & SCHEMAS

You MUST evaluate the user's message intent:
1. GENERAL QUESTIONS OR EXPLANATIONS:
   If the user is asking a general conceptual question, explaining something, or asking how something works (WITHOUT wanting you to write or edit files), you MUST set "files" to an empty array [] and write your complete, detailed explanation in the "message" field.
   
2. CODE GENERATION / FILE CREATION:
   If the user is asking to create, edit, modify, or fix code or files, you MUST generate the full, complete files (including proper paths) and return them in the "files" array. Describe your actions in the "message" field.

### CAPACITY & DEFAULT INSTRUCTIONS
- You have 100% full capacity to write ANY code file. You are not limited to a single language. You can create directories/folders, write file names such as "metadata.json", "app.js", "main.py", "index.html", "script.js", "package.json", or any code files in subfolders (e.g. "src/").
- You can install npm packages, import dependencies, and create rich nested project layouts.
- By default, if the user gives no instructions or empty input, you should default to scaffolding a beautiful, complete starter landing page with folders, "index.html", and "app.js".

### OUTPUT FORMAT SPECIFICATION
You MUST return your entire response as a single, valid JSON block. DO NOT wrap with extra conversational text outside the JSON.
Your JSON response MUST follow this exact schema:
\`\`\`json
{
  "files": [
    {
      "path": "path/to/file.ext",
      "content": "Full file content here (NO placeholders, NO truncated code)"
    }
  ],
  "message": "Friendly, professional developer message detailing what you built or answering their question."
}
\`\`\`
Return 100% complete and fully runnable file contents inside the JSON. Do not omit any lines.`;

    if (isQuestionOnly) {
      systemInstructions = `You are a highly capable, autonomous Full Stack Developer Coding Agent inside an interactive E2B agent cloud sandbox.
The user is asking a conceptual question, requesting an explanation, or chatting (WITHOUT requesting file mutations). 

You MUST set the "files" array to an empty list [] and put your complete, friendly, detailed answer in the "message" field.

Your JSON response MUST look exactly like this:
\`\`\`json
{
  "files": [],
  "message": "Your complete, clear, helpful explanation here."
}
\`\`\`
DO NOT return any text outside the JSON block. Let the JSON block stand alone.`;
    }

    const fullPrompt = `System Context:\n${systemInstructions}\n\nExisting files in sandbox workspace:\n${contextOverview}\n\nUser instructions: ${userMsg}`;

    try {
      if (isMultiAgent || userMsg.startsWith('/deep-research')) {
        setAgentStatus('Initializing Deep Research agent cascade...');
        await new Promise(r => setTimeout(r, 700));
        setAgentStatus('Searching Google & indexing official API documents...');
        await new Promise(r => setTimeout(r, 900));
        setAgentStatus('Evaluating dependency trees and sandbox layout...');
        await new Promise(r => setTimeout(r, 800));
        setAgentStatus('Deploying codegen sub-agents...');
      } else {
        setAgentStatus('Thinking and analyzing instructions...');
      }
      
      const resp = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          customApiKey: geminiApiKey || undefined,
          claudeApiKey: claudeApiKey || undefined,
          gptApiKey: gptApiKey || undefined,
          customModelEndpoint: customModelEndpoint || undefined,
          customModelKey: customModelKey || undefined,
          selectedModel: selectedModel,
          isComplex: isMultiAgent
        })
      });

      let resData;
      if (!resp.ok) {
        let errMessage = resp.statusText || 'Unknown server error';
        try {
          const errBody = await resp.json();
          if (errBody && errBody.error) errMessage = errBody.error;
        } catch (e) {}
        throw new Error(`Failed to contact API: ${errMessage}`);
      }

      setAgentStatus('Compiling source code...');
      
      try {
        resData = await resp.json();
      } catch (e: any) {
        throw new Error(`Invalid JSON response from server: ${e.message}`);
      }
      
      const rawText = resData.text || resData.result || '';
      
      let parsedResponse: { files?: WorkspaceFile[]; message?: string } = {};
      try {
        let cleanText = rawText;
        if (cleanText.includes('```json')) {
          cleanText = cleanText.split('```json')[1].split('```')[0];
        } else if (cleanText.includes('```')) {
          cleanText = cleanText.split('```')[1].split('```')[0];
        }
        parsedResponse = JSON.parse(cleanText.trim());
      } catch (parseErr) {
        parsedResponse = {
          message: rawText,
          files: []
        };
      }

      if (parsedResponse.files && parsedResponse.files.length > 0) {
        // Simulate live creation step-by-step
        for (const file of parsedResponse.files) {
          const dirMatch = file.path.match(/^(.*)\/[^/]+$/);
          if (dirMatch) {
            setAgentStatus(`Creating directory ${dirMatch[1]}...`);
            await new Promise(r => setTimeout(r, 600));
          }
          setAgentStatus(`Writing file ${file.path}...`);
          await new Promise(r => setTimeout(r, 800));
        }
        
        setAgentStatus('Executing npm install...');
        await new Promise(r => setTimeout(r, 1500));
        setAgentStatus('Starting dev server on port 3000...');
        await new Promise(r => setTimeout(r, 1000));

        setFiles(prev => {
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

        const createdPaths = parsedResponse.files.map(f => f.path);
        if (createdPaths.includes('index.html')) {
          setActiveFilePath('index.html');
        } else if (createdPaths.length > 0) {
          setActiveFilePath(createdPaths[0]);
        }

        if (createdPaths.includes('index.html') || createdPaths.some(p => p.endsWith('.html'))) {
          setActiveTab('preview');
        } else {
          setActiveTab('code');
        }

        appendSystemLog(`Agent successfully completed compilation and file deployment inside current Sandbox environment. Files modified: ${createdPaths.join(', ')}`);
      }

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

  const handleNewChatSession = async () => {
    const initialMessage = {
      id: 'initial',
      role: 'assistant',
      content: "Welcome to Docscraft-pro agent studio 💻\n\nI can build complex, interactive full-stack modules, HTML/JS/CSS websites, HTML5 games, and specialized APIs using the **E2B Enterprise AI Agent Cloud** sandbox instances.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages([initialMessage as ChatMessage]);
    setFiles([]);
    setProjectName("New Project");
    
    if (user) {
      try {
        const docRef = await addDoc(collection(db, 'chat_sessions'), {
          title: "New Project",
          appType: "agentStudio",
          messages: JSON.stringify([initialMessage]),
          ownerId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        setCurrentSessionId(docRef.id);
        const newSession = {
          id: docRef.id,
          title: "New Project",
          appType: "agentStudio",
          messages: JSON.stringify([initialMessage]),
          ownerId: user.uid,
          createdAt: { toMillis: () => Date.now() }
        };
        setChatSessionsList(prev => [newSession, ...prev]);
      } catch (err) {
        console.error("Failed to create chat session", err);
      }
    }
    
    appendSystemLog("Started new chat session container.");
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-transparent text-slate-800 flex flex-col font-sans antialiased selection:bg-indigo-600 selection:text-white relative z-10">
      <AgentStudioBackground />
      {/* 1. TOP HEADER MENU BAR LAYOUT */}
      <header className="h-13 bg-slate-900 text-white flex items-center justify-between px-4 text-xs font-semibold shrink-0 select-none border-b border-slate-950 relative z-50">
        
        {/* Left Side: Standard VSCode File Menus */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 hover:bg-slate-800 px-2 py-1 rounded-md transition-all text-slate-300">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Workspace Dashboard</span>
          </button>
          
          <div className="h-4 w-px bg-slate-800" />
          
          <div className="flex items-center gap-1 relative z-[60]">
            {/* File Menu */}
            <div className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')} 
                className={`px-2.5 py-1.5 rounded-md transition-colors text-slate-200 flex items-center gap-1 ${activeMenu === 'file' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
              >
                File
              </button>
              {activeMenu === 'file' && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-slate-900 border border-slate-800 shadow-2xl rounded-lg py-1.5 z-[999] text-left text-slate-200">
                  <button 
                    onClick={() => { setSidebarMode('explorer'); setShowFileCreate(true); setActiveMenu(null); }} 
                    className="w-full text-left px-3 py-2 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>New Sandbox File</span>
                    <span className="text-[9px] text-slate-400 font-mono font-bold">Ctrl+N</span>
                  </button>
                  <button 
                    onClick={() => { handleSaveActiveFile(); setActiveMenu(null); }} 
                    className="w-full text-left px-3 py-2 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Save Active File</span>
                    <span className="text-[9px] text-slate-400 font-mono font-bold">Ctrl+S</span>
                  </button>
                  <div className="h-px bg-slate-800 my-1" />
                  <button 
                    onClick={() => { 
                      const fileInput = document.getElementById('zip-uploader-input-top');
                      if (fileInput) (fileInput as HTMLInputElement).click();
                      setActiveMenu(null); 
                    }} 
                    className="w-full text-left px-3 py-2 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    Import ZIP Project
                  </button>
                  <button 
                    onClick={async () => {
                      appendSystemLog("Preparing zip download...");
                      const zip = new JSZip();
                      files.forEach(file => {
                        zip.file(file.path, file.content);
                      });
                      const blob = await zip.generateAsync({ type: "blob" });
                      const safeName = projectName.toLowerCase().replace(/\s+/g, '-');
                      saveAs(blob, `${safeName}.zip`);
                      appendSystemLog(`Downloaded ${safeName}.zip`);
                      setActiveMenu(null);
                    }} 
                    className="w-full text-left px-3 py-2 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    Export ZIP Project
                  </button>
                </div>
              )}
            </div>

            {/* Edit Menu */}
            <div className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')} 
                className={`px-2.5 py-1.5 rounded-md transition-colors text-slate-200 flex items-center gap-1 ${activeMenu === 'edit' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
              >
                Edit
              </button>
              {activeMenu === 'edit' && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-slate-900 border border-slate-800 shadow-2xl rounded-lg py-1.5 z-[999] text-left text-slate-200">
                  <button 
                    onClick={() => { setShowInstructionsModal(true); setActiveMenu(null); }} 
                    className="w-full text-left px-3 py-2 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    AI System Instructions
                  </button>
                  <div className="h-px bg-slate-800 my-1" />
                  <button 
                    onClick={() => { setFiles([]); appendSystemLog("Cleared workspace files."); setActiveMenu(null); }} 
                    className="w-full text-left px-3 py-2 hover:bg-red-600 hover:text-white text-red-400 transition-colors"
                  >
                    Clear Workspace Files
                  </button>
                </div>
              )}
            </div>

            {/* View Menu */}
            <div className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')} 
                className={`px-2.5 py-1.5 rounded-md transition-colors text-slate-200 flex items-center gap-1 ${activeMenu === 'view' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
              >
                View
              </button>
              {activeMenu === 'view' && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-slate-900 border border-slate-800 shadow-2xl rounded-lg py-1.5 z-[999] text-left text-slate-200">
                  <button 
                    onClick={() => { setActiveTab('chat'); setActiveMenu(null); }} 
                    className="w-full text-left px-3 py-2 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Chat Panel View</span>
                    <span className="text-[9px] text-slate-400 font-mono font-bold">Tab 1</span>
                  </button>
                  <button 
                    onClick={() => { setActiveTab('code'); setActiveMenu(null); }} 
                    className="w-full text-left px-3 py-2 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Source Code View</span>
                    <span className="text-[9px] text-slate-400 font-mono font-bold">Tab 2</span>
                  </button>
                  <button 
                    onClick={() => { setActiveTab('preview'); setActiveMenu(null); }} 
                    className="w-full text-left px-3 py-2 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-between"
                  >
                    <span>Live Interactive View</span>
                    <span className="text-[9px] text-slate-400 font-mono font-bold">Tab 3</span>
                  </button>
                  <div className="h-px bg-slate-800 my-1" />
                  <button 
                    onClick={() => { setPreviewKey(k => k + 1); appendSystemLog("Forced iframe reload"); setActiveMenu(null); }} 
                    className="w-full text-left px-3 py-2 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    Refresh Active Viewport
                  </button>
                </div>
              )}
            </div>

            {/* Terminal Menu */}
            <div className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'terminal' ? null : 'terminal')} 
                className={`px-2.5 py-1.5 rounded-md transition-colors text-slate-200 flex items-center gap-1 ${activeMenu === 'terminal' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
              >
                Terminal
              </button>
              {activeMenu === 'terminal' && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-slate-900 border border-slate-800 shadow-2xl rounded-lg py-1.5 z-[999] text-left text-slate-200">
                  <button 
                    onClick={() => { setSidebarMode('e2b'); setActiveMenu(null); }} 
                    className="w-full text-left px-3 py-2 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    Open VM Terminal
                  </button>
                  <button 
                    onClick={() => { setE2bLogs([]); appendSystemLog("Cleared terminal logs."); setActiveMenu(null); }} 
                    className="w-full text-left px-3 py-2 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    Clear Terminal Output
                  </button>
                  <div className="h-px bg-slate-800 my-1" />
                  <button 
                    onClick={() => { triggerE2bCloudConnect(); setActiveMenu(null); }} 
                    className="w-full text-left px-3 py-2 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    Reboot VM Server Instance
                  </button>
                </div>
              )}
            </div>

            {/* Help Menu */}
            <div className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')} 
                className={`px-2.5 py-1.5 rounded-md transition-colors text-slate-200 flex items-center gap-1 ${activeMenu === 'help' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
              >
                Help
              </button>
              {activeMenu === 'help' && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-slate-900 border border-slate-800 shadow-2xl rounded-lg py-1.5 z-[999] text-left text-slate-200">
                  <button 
                    onClick={() => { setSidebarMode('settings'); setActiveMenu(null); }} 
                    className="w-full text-left px-3 py-2 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    Workspace Settings
                  </button>
                  <button 
                    onClick={() => { setShowShortcutsModal(true); setActiveMenu(null); }} 
                    className="w-full text-left px-3 py-2 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    View Keyboard Shortcuts
                  </button>
                </div>
              )}
            </div>

            <input 
              type="file" 
              id="zip-uploader-input-top" 
              accept=".zip" 
              className="hidden" 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                appendSystemLog("Extracting zip file...");
                const jszip = new JSZip();
                try {
                  const zip = await jszip.loadAsync(file);
                  const newFiles: WorkspaceFile[] = [];
                  for (const relativePath in zip.files) {
                    const zipEntry = zip.files[relativePath];
                    if (!zipEntry.dir) {
                      if (relativePath.match(/\.(png|jpe?g|gif|svg|ico|pdf|zip|mp4|webm|wav|mp3|eot|ttf|woff|woff2)$/i)) {
                        continue;
                      }
                      try {
                        const content = await zipEntry.async("string");
                        if (content !== null && content !== undefined) {
                          newFiles.push({ path: relativePath, content });
                        }
                      } catch(e) { console.error("Could not read " + relativePath) }
                    }
                  }
                  setFiles(prev => {
                    const combined = [...prev];
                    newFiles.forEach(nf => {
                      const existingIdx = combined.findIndex(pf => pf.path === nf.path);
                      if (existingIdx !== -1) combined[existingIdx] = nf;
                      else combined.push(nf);
                    });
                    return combined;
                  });
                  appendSystemLog(`Successfully extracted ${newFiles.length} files from ${file.name}`);
                } catch (err) {
                  console.error(err);
                  appendSystemLog("Failed to extract zip file.");
                }
              }} 
            />
          </div>
        </div>

        {/* Center Name Title */}
        <div className="flex items-center justify-center gap-2 text-slate-100 font-mono font-bold text-sm bg-slate-950 px-5 py-2 rounded-xl border border-slate-700 shadow-inner group w-1/3 md:w-auto">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <input
             value={projectName}
             onChange={e => setProjectName(e.target.value)}
             className="bg-transparent border-none outline-none text-center uppercase tracking-widest min-w-[120px] w-full text-white placeholder-slate-500 group-hover:bg-slate-900 px-2 py-0.5 rounded transition-colors"
             placeholder="Project Name"
          />
        </div>

        {/* Right Side Settings Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 mr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-slate-400 hidden lg:inline uppercase font-mono tracking-tight font-bold">e2b-v3 secure VM sandbox</span>
          </div>

          {/* Persistent Keyboard Shortcuts Button */}
          <button 
            onClick={() => setShowShortcutsModal(true)}
            className="flex items-center gap-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-200 hover:text-white border border-indigo-800 px-3 py-1.5 rounded-md transition-colors text-[11px] font-bold shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            ⚡ Shortcuts
          </button>
          
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

      {/* Global Background Click Handler for menus */}
      {activeMenu && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setActiveMenu(null)} />
      )}

      {/* 2. BODY LAYOUT: SideBar Icons + Sidebar List + Main code/preview tabs */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        
        {/* Sidebar Mini Action Rails (Left aligned columns) */}
        <div className="w-14 bg-slate-900 shrink-0 flex flex-col items-center py-4 border-r border-slate-950 justify-between overflow-hidden">
          <div className="space-y-4 w-full flex flex-col items-center">
            {/* Chats / History */}
            <button 
              onClick={() => setSidebarMode('chats')}
              title="Chat Sessions"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                sidebarMode === 'chats' 
                  ? 'bg-indigo-600 shadow-lg text-white font-bold' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-5 h-5" />
            </button>

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
          {!isSidebarCollapsed && (
            <motion.div 
              key="sidebar-drawer"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="w-72 bg-white shrink-0 flex flex-col border-r border-slate-200 overflow-hidden select-none"
            >
            
            {/* CHATS DRAWER CONTENT */}
            {sidebarMode === 'chats' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-indigo-500" /> Chat Sessions
                  </span>
                  <button 
                    onClick={handleNewChatSession}
                    title="New Chat Session"
                    className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  
                  {chatSessionsList.length === 0 && (
                    <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 cursor-pointer">
                      <h4 className="text-xs font-bold text-indigo-900 truncate">Current Session</h4>
                      <p className="text-[10px] text-indigo-700 truncate">{projectName}</p>
                    </div>
                  )}

                  {chatSessionsList.map((session, idx) => (
                    <div 
                      key={session.id} 
                      onClick={() => {
                        setCurrentSessionId(session.id);
                        setProjectName(session.title || "Untitled Project");
                        if (session.messages) {
                          try {
                            setChatMessages(JSON.parse(session.messages));
                          } catch (e) {
                            setChatMessages([]);
                          }
                        }
                      }}
                      className={`p-2 rounded-lg cursor-pointer ${currentSessionId === session.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50'}`}
                    >
                      <h4 className={`text-xs font-bold truncate ${currentSessionId === session.id ? 'text-indigo-900' : 'text-slate-700'}`}>{session.title || "Untitled Project"}</h4>
                      <p className="text-[10px] text-slate-500 truncate">{new Date(session.createdAt?.toMillis?.() || Date.now()).toLocaleDateString()}</p>
                    </div>
                  ))}

                </div>
              </div>
            )}

            {/* EXPLORER DRAWER CONTENT */}
            {sidebarMode === 'explorer' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500 flex items-center gap-1.5">
                    <Folder className="w-4 h-4 text-indigo-500" /> Explorer
                  </span>
                  
                  <div className="flex gap-1.5">
                    <label 
                      title="Upload Zip File" 
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <input type="file" accept=".zip" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        appendSystemLog("Extracting zip file...");
                        const jszip = new JSZip();
                        try {
                          const zip = await jszip.loadAsync(file);
                          const newFiles: WorkspaceFile[] = [];
                          for (const relativePath in zip.files) {
                            const zipEntry = zip.files[relativePath];
                            if (!zipEntry.dir) {
                              // Skip binary formats that shouldn't be read as string
                              if (relativePath.match(/\.(png|jpe?g|gif|svg|ico|pdf|zip|mp4|webm|wav|mp3|eot|ttf|woff|woff2)$/i)) {
                                continue;
                              }
                              try {
                                const content = await zipEntry.async("string");
                                if (content !== null && content !== undefined) {
                                  newFiles.push({ path: relativePath, content });
                                }
                              } catch(e) { console.error("Could not read " + relativePath) }
                            }
                          }
                          setFiles(prev => {
                            const combined = [...prev];
                            newFiles.forEach(nf => {
                              const existingIdx = combined.findIndex(pf => pf.path === nf.path);
                              if (existingIdx !== -1) combined[existingIdx] = nf;
                              else combined.push(nf);
                            });
                            return combined;
                          });
                          appendSystemLog(`Successfully extracted ${newFiles.length} files from ${file.name}`);
                        } catch (err) {
                          console.error(err);
                          appendSystemLog("Failed to extract zip file.");
                        }
                      }} />
                    </label>
                    <button 
                      onClick={async () => {
                        appendSystemLog("Preparing zip download...");
                        const zip = new JSZip();
                        files.forEach(file => {
                          zip.file(file.path, file.content);
                        });
                        const blob = await zip.generateAsync({ type: "blob" });
                        const safeName = projectName.toLowerCase().replace(/\s+/g, '-');
                        saveAs(blob, `${safeName}.zip`);
                        appendSystemLog(`Downloaded ${safeName}.zip`);
                      }} 
                      title="Download Zip" 
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 rotate-[-90deg]" />
                    </button>
                    <button 
                      onClick={() => setShowFileCreate(!showFileCreate)} 
                      title="New sandbox file" 
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-indigo-600 transition-colors"
                    >
                      <FileCode className="w-4 h-4" />
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
                  <div className="space-y-1.5 flex flex-col flex-1 pb-4">
                    <div className="flex justify-between items-center shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Native Terminal</span>
                      <button onClick={() => setE2bLogs([])} className="text-[9px] text-indigo-600 font-bold hover:underline">Clear</button>
                    </div>
                    <div className="flex-1 min-h-[120px] bg-slate-950 rounded-t-xl p-2.5 font-mono text-[9px] text-emerald-400 overflow-y-auto space-y-1 scrollbar-thin shadow-inner select-text">
                      {e2bLogs.length === 0 ? (
                        <p className="text-slate-600 italic">No output. Type a command below.</p>
                      ) : (
                        e2bLogs.map((log, lIdx) => <div key={lIdx} className="break-all">{log}</div>)
                      )}
                    </div>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.elements.namedItem('cmd') as HTMLInputElement;
                        if (input.value.trim()) {
                          const cmd = input.value;
                          setE2bLogs(prev => [...prev, `$ ${cmd}`, `> e2b: executing ${cmd}...`, "Command execution simulated in dev environment."]);
                          input.value = '';
                        }
                      }}
                      className="flex border border-slate-900 bg-slate-900 rounded-b-xl overflow-hidden shadow-inner shrink-0"
                    >
                      <span className="text-emerald-500 font-mono text-[10px] font-bold pl-2.5 py-1.5">$&nbsp;</span>
                      <input 
                        name="cmd"
                        type="text"
                        autoComplete="off"
                        placeholder="npm install..."
                        className="bg-transparent flex-1 text-slate-300 font-mono text-[10px] outline-none px-1 py-1.5"
                      />
                    </form>
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
                  <div className="space-y-1.5 overflow-y-auto max-h-[60vh] pr-2">
                    <label className="font-extrabold text-slate-700 block">E2B API Key (BYOK)</label>
                    <input 
                      type="password" 
                      placeholder="e2b_api_key_..."
                      value={e2bApiKey}
                      onChange={e => setE2bApiKey(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono font-medium focus:outline-indigo-500 mb-4"
                    />

                    <label className="font-extrabold text-slate-700 block">Gemini API Key (BYOK)</label>
                    <input 
                      type="password" 
                      placeholder="AIzaSy..."
                      value={geminiApiKey}
                      onChange={e => setGeminiApiKey(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono font-medium focus:outline-indigo-500 mb-4"
                    />

                    <label className="font-extrabold text-slate-700 block">Claude API Key (BYOK)</label>
                    <input 
                      type="password" 
                      placeholder="sk-ant-..."
                      value={claudeApiKey}
                      onChange={e => setClaudeApiKey(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono font-medium focus:outline-indigo-500 mb-4"
                    />

                    <label className="font-extrabold text-slate-700 block">GPT API Key (BYOK)</label>
                    <input 
                      type="password" 
                      placeholder="sk-proj-..."
                      value={gptApiKey}
                      onChange={e => setGptApiKey(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono font-medium focus:outline-indigo-500 mb-4"
                    />

                    <div className="p-3 bg-slate-100 rounded-lg mt-4 mb-2 border border-slate-200">
                      <label className="font-extrabold text-slate-700 block mb-2">Custom Model Details</label>
                      
                      <label className="font-semibold text-slate-600 block text-[10px]">Endpoint URL</label>
                      <input 
                        type="text" 
                        placeholder="https://your-custom-endpoint/v1/chat/completions"
                        value={customModelEndpoint}
                        onChange={e => setCustomModelEndpoint(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono font-medium focus:outline-indigo-500 mb-3"
                      />
                      
                      <label className="font-semibold text-slate-600 block text-[10px]">API Key / Schema</label>
                      <input 
                        type="password" 
                        placeholder="Bearer token or custom key"
                        value={customModelKey}
                        onChange={e => setCustomModelKey(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono font-medium focus:outline-indigo-500"
                      />
                    </div>

                    <div className="p-3 bg-slate-100 rounded-lg mt-4 mb-2 border border-slate-200">
                      <label className="font-extrabold text-slate-700 block mb-2">Agent Config & System Rules</label>
                      <label className="font-semibold text-slate-600 block text-[10px]">Instructions / Persona</label>
                      <textarea
                        value={systemInstructionsInput}
                        onChange={e => setSystemInstructionsInput(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-[10px] text-slate-600 h-24 custom-scrollbar"
                        placeholder="System instructions..."
                      />
                      <button onClick={handleSaveKeys} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg mt-2 shadow-sm">
                        {isKeysSaved ? 'Saved to LocalStorage' : 'Save Keys'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar Collapse Arrow Toggle Button */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`absolute left-[56px] ${isSidebarCollapsed ? 'translate-x-0' : 'translate-x-72'} z-40 bg-slate-900 border border-slate-800 text-slate-300 w-5 h-10 flex items-center justify-center rounded-r-lg hover:text-white transition-all shadow-md top-1/2 -translate-y-1/2`}
          title={isSidebarCollapsed ? "Expand Panel" : "Collapse Panel"}
          id="toggle-sidebar-collapse"
        >
          {isSidebarCollapsed ? "→" : "←"}
        </button>

        {/* MAIN WORKSPACE CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FDFBF7] relative">
          
          <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 shrink-0">
             <div className="flex items-center gap-2">
                <button
                   onClick={() => setActiveTab('chat')}
                   className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                     activeTab === 'chat'
                       ? 'bg-slate-100 text-slate-800 border border-slate-200 shadow-xs'
                       : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                   }`}
                >
                   <Bot className="w-4 h-4 text-indigo-500" /> 
                   <span>Chat Panel</span>
                </button>
                <button
                   onClick={() => setActiveTab('code')}
                   className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                     activeTab === 'code'
                       ? 'bg-slate-100 text-slate-800 border border-slate-200 shadow-xs'
                       : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                   }`}
                >
                   <FileCode className="w-4 h-4 text-indigo-500" /> 
                   <span>Source Code</span>
                </button>
                <button
                   onClick={() => setActiveTab('preview')}
                   className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                     activeTab === 'preview'
                       ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs font-extrabold'
                       : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                   }`}
                >
                   <Sparkles className="w-4 h-4 text-indigo-500" /> 
                   <span>Preview Sandbox</span>
                </button>
             </div>
             <div className="flex items-center gap-4">
                <ModelSelector selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
             </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col bg-white">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                       <Bot className="w-12 h-12 mb-4 text-indigo-300" />
                       <h2 className="text-xl font-bold">Start a conversation</h2>
                    </div>
                  )}
                  {chatMessages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-2xl p-4 rounded-2xl text-sm whitespace-pre-wrap break-words ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                           {msg.content}
                         </div>
                      </div>
                  ))}
                  {isLlmGenerating && (
                    <div className="flex justify-start">
                       <div className="p-4 bg-slate-100/70 border border-slate-200/50 rounded-2xl rounded-tl-none flex items-center gap-1.5 w-24 h-[52px]">
                         <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0 }} className="w-2 h-2 bg-indigo-500 rounded-full" />
                         <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.2 }} className="w-2 h-2 bg-purple-500 rounded-full" />
                         <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.4 }} className="w-2 h-2 bg-indigo-400 rounded-full" />
                       </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                  <form onSubmit={handleSendPromptMessage} className="flex bg-slate-50 border border-slate-200 rounded-2xl p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                      <div className="relative flex-1">
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
                        placeholder="E.g., /question How does this work? or Initialize a new Express server..."
                        className="w-full bg-transparent border-none outline-none resize-none px-4 py-3 text-xs md:text-sm text-slate-800 placeholder-slate-400 max-h-24 scrollbar-thin font-medium"
                      />
                      <AnimatePresence>
                        {promptInput.startsWith('/') && promptInput.length < 5 && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-slate-200 shadow-xl rounded-xl p-2 z-[100]"
                          >
                             <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Commands</div>
                             <button type="button" onClick={() => setPromptInput('/fix ')} className="flex flex-col w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-lg">
                               <span className="text-xs font-bold text-slate-700">/fix</span>
                               <span className="text-[10px] text-slate-500">Fix code or errors</span>
                             </button>
                             <button type="button" onClick={() => setPromptInput('/explain ')} className="flex flex-col w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-lg">
                               <span className="text-xs font-bold text-slate-700">/explain</span>
                               <span className="text-[10px] text-slate-500">Explain how code works</span>
                             </button>
                             <button type="button" onClick={() => setPromptInput('/refactor ')} className="flex flex-col w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-lg">
                               <span className="text-xs font-bold text-slate-700">/refactor</span>
                               <span className="text-[10px] text-slate-500">Clean up and optimize</span>
                             </button>
                             <button type="button" onClick={() => { setPromptInput('/deep-research '); setIsMultiAgent(true); }} className="flex flex-col w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-lg">
                               <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                                 <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> /deep-research
                               </span>
                               <span className="text-[10px] text-slate-500">Deploy recursive research agent loop</span>
                             </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      </div>

                      <div className="flex items-center gap-1.5 pr-1">
                        {isLlmGenerating ? (
                          <button 
                            type="button" 
                            onClick={() => setIsLlmGenerating(false)}
                            className="p-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl transition-all shadow-sm"
                            title="Stop Agent"
                          >
                             <div className="w-3.5 h-3.5 bg-red-500 rounded-sm"></div>
                          </button>
                        ) : (
                          <button 
                            type="submit"
                            disabled={!promptInput.trim()}
                            className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-md transition-all flex items-center justify-center active:scale-95"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
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
                  <div className="flex-1 h-full bg-white overflow-auto relative">
                    <Editor
                      value={editingCode || ''}
                      onValueChange={code => setEditingCode(code || '')}
                      highlight={code => {
                        const safeCode = code || '';
                        const pathStr = String(activeFilePath || 'index.html');
                        let lang = 'javascript';
                        if (pathStr.endsWith('.css')) lang = 'css';
                        else if (pathStr.endsWith('.html') || pathStr.endsWith('.htm')) lang = 'markup';
                        else if (pathStr.endsWith('.json')) lang = 'json';
                        else if (pathStr.endsWith('.ts') || pathStr.endsWith('.tsx')) lang = 'typescript';
                        
                        let grammar = null;
                        try {
                          grammar = Prism.languages[lang] || Prism.languages.js || Prism.languages.javascript || Prism.languages.markup;
                        } catch (err) {}
                        
                        if (!grammar) return safeCode;
                        
                        try {
                          return Prism.highlight(safeCode, grammar, lang);
                        } catch (e) {
                          return safeCode;
                        }
                      }}
                      padding={16}
                      className="min-h-full font-mono text-xs md:text-sm leading-5 text-slate-850 tab-size-[4] select-text selection:bg-slate-200"
                      style={{
                        fontFamily: '"Fira code", "Fira Mono", monospace',
                        fontSize: 12,
                        minHeight: '100%',
                        outline: 'none'
                      }}
                    />
                  </div>
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
                      onClick={() => {
                        appendSystemLog("Forcing iframe render cache reload...");
                        setPreviewKey(k => k + 1);
                      }}
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
                  {!files.some(f => f.path === 'index.html') ? (
                    <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                      {/* Decorative pulsing gradients */}
                      <div className="absolute top-10 left-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
                      <div className="absolute bottom-10 right-10 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                      
                      {/* Animated Core Card */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.92, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: 'spring', duration: 0.6 }}
                        className="max-w-md bg-slate-900/90 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 flex flex-col items-center"
                      >
                        {/* Animated Icon Ring */}
                        <div className="relative mb-6">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                            className="absolute -inset-2.5 bg-gradient-to-r from-rose-500 via-indigo-500 to-cyan-500 rounded-full opacity-30 blur-md"
                          />
                          <div className="w-16 h-16 bg-slate-800/90 border border-slate-700/80 rounded-2xl flex items-center justify-center text-slate-300 relative z-10">
                            <FileCode className="w-8 h-8 text-indigo-400 animate-pulse" />
                          </div>
                        </div>

                        <h2 className="text-xl md:text-2xl font-extrabold text-white mb-3 font-mono tracking-tight flex items-center gap-2">
                          Oops, no files created!
                        </h2>
                        
                        <p className="text-xs md:text-sm text-slate-400 mb-6 leading-relaxed">
                          Can't load the sandbox live preview because <code className="bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs">index.html</code> was not found. Prompt the AI agent inside the Chat tab to start generating code, or initialize standard boilerplate below!
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                          <button
                            onClick={() => {
                              const newFiles = [
                                {
                                  path: 'index.html',
                                  content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Docscraft Sandbox App</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-slate-900 to-indigo-950 text-white min-h-screen flex flex-col items-center justify-center p-6 font-sans">
    <div class="text-center space-y-4 max-w-lg">
        <div class="inline-block bg-indigo-500/15 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold border border-indigo-500/20">
            Sandbox Environment Active ⚡
        </div>
        <h1 class="text-4xl font-extrabold tracking-tight">Your Sandbox App is Live!</h1>
        <p class="text-slate-400 text-sm">Use the Agent Studio Chat tab on the left to write prompts and watch your code update in real-time.</p>
    </div>
</body>
</html>`
                                }
                              ];
                              setFiles(newFiles);
                              localStorage.setItem('dc_repos_files', JSON.stringify(newFiles));
                              setActiveFilePath('index.html');
                              appendSystemLog("Auto-generated default index.html boilerplate to load the sandbox.");
                            }}
                            className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Initialize index.html
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  ) : (
                    <>
                      <iframe 
                        key={previewKey}
                        title="Docscraft Active Sandbox Preview Frame"
                        srcDoc={previewFrameContent}
                        sandbox="allow-scripts allow-popups allow-modals allow-same-origin"
                        referrerPolicy="no-referrer"
                        className="w-full h-full border-none bg-white relative z-10"
                      />
                      
                      {/* Backdrop hint indicating preview compilation status */}
                      <div className="absolute inset-x-0 bottom-4 mx-auto w-fit bg-slate-900/95 text-white p-3 rounded-2xl shadow-xl flex items-center gap-2.5 z-20 text-xs border border-slate-800">
                        <Gamepad2 className="w-4.5 h-4.5 text-indigo-400 animate-bounce" />
                        <span>Interactive Preview active. Interact with your built game above!</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Instructions / Researcher Schema Modal */}
      <AnimatePresence>
        {showInstructionsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
            onClick={() => setShowInstructionsModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[750px]"
            >
              <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-slate-800 p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2.5 font-mono">
                    <Bot className="w-5.5 h-5.5 text-indigo-400" />
                    AI Studio Agent Workspace Configuration
                  </h3>
                  <p className="text-xs text-indigo-300 font-medium mt-1">Configure and synchronize the autonomous E2B resource provisioning engine.</p>
                </div>
                <button 
                  onClick={() => setShowInstructionsModal(false)} 
                  className="text-slate-400 hover:text-white font-bold p-2 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-2 shrink-0 gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setModalActiveTab('prompt')}
                  className={`pb-3 text-xs font-bold transition-all border-b-2 px-3 flex items-center gap-2 ${
                    modalActiveTab === 'prompt'
                      ? 'border-indigo-500 text-indigo-400 font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  📋 System Prompt
                </button>
                <button
                  onClick={() => setModalActiveTab('tools')}
                  className={`pb-3 text-xs font-bold transition-all border-b-2 px-3 flex items-center gap-2 ${
                    modalActiveTab === 'tools'
                      ? 'border-indigo-500 text-indigo-400 font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  🛠️ Functions / Tools
                </button>
                <button
                  onClick={() => setModalActiveTab('settings')}
                  className={`pb-3 text-xs font-bold transition-all border-b-2 px-3 flex items-center gap-2 ${
                    modalActiveTab === 'settings'
                      ? 'border-indigo-500 text-indigo-400 font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  ⚙️ AI Studio Settings
                </button>
                <button
                  onClick={() => setModalActiveTab('skills')}
                  className={`pb-3 text-xs font-bold transition-all border-b-2 px-3 flex items-center gap-2 ${
                    modalActiveTab === 'skills'
                      ? 'border-indigo-500 text-indigo-400 font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  🧠 Local Agent Skills
                </button>
              </div>

              {/* Scrollable Modal Body Content */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-slate-300 custom-scrollbar bg-slate-900/60">
                
                {modalActiveTab === 'prompt' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-mono font-bold text-slate-100 flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-indigo-400" />
                        AI System Instructions & Persona
                      </h4>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(systemInstructionsInput);
                          setCopiedTextType('prompt');
                          setTimeout(() => setCopiedTextType(null), 2000);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] py-1.5 px-3.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 font-sans"
                      >
                        {copiedTextType === 'prompt' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Prompt
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      This bulletproof prompt is optimized for Google AI Studio. Copy and paste it directly into the **System Instructions** panel to configure Gemini as an autonomous provisioning core.
                    </p>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto whitespace-pre-wrap max-h-[340px] custom-scrollbar shadow-inner leading-relaxed">
                      {systemInstructionsInput}
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 pt-2">
                      <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl">
                        <span className="text-xs text-indigo-400 font-extrabold font-mono block mb-1">ZERO BOILERPLATE</span>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Focuses Gemini strictly on structural mutations and codebase building without long text preambles.
                        </p>
                      </div>
                      <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl">
                        <span className="text-xs text-emerald-400 font-extrabold font-mono block mb-1">SELF-HEALING</span>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Instructs the model to handle compilation errors immediately by reading logs and rewriting files.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {modalActiveTab === 'tools' && (
                  <div className="space-y-6">
                    <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
                      <Shield className="w-6 h-6 text-indigo-400 shrink-0" />
                      <div className="text-xs">
                        <span className="font-bold text-slate-100 block font-mono">Native Tool Definitions (Function Calling)</span>
                        <p className="text-slate-400 mt-0.5 leading-normal">To ensure Gemini triggers backend endpoints cleanly, add these JSON schema configurations in the **Tools / Functions** panel of the Google AI Studio interface.</p>
                      </div>
                    </div>

                    {/* Tool 1: provision_project */}
                    <div className="space-y-2 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                      <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded font-mono">TOOL 1</span>
                          <span className="font-bold text-slate-200 font-mono text-xs">provision_project</span>
                        </div>
                        <button
                          onClick={() => handleCopyToClipboard(JSON.stringify({
                            "name": "provision_project",
                            "description": "Spins up a new codebase container and database layer inside the connected user space.",
                            "parameters": {
                              "type": "OBJECT",
                              "properties": {
                                "name": {
                                  "type": "STRING",
                                  "description": "The clean slugified name of the application."
                                },
                                "template": {
                                  "type": "STRING",
                                  "description": "The codebase framework boilerplate. Default is 'vite-react-typescript'."
                                },
                                "auto_provision_backend": {
                                  "type": "BOOLEAN",
                                  "description": "Must be set to true to spin up the data storage layer automatically."
                                }
                              },
                              "required": ["name", "template", "auto_provision_backend"]
                            }
                          }, null, 2), 'tool1')}
                          className="text-indigo-400 hover:text-white text-[10px] font-bold transition-colors flex items-center gap-1 bg-slate-800/40 hover:bg-slate-800 px-2.5 py-1 rounded-lg"
                        >
                          {copiedTextType === 'tool1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedTextType === 'tool1' ? 'Copied' : 'Copy Schema'}
                        </button>
                      </div>
                      <pre className="p-4 text-[10px] text-slate-300 font-mono overflow-x-auto max-h-[160px] custom-scrollbar leading-relaxed">
                        {`{
  "name": "provision_project",
  "description": "Spins up a new codebase container and database layer inside the connected user space.",
  "parameters": {
    "type": "OBJECT",
    "properties": {
      "name": {
        "type": "STRING",
        "description": "The clean slugified name of the application."
      },
      "template": {
        "type": "STRING",
        "description": "The codebase framework boilerplate. Default is 'vite-react-typescript'."
      },
      "auto_provision_backend": {
        "type": "BOOLEAN",
        "description": "Must be set to true to spin up the data storage layer automatically."
      }
    },
    "required": ["name", "template", "auto_provision_backend"]
  }
}`}
                      </pre>
                    </div>

                    {/* Tool 2: mutate_files */}
                    <div className="space-y-2 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                      <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded font-mono">TOOL 2</span>
                          <span className="font-bold text-slate-200 font-mono text-xs">mutate_files</span>
                        </div>
                        <button
                          onClick={() => handleCopyToClipboard(JSON.stringify({
                            "name": "mutate_files",
                            "description": "Writes, updates, or removes files in the application file structure.",
                            "parameters": {
                              "type": "OBJECT",
                              "properties": {
                                "commit_message": {
                                  "type": "STRING",
                                  "description": "A short, descriptive message explaining the changes made to the codebase."
                                },
                                "files": {
                                  "type": "ARRAY",
                                  "items": {
                                    "type": "OBJECT",
                                    "properties": {
                                      "path": {
                                        "type": "STRING",
                                        "description": "The absolute relative path of the file inside the project workspace (e.g., 'src/components/Auth.tsx')."
                                      },
                                      "action": {
                                        "type": "STRING",
                                        "enum": ["WRITE", "UPDATE", "DELETE"],
                                        "description": "The file system operation to perform."
                                      },
                                      "content": {
                                        "type": "STRING",
                                        "description": "The exact source code or configuration contents. Must be valid, uncorrupted strings without truncated data."
                                      }
                                    },
                                    "required": ["path", "action", "content"]
                                  }
                                }
                              },
                              "required": ["commit_message", "files"]
                            }
                          }, null, 2), 'tool2')}
                          className="text-indigo-400 hover:text-white text-[10px] font-bold transition-colors flex items-center gap-1 bg-slate-800/40 hover:bg-slate-800 px-2.5 py-1 rounded-lg"
                        >
                          {copiedTextType === 'tool2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedTextType === 'tool2' ? 'Copied' : 'Copy Schema'}
                        </button>
                      </div>
                      <pre className="p-4 text-[10px] text-slate-300 font-mono overflow-x-auto max-h-[160px] custom-scrollbar leading-relaxed">
                        {`{
  "name": "mutate_files",
  "description": "Writes, updates, or removes files in the application file structure.",
  "parameters": {
    "type": "OBJECT",
    "properties": {
      "commit_message": {
        "type": "STRING",
        "description": "A short, descriptive message explaining the changes made to the codebase."
      },
      "files": {
        "type": "ARRAY",
        "items": {
          "type": "OBJECT",
          "properties": {
            "path": {
              "type": "STRING",
              "description": "The absolute relative path of the file inside the project workspace (e.g., 'src/components/Auth.tsx')."
            },
            "action": {
              "type": "STRING",
              "enum": ["WRITE", "UPDATE", "DELETE"],
              "description": "The file system operation to perform."
            },
            "content": {
              "type": "STRING",
              "description": "The exact source code or configuration contents. Must be valid, uncorrupted strings without truncated data."
            }
          },
          "required": ["path", "action", "content"]
        }
      }
    },
    "required": ["commit_message", "files"]
  }
}`}
                      </pre>
                    </div>
                  </div>
                )}

                {modalActiveTab === 'settings' && (
                  <div className="space-y-4">
                    <h4 className="font-mono font-bold text-slate-100 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-indigo-400" />
                      ⚙️ AI Studio Production Settings Checklist
                    </h4>
                    <p className="text-xs text-slate-400">
                      Configure your Google AI Studio model parameters precisely as defined below for optimal stability during agentic coding and file mutations.
                    </p>

                    <div className="space-y-2 pt-2">
                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
                        <input type="checkbox" defaultChecked className="mt-1 accent-indigo-500 rounded border-slate-800 bg-slate-900" />
                        <div className="text-xs">
                          <span className="font-bold text-slate-200 block font-mono">Model: Gemini 2.5 Flash / 1.5 Pro</span>
                          <span className="text-slate-400">Ensures rapid token processing and large context windows for code exploration.</span>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
                        <input type="checkbox" defaultChecked className="mt-1 accent-indigo-500 rounded border-slate-800 bg-slate-900" />
                        <div className="text-xs">
                          <span className="font-bold text-slate-200 block font-mono">Temperature: 0.0 (Strict Logic Mode)</span>
                          <span className="text-slate-400">Reduces hallucinations and ensures identical code syntax matches across runs.</span>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
                        <input type="checkbox" defaultChecked className="mt-1 accent-indigo-500 rounded border-slate-800 bg-slate-900" />
                        <div className="text-xs">
                          <span className="font-bold text-slate-200 block font-mono">Safety Filter Threshold: Low / Block None</span>
                          <span className="text-slate-400">Avoids safe code logic or file patterns being blocks incorrectly by content policies.</span>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
                        <input type="checkbox" defaultChecked className="mt-1 accent-indigo-500 rounded border-slate-800 bg-slate-900" />
                        <div className="text-xs">
                          <span className="font-bold text-slate-200 block font-mono">Function Calling: Any / Native Auto</span>
                          <span className="text-slate-400">Allows Gemini to trigger our workspace Mutate and Provision tools recursively.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {modalActiveTab === 'skills' && (
                  <div className="space-y-4">
                    <h4 className="font-mono font-bold text-slate-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      🧠 Local Workspace Skill Schemas
                    </h4>
                    <p className="text-xs text-slate-400">
                      Docscraft uses the following default criteria to orchestrate background E2B containers and compile active front-end assets.
                    </p>

                    <div className="space-y-4 pt-2">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-2 text-xs">
                          <Sparkles className="w-4 h-4 text-amber-500"/> Core Working Language & Mode
                        </h4>
                        <p className="text-slate-400 text-xs mb-2"><strong>Language:</strong> The agent must use TypeScript/JavaScript strictly unless requested otherwise. React components should be preferred for UI generation.</p>
                        <p className="text-slate-400 text-xs"><strong>Execution Strategy:</strong> The agent MUST make a structured plan before executing any code. It should present the plan in the chat to the user first.</p>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-2 text-xs">
                          <Search className="w-4 h-4 text-blue-500"/> Researcher Schema
                        </h4>
                        <p className="text-slate-400 text-xs mb-2">When encountering new technologies, APIs, or complex requirements, the agent must enter <strong>Research Mode</strong>.</p>
                        <ul className="list-disc pl-5 space-y-1 text-slate-400 text-[11px]">
                          <li>Query latest documentation and best practices.</li>
                          <li>Avoid hallucinating outdated syntax.</li>
                          <li>Synthesize findings into the pre-execution plan.</li>
                        </ul>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                        <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-2 text-xs">
                          <Code2 className="w-4 h-4 text-emerald-500"/> Code Quality Guidelines
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-slate-400 text-[11px]">
                          <li>Generate functional, zero-mock UI where possible.</li>
                          <li>Rely on Tailwind CSS for inline rapid styling.</li>
                          <li>Follow single-view constraint for basic apps unless expanded by user.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

              </div>
              <div className="p-5 border-t border-slate-800 bg-slate-950 flex justify-between items-center shrink-0">
                <span className="text-[10px] font-mono text-indigo-400/80">Synchronized with E2B Cloud & Gemini-3.1-Pro</span>
                <button 
                  onClick={() => setShowInstructionsModal(false)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-6 rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 active:scale-95"
                >
                  Apply Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* Dynamic Keyboard Shortcuts Quick Help Modal */}
      <AnimatePresence>
        {showShortcutsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowShortcutsModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            >
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                    Docscraft Keyboard Shortcuts
                  </h3>
                  <p className="text-[10px] text-slate-300 font-mono uppercase tracking-wide mt-1">High-productivity workstation keybindings</p>
                </div>
                <button onClick={() => setShowShortcutsModal(false)} className="text-slate-400 hover:text-white font-bold p-2 text-lg">✕</button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between">
                    <span className="text-xs text-slate-500 font-bold">Save active code file</span>
                    <kbd className="w-fit bg-slate-200 text-slate-800 text-[10px] px-2 py-1 rounded font-mono font-bold mt-2 shadow-xs">Ctrl + S</kbd>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between">
                    <span className="text-xs text-slate-500 font-bold">Toggle sidebar collapse</span>
                    <kbd className="w-fit bg-slate-200 text-slate-800 text-[10px] px-2 py-1 rounded font-mono font-bold mt-2 shadow-xs">Ctrl + B</kbd>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between">
                    <span className="text-xs text-slate-500 font-bold">Deploy research agent</span>
                    <kbd className="w-fit bg-slate-200 text-slate-800 text-[10px] px-2 py-1 rounded font-mono font-bold mt-2 shadow-xs">/deep-research</kbd>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between">
                    <span className="text-xs text-slate-500 font-bold">Hard refresh frame</span>
                    <kbd className="w-fit bg-slate-200 text-slate-800 text-[10px] px-2 py-1 rounded font-mono font-bold mt-2 shadow-xs">Alt + 3 (Refresh)</kbd>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between col-span-2">
                    <span className="text-xs text-slate-500 font-bold">Tab Navigation</span>
                    <div className="flex gap-2 mt-2">
                      <kbd className="bg-slate-200 text-slate-800 text-[10px] px-2 py-1 rounded font-mono font-bold shadow-xs">Alt + 1: Chat</kbd>
                      <kbd className="bg-slate-200 text-slate-800 text-[10px] px-2 py-1 rounded font-mono font-bold shadow-xs">Alt + 2: Code</kbd>
                      <kbd className="bg-slate-200 text-slate-800 text-[10px] px-2 py-1 rounded font-mono font-bold shadow-xs">Alt + 3: Live View</kbd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button 
                  onClick={() => setShowShortcutsModal(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-6 rounded-xl text-xs transition-colors shadow-sm"
                >
                  Close Panel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
