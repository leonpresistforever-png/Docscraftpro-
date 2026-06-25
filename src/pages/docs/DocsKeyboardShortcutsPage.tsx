import React, { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { DocsSidebar } from '../../components/docs/DocsSidebar';
import { Search, Keyboard, Copy, Check, Terminal, Sparkles, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DocShortcut {
  name: string;
  macKeys: string[];
  winKeys: string[];
  description: string;
  category: 'Workspace' | 'Document Editing' | 'Typography Formatting' | 'AI & System Agents' | 'Exports & Sync';
}

const ALL_DOCS_SHORTCUTS: DocShortcut[] = [
  // Workspace Navigation
  { name: 'Toggle Quick Help Drawer', macKeys: ['Cmd', '/'], winKeys: ['Ctrl', '/'], description: 'Toggles the global interactive command key center dynamic pop-up.', category: 'Workspace' },
  { name: 'Spawn New Document Canvas', macKeys: ['Cmd', 'Option', 'N'], winKeys: ['Ctrl', 'Alt', 'N'], description: 'Immediately routes to dashboard and prompts a fresh template draft.', category: 'Workspace' },
  { name: 'Quick Save Document', macKeys: ['Cmd', 'S'], winKeys: ['Ctrl', 'S'], description: 'Trigger dynamic background saving state sequence to cloud vault.', category: 'Workspace' },
  { name: 'Toggle Sovereign Fullscreen', macKeys: ['Cmd', 'Option', 'F'], winKeys: ['Ctrl', 'Alt', 'F'], description: 'Grows client viewport into full screen mode to omit all distraction noises.', category: 'Workspace' },
  { name: 'Return to Landing Hub', macKeys: ['Cmd', 'Option', 'H'], winKeys: ['Ctrl', 'Alt', 'H'], description: 'Closes working document state and returns safely to main public presentation.', category: 'Workspace' },
  
  // Document Navigation
  { name: 'Search workspace files', macKeys: ['Cmd', 'F'], winKeys: ['Ctrl', 'F'], description: 'Brings focus to global dashboard Search documents bar.', category: 'Workspace' },
  { name: 'Undo previous key inputs', macKeys: ['Cmd', 'Z'], winKeys: ['Ctrl', 'Z'], description: 'Rolls back last typed character block or node format change.', category: 'Document Editing' },
  { name: 'Redo previously reverted keystroke', macKeys: ['Cmd', 'Shift', 'Z'], winKeys: ['Ctrl', 'Shift', 'Z'], description: 'Re-applies text block states backward from the undo history queue.', category: 'Document Editing' },
  { name: 'Wipe current active selection', macKeys: ['Delete'], winKeys: ['Delete'], description: 'Trash the active text selection or current block container.', category: 'Document Editing' },
  
  // Block Editing
  { name: 'Copy Current Block', macKeys: ['Cmd', 'C'], winKeys: ['Ctrl', 'C'], description: 'Copies content text of selected node segment.', category: 'Document Editing' },
  { name: 'Cut Current Block', macKeys: ['Cmd', 'X'], winKeys: ['Ctrl', 'X'], description: 'Deletes selected block segment while packing it into memory clipboard.', category: 'Document Editing' },
  { name: 'Paste Captured Blocks', macKeys: ['Cmd', 'V'], winKeys: ['Ctrl', 'V'], description: 'Spits clipboard content back onto active cursor coordinate.', category: 'Document Editing' },
  { name: 'Copy Deeplink to Page', macKeys: ['Cmd', 'Option', 'L'], winKeys: ['Ctrl', 'Alt', 'L'], description: 'Copies unique web routing URL path to target workspace.', category: 'Document Editing' },
  
  // Formatting
  { name: 'Format Weight: Bold', macKeys: ['Cmd', 'B'], winKeys: ['Ctrl', 'B'], description: 'Toggles bold highlight styling over selected text block.', category: 'Typography Formatting' },
  { name: 'Format Style: Italic', macKeys: ['Cmd', 'I'], winKeys: ['Ctrl', 'I'], description: 'Toggles italicized visual accenting typeface.', category: 'Typography Formatting' },
  { name: 'Format Decoration: Underline', macKeys: ['Cmd', 'U'], winKeys: ['Ctrl', 'U'], description: 'Applies continuous trace stroke directly underneath selected line.', category: 'Typography Formatting' },
  { name: 'Golden Highlighter Accent', macKeys: ['Cmd', 'Shift', 'H'], winKeys: ['Ctrl', 'Shift', 'H'], description: 'Draws custom high-contrast gold highlight background overlay.', category: 'Typography Formatting' },
  { name: 'Apply Header Level 1', macKeys: ['Cmd', '1'], winKeys: ['Ctrl', '1'], description: 'Formats current cursor line as giant Display Serif header.', category: 'Typography Formatting' },
  { name: 'Apply Header Level 2', macKeys: ['Cmd', '2'], winKeys: ['Ctrl', '2'], description: 'Formats current cursor line as secondary sub-header.', category: 'Typography Formatting' },
  { name: 'Inject Mono Code-Frame', macKeys: ['Cmd', 'Option', '6'], winKeys: ['Ctrl', 'Alt', '6'], description: 'Enwraps matching characters with clean, monospace font block styling.', category: 'Typography Formatting' },

  // AI & Agents
  { name: 'Initiate Autonomous AI Query', macKeys: ['Cmd', 'J'], winKeys: ['Ctrl', 'J'], description: 'Toggles interactive Gemini workspace floating controller overlay.', category: 'AI & System Agents' },
  { name: 'Trigger Agent Audit Command', macKeys: ['Cmd', 'Option', 'A'], winKeys: ['Ctrl', 'Alt', 'A'], description: 'Commands autonomous client agents to draft security and content reviews.', category: 'AI & System Agents' },
  { name: 'Console Log Telemetry Sync', macKeys: ['Cmd', 'Option', 'G'], winKeys: ['Ctrl', 'Alt', 'G'], description: 'Inspects developer database latency parameters in console log.', category: 'AI & System Agents' },
  { name: 'Toggle Companion Sidebar', macKeys: ['Cmd', 'K'], winKeys: ['Ctrl', 'K'], description: 'Opens or collapses the right side real-time companion chat drawer.', category: 'AI & System Agents' },

  // Exports & Print
  { name: 'Print layout template', macKeys: ['Cmd', 'P'], winKeys: ['Ctrl', 'P'], description: 'Launches browser print system formatting for neat, bordered PDF layouts.', category: 'Exports & Sync' },
  { name: 'Export to Google Sheets', macKeys: ['Cmd', 'Option', 'X'], winKeys: ['Ctrl', 'Alt', 'X'], description: 'Uploads table blocks directly into associated workspace cell ranges.', category: 'Exports & Sync' },
  { name: 'Generate standard PDF report', macKeys: ['Cmd', 'Option', 'E'], winKeys: ['Ctrl', 'Alt', 'E'], description: 'Calls local processor to bundle workspace blocks into PDF pages.', category: 'Exports & Sync' },
];

export function DocsKeyboardShortcutsPage() {
  const [system, setSystem] = useState<'mac' | 'win'>('mac');
  const [search, setSearch] = useState('');
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const handleCopyCommand = (shortcut: DocShortcut) => {
    const keysStr = (system === 'mac' ? shortcut.macKeys : shortcut.winKeys).join(' + ');
    const textToCopy = `${shortcut.name} Shortcut: (${keysStr}) -> ${shortcut.description}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedName(shortcut.name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  const filteredShortcuts = ALL_DOCS_SHORTCUTS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.description.toLowerCase().includes(search.toLowerCase()) ||
                          item.category.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-sans text-gray-900 selection:bg-amber-600 selection:text-white">
      <Navbar />
      <div className="flex flex-1 pt-20">
        <div className="hidden lg:block border-r border-gray-200 bg-white">
          <DocsSidebar />
        </div>
        
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-4xl mx-auto px-6 py-12 lg:px-12 lg:py-16">
            
            {/* Header Title Box */}
            <div className="border-b border-gray-200 pb-8 mb-8">
              <span className="text-xs font-black uppercase tracking-widest text-[#b08d2c] font-mono block mb-2">Docscraft Keyboard Bible</span>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4 font-sans text-stone-900">Workspace Commands</h1>
              <p className="text-gray-500 text-sm md:text-base leading-relaxed font-serif max-w-2xl">
                Operate at terminal efficiency. Every feature, editing node, Gemini toolset, block manipulation, and sandbox export can be summoned instantaneously using standard keyboard combinations.
              </p>
            </div>

            {/* Quick Live Interactive Instruction Banner */}
            <div className="mb-8 p-4 bg-amber-50/80 border border-[#E3CDAA] rounded-2xl flex gap-3 h-auto items-center text-xs text-amber-900 font-medium">
              <Info className="w-5 h-5 text-[#b08d2c] shrink-0" />
              <span>
                <strong>PROTIP:</strong> Press <kbd className="bg-white border px-1.5 py-0.5 rounded shadow-sm font-mono text-[10px]">⌘ /</kbd> anywhere inside our application ecosystem to toggle the dynamic shortcuts console helper.
              </span>
            </div>

            {/* System selector and real time Search input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-8 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
              
              {/* Toggle platform view */}
              <div className="flex gap-2 p-1 bg-gray-150/60 rounded-xl max-w-xs shrink-0 select-none">
                <button 
                  onClick={() => setSystem('mac')}
                  className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all focus:outline-none ${system === 'mac' ? 'bg-[#b08d2c] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
                >
                  macOS Keys
                </button>
                <button 
                  onClick={() => setSystem('win')}
                  className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all focus:outline-none ${system === 'win' ? 'bg-[#b08d2c] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'}`}
                >
                  Windows / Linux
                </button>
              </div>

              {/* Live search feedback */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filter keys (e.g. bold, save, AI)..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 outline-none rounded-xl text-xs focus:border-[#b08d2c] focus:ring-1 focus:ring-[#b08d2c] transition-all font-medium text-stone-850"
                />
              </div>

            </div>

            {/* Groups Matrix list */}
            <div className="space-y-10">
              {(['Workspace', 'Document Editing', 'Typography Formatting', 'AI & System Agents', 'Exports & Sync'] as const).map(group => {
                const groupItems = filteredShortcuts.filter(item => item.category === group);
                if (groupItems.length === 0) return null;

                return (
                  <div key={group} className="space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#aa7a00] border-b border-gray-200/50 pb-2 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-[#b08d2c]" />
                      <span>{group} Commands</span>
                    </h2>

                    <div className="grid grid-cols-1 gap-3">
                      {groupItems.map((item) => {
                        const activeKeys = system === 'mac' ? item.macKeys : item.winKeys;
                        const isCopied = copiedName === item.name;

                        return (
                          <div 
                            key={item.name}
                            className="bg-white border border-gray-200/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#E3CDAA] hover:shadow-xs transition-all relative group"
                          >
                            <div className="space-y-1 max-w-md">
                              <h3 className="text-sm font-bold text-stone-900">{item.name}</h3>
                              <p className="text-gray-500 text-xs font-serif leading-relaxed">{item.description}</p>
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                              
                              {/* Keycaps Visual blocks */}
                              <div className="flex gap-1 items-center">
                                {activeKeys.map((k, kIdx) => (
                                  <React.Fragment key={kIdx}>
                                    {kIdx > 0 && <span className="text-stone-300 text-xs px-0.5 font-bold">+</span>}
                                    <kbd className="bg-stone-50 border-b-2 border-stone-200 border border-stone-150 text-stone-700 font-mono font-bold text-xs rounded-lg px-2.5 py-1 shadow-xs uppercase select-none min-w-[28px] text-center">
                                      {k === 'Cmd' ? '⌘' : k === 'Option' ? '⌥' : k === 'Shift' ? '⇧' : k}
                                    </kbd>
                                  </React.Fragment>
                                ))}
                              </div>

                              {/* Copy button action frame */}
                              <button 
                                onClick={() => handleCopyCommand(item)}
                                className="p-2 bg-stone-50 group-hover:bg-amber-50 hover:bg-amber-100 text-stone-400 hover:text-amber-700 rounded-xl border border-stone-200/50 transition-colors"
                                title="Copy shortcut information to clipboard"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>

                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredShortcuts.length === 0 && (
                <div className="p-12 text-center text-gray-400 bg-white border border-dashed border-gray-200 rounded-3xl font-serif text-sm">
                  No shortcut definitions matched your filtration constraints. Search another phrase!
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
