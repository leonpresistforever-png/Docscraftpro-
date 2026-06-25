import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Calendar, CheckSquare, Clock, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';

interface LocalTask {
  id: string;
  title: string;
  notes?: string;
  completed: boolean;
  dueDate?: string;
  category: 'poet' | 'story' | 'professional' | 'general';
  createdAt?: any;
}

export function ProductivityPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'poet' | 'story' | 'professional' | 'general'>('general');
  const [newTaskDue, setNewTaskDue] = useState('');

  // Dual Persistence Engine: Real-time Firestore sync when authenticated; LocalStorage fallback otherwise
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      const q = query(
        collection(db, 'tasks'),
        where('ownerId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedTasks = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || '',
            notes: data.notes || '',
            completed: !!data.completed,
            dueDate: data.dueDate || '',
            category: data.category || 'general',
            createdAt: data.createdAt
          } as LocalTask;
        });

        // Client-side Sort to prevent requirement for complex Firestore composite indexes
        fetchedTasks.sort((a, b) => {
          const t1 = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
          const t2 = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
          return t2 - t1;
        });

        setTasks(fetchedTasks);
        setIsLoading(false);
      }, (error) => {
        console.error('Error fetching tasks from firestore:', error);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Local Storage Fallback Mode
      const saved = localStorage.getItem('docscraft_local_tasks');
      if (saved) {
        try {
          setTasks(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse local tasks:', e);
        }
      } else {
        const seed: LocalTask[] = [
          {
            id: '1',
            title: 'Draft my first professional poetry flow',
            notes: 'Focus on rhythm and high-contrast imagery.',
            completed: false,
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            category: 'poet'
          },
          {
            id: '2',
            title: 'Outline the second chapter of the sci-fi story',
            notes: 'Map out the characters and narrative transitions.',
            completed: true,
            dueDate: new Date().toISOString().split('T')[0],
            category: 'story'
          }
        ];
        setTasks(seed);
        localStorage.setItem('docscraft_local_tasks', JSON.stringify(seed));
      }
      setIsLoading(false);
    }
  }, [user]);

  const saveToLocalStorage = (updatedTasks: LocalTask[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('docscraft_local_tasks', JSON.stringify(updatedTasks));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    if (user) {
      try {
        await addDoc(collection(db, 'tasks'), {
          title: newTaskTitle.trim(),
          notes: newTaskNotes.trim() || '',
          completed: false,
          dueDate: newTaskDue || '',
          category: newTaskCategory,
          ownerId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        console.error('Failed to save task to cloud:', error);
      }
    } else {
      const added: LocalTask = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        title: newTaskTitle.trim(),
        notes: newTaskNotes.trim() || undefined,
        completed: false,
        dueDate: newTaskDue || undefined,
        category: newTaskCategory
      };
      const updated = [added, ...tasks];
      saveToLocalStorage(updated);
    }
    
    // Reset inputs
    setNewTaskTitle('');
    setNewTaskNotes('');
    setNewTaskDue('');
    setNewTaskCategory('general');
  };

  const toggleTask = async (id: string) => {
    if (user) {
      try {
        const tToUpdate = tasks.find(t => t.id === id);
        if (tToUpdate) {
          await updateDoc(doc(db, 'tasks', id), {
            completed: !tToUpdate.completed,
            updatedAt: serverTimestamp()
          });
        }
      } catch (error) {
        console.error('Failed to toggle task in cloud:', error);
      }
    } else {
      const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      saveToLocalStorage(updated);
    }
  };

  const deleteTask = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'tasks', id));
      } catch (error) {
        console.error('Failed to delete task from cloud:', error);
      }
    } else {
      const updated = tasks.filter(t => t.id !== id);
      saveToLocalStorage(updated);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'poet': return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'story': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'professional': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFBF7] font-sans text-gray-900 overflow-hidden animate-fade-in">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 md:p-10 lg:p-12 space-y-8">
          
          <header className="border-b border-[#EAE6DF] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-black tracking-tight text-purple-950 flex items-center gap-2">
                Creative Writing Hub <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
              </h1>
              <p className="text-sm text-purple-700/60 mt-1 font-serif">
                Stay on track. Process your thoughts, stories, and professional documents securely synced in real-time.
              </p>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-center">
              {user ? (
                <span className="px-3 py-1 bg-green-50 border border-green-200 rounded-full text-[10px] font-bold text-green-700 uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span> Cloud Synced
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                  Offline Storage
                </span>
              )}
              <span className="px-3 py-1 bg-purple-50 border border-purple-100 rounded-full text-xs font-semibold text-purple-700 font-mono">
                Active Goals: {tasks.filter(t => !t.completed).length}
              </span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Form to add task */}
            <div className="lg:col-span-12 xl:col-span-5 bg-white border border-[#EAE6DF] rounded-3xl p-6 shadow-xs self-start space-y-4">
              <h2 className="text-lg font-bold text-purple-950 font-serif border-b pb-3 border-purple-50 flex items-center gap-2">
                <Plus className="w-5 h-5 text-pink-500" /> State Active Target
              </h2>

              <form onSubmit={handleAddTask} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E22CE]">Goal / Title</label>
                  <input 
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    placeholder="E.g., Finish outline of poetry book..."
                    className="w-full px-4 py-2.5 rounded-xl border border-purple-50 focus:outline-none focus:border-pink-500 bg-purple-50/25 text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E22CE]">Background Notes</label>
                  <textarea 
                    value={newTaskNotes}
                    onChange={e => setNewTaskNotes(e.target.value)}
                    rows={2}
                    placeholder="E.g., Write the introductory ode page..."
                    className="w-full px-4 py-2.5 rounded-xl border border-purple-50 focus:outline-none focus:border-pink-500 bg-purple-50/25 text-xs font-serif"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E22CE]">Category</label>
                    <select
                      value={newTaskCategory}
                      onChange={e => setNewTaskCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-purple-50 focus:outline-none focus:border-pink-500 bg-purple-50/25 text-xs font-semibold"
                    >
                      <option value="poet">Poet / Poetry</option>
                      <option value="story">Story Writer</option>
                      <option value="professional">Professional</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#7E22CE]">Target Date</label>
                    <input 
                      type="date"
                      value={newTaskDue}
                      onChange={e => setNewTaskDue(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-purple-50 focus:outline-none focus:border-pink-500 bg-purple-50/25 text-xs text-stone-600 font-medium"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-pink-600 via-purple-700 to-indigo-800 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-sm hover:opacity-95 transition-all text-center cursor-pointer"
                >
                  Processed & Register Target
                </button>
              </form>
            </div>

            {/* Right Column: Active and Completed Tasks */}
            <div className="lg:col-span-12 xl:col-span-7 bg-white border border-[#EAE6DF] rounded-3xl p-6 shadow-xs flex flex-col min-h-[450px]">
              <h2 className="text-lg font-bold text-purple-950 font-serif border-b pb-3 border-purple-50 flex items-center gap-2 mb-4">
                <CheckSquare className="w-5 h-5 text-purple-600" /> Active Creative Tasks
              </h2>

              <div className="flex-1 overflow-y-auto space-y-4 max-h-[500px] pr-1">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-24 text-purple-300">
                    <Loader2 className="w-8 h-8 mb-2 animate-spin text-purple-600" />
                    <span className="text-xs font-semibold font-mono">Synchronizing workspace targets...</span>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-purple-300 border-2 border-dashed border-purple-50 rounded-2xl">
                    <CheckSquare className="w-12 h-12 mb-3 opacity-40 animate-bounce" />
                    <span className="text-sm font-serif">All targets accomplished! Keep on drafting.</span>
                  </div>
                ) : (
                  <div className="divide-y divide-purple-50">
                    {tasks.map(task => (
                      <div key={task.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-start group">
                        <input 
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                          className="w-5 h-5 mt-1 border-purple-200 rounded text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600 shrink-0"
                        />
                        <div className="flex-1 space-y-1">
                          <p className={`font-semibold text-sm ${task.completed ? 'line-through text-purple-300 font-serif' : 'text-purple-950 font-serif'}`}>
                            {task.title}
                          </p>
                          {task.notes && <p className="text-xs text-purple-700/60 font-serif">{task.notes}</p>}
                          
                          <div className="flex flex-wrap gap-2 pt-1 items-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${getCategoryColor(task.category)}`}>
                              {task.category}
                            </span>
                            {task.dueDate && (
                              <span className="text-[10px] text-pink-600 font-semibold font-mono flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-pink-400" /> Due: {task.dueDate}
                              </span>
                            )}
                          </div>
                        </div>

                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-500 transition-opacity p-1 cursor-pointer"
                          title="Delete Target"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
