import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react';
import { ArrowLeft, FileArchive, FileText, FileSpreadsheet, Presentation, Sparkles, FolderArchive, ArrowRight, MousePointer2, Code2, Calculator, TerminalSquare, Bot, Search } from 'lucide-react';
import { isSemanticSearchEnabled, setSemanticSearchEnabled } from '../lib/useOramaSearch';

const TOOLS = [
  { id: 'semantic-search', name: 'Semantic Search Engine', description: 'Enable local Orama-based semantic search for typo-tolerant fast document searches in Quick Find.', icon: Search, color: '#3b82f6', gradient: 'from-blue-500 to-indigo-600', shadow: 'hover:shadow-blue-500/20', isTool: true, action: 'toggle-search' },
  { id: 'autonomous-agent', name: 'Autonomous Docs Agent', description: 'Live NLP analysis in a Web Worker (Summaries & Tags).', icon: Bot, color: '#6366f1', gradient: 'from-indigo-500 to-purple-600', shadow: 'hover:shadow-indigo-500/20', isTool: true, route: 'agent' },
  { id: 'code-sandbox', name: 'Live Code Sandbox', description: 'Write and execute real code instantly using Sandpack.', icon: TerminalSquare, color: '#10b981', gradient: 'from-emerald-500 to-teal-600', shadow: 'hover:shadow-emerald-500/20', isTool: true, route: 'code' },
  { id: 'math-sandbox', name: 'Math & Logic Sandbox', description: 'Write KaTeX equations and visualize them in a 3D environment.', icon: Calculator, color: '#8b5cf6', gradient: 'from-purple-500 to-indigo-600', shadow: 'hover:shadow-purple-500/20', isTool: true, route: 'math' },
  { id: 'mermaid-diagram', name: 'Mermaid Diagrams', description: 'Quickly text-to-flowchart renderer for drawing software architecture and logic trees.', icon: Code2, color: '#ec4899', gradient: 'from-pink-400 to-rose-500', shadow: 'hover:shadow-pink-500/20', isTool: true, route: 'mermaid' },
];

function ToolCard({ tool, onClick }: { tool: typeof TOOLS[0], onClick: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const rotateX = useMotionTemplate`${smoothMouseY.get() * -0.05}deg`;
  const rotateY = useMotionTemplate`${smoothMouseX.get() * 0.05}deg`;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ transformStyle: 'preserve-3d', rotateX, rotateY }}
      whileHover={{ scale: 1.02 }}
      className={`relative group bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-100/50 cursor-pointer overflow-hidden transition-all duration-300 ${tool.shadow}`}
    >
      {/* Dynamic Hover Background */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at center, ${tool.color} 0%, transparent 70%)`,
        }}
      />
      
      {/* Icon */}
      <div 
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-gradient-to-br ${tool.gradient} text-white shadow-lg transform group-hover:-translate-y-2 group-hover:shadow-xl transition-all duration-300`}
        style={{ transform: 'translateZ(50px)' }}
      >
        <tool.icon className="w-8 h-8" />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-colors">
        {tool.name}
      </h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-8">
        {tool.description}
      </p>
      
      <div className="flex items-center text-sm font-bold text-gray-900 mt-auto group-hover:tracking-wide transition-all uppercase">
        <span className={`bg-clip-text text-transparent bg-gradient-to-r ${tool.gradient}`}>Launch Tool</span>
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ArrowRight className="w-5 h-5 ml-2 text-gray-900 group-hover:translate-x-1 transition-transform" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export function SummarizePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-white text-gray-900 font-sans relative overflow-hidden">
      {/* Animated SVG / CSS Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Subtle SVG Grid */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.5 }}></div>
      </div>

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-20 px-6 py-5 flex items-center justify-between backdrop-blur-md bg-white/70 border-b border-gray-100"
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/doc/${id}`)}
            className="flex items-center justify-center p-2.5 rounded-full hover:bg-gray-100/80 transition-colors text-gray-600 hover:text-gray-900 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 flex items-center gap-2 tracking-tight">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Productivity Hub
          </h1>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="text-center mb-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-sm mb-8 border border-indigo-100">
              <MousePointer2 className="w-4 h-4" />
              Hover to interact
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 drop-shadow-sm">
              Supercharge your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">workflow</span>
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto font-medium">
              A carefully crafted collection of high-performance tools and plugins to transform your documents, spreadsheets, and presentations.
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {TOOLS.map((tool, index) => (
            <motion.div
              key={tool.id}
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
              }}
            >
              <ToolCard 
                tool={tool} 
                onClick={() => {
                  if (tool.id === 'semantic-search') {
                    const current = isSemanticSearchEnabled();
                    setSemanticSearchEnabled(!current);
                    alert(`Semantic Search Engine is now ${!current ? 'ENABLED' : 'DISABLED'}. Check "Quick Find" in the sidebar!`);
                  } else if (tool.id === 'mermaid-diagram') {
                    navigate(`/doc/${id}/tools/mermaid`);
                  } else if (tool.id === 'math-sandbox') {
                    navigate(`/doc/${id}/tools/math`);
                  } else if (tool.id === 'code-sandbox') {
                    navigate(`/doc/${id}/tools/code`);
                  } else if (tool.id === 'autonomous-agent') {
                    navigate(`/doc/${id}/tools/agent`);
                  } else if (tool.route) {
                    navigate(tool.route);
                  } else {
                    alert("Tool currently under construction.");
                  }
                }} 
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

