import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Plus, Pin, Palette, Trash2, Image as ImageIcon, CheckSquare, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KeepNote {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  tasks: { text: string; completed: boolean }[];
  isChecklist: boolean;
  createdAt: any;
  updatedAt: any;
}

const COLORS = [
  '#ffffff', // White
  '#f28b82', // Red
  '#fbbc04', // Orange
  '#fff475', // Yellow
  '#ccff90', // Green
  '#a7ffeb', // Teal
  '#cbf0f8', // Blue
  '#aecbfa', // Dark Blue
  '#d7aefb', // Purple
  '#fdcfe8', // Pink
  '#e6c9a8', // Brown
  '#e8eaed'  // Gray
];

export function KeepNotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<KeepNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Note Creation State
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState('#ffffff');
  const [isNewChecklist, setIsNewChecklist] = useState(false);
  const [isNewPinned, setIsNewPinned] = useState(false);
  const [newTasks, setNewTasks] = useState<{text: string; completed: boolean}[]>([{text: '', completed: false}]);

  // Editing Note State
  const [editingNote, setEditingNote] = useState<KeepNote | null>(null);

  useEffect(() => {
    if (!user) return;
    
    // Firestore security rules apply to the 'documents' collection for notes, but let's use a specific "keep_notes" collection.
    // Wait, by firestore rules we might be denied if we use "keep_notes", let's check firestore.rules:
    // Oh! firestore.rules doesn't allow "keep_notes"! It only allows "documents", "users", "chat_sessions", "inputHistory".
    // I should create documents with a `type: 'keep_note'` inside the `documents` collection!
    const q = query(
      collection(db, 'documents'),
      where('ownerId', '==', user.uid),
      where('type', '==', 'keep_note')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as KeepNote[];
      
      // Client-side sort by updatedAt descending
      notesData.sort((a, b) => {
        const timeA = a.updatedAt?.toMillis?.() || 0;
        const timeB = b.updatedAt?.toMillis?.() || 0;
        return timeB - timeA;
      });
      
      setNotes(notesData);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSaveNewNote = async () => {
    if (!user) return;
    if (!newTitle.trim() && !newContent.trim() && (!isNewChecklist || newTasks.every(t => !t.text.trim()))) {
      setIsCreating(false);
      return;
    }

    const validTasks = newTasks.filter(t => t.text.trim() !== '');

    const noteData = {
      type: 'keep_note',
      ownerId: user.uid,
      title: newTitle.trim(),
      content: newContent.trim(),
      color: newColor,
      isPinned: isNewPinned,
      isChecklist: isNewChecklist,
      tasks: validTasks,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'documents'), noteData);
      // Reset
      setIsCreating(false);
      setNewTitle('');
      setNewContent('');
      setNewColor('#ffffff');
      setIsNewChecklist(false);
      setIsNewPinned(false);
      setNewTasks([{text: '', completed: false}]);
    } catch (e) {
      console.error("Error creating note", e);
    }
  };

  const updateNoteFields = async (id: string, fields: any) => {
    try {
      await updateDoc(doc(db, 'documents', id), {
        ...fields,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error updating note", e);
    }
  };

  const deleteNote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'documents', id));
    } catch (e) {
      console.error("Error deleting note", e);
    }
  };

  const filteredNotes = notes.filter(n => 
    (n.title && n.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (n.tasks && n.tasks.some(t => t.text.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);

  const handleTaskChange = (index: number, text: string) => {
    const updated = [...newTasks];
    updated[index].text = text;
    if (index === updated.length - 1 && text.trim() !== '') {
      updated.push({ text: '', completed: false });
    }
    setNewTasks(updated);
  };

  const handleEditingTaskChange = (index: number, text: string) => {
    if (!editingNote) return;
    const updatedTasks = [...editingNote.tasks];
    updatedTasks[index].text = text;
    if (index === updatedTasks.length - 1 && text.trim() !== '') {
      updatedTasks.push({ text: '', completed: false });
    }
    setEditingNote({...editingNote, tasks: updatedTasks});
  };

  const saveEditingNote = async () => {
    if (!editingNote) return;
    
    const validTasks = editingNote.tasks.filter(t => t.text.trim() !== '');
    
    await updateNoteFields(editingNote.id, {
      title: editingNote.title,
      content: editingNote.content,
      color: editingNote.color,
      isChecklist: editingNote.isChecklist,
      tasks: validTasks
    });
    setEditingNote(null);
  };

  const NoteCard = ({ note }: { note: KeepNote }) => (
    <motion.div 
      layout
      onClick={() => {
        setEditingNote({
           ...note, 
           tasks: note.tasks && note.tasks.length > 0 ? [...note.tasks, {text: '', completed: false}] : [{text: '', completed: false}]
        });
      }}
      className="rounded-xl border border-gray-200 overflow-hidden relative group cursor-pointer hover:shadow-md transition-shadow"
      style={{ backgroundColor: note.color || '#ffffff' }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2 group">
           {note.title && <h3 className="font-bold text-gray-900 text-lg leading-tight">{note.title}</h3>}
           <button 
             onClick={(e) => { e.stopPropagation(); updateNoteFields(note.id, { isPinned: !note.isPinned }); }}
             className={`p-2 rounded-full hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 ${note.isPinned ? 'opacity-100' : ''}`}
           >
             <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-gray-900 text-gray-900' : 'text-gray-500'}`} />
           </button>
        </div>
        
        {note.isChecklist ? (
          <div className="space-y-1.5 mt-2">
            {note.tasks && note.tasks.map((task, i) => (
              <div key={i} className="flex items-start gap-2">
                <input 
                  type="checkbox" 
                  checked={task.completed} 
                  onChange={(e) => {
                    e.stopPropagation();
                    const newTasks = [...note.tasks];
                    newTasks[i].completed = !newTasks[i].completed;
                    updateNoteFields(note.id, { tasks: newTasks });
                  }}
                  onClick={e => e.stopPropagation()}
                  className="w-4 h-4 rounded mt-0.5 text-gray-800 focus:ring-gray-800 bg-white/50 border-gray-400"
                />
                <span className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{task.text}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-800 whitespace-pre-wrap text-sm line-clamp-10">{note.content}</p>
        )}
      </div>

      <div className="px-4 pb-3 pt-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between">
         <div className="flex gap-1 relative group/palette">
            <button className="p-1.5 rounded-full hover:bg-black/5 text-gray-500" onClick={(e) => e.stopPropagation()}>
              <Palette className="w-4 h-4" />
            </button>
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover/palette:flex bg-white shadow-xl rounded-lg border border-gray-200 p-2 gap-1 z-10 w-64 flex-wrap">
              {COLORS.map(c => (
                <button 
                  key={c}
                  onClick={(e) => { e.stopPropagation(); updateNoteFields(note.id, { color: c }); }}
                  className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
         </div>
         <button onClick={(e) => deleteNote(e, note.id)} className="p-1.5 rounded-full hover:bg-black/5 text-gray-500">
            <Trash2 className="w-4 h-4" />
         </button>
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-screen bg-[#FDFCF8] font-sans">
      <Sidebar />
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-gray-100 bg-white z-10 shrink-0">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center text-white"><CheckSquare className="w-5 h-5"/></div>
            Notes
          </h1>
          <div className="flex-1 max-w-xl mx-8 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search notes and lists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all form-input border-none"
            />
          </div>
          <div className="w-10"></div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-8" onClick={() => { if(isCreating) handleSaveNewNote(); }}>
           
           {/* Create Note Input */}
           <div className="max-w-2xl mx-auto mb-12">
             <div 
                className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300"
                style={{ backgroundColor: isCreating ? newColor : '#ffffff' }}
                onClick={(e) => { e.stopPropagation(); setIsCreating(true); }}
             >
                {isCreating ? (
                  <div className="p-4 flex flex-col">
                     <div className="flex justify-between items-start mb-2">
                        <input
                           type="text"
                           placeholder="Title"
                           value={newTitle}
                           onChange={e => setNewTitle(e.target.value)}
                           className="w-full font-bold text-lg bg-transparent border-none focus:ring-0 placeholder-gray-500"
                        />
                        <button onClick={() => setIsNewPinned(!isNewPinned)} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-black/5"><Pin className={`w-5 h-5 ${isNewPinned ? 'fill-gray-900 text-gray-900' : ''}`}/></button>
                     </div>
                     
                     {isNewChecklist ? (
                        <div className="space-y-2 mb-4 px-3">
                           {newTasks.map((task, idx) => (
                             <div key={idx} className="flex items-center gap-3">
                               <input type="checkbox" className="w-4 h-4 rounded text-gray-800 border-gray-400" checked={task.completed} onChange={() => {
                                  const updated = [...newTasks];
                                  updated[idx].completed = !updated[idx].completed;
                                  setNewTasks(updated);
                               }}/>
                               <input
                                 type="text"
                                 autoFocus={idx === newTasks.length - 1}
                                 placeholder={idx === newTasks.length - 1 ? "List item" : ""}
                                 value={task.text}
                                 onChange={e => handleTaskChange(idx, e.target.value)}
                                 className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0 placeholder-gray-400"
                               />
                             </div>
                           ))}
                        </div>
                     ) : (
                        <textarea
                           autoFocus
                           placeholder="Take a note..."
                           value={newContent}
                           onChange={e => setNewContent(e.target.value)}
                           className="w-full bg-transparent border-none focus:ring-0 min-h-[100px] resize-none text-sm placeholder-gray-600 px-3"
                        />
                     )}

                     <div className="flex justify-between items-center mt-2 px-1">
                        <div className="flex gap-1 relative group/palette">
                          <button className="p-2 rounded-full hover:bg-black/5 text-gray-500" title="Background options">
                            <Palette className="w-4 h-4"/>
                          </button>
                          <div className="absolute top-full left-0 mt-2 hidden group-hover/palette:flex bg-white shadow-xl rounded-lg border border-gray-200 p-2 gap-1 z-10 w-64 flex-wrap">
                            {COLORS.map(c => (
                              <button key={c} onClick={() => setNewColor(c)} className="w-6 h-6 rounded-full border border-gray-300" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleSaveNewNote(); }} className="font-medium text-gray-800 px-4 py-2 hover:bg-black/5 rounded-lg text-sm">Close</button>
                     </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3.5 px-5">
                    <span className="text-gray-500 font-medium">Take a note...</span>
                    <div className="flex gap-3">
                      <button onClick={(e) => { e.stopPropagation(); setIsCreating(true); setIsNewChecklist(true); }} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100" title="New list"><CheckSquare className="w-5 h-5"/></button>
                      <button onClick={(e) => { e.stopPropagation(); setIsCreating(true); }} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100" title="New note with image"><ImageIcon className="w-5 h-5"/></button>
                    </div>
                  </div>
                )}
             </div>
           </div>

           {/* Notes Grid */}
           <div className="max-w-7xl mx-auto">
              {pinnedNotes.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 px-2">Pinned ({pinnedNotes.length})</h3>
                  <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    <AnimatePresence>
                      {pinnedNotes.map(note => <NoteCard key={note.id} note={note} />)}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {unpinnedNotes.length > 0 && (
                <div>
                  {pinnedNotes.length > 0 && <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 px-2">Others</h3>}
                  <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    <AnimatePresence>
                      {unpinnedNotes.map(note => <NoteCard key={note.id} note={note} />)}
                    </AnimatePresence>
                  </div>
                </div>
              )}
           </div>

        </div>
      </div>

      {/* Editing Modal */}
      <AnimatePresence>
        {editingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm pointer-events-auto"
               onClick={saveEditingNote}
             />
             <motion.div 
               layoutId={editingNote.id}
               className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl relative pointer-events-auto border border-gray-200 overflow-hidden"
               style={{ backgroundColor: editingNote.color }}
             >
                <div className="p-6">
                   <div className="flex justify-between items-start mb-4">
                      <input
                         type="text"
                         placeholder="Title"
                         value={editingNote.title}
                         onChange={e => setEditingNote({...editingNote, title: e.target.value})}
                         className="w-full font-bold text-2xl bg-transparent border-none focus:ring-0 placeholder-gray-500"
                      />
                      <button onClick={() => setEditingNote({...editingNote, isPinned: !editingNote.isPinned})} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-black/5">
                        <Pin className={`w-6 h-6 ${editingNote.isPinned ? 'fill-gray-900 text-gray-900' : ''}`}/>
                      </button>
                   </div>
                   
                   {editingNote.isChecklist ? (
                      <div className="space-y-2 mb-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                         {editingNote.tasks.map((task, idx) => (
                           <div key={idx} className="flex items-center gap-3">
                             <input type="checkbox" className="w-5 h-5 rounded text-gray-800 border-gray-400" checked={task.completed} onChange={() => {
                                const updated = [...editingNote.tasks];
                                updated[idx].completed = !updated[idx].completed;
                                setEditingNote({...editingNote, tasks: updated});
                             }}/>
                             <input
                               type="text"
                               placeholder={idx === editingNote.tasks.length - 1 ? "List item" : ""}
                               value={task.text}
                               onChange={e => handleEditingTaskChange(idx, e.target.value)}
                               className={`flex-1 bg-transparent border-none focus:ring-0 text-base p-0 placeholder-gray-400 ${task.completed ? 'line-through text-gray-500' : ''}`}
                             />
                             <button onClick={() => {
                               if (idx === editingNote.tasks.length - 1 && task.text === '') return;
                               const updated = [...editingNote.tasks];
                               updated.splice(idx, 1);
                               setEditingNote({...editingNote, tasks: updated});
                             }} className="text-gray-400 hover:text-gray-800"><X className="w-4 h-4"/></button>
                           </div>
                         ))}
                      </div>
                   ) : (
                      <textarea
                         placeholder="Take a note..."
                         value={editingNote.content}
                         onChange={e => setEditingNote({...editingNote, content: e.target.value})}
                         className="w-full bg-transparent border-none focus:ring-0 min-h-[300px] resize-none text-base placeholder-gray-600 px-3"
                      />
                   )}

                   <div className="flex justify-between items-center mt-4 pt-4 border-t border-black/5">
                      <div className="flex gap-1 relative group/palette">
                        <button className="p-2 rounded-full hover:bg-black/5 text-gray-600" title="Background options">
                          <Palette className="w-5 h-5"/>
                        </button>
                        <div className="absolute bottom-full left-0 mb-2 hidden group-hover/palette:flex bg-white shadow-xl rounded-lg border border-gray-200 p-2 gap-1 w-72 flex-wrap drop-shadow-2xl z-50">
                          {COLORS.map(c => (
                            <button key={c} onClick={() => setEditingNote({...editingNote, color: c})} className="w-8 h-8 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                      <button onClick={saveEditingNote} className="font-bold text-gray-800 px-6 py-2 hover:bg-black/5 rounded-xl transition-colors">Close</button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
