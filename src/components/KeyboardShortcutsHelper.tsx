import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Keyboard, Sparkles, Command, Save, Plus, HelpCircle, HardDrive, Layout, Maximize, ChevronDown, ChevronUp } from 'lucide-react';
import Draggable from 'react-draggable';

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'Global' | 'Editing' | 'Formatting' | 'AI Assistant' | 'Sovereign Exports';
}

const EXTENSIVE_SHORTCUTS: ShortcutItem[] = [
  // Global Navigation
  { keys: ['Cmd', '/'], description: 'Toggle Keyboard Shortcuts Info Drawer', category: 'Global' },
  { keys: ['Cmd', 'H'], description: 'Fly Back to Workspace Landing Page (Short Key)', category: 'Global' },
  { keys: ['Cmd', 'D'], description: 'Go directly to Workspace Dashboard (Short Key)', category: 'Global' },
  { keys: ['Cmd', 'Shift', 'N'], description: 'Initialize Document Draft & Workspace (Long Key)', category: 'Global' },
  { keys: ['Cmd', 'Shift', 'F'], description: 'Toggle Fullscreen Workspace view (Long Key)', category: 'Global' },
  { keys: ['Cmd', 'S'], description: 'Commit Progress / Save to Sovereign Crypt Vault', category: 'Global' },
  { keys: ['Esc'], description: 'Dismiss Modal / Close Current dialog', category: 'Global' },

  // Document Editing
  { keys: ['Cmd', 'Z'], description: 'Undo Last Writing Keystroke', category: 'Editing' },
  { keys: ['Cmd', 'Shift', 'Z'], description: 'Redo Truncated Text Progression', category: 'Editing' },
  { keys: ['Cmd', 'X'], description: 'Cut Selected Block into Cache Clipboard', category: 'Editing' },
  { keys: ['Cmd', 'C'], description: 'Copy Selection to Clipboard', category: 'Editing' },
  { keys: ['Cmd', 'V'], description: 'Paste Structured Text or Diagrams', category: 'Editing' },
  { keys: ['Delete'], description: 'Wipe Current Active Document', category: 'Editing' },

  // Typography Formatting
  { keys: ['Cmd', 'B'], description: 'Apply Bold Display Weight', category: 'Formatting' },
  { keys: ['Cmd', 'I'], description: 'Apply Elegant Italic Style Font', category: 'Formatting' },
  { keys: ['Cmd', 'U'], description: 'Apply Stylus Underline Trace', category: 'Formatting' },
  { keys: ['Cmd', 'Shift', 'H'], description: 'Apply Gold Highlighter Highlight Accent', category: 'Formatting' },
  { keys: ['Cmd', '1'], description: 'Format Current Line as Heading 1 (Large Serif)', category: 'Formatting' },
  { keys: ['Cmd', '2'], description: 'Format Current Line as Heading 2 (Medium Serif)', category: 'Formatting' },

  // AI Assistant commands
  { keys: ['Cmd', 'J'], description: 'Initiate Smart AI Autocomplete Autopilot', category: 'AI Assistant' },
  { keys: ['Cmd', 'K'], description: 'Toggle Chatbot Companion Sidebar & Assistant', category: 'AI Assistant' },

  // Sovereign Exports
  { keys: ['Cmd', 'P'], description: 'Print Native Document Layout with borders', category: 'Sovereign Exports' },
  { keys: ['Cmd', 'Shift', 'E'], description: 'Export Document as high-fidelity standard PDF', category: 'Sovereign Exports' },
];

