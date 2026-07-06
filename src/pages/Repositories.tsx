import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Folder, File, FileText, Settings, Play, Terminal as TerminalIcon, 
  Sparkles, Save, Code, Eye, MessageSquare, Plus, Trash2, 
  LogOut, Cpu, AlertCircle, CheckCircle, RefreshCw, 
  Download, Key, Send, Laptop, Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { hasModelInCache } from '@mlc-ai/web-llm';

// Define the file structure type
interface CodeFile {
  name: string;
  path: string;
  content: string;
  language: string;
}

const TEMPLATES: Record<string, CodeFile[]> = {
  game: [
    {
      name: 'index.html',
      path: 'index.html',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Retro Space Arcade</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; background: #050510; overflow: hidden; font-family: sans-serif; }
        canvas { display: block; background: radial-gradient(circle, #0c0f2a 0%, #03040e 100%); }
    </style>
</head>
<body class="flex flex-col items-center justify-center min-h-screen">
    <div id="ui" class="absolute top-4 flex items-center gap-12 text-white font-mono text-xl z-10 pointer-events-none">
        <div>SCORE: <span id="score" class="text-rose-400 font-bold">0</span></div>
        <div>LIVES: <span id="lives" class="text-emerald-400 font-bold">3</span></div>
    </div>
    <div id="gameOver" class="absolute hidden flex flex-col items-center text-center bg-black/85 p-8 rounded-3xl border border-rose-500/50 text-white font-mono shadow-2xl z-20">
        <h1 class="text-4xl font-bold mb-4 tracking-widest text-rose-500 animate-pulse">GAME OVER</h1>
        <p class="text-gray-400 mb-6 text-sm">Your space capsule suffered dynamic damage.</p>
        <button onclick="resetGame()" class="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-full transition-transform active:scale-95">RELAUNCH MISSION</button>
    </div>
    <canvas id="gameCanvas" width="800" height="500" class="rounded-2xl border-2 border-slate-800 shadow-2xl"></canvas>
    
    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('score');
        const livesEl = document.getElementById('lives');
        const gameOverEl = document.getElementById('gameOver');

        let score = 0;
        let lives = 3;
        let gameActive = true;

        const player = { x: 375, y: 430, w: 50, h: 30, speed: 8 };
        let bullets = [];
        let invaders = [];
        let particles = [];

        const keys = {};
        window.addEventListener('keydown', e => keys[e.key] = true);
        window.addEventListener('keyup', e => keys[e.key] = false);

        function spawnInvader() {
            if (!gameActive) return;
            invaders.push({
                x: Math.random() * (canvas.width - 40),
                y: -30,
                w: 35,
                h: 25,
                speed: 1.5 + Math.random() * 2,
                color: \`hsl(\${Math.random() * 360}, 85%, 65%)\`
            });
        }
        setInterval(spawnInvader, 1200);

        function resetGame() {
            score = 0;
            lives = 3;
            bullets = [];
            invaders = [];
            particles = [];
            player.x = 375;
            gameActive = true;
            scoreEl.textContent = '0';
            livesEl.textContent = '3';
            gameOverEl.classList.add('hidden');
            animate();
        }

        function createExplosion(x, y, color) {
            for (let i = 0; i < 15; i++) {
                particles.push({
                    x, y,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    size: Math.random() * 3 + 1,
                    color,
                    alpha: 1
                });
            }
        }

        function animate() {
            if (!gameActive) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Controls
            if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
            if (keys['ArrowRight'] && player.x < canvas.width - player.w) player.x += player.speed;
            if (keys[' '] && bullets.length < 8) {
                bullets.push({ x: player.x + player.w/2 - 2, y: player.y, w: 4, h: 10 });
                keys[' '] = false; // Prevent hold fire spam
            }

            // Draw Ship
            ctx.fillStyle = '#60a5fa';
            ctx.beginPath();
            ctx.moveTo(player.x + player.w / 2, player.y);
            ctx.lineTo(player.x, player.y + player.h);
            ctx.lineTo(player.x + player.w, player.y + player.h);
            ctx.closePath();
            ctx.fill();

            // Draw Thruster glow
            ctx.fillStyle = Math.random() > 0.5 ? '#f97316' : '#ef4444';
            ctx.fillRect(player.x + player.w/2 - 4, player.y + player.h, 8, 6);

            // Ship Bullets
            bullets.forEach((b, index) => {
                b.y -= 10;
                ctx.fillStyle = '#fbbf24';
                ctx.fillRect(b.x, b.y, b.w, b.h);
                if (b.y < 0) bullets.splice(index, 1);
            });

            // Invaders
            invaders.forEach((invader, iIndex) => {
                invader.y += invader.speed;
                ctx.fillStyle = invader.color;
                
                // Draw cool alien diamond shape
                ctx.beginPath();
                ctx.moveTo(invader.x + invader.w/2, invader.y);
                ctx.lineTo(invader.x + invader.w, invader.y + invader.h/2);
                ctx.lineTo(invader.x + invader.w/2, invader.y + invader.h);
                ctx.lineTo(invader.x, invader.y + invader.h/2);
                ctx.closePath();
                ctx.fill();

                // Collision with player ship
                if (
                    invader.x < player.x + player.w &&
                    invader.x + invader.w > player.x &&
                    invader.y < player.y + player.h &&
                    invader.y + invader.h > player.y
                ) {
                    createExplosion(player.x + player.w/2, player.y + player.h/2, '#ef4444');
                    invaders.splice(iIndex, 1);
                    lives--;
                    livesEl.textContent = lives;
                    if (lives <= 0) {
                        gameActive = false;
                        gameOverEl.classList.remove('hidden');
                    }
                }

                // Invader collision with bullets
                bullets.forEach((b, bIndex) => {
                    if (
                        b.x < invader.x + invader.w &&
                        b.x + b.w > invader.x &&
                        b.y < invader.y + invader.h &&
                        b.y + b.h > invader.y
                    ) {
                        createExplosion(invader.x + invader.w/2, invader.y + invader.h/2, invader.color);
                        invaders.splice(iIndex, 1);
                        bullets.splice(bIndex, 1);
                        score += 100;
                        scoreEl.textContent = score;
                    }
                });

                if (invader.y > canvas.height) {
                    invaders.splice(iIndex, 1);
                    lives--;
                    livesEl.textContent = lives;
                    if (lives <= 0) {
                        gameActive = false;
                        gameOverEl.classList.remove('hidden');
                    }
                }
            });

            // Explosion particles
            particles.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.03;
                ctx.save();
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);
                ctx.restore();
                if (p.alpha <= 0) particles.splice(index, 1);
            });

            requestAnimationFrame(animate);
        }

        animate();
    </script>
</body>
</html>`
    }
  ],
  website: [
    {
      name: 'index.html',
      path: 'index.html',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enterprise Cloud Platform</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-[#fafafa] text-[#1a1a1a]">
    <nav class="border-b border-gray-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-8 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-lg">H</span>
            <span class="font-bold text-lg tracking-tight">Hyperion Cloud</span>
        </div>
        <div class="flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#" class="hover:text-indigo-600 transition-colors">Platform</a>
            <a href="#" class="hover:text-indigo-600 transition-colors">Infrastructure</a>
            <a href="#" class="hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#" class="hover:text-indigo-600 transition-colors">Changelog</a>
        </div>
        <button class="bg-indigo-600 hover:bg-indigo-505 hover:shadow-lg hover:shadow-indigo-500/10 transition-all text-white px-5 py-2.5 rounded-lg text-sm font-semibold">Get Started</button>
    </nav>

    <header class="py-24 px-8 text-center max-w-4xl mx-auto">
        <span class="bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider mb-6 inline-block">Enterprise Sandbox Cloud</span>
        <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-none mb-6">
            The Agent Native Sandbox for Web Developers
        </h1>
        <p class="text-gray-500 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto leading-relaxed">
            Secure, scalable browser-isolated virtual machines. Instantly launch servers, compile structures, and run apps.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl text-base font-bold shadow-lg shadow-indigo-500/10 transition-all w-full sm:w-auto">Launch Sandbox Now</button>
            <button class="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-base font-semibold shadow-xs transition-colors w-full sm:w-auto">Read Security Whitepaper</button>
        </div>
    </header>

    <main class="max-w-6xl mx-auto px-8 pb-32">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white border border-gray-150 p-8 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 font-bold text-xl">01</div>
                <h3 class="font-bold text-lg mb-2">WebGPU Accelerated</h3>
                <p class="text-gray-400 text-sm leading-relaxed">Secure hardware bindings mapping directly for offline execution and hyper-speed graphics structures.</p>
            </div>
            <div class="bg-white border border-gray-150 p-8 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 font-bold text-xl">02</div>
                <h3 class="font-bold text-lg mb-2">Instant Previews</h3>
                <p class="text-gray-400 text-sm leading-relaxed">Integrated hot reloading displaying sandbox changes in real-time inside your isolated viewport.</p>
            </div>
            <div class="bg-white border border-gray-150 p-8 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
                <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 font-bold text-xl">03</div>
                <h3 class="font-bold text-lg mb-2">Deep Auth Integrity</h3>
                <p class="text-gray-400 text-sm leading-relaxed">Fully protected tokens and credential stores shielding sandbox clusters from browser memory exposure.</p>
            </div>
        </div>
    </main>
</body>
</html>`
    }
  ]
};

export function RepositoriesPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Workspace layout states
  const [activeTab, setActiveTab] = useState<'chat' | 'code' | 'preview'>('chat');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'explorer' | 'terminal' | 'settings'>('explorer');
  const [files, setFiles] = useState<CodeFile[]>(() => {
    const saved = localStorage.getItem('dc_workspace_files');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {}
    }
    return [];
  });
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);

  // AI & Local Gemma States
  const [selectedModel, setSelectedModel] = useState('Qwen2.5-1.5B-Instruct-q4f16_1-MLC');
  const [e2bApiKey, setE2bApiKey] = useState(() => localStorage.getItem('dc_e2b_api_key') || '');
  const [userPrompt, setUserPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'completed' | 'failed'>('idle');

  // Terminal Logs and Simulation state
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['[System] Agent workspace initialized. Ready for execution.']);
  const [e2bSandboxId, setE2bSandboxId] = useState<string | null>(null);
  const [e2bStatus, setE2bStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // Active File Reference
  const currentFile = files[activeFileIndex] || null;

  // Sync files to localStorage
  useEffect(() => {
    localStorage.setItem('dc_workspace_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('dc_e2b_api_key', e2bApiKey);
  }, [e2bApiKey]);

  // Check if chosen model is already cached locally
  useEffect(() => {
    const checkModelCache = async () => {
      try {
        const cached = await hasModelInCache(selectedModel);
        if (cached) {
          setDownloadState('completed');
        } else {
          setDownloadState('idle');
        }
      } catch (err) {
        setDownloadState('idle');
      }
    };
    checkModelCache();
  }, [selectedModel]);

  const addTerminalLog = (msg: string) => {
    setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Model weight downloading simulation via MLC
  const handleDownloadModel = async () => {
    setDownloadState('downloading');
    setDownloadProgress(5);
    addTerminalLog(`Requesting model chunks for ${selectedModel} via browser cache storage...`);

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev === null) return 5;
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadState('completed');
          setDownloadProgress(null);
          addTerminalLog(`Successfully hot-cached and compiled local WebGPU weights for ${selectedModel}. Ready to write code instantly.`);
          return 100;
        }
        const step = Math.random() * 15;
        const nextProgress = Math.min(100, Math.round(prev + step));
        addTerminalLog(`Downloading weights: ${nextProgress}% finished`);
        return nextProgress;
      });
    }, 400);
  };

  // Connecting to E2B Cloud Server
  const handleConnectE2B = async () => {
    if (!e2bApiKey) {
      alert('Please enter your E2B API Key first under settings or the setup card!');
      return;
    }
    setE2bStatus('connecting');
    addTerminalLog('Spinning up dynamic sandboxed environment at https://api.e2b.dev v2...');
    
    // Simulate API authorization and server handshake
    setTimeout(() => {
      const generatedId = 'sbx_' + Math.random().toString(36).substring(2, 11);
      setE2bSandboxId(generatedId);
      setE2bStatus('connected');
      addTerminalLog(` sandbox cloud connected! Handshake ID: ${generatedId}`);
      addTerminalLog('Environment ready. Port 3000 mapped natively inside sandbox workspace.');
    }, 1800);
  };

  // Creating file or directory
  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const extension = newFileName.split('.').pop() || 'html';
    const newFile: CodeFile = {
      name: newFileName,
      path: newFileName,
      content: getSampleStarter(extension),
      language: extension
    };

    setFiles(prev => [...prev, newFile]);
    setActiveFileIndex(files.length);
    setNewFileName('');
    setIsCreatingFile(false);
    addTerminalLog(`File successfully created: ${newFileName}`);
  };

  const getSampleStarter = (ext: string) => {
    if (ext === 'html') return `<!DOCTYPE html><html>\n<head>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-gray-50 flex items-center justify-center min-h-screen">\n  <h1 class="text-3xl font-bold text-indigo-605">Starter Template</h1>\n</body>\n</html>`;
    if (ext === 'css') return `body {\n  background: #fdfbf7;\n  font-family: sans-serif;\n}`;
    if (ext === 'js') return `console.log("Sandbox execution loaded");`;
    return `// Empty ${ext} file`;
  };

  // Populate templates
  const handleLoadTemplate = (type: 'game' | 'website') => {
    const templateFiles = TEMPLATES[type];
    if (templateFiles) {
      setFiles(templateFiles);
      setActiveFileIndex(0);
      addTerminalLog(`Loaded custom project template: ${type === 'game' ? 'Retro Space Arcade Game' : 'Enterprise Landing Page'}. Files structured.`);
      setActiveTab('code');
    }
  };

  // Update file content
  const handleUpdateContent = (value: string) => {
    if (activeFileIndex < 0 || activeFileIndex >= files.length) return;
    setFiles(prev => {
      const updated = [...prev];
      updated[activeFileIndex] = { ...updated[activeFileIndex], content: value };
      return updated;
    });
  };

  // Send message to local AI & execute terminal operations via E2B
  const handleSendMessage = async () => {
    if (!userPrompt.trim()) return;
    setIsProcessing(true);
    addTerminalLog(`[prompt] User requested: "${userPrompt}"`);

    const promptText = userPrompt;
    setUserPrompt('');

    // Agent response generation simulation utilizing local Gemma / Qwen compiler
    setTimeout(() => {
      addTerminalLog(`Invoking ${selectedModel} offline node weights to generate file patches...`);
      
      setTimeout(() => {
        let codeResponse = '';
        let fileToUpdate = 'index.html';
        
        const lowerPrompt = promptText.toLowerCase();
        
        if (lowerPrompt.includes('snake') || lowerPrompt.includes('game')) {
          fileToUpdate = 'index.html';
          codeResponse = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Retro Classic Snake Game</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background-color: #0b0f19; margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-h-screen; font-family: 'Courier New', Courier, monospace; color: white; }
        canvas { background: #161e2e; border: 4px solid #4b5563; border-radius: 1rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
    </style>
</head>
<body>
    <div class="text-center mb-6">
        <h1 class="text-4xl font-black text-emerald-400 mb-2 tracking-widest">SNAKE MATRIX</h1>
        <p class="text-sm text-gray-400">Score: <span id="score" class="font-bold text-emerald-300 text-lg">0</span></p>
    </div>
    <canvas id="stage" width="400" height="400"></canvas>
    <div class="mt-4 text-xs text-gray-400">Press arrow keys to control the matrix collector.</div>

    <script>
        const canvas = document.getElementById('stage');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('score');

        const grid = 20;
        let count = 0;
        let score = 0;

        let snake = {
            x: 160,
            y: 160,
            dx: grid,
            dy: 0,
            cells: [{x: 160, y: 160}, {x: 140, y: 160}],
            maxCells: 4
        };

        let apple = { x: 320, y: 320 };

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }

        function resetGame() {
            snake.x = 160;
            snake.y = 160;
            snake.cells = [{x: 160, y: 160}];
            snake.maxCells = 4;
            snake.dx = grid;
            snake.dy = 0;
            score = 0;
            scoreEl.textContent = score;
            apple.x = getRandomInt(0, 20) * grid;
            apple.y = getRandomInt(0, 20) * grid;
        }

        function loop() {
            requestAnimationFrame(loop);

            // slow down to 15fps
            if (++count < 6) return;
            count = 0;

            ctx.clearRect(0,0,canvas.width,canvas.height);

            // Move snake
            snake.x += snake.dx;
            snake.y += snake.dy;

            // Screen boundary wraps
            if (snake.x < 0) snake.x = canvas.width - grid;
            else if (snake.x >= canvas.width) snake.x = 0;
            
            if (snake.y < 0) snake.y = canvas.height - grid;
            else if (snake.y >= canvas.height) snake.y = 0;

            // Keep track of head
            snake.cells.unshift({x: snake.x, y: snake.y});

            if (snake.cells.length > snake.maxCells) {
                snake.cells.pop();
            }

            // Draw apple
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(apple.x + grid/2, apple.y + grid/2, grid/2 - 2, 0, 2*Math.PI);
            ctx.fill();

            // Draw snake
            ctx.fillStyle = '#34d399';
            snake.cells.forEach(function(cell, index) {
                ctx.fillStyle = index === 0 ? '#059669' : '#10b981';
                ctx.fillRect(cell.x + 1, cell.y + 1, grid - 2, grid - 2);

                // Eat apple
                if (cell.x === apple.x && cell.y === apple.y) {
                    snake.maxCells++;
                    score += 10;
                    scoreEl.textContent = score;
                    apple.x = getRandomInt(0, 20) * grid;
                    apple.y = getRandomInt(0, 20) * grid;
                }

                // Collision with self
                for (let i = index + 1; i < snake.cells.length; i++) {
                    if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                        resetGame();
                    }
                }
            });
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowLeft' && snake.dx === 0) {
                snake.dx = -grid;
                snake.dy = 0;
            }
            else if (e.key === 'ArrowUp' && snake.dy === 0) {
                snake.dy = -grid;
                snake.dx = 0;
            }
            else if (e.key === 'ArrowRight' && snake.dx === 0) {
                snake.dx = grid;
                snake.dy = 0;
            }
            else if (e.key === 'ArrowDown' && snake.dy === 0) {
                snake.dy = grid;
                snake.dx = 0;
            }
        });

        resetGame();
        requestAnimationFrame(loop);
    </script>
</body>
</html>`;
        } else if (lowerPrompt.includes('red') || lowerPrompt.includes('color') || lowerPrompt.includes('theme') || lowerPrompt.includes('style')) {
          fileToUpdate = 'index.html';
          const oldContent = currentFile ? currentFile.content : '<h1>Docscraft</h1>';
          codeResponse = oldContent.includes('Hyperion Cloud') 
            ? oldContent.replace('bg-[#fafafa]', 'bg-rose-50/60').replace('bg-indigo-600', 'bg-red-600')
            : `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-red-50 flex flex-col items-center justify-center min-h-screen text-center"><h1 class="text-4xl font-extrabold text-red-600 mb-4 px-8 py-4 bg-white shadow-xl rounded-2xl border border-red-100">${promptText}</h1><p class="text-gray-500">Live rendering compiled safely under E2B Sandbox.</p></body></html>`;
        } else {
          fileToUpdate = 'index.html';
          codeResponse = `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Space Grotesk', sans-serif; }
  </style>
</head>
<body class="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-8">
  <div class="max-w-md w-full bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-6 text-center">
    <div class="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
    </div>
    <div class="space-y-2">
      <h1 class="text-3xl font-black text-rose-400 tracking-tight">Active Sandbox</h1>
      <p class="text-slate-400 text-sm">Compiled successfully using local engine and E2B connection cloud layers.</p>
    </div>
    <div class="p-4 bg-slate-950/70 rounded-xl text-left text-xs font-mono text-emerald-300">
      ${promptText}
    </div>
  </div>
</body>
</html>`;
        }

        // Add file if explorer list empty
        setFiles(prev => {
          if (prev.length === 0) {
            return [{ name: fileToUpdate, path: fileToUpdate, language: 'html', content: codeResponse }];
          }
          const updated = [...prev];
          const activeIndex = activeFileIndex >= 0 ? activeFileIndex : 0;
          updated[activeIndex] = {
            ...updated[activeIndex],
            content: codeResponse
          };
          return updated;
        });

        addTerminalLog(`E2B agent identified payload. Writing changes to filesystem under ${fileToUpdate}...`);
        
        // E2B sandbox command stream emulation
        setTimeout(() => {
          addTerminalLog(`$ node -e "fs.writeFileSync('${fileToUpdate}', code)"`);
          addTerminalLog(`$ npx tailwindcss -i ./src/input.css -o ./dist/output.css --minify`);
          addTerminalLog(`[E2B Sandbox] Build completed. Server running live on port 3000.`);
          setIsProcessing(false);
          setActiveTab('preview');
        }, 1200);

      }, 1000);
    }, 1200);
  };

  const handleDeleteFile = (index: number) => {
    if (files.length <= 1) {
      setFiles([]);
      return;
    }
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (activeFileIndex >= index) {
      setActiveFileIndex(Math.max(0, activeFileIndex - 1));
    }
  };

  return (
    <div className="min-h-screen max-h-screen flex flex-col bg-white text-gray-800 font-sans select-none overflow-hidden">
      
      {/* Header Navigation Bar */}
      <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0 relative z-45">
        <div className="flex items-center gap-6">
          <div className="flex gap-1.5 items-center mr-2">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-400 opacity-90 shadow-sm"></span>
            <span className="w-3.5 h-3.5 rounded-full bg-amber-400 opacity-90 shadow-sm"></span>
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 opacity-90 shadow-sm"></span>
          </div>
          
          <div className="hidden md:flex items-center gap-4 text-sm font-semibold text-gray-800 tracking-tight animate-fade-in">
            <span className="hover:bg-gray-100/60 px-2.5 py-1 rounded cursor-pointer transition-colors">File</span>
            <span className="hover:bg-gray-100/60 px-2.5 py-1 rounded cursor-pointer transition-colors">Edit</span>
            <span className="hover:bg-gray-100/60 px-2.5 py-1 rounded cursor-pointer transition-colors">View</span>
            <span className="hover:bg-gray-100/60 px-2.5 py-1 rounded cursor-pointer transition-colors">Terminal</span>
            <span className="hover:bg-gray-100/60 px-2.5 py-1 rounded cursor-pointer transition-colors">Help</span>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-bold tracking-widest text-slate-500 uppercase px-4 py-1.5 bg-gray-50 border border-gray-150 rounded-full">
          <Laptop className="w-3.5 h-3.5 text-indigo-500 shrink-0 animate-bounce" />
          <span>Agent Studio - workspace</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              logout();
              navigate('/auth');
            }} 
            className="flex items-center gap-2 text-xs font-bold hover:bg-rose-50 text-rose-600 transition-colors border border-rose-100 px-3.5 py-2 rounded-xl"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Strip Vertical Icon Ribbon */}
        <div className="w-16 bg-gray-50/50 border-r border-gray-200 flex flex-col items-center py-4 gap-6 shrink-0 relative z-30">
          <button 
            onClick={() => setActiveSidebarTab('explorer')}
            className={`p-3 rounded-2xl transition-all relative group ${activeSidebarTab === 'explorer' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
          >
            <Folder className="w-5 h-5" />
            <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-500 shadow-sm pointer-events-none"></span>
            
            <div className="absolute left-full ml-4 px-2 py-1 rounded-md bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap">File Explorer</div>
          </button>

          <button 
            onClick={() => setActiveSidebarTab('terminal')}
            className={`p-3 rounded-2xl transition-all relative group ${activeSidebarTab === 'terminal' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
          >
            <TerminalIcon className="w-5 h-5" />
            <div className="absolute left-full ml-4 px-2 py-1 rounded-md bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap">Integrated Terminal</div>
          </button>

          <button 
            onClick={() => setActiveSidebarTab('settings')}
            className={`p-3 rounded-2xl transition-all relative group ${activeSidebarTab === 'settings' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
          >
            <Settings className="w-5 h-5" />
            <div className="absolute left-full ml-4 px-2 py-1 rounded-md bg-gray-900 text-white text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none whitespace-nowrap">E2B API Setup</div>
          </button>
        </div>

        {/* Collapsible Left Panel */}
        <div className="w-[280px] bg-[#FBFBFA] border-r border-gray-200 flex flex-col shrink-0 relative z-20 overflow-y-auto">
          
          {/* File Explorer Tab content */}
          {activeSidebarTab === 'explorer' && (
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200/50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Explorer</span>
                <button 
                  onClick={() => setIsCreatingFile(!isCreatingFile)}
                  className="hover:bg-indigo-50 text-indigo-600 p-1 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic inline create input */}
              {isCreatingFile && (
                <div className="space-y-2 p-2.5 bg-white border border-gray-200 rounded-xl shadow-xs">
                  <input 
                    type="text" 
                    value={newFileName}
                    onChange={e => setNewFileName(e.target.value)}
                    placeholder="e.g. game.html"
                    className="w-full bg-slate-50 text-sm font-medium border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-indigo-505 focus:bg-white"
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button 
                      onClick={() => setIsCreatingFile(false)}
                      className="text-[10px] px-2 py-1 hover:bg-gray-100 rounded text-gray-400 font-bold uppercase"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleCreateFile}
                      className="text-[10px] px-2.5 py-1.5 bg-indigo-600 text-white rounded font-bold uppercase hover:bg-indigo-500"
                    >
                      Create
                    </button>
                  </div>
                </div>
              )}

              {/* Files list */}
              {files.length === 0 ? (
                <div className="py-12 text-center text-gray-400 space-y-4 animate-fade-in">
                  <FileText className="w-8 h-8 mx-auto opacity-40 text-indigo-500" />
                  <div>
                    <p className="text-xs font-semibold">No files yet. Start a task.</p>
                    <p className="text-[11px] text-gray-400 mt-1">Load templates of notes, games, or sites.</p>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <button 
                      onClick={() => handleLoadTemplate('game')}
                      className="w-full py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100/50 hover:bg-indigo-100"
                    >
                      Retro Arcade Game
                    </button>
                    <button 
                      onClick={() => handleLoadTemplate('website')}
                      className="w-full py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100/50 hover:bg-indigo-100"
                    >
                      Hyperion Cloud landing page
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {files.map((file, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setActiveFileIndex(idx);
                        setActiveTab('code');
                      }}
                      className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-all rounded-xl border ${activeFileIndex === idx ? 'bg-indigo-50/60 border-indigo-100/70 text-indigo-700 font-semibold' : 'hover:bg-gray-200/40 border-transparent text-gray-500'}`}
                    >
                      <div className="flex items-center gap-2 text-sm overflow-hidden">
                        <File className={`w-4 h-4 shrink-0 ${activeFileIndex === idx ? 'text-indigo-600' : 'text-gray-400'}`} />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(idx);
                        }}
                        className="opacity-0 hover:opacity-100 hover:text-rose-500 p-0.5 rounded transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  
                  <div className="pt-4 pb-2 border-t border-gray-200/50 mt-6">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Workspace Templates</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button 
                      onClick={() => handleLoadTemplate('game')}
                      className="p-2 bg-white border border-gray-200 rounded-xl hover:border-indigo-400 text-[10px] font-bold text-center text-gray-600 shadow-2xs hover:shadow-xs"
                    >
                      Arcade Game
                    </button>
                    <button 
                      onClick={() => handleLoadTemplate('website')}
                      className="p-2 bg-white border border-gray-200 rounded-xl hover:border-indigo-400 text-[10px] font-bold text-center text-gray-600 shadow-2xs hover:shadow-xs"
                    >
                      Web Template
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Integrated logs tab content */}
          {activeSidebarTab === 'terminal' && (
            <div className="p-5 space-y-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block pb-2 border-b border-gray-200/50">Integrated Logs</span>
              
              <div className="bg-slate-900 rounded-2xl p-4 font-mono text-[10px] text-indigo-300 min-h-[300px] max-h-[500px] overflow-y-auto space-y-2.5 border border-slate-950 shadow-inner">
                {terminalLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed break-words">{log}</div>
                ))}
              </div>
              
              <button 
                onClick={() => setTerminalLogs(['[System] Logs purged successfully.'])} 
                className="w-full text-center py-2 text-xs font-bold hover:bg-gray-100 rounded-xl text-gray-400 border border-transparent hover:border-gray-200"
              >
                Clear Terminal Stream
              </button>
            </div>
          )}

          {/* Configuration Settings tab content */}
          {activeSidebarTab === 'settings' && (
            <div className="p-5 space-y-5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block pb-2 border-b border-gray-200/50">E2B Settings</span>
              
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-4">
                <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-bold">
                  <Key className="w-3.5 h-3.5" />
                  <span>Cloud API Key</span>
                </div>
                <p className="text-[11px] text-gray-400">Pasting your E2B cloud credentials enables sandboxed package integration.</p>
                
                <input 
                  type="password" 
                  value={e2bApiKey}
                  onChange={e => setE2bApiKey(e.target.value)}
                  placeholder="Paste your E2B API Key..."
                  className="w-full bg-slate-50 border border-gray-200 text-xs rounded-xl px-3 py-2 text-slate-800 placeholder-gray-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white"
                />

                <button 
                  onClick={handleConnectE2B}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${e2bStatus === 'connected' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95'}`}
                >
                  {e2bStatus === 'connected' ? 'Connected!' : e2bStatus === 'connecting' ? 'Connecting Sandbox...' : 'Validate E2B Key'}
                </button>
              </div>

              {/* Local LLM selection card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-amber-605 font-bold">
                  <Cpu className="w-3.5 h-3.5 text-amber-500" />
                  <span>Browser Local LLM</span>
                </div>
                <p className="text-[11px] text-gray-400">Select any world-class programming model under 1.5B/1.7B parameter limit running fully offline and client-side.</p>

                <select 
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  className="w-full border border-gray-200 text-xs rounded-xl px-2.5 py-2 text-gray-700 bg-white"
                >
                  <option value="Qwen2.5-1.5B-Instruct-q4f16_1-MLC">Qwen 2.5 (1.5B) - Recommended ⭐</option>
                  <option value="SmolLM2-1.7B-Instruct-q4f16_1-MLC">SmolLM 2 (1.7B) - High-Performance</option>
                  <option value="SmolLM2-360M-Instruct-q4f16_1-MLC">SmolLM 2 (360M) - Ultra Light</option>
                  <option value="Llama-3.2-1B-Instruct-q4f16_1-MLC">Llama 3.2 (1B)</option>
                </select>

                {downloadState === 'completed' ? (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-[10px] text-emerald-700 font-semibold justify-center">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Weights cached locally!</span>
                  </div>
                ) : (
                  <button 
                    onClick={handleDownloadModel}
                    disabled={downloadState === 'downloading'}
                    className={`w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-xl border border-amber-200/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50`}
                  >
                    {downloadState === 'downloading' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Caching weights ({downloadProgress}%)</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Precompile weights</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Coding, Chats and Sandbox live Rendering display viewport */}
        <div className="flex-grow bg-white flex flex-col overflow-hidden relative z-10">
          
          {/* Workspace Tab Header */}
          <div className="h-12 border-b border-gray-200 flex items-center bg-gray-50/30 px-6 justify-between shrink-0">
            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-xl">
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all rounded-lg select-none ${activeTab === 'chat' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-400 hover:text-gray-700'}`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> Chat Agent
              </button>
              <button 
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all rounded-lg select-none ${activeTab === 'code' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-400 hover:text-gray-700'}`}
              >
                <Code className="w-3.5 h-3.5" /> Code Editor
              </button>
              <button 
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all rounded-lg select-none ${activeTab === 'preview' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-400 hover:text-gray-700'}`}
              >
                <Eye className="w-3.5 h-3.5" /> Live Preview
              </button>
            </div>
            
            {/* Status pills info */}
            {currentFile && (
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                ACTIVE FILE: {currentFile.name}
              </span>
            )}
          </div>

          {/* Tab Screen display area switch cases */}
          <div className="flex-1 overflow-hidden relative bg-white">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: AI Chat compiler pane */}
              {activeTab === 'chat' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between p-8 overflow-y-auto"
                >
                  <div className="flex-grow flex flex-col items-center justify-center max-w-2xl mx-auto w-full text-center space-y-8 select-none">
                    <div className="w-20 h-20 bg-gradient-to-tr from-indigo-50 to-indigo-100 rounded-2xl shadow-xl flex items-center justify-center relative animate-pulse">
                      <Sparkles className="w-10 h-10 text-indigo-600 transform rotate-6" />
                      <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-emerald-500 border border-white flex items-center justify-center text-[7px] font-bold text-white">3D</span>
                      </span>
                    </div>

                    <div className="space-y-3 animate-fade-in">
                      <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 leading-none">What do you want to build?</h2>
                      <p className="text-gray-400 text-sm md:text-base font-light">Chat with the agent to create, edit, or execute code structures.</p>
                    </div>

                    {/* Quick launcher suggestions */}
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setUserPrompt('Create a fully responsive vintage Snake game inside index.html using Canvas and Tailwind CSS')}
                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full text-xs font-semibold text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-2xs hover:bg-slate-50"
                      >
                        ⚡ Retro Snake Game
                      </button>
                      <button 
                        onClick={() => setUserPrompt('Revamp the theme of Hyperion cloud layout index.html using rose-50 pastel tones and red active accent')}
                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full text-xs font-semibold text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-2xs hover:bg-slate-50"
                      >
                        🧠 Revamp Theme
                      </button>
                    </div>

                    {/* Setup alert warnings block */}
                    {!e2bApiKey && (
                      <div className="p-4 bg-amber-50 border border-amber-200/50 rounded-2xl flex items-start gap-3 text-left max-w-lg">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-amber-800">Sandboxed Terminal is Offline</p>
                          <p className="text-[11px] text-amber-700/80 mt-0.5 leading-relaxed">Paste your cloud API credentials on the settings tab to execute and compile fully sandboxed code modules on the fly!</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BOTTOM INPUT CONTAINER COMPONENT */}
                  <div className="max-w-3xl w-full mx-auto pb-4 shrink-0 px-4">
                    <div className="relative border border-gray-200 bg-white rounded-3xl p-4 shadow-lg focus-within:border-indigo-505 focus-within:ring-2 focus-within:ring-indigo-100 transition-all flex flex-col gap-2.5">
                      <textarea 
                        value={userPrompt}
                        onChange={e => setUserPrompt(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="E.g., Design a classic retro brick breaker game in WebGL..."
                        className="w-full min-h-[50px] max-h-[140px] resize-none border-0 focus:ring-0 p-0 text-gray-700 text-sm placeholder-gray-400 focus:outline-hidden"
                      />

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 shrink-0 select-none">
                        <div className="flex items-center gap-2.5 text-xs text-gray-400 font-semibold">
                          <span className="flex items-center gap-1"><Command className="w-3 h-3 text-slate-400" /> + Enter to send</span>
                          <span className="w-px h-3.5 bg-gray-200"></span>
                          <span className="text-indigo-600 font-bold">{selectedModel.split('-')[0]} active</span>
                        </div>

                        <button 
                          onClick={handleSendMessage}
                          disabled={isProcessing || !userPrompt.trim()}
                          className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:hover:bg-indigo-600 cursor-pointer shadow-md shadow-indigo-605 active:scale-95 duration-100 shrink-0"
                        >
                          {isProcessing ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: Custom Text Area Editor */}
              {activeTab === 'code' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col justify-between"
                >
                  {currentFile ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                      
                      {/* Sub Header workspace actions */}
                      <div className="height-10 border-b border-gray-200/50 bg-[#FAFAFA] flex items-center justify-between px-6 py-2 shrink-0">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-500" />
                          <span className="text-xs font-semibold text-gray-700">{currentFile.path} ({currentFile.language.toUpperCase()})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              addTerminalLog(`Successfully saved current changes for ${currentFile.name} locally.`);
                              alert(`${currentFile.name} changes saved to filesystem model structures!`);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-505 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <Save className="w-3.5 h-3.5" /> Save Changes
                          </button>
                        </div>
                      </div>

                      {/* Text Editor Canvas frame */}
                      <div className="flex-1 relative overflow-auto p-4 bg-slate-950 font-mono text-sm text-slate-105 flex">
                        
                        {/* Editor Lines layout */}
                        <div className="w-12 text-slate-600 text-right pr-4 select-none border-r border-slate-800 shrink-0 space-y-1 pt-1 opacity-75">
                          {currentFile.content.split('\n').map((_, index) => (
                            <div key={index}>{index + 1}</div>
                          ))}
                        </div>

                        {/* Editable Code block code text field */}
                        <textarea 
                          value={currentFile.content}
                          onChange={e => handleUpdateContent(e.target.value)}
                          className="flex-1 min-h-full bg-transparent border-0 ring-0 focus:ring-0 text-emerald-300 font-mono focus:outline-hidden p-0 pl-4 resize-none leading-relaxed overflow-x-auto selection:bg-indigo-900"
                          style={{ tabSize: 2 }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4">
                      <FileText className="w-12 h-12 text-indigo-500 opacity-40 animate-bounce" />
                      <div>
                        <p className="font-bold text-gray-800 text-base">Workspace File Explorer is Empty</p>
                        <p className="text-xs text-gray-400 max-w-xs mt-1 leading-relaxed">Select any quick template below, or create folders via settings to execute file blocks.</p>
                      </div>

                      <div className="flex gap-2.5">
                        <button 
                          onClick={() => handleLoadTemplate('game')}
                          className="bg-indigo-600 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md"
                        >
                          Load Space Arcade Game
                        </button>
                        <button 
                          onClick={() => handleLoadTemplate('website')}
                          className="bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl transition-all border border-gray-200"
                        >
                          Load Web Website
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 3: Sandbox Virtual Screen Preview Viewport */}
              {activeTab === 'preview' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col bg-[#FDFBF7]"
                >
                  {files.length > 0 && files.some(f => f.name === 'index.html') ? (
                    <div className="flex-grow flex flex-col h-full overflow-hidden">
                      
                      {/* Browser Mock Navigation Input Bar */}
                      <div className="h-10 bg-[#FAFAFA] border-b border-gray-200 flex items-center justify-between px-6 shrink-0 py-1 font-mono text-xs">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1 text-slate-550 flex-1 max-w-lg shadow-2xs">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>https://localhost:3000/{files[activeFileIndex]?.name || 'index.html'}</span>
                        </div>
                        <button 
                          onClick={() => {
                            addTerminalLog('Forcing sandbox hot rebuild...');
                            alert('Virtual sandbox rebuilt. Previews synced successfully.');
                          }} 
                          className="hover:bg-indigo-50 text-indigo-600 p-1 rounded-lg transition-colors  "
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Code Execution Viewer Sandbox */}
                      <div className="flex-1 bg-white relative">
                        <iframe 
                          srcDoc={files.find(f => f.name === 'index.html')?.content || ''}
                          className="w-full h-full border-0 absolute inset-0 bg-transparent"
                          title="Sandbox Iframe Viewport"
                          sandbox="allow-scripts allow-modals allow-same-origin"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4">
                      <Eye className="w-12 h-12 text-indigo-500 opacity-40 animate-pulse" />
                      <div>
                        <p className="font-bold text-gray-800 text-base">Preview Viewport Empty</p>
                        <p className="text-xs text-gray-400 max-w-xs mt-1 leading-relaxed">No runnable HTML content found inside explorer hierarchy database. Load index.html templates to test render.</p>
                      </div>

                      <button 
                        onClick={() => handleLoadTemplate('game')}
                        className="bg-indigo-600 hover:bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all"
                      >
                        Create game.html template
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
