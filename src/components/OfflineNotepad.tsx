import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Plus, Trash2, Copy, FileText, Download, ChevronRight, 
  Check, FilePlus2, RefreshCw, Bookmark, ArrowRightLeft, BookOpen 
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

interface OfflineNotepadProps {
  isOpen: boolean;
  onClose: () => void;
  editor: any; // TipTap editor instance
}

const DEFAULT_NOTES: Note[] = [
  {
    id: "welcome-doccraft-note",
    title: "💡 Reference Pad & Checklist",
    content: `Welcome to your completely offline Scratchpad!\n\nThis scratchpad is stored safely on this device (in localStorage). Anything you write will be cached here for your reference while you compose your main document in the editor.\n\n🔥 FEATURES:\n1. 📂 Multi-note Organizer: Create separate outline drafts or scratchpads using the "+ New" button above.\n2. 📝 Insert at Cursor: Select a note and click "Insert in Document" at the bottom to inject this note's content directly into the rich text editor.\n3. ✂️ Grab Selection: Highlight any paragraph in your main document, and click "Grab Selection" to append that text straight into this scratch note!`,
    updatedAt: Date.now()
  }
];

export function OfflineNotepad({ isOpen, onClose, editor }: OfflineNotepadProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedTextNotice, setCopiedTextNotice] = useState<string>("");

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('doccraft_offline_notepad_notes');
      if (stored) {
        const parsed = JSON.parse(stored) as Note[];
        if (parsed && parsed.length > 0) {
          setNotes(parsed);
          setActiveNoteId(parsed[0].id);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to parse stored notepad notes:", e);
    }
    // Default fallback
    setNotes(DEFAULT_NOTES);
    setActiveNoteId(DEFAULT_NOTES[0].id);
    localStorage.setItem('doccraft_offline_notepad_notes', JSON.stringify(DEFAULT_NOTES));
  }, []);

  // Save notes helper
  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    localStorage.setItem('doccraft_offline_notepad_notes', JSON.stringify(updatedNotes));
  };

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const handleUpdateActiveNote = (fields: Partial<Note>) => {
    if (!activeNoteId) return;
    const updated = notes.map(n => {
      if (n.id === activeNoteId) {
        return {
          ...n,
          ...fields,
          updatedAt: Date.now()
        };
      }
      return n;
    });
    saveNotes(updated);
  };

  const handleCreateNewNote = () => {
    const newNote: Note = {
      id: "note-" + Date.now(),
      title: "Untitled Scratch Note",
      content: "",
      updatedAt: Date.now()
    };
    const updated = [newNote, ...notes];
    saveNotes(updated);
    setActiveNoteId(newNote.id);
  };

  const handleDeleteActiveNote = () => {
    if (notes.length <= 1) {
      // Don't delete last note, just clear it
      handleUpdateActiveNote({
        title: "Untitled Scratch Note",
        content: ""
      });
      return;
    }
    const updated = notes.filter(n => n.id !== activeNoteId);
    saveNotes(updated);
    setActiveNoteId(updated[0].id);
  };

  const handleCopyNoteText = () => {
    if (!activeNote || !activeNote.content) return;
    navigator.clipboard.writeText(activeNote.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Grab selection from main document editor
  const handleGrabDocSelection = () => {
    if (!editor) {
      triggerNotice("Editor unavailable");
      return;
    }

    const selectionText = editor.state.doc.textBetween(
      editor.state.selection.from, 
      editor.state.selection.to, 
      " "
    ).trim();

    if (!selectionText) {
      triggerNotice("⚠️ Highlight text in the document first!");
      return;
    }

    const currentContent = activeNote ? activeNote.content : "";
    const newContent = currentContent 
      ? `${currentContent}\n\n[Reference Clapped]:\n"${selectionText}"`
      : selectionText;

    handleUpdateActiveNote({ content: newContent });
    triggerNotice("✨ Selected text grabbed safely!");
  };

  // Inject notepad draft content into TipTap editor
  const handleInsertInDoc = () => {
    if (!editor) return;
    if (!activeNote || !activeNote.content) {
      triggerNotice("⚠️ Note is empty!");
      return;
    }

    // Replace linebreaks with paragraph tags or HTML safe breaks
    const formattedHtml = activeNote.content
      .split('\n\n')
      .map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`)
      .join('');

    editor.chain().focus().insertContent(formattedHtml).run();
    triggerNotice("🚀 Injected into editor at cursor!");
  };

  const triggerNotice = (msg: string) => {
    setCopiedTextNotice(msg);
    setTimeout(() => setCopiedTextNotice(""), 3000);
  };

  const handleResetToDefaults = () => {
    if (window.confirm("Restore default checklist note? Your other custom notes will remain.")) {
      const merged = [...DEFAULT_NOTES, ...notes.filter(n => n.id !== "welcome-doccraft-note")];
      saveNotes(merged);
      setActiveNoteId(DEFAULT_NOTES[0].id);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/15 backdrop-blur-xs z-[99900]" 
            onClick={onClose} 
          />

          {/* Core Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0.95 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-screen w-80 sm:w-96 bg-white border-l border-gray-200 shadow-2xl z-[99999] flex flex-col font-sans text-gray-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="p-1 px-2.5 bg-indigo-600 rounded-lg text-white font-bold text-xs font-mono">
                  DEV-OFFLINE
                </div>
                <h3 className="font-bold text-gray-800 text-sm tracking-tight flex items-center gap-1.5 uppercase">
                  <Bookmark className="w-4 h-4 text-indigo-600" /> Offline Note Pad
                </h3>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-700 transition-colors shadow-none outline-none focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Note Selector List Toolbar */}
            <div className="p-3.5 border-b border-gray-100 flex items-center gap-2 bg-white flex-shrink-0">
              <select
                value={activeNoteId}
                onChange={(e) => setActiveNoteId(e.target.value)}
                className="flex-1 text-xs font-semibold bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg p-2 outline-none text-gray-700 font-sans cursor-pointer transition-colors"
              >
                {notes.map(note => (
                  <option key={note.id} value={note.id}>
                    {note.title || "Untitled Note"}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleCreateNewNote}
                title="Create a new draft pad space"
                className="p-2 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-all font-sans text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer focus:outline-none"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>New</span>
              </button>
            </div>

            {/* Editing Field Body */}
            <div className="flex-1 p-4 flex flex-col gap-3.5 bg-gray-50/30 overflow-y-auto min-h-0">
              {activeNote ? (
                <>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scratchpad Title</label>
                    <input
                      type="text"
                      value={activeNote.title}
                      placeholder="Give this note a title..."
                      onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                      className="w-full text-sm font-bold bg-white border border-gray-250 hover:border-gray-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all text-gray-800"
                    />
                  </div>

                  <div className="flex-1 flex flex-col gap-1 min-h-0">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Device Capped Notes</label>
                      <span className="text-[9px] font-mono text-gray-400">Offline Auto-saved</span>
                    </div>
                    <textarea
                      value={activeNote.content}
                      placeholder="Start jotting down things for reference while editing, pasting outlines, links, snippets, research notes, structures..."
                      onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                      className="w-full flex-1 p-3.5 border border-gray-250 bg-white hover:border-gray-300 rounded-2xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all font-mono text-xs text-gray-700 leading-relaxed resize-none min-h-[220px]"
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400">
                  <BookOpen className="w-8 h-8 opacity-40 mb-2 text-indigo-600 animate-pulse" />
                  <p className="text-xs">No active notes. Click "+ New" above to start jotting things down!</p>
                </div>
              )}
            </div>

            {/* Quick Actions Feed Alert Drawer */}
            {copiedTextNotice && (
              <div className="mx-4 my-2 p-2 px-3.5 bg-indigo-900 border border-indigo-700 rounded-xl text-white text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                <span>{copiedTextNotice}</span>
              </div>
            )}

            {/* Sticky Action Board Footer */}
            <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0 flex flex-col gap-2 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.03)]">
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleGrabDocSelection}
                  title="Grabs any selected text block inside the document editor and clips it to this note"
                  className="flex items-center justify-center gap-1.5 border border-gray-200 hover:border-indigo-200 hover:bg-neutral-50 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-600 hover:text-indigo-600 transition-all cursor-pointer focus:outline-none"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
                  <span>Grab Selection</span>
                </button>

                <button
                  onClick={handleCopyNoteText}
                  className="flex items-center justify-center gap-1.5 border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50 px-2.5 py-2 rounded-xl text-xs font-bold text-gray-600 hover:text-emerald-700 transition-all cursor-pointer focus:outline-none"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Note</span>
                    </>
                  )}
                </button>
              </div>

              {activeNote && (
                <button
                  onClick={handleInsertInDoc}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] text-xs uppercase tracking-wider block focus:outline-none"
                >
                  <FileText className="w-4 h-4" />
                  <span>Insert in Document</span>
                </button>
              )}

              <div className="flex items-center justify-between border-t border-gray-100 pt-2.5 mt-1.5 text-[10px] text-gray-400 font-sans">
                <button
                  onClick={handleResetToDefaults}
                  className="hover:text-amber-600 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Restore Default
                </button>
                <button
                  onClick={handleDeleteActiveNote}
                  className="text-red-400 hover:text-red-700 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3 text-red-400" /> Trash Pad
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