export function KeyboardShortcutsHelper() {
  const navigate = useNavigate();
  const nodeRef = React.useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Global' | 'Editing' | 'Formatting' | 'AI Assistant' | 'Sovereign Exports'>('All');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;

      // Escape key closes modal
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      // Check for Cmd + / -> Toggle Modal
      if (isCmd && e.key === '/') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        return;
      }

      // Check for Cmd + S -> Trigger Save Notification
      if (isCmd && !isShift && e.key.toLowerCase() === 's') {
        e.preventDefault();
        showToast("✓ PROGRESS SECURED: Document draft state successfully saved to cloud vault!");
        return;
      }

      // Check for Cmd + D -> Dashboard (Short Key)
      if (isCmd && !isShift && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        showToast("📂 Loading Workspace Dashboard...");
        setTimeout(() => {
          navigate('/dashboard');
        }, 300);
        return;
      }

      // Check for Cmd + H -> Go Home (Short Key)
      if (isCmd && !isShift && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        showToast("🏠 Returning to Landing Home...");
        setTimeout(() => {
          navigate('/');
        }, 300);
        return;
      }

      // Check for Cmd + Shift + N -> Dashboard / New Document (Long Key)
      if (isCmd && isShift && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        showToast("⚡ Canvas Initializing: Redirecting you to the workspace creator...");
        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
        return;
      }

      // Check for Cmd + Shift + F -> Fullscreen toggle (Long Key)
      if (isCmd && isShift && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen()
            .then(() => showToast("💻 WORKSPACE FULLSCREEN ACTIVATED"))
            .catch(() => {});
        } else {
          document.exitFullscreen();
          showToast("💻 Workspace Fullscreen Deactivated");
        }
        return;
      }

      // Check for Cmd + K -> Toggle Companion Sidebar (Short Key)
      if (isCmd && !isShift && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        showToast("🤖 Activating Chatbot Companion Companion...");
        // Dispatch event for other components to dynamically open if they have sidebar
        window.dispatchEvent(new CustomEvent('toggle-chatbot-companion'));
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const filteredShortcuts = EXTENSIVE_SHORTCUTS.filter(s => {
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesSearch = s.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.keys.join(' ').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Floating Retro Tactile Action Button (Bottom Right) */}
      {!isMinimized ? (
        <motion.div 
          drag
          dragMomentum={false}
          dragElastic={0.05}
          className="fixed bottom-6 right-6 z-[99] print:hidden cursor-move flex items-center gap-2" 
          title="Drag me! Keyboard Shortcuts & Commands (Cmd + /)"
        >
          <button 
            onClick={() => setIsMinimized(true)}
            className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-500 rounded-full hover:bg-gray-300 transition-colors shadow-md cursor-pointer"
            title="Hide shortcuts"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-[#FCFAF6] border-2 border-[#D4AF37] hover:border-[#b08d2c] hover:bg-[#FAF6EE] text-amber-900 font-sans font-bold text-xs uppercase tracking-widest rounded-full shadow-lg transition-all transform hover:scale-105 select-none focus:outline-none cursor-pointer"
          >
            <Keyboard className="w-4 h-4 text-[#D4AF37] animate-pulse" />
            <span>Shortcuts</span>
            <span className="bg-stone-200 text-stone-700 font-mono text-[9px] px-1.5 py-0.5 rounded border border-stone-300">⌘ /</span>
          </button>
        </motion.div>
      ) : (
        <motion.button
          drag
          dragMomentum={false}
          dragElastic={0.05}
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-6 right-6 z-[99] w-8 h-8 flex items-center justify-center bg-stone-800 text-white rounded-full shadow-lg hover:bg-stone-700 transition-all opacity-70 hover:opacity-100 print:hidden cursor-move"
          title="Drag me! Show shortcuts"
        >
          <Keyboard className="w-4 h-4" />
        </motion.button>
      )}

      {/* Global Success Save / Notify Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 30, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -30, x: '-50%' }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-gradient-to-r from-neutral-900 to-stone-900 border-2 border-[#D4AF37] text-amber-100 font-serif font-bold text-xs sm:text-sm px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 w-[90%] max-w-lg"
          >
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Overlay Drawer dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.3 }}
              className="bg-[#FCFAF7] border-2 border-[#E3D1B4] rounded-[2.5rem] p-6 md:p-8 max-w-2xl w-full shadow-[0_30px_60px_rgba(0,0,0,0.25)] relative text-stone-900 font-sans flex flex-col max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Box */}
              <div className="flex justify-between items-center border-b border-[#EAD09D]/50 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                    <Keyboard className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-2xl">Docscraft Core Commands</h3>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-amber-700 font-extrabold">Instant Keyboard Command references</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors text-stone-400 hover:text-stone-700 outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filtering Controls & Command search bar */}
              <div className="space-y-4 mb-6 shrink-0">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search shortcuts (e.g. bold, save, AI)..."
                    className="w-full bg-white border border-[#E3CDAA] outline-none rounded-2xl pl-10 pr-4 py-3 text-xs focus:border-[#b08d2c] focus:ring-1 focus:ring-[#b08d2c] text-stone-800 font-medium transition-all shadow-inner"
                  />
                </div>

                {/* Categories filtering tab bar */}
                <div className="flex flex-wrap gap-1.5 border-b border-stone-200/50 pb-2">
                  {(['All', 'Global', 'Editing', 'Formatting', 'AI Assistant', 'Sovereign Exports'] as const).map((cat) => {
                    const isSel = selectedCategory === cat;
                    return (
                      <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all focus:outline-none ${
                          isSel 
                            ? 'bg-[#b08d2c] text-white shadow-sm' 
                            : 'bg-white border border-[#E3CDAA]/50 hover:bg-stone-50 text-stone-600'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrolling Shortcuts Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                <AnimatePresence mode="popLayout">
                  {filteredShortcuts.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-8 text-center text-stone-400 border border-dashed border-[#E3CDAA] rounded-2xl text-xs py-12 font-serif"
                    >
                      No shortcut keys matching your search filter found. Search another workspace rule!
                    </motion.div>
                  ) : (
                    filteredShortcuts.map((item, idx) => (
                      <motion.div 
                        key={item.description}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, delay: Math.min(idx * 0.02, 0.2) }}
                        className="bg-white border border-[#EBE1CD] hover:border-amber-400 hover:shadow-xs p-3.5 rounded-2xl flex items-center justify-between gap-4 transition-all"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className="text-[9px] font-mono font-bold bg-amber-50 px-2 py-0.5 border border-amber-100 rounded text-amber-700 shrink-0">
                            {item.category}
                          </span>
                          <span className="text-xs text-stone-850 font-serif font-bold text-stone-800 truncate">
                            {item.description}
                          </span>
                        </div>

                        {/* Traditional styled keyboard keys display */}
                        <div className="flex items-center gap-1 shrink-0">
                          {item.keys.map((k, kIdx) => (
                            <React.Fragment key={kIdx}>
                              {kIdx > 0 && <span className="text-stone-300 text-[10px] px-0.5">+</span>}
                              <kbd className="bg-stone-100 border-b-2 border-stone-300 border-x border-t border-stone-200 text-stone-700 font-mono font-bold text-[10px] md:text-xs rounded px-2 py-1 shadow-sm uppercase select-none min-w-[24px] text-center">
                                {k === 'Cmd' ? '⌘' : k === 'Option' ? '⌥' : k === 'Shift' ? '⇧' : k}
                              </kbd>
                            </React.Fragment>
                          ))}
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Centered Instructions Footer */}
              <div className="mt-6 border-t border-[#EAD09D]/50 pt-4 text-center text-[10px] text-stone-400 font-mono flex justify-between items-center shrink-0">
                <span>Hold down command combinations inside document writing canvas</span>
                <span className="font-bold text-amber-700">June 2026 Sovereign Build</span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
