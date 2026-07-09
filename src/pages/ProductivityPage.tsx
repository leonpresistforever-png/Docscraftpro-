import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Check, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  Bell, 
  BellOff, 
  Volume2, 
  Trash2, 
  CheckSquare, 
  Loader2 
} from 'lucide-react';
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
  dueDate?: string; // "2026-06-DD"
  category: 'poet' | 'story' | 'professional' | 'general';
  time?: string; // "09:00 AM" format or raw time
  createdAt?: any;
}

export function ProductivityPage() {
  const { user, signInWithGoogle } = useAuth();
  const [tasks, setTasks] = useState<LocalTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Selected Day state (June 2026 matches the landing page calendar bezel)
  const [selectedDay, setSelectedDay] = useState<number>(22);
  
  // Task Form inputs
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'poet' | 'story' | 'professional' | 'general'>('general');
  const [newTaskTime, setNewTaskTime] = useState('09:00');
  
  // Focus Tracker States (Stopwatch & Countdown)
  const [trackerMode, setTrackerMode] = useState<'stopwatch' | 'countdown'>('stopwatch');
  const [trackingActive, setTrackingActive] = useState(false);
  const [secondsTracked, setSecondsTracked] = useState(0); 
  const [countdownMinutes, setCountdownMinutes] = useState(5);
  const [customMinsInput, setCustomMinsInput] = useState('');
  const [activeTask, setActiveTask] = useState<string | null>(null);
  
  // Notification Toast state
  const [notification, setNotification] = useState<{show: boolean, msg: string}>({show: false, msg: ''});
  const [isSyncing, setIsSyncing] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const alarmIntervalRef = useRef<any>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  // Check Google connection on load
  useEffect(() => {
    setIsGoogleConnected(!!sessionStorage.getItem('google_access_token'));
  }, [user]);

  const showNotification = (msg: string) => {
    setNotification({ show: true, msg });
    setTimeout(() => setNotification({ show: false, msg: '' }), 4000);
  };

  // Real-time Database Persistence Sync Engine
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
            time: data.time || '12:00 PM',
            createdAt: data.createdAt
          } as LocalTask;
        });

        // Client-side Sort to keep list structured beautifully without requiring complex Firestore composite indexes
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
            dueDate: '2026-06-22',
            category: 'poet',
            time: '09:00 AM'
          },
          {
            id: '2',
            title: 'Outline the second chapter of the story',
            notes: 'Map out the characters and narrative transitions.',
            completed: true,
            dueDate: '2026-06-22',
            category: 'story',
            time: '02:30 PM'
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

  // Sound Synthesizer via Web Audio API (No files required!)
  const playAlarmSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };
      
      // Beautiful chime melody
      playTone(523.25, now, 0.3);       // C5
      playTone(659.25, now + 0.15, 0.3); // E5
      playTone(783.99, now + 0.3, 0.4);  // G5
      playTone(1046.50, now + 0.45, 0.6); // C6
    } catch (e) {
      console.warn("Web Audio Context blocked or uninitialized:", e);
    }
  };

  const triggerAlarm = () => {
    setAlarmActive(true);
    playAlarmSound();
    
    // Repeat chime every 3 seconds until stopped
    if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    alarmIntervalRef.current = setInterval(() => {
      playAlarmSound();
    }, 3000);
  };

  const stopAlarm = () => {
    setAlarmActive(false);
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  };

  // Clean up alarm interval on unmount
  useEffect(() => {
    return () => {
      if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current);
    };
  }, []);

  // Real-time tracking tick
  useEffect(() => {
    let interval: any = null;
    if (trackingActive) {
      interval = setInterval(() => {
        if (trackerMode === 'stopwatch') {
          setSecondsTracked(prev => prev + 1);
        } else {
          setSecondsTracked(prev => {
            if (prev <= 1) {
              setTrackingActive(false);
              triggerAlarm();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [trackingActive, trackerMode]);

  // Handle mode switches
  const handleModeChange = (mode: 'stopwatch' | 'countdown') => {
    setTrackingActive(false);
    stopAlarm();
    setTrackerMode(mode);
    if (mode === 'stopwatch') {
      setSecondsTracked(0);
    } else {
      setSecondsTracked(countdownMinutes * 60);
    }
  };

  // Handle countdown minutes change
  const handleCountdownMinutesChange = (mins: number) => {
    setCountdownMinutes(mins);
    if (!trackingActive && trackerMode === 'countdown') {
      setSecondsTracked(mins * 60);
    }
  };

  // Google Calendar Integration API Call
  const fetchGoogleCalendarEvents = async () => {
    const token = sessionStorage.getItem('google_access_token');
    if (!token) {
      showNotification("Please synchronize with Google to fetch live calendar events.");
      try {
        await signInWithGoogle();
        const newToken = sessionStorage.getItem('google_access_token');
        if (!newToken) return;
        setIsGoogleConnected(true);
      } catch (err) {
        console.error("Auth failed:", err);
        return;
      }
    }
    
    setIsSyncing(true);
    const activeToken = sessionStorage.getItem('google_access_token');
    
    try {
      // Fetch user's primary calendar events (filtering for June 2026 month to align with layout)
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=2026-06-01T00:00:00Z&timeMax=2026-06-30T23:59:59Z&maxResults=50&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            Authorization: `Bearer ${activeToken}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Google Calendar response was not successful.');
      }
      
      const data = await response.json();
      const fetchedEvents = data.items || [];
      
      if (fetchedEvents.length === 0) {
        showNotification("Synced successfully, but found no events in Google Calendar for June 2026.");
        return;
      }

      const newTasks: LocalTask[] = fetchedEvents.map((item: any) => {
        const startStr = item.start?.dateTime || item.start?.date || '';
        const startDate = new Date(startStr);
        const dayVal = startDate.getMonth() === 5 ? startDate.getDate() : selectedDay;
        const formattedDueDate = `2026-06-${String(dayVal).padStart(2, '0')}`;
        
        // Format to readable 12H time
        let displayTime = '12:00 PM';
        if (item.start?.dateTime) {
          const hours = startDate.getHours();
          const minutes = startDate.getMinutes().toString().padStart(2, '0');
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const h = hours % 12 || 12;
          displayTime = `${h.toString().padStart(2, '0')}:${minutes} ${ampm}`;
        }

        return {
          id: `gcal-${item.id}`,
          title: item.summary || 'Google Calendar Event',
          notes: 'Google Calendar Sync Event',
          completed: false,
          dueDate: formattedDueDate,
          category: 'general',
          time: displayTime
        };
      });

      // Synchronize to active Firestore/LocalStorage database
      if (user) {
        for (const item of newTasks) {
          const exists = tasks.some(t => t.title === item.title && t.dueDate === item.dueDate);
          if (!exists) {
            await addDoc(collection(db, 'tasks'), {
              title: item.title,
              notes: item.notes,
              completed: false,
              dueDate: item.dueDate,
              category: item.category,
              time: item.time,
              ownerId: user.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
        }
      } else {
        const updated = [...tasks];
        for (const item of newTasks) {
          const exists = updated.some(t => t.title === item.title && t.dueDate === item.dueDate);
          if (!exists) {
            updated.unshift(item);
          }
        }
        saveToLocalStorage(updated);
      }

      setIsGoogleConnected(true);
      showNotification(`Successfully synchronized ${newTasks.length} events from your Google Calendar!`);
    } catch (error: any) {
      console.error("Google Calendar Sync Error:", error);
      showNotification("Failed to sync calendar. Grant authorization and try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleTask = async (id: string) => {
    const tToToggle = tasks.find(t => t.id === id);
    if (!tToToggle) return;
    
    const nextCompletedState = !tToToggle.completed;
    
    if (user) {
      try {
        await updateDoc(doc(db, 'tasks', id), {
          completed: nextCompletedState,
          updatedAt: serverTimestamp()
        });
        if (nextCompletedState) {
          showNotification(`Task completed: ${tToToggle.title}`);
        }
      } catch (error) {
        console.error('Failed to toggle task in firestore:', error);
      }
    } else {
      const updated = tasks.map(t => t.id === id ? { ...t, completed: nextCompletedState } : t);
      saveToLocalStorage(updated);
      if (nextCompletedState) {
        showNotification(`Task completed: ${tToToggle.title}`);
      }
    }

    if (tToToggle.title === activeTask && nextCompletedState) {
      setTrackingActive(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const [hours, minutes] = newTaskTime.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    const formattedTime = `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;

    const formattedDueDate = `2026-06-${String(selectedDay).padStart(2, '0')}`;

    if (user) {
      try {
        await addDoc(collection(db, 'tasks'), {
          title: newTaskTitle.trim(),
          notes: newTaskNotes.trim() || '',
          completed: false,
          dueDate: formattedDueDate,
          category: newTaskCategory,
          time: formattedTime,
          ownerId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        showNotification(`New milestone assigned for June ${selectedDay} at ${formattedTime}`);
      } catch (error) {
        console.error('Failed to save task to Firestore:', error);
      }
    } else {
      const added: LocalTask = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        notes: newTaskNotes.trim() || undefined,
        completed: false,
        dueDate: formattedDueDate,
        category: newTaskCategory,
        time: formattedTime
      };
      const updated = [added, ...tasks];
      saveToLocalStorage(updated);
      showNotification(`New milestone assigned for June ${selectedDay} at ${formattedTime}`);
    }

    setActiveTask(newTaskTitle.trim());
    setNewTaskTitle('');
    setNewTaskNotes('');
  };

  const deleteTask = async (id: string) => {
    const tToDelete = tasks.find(t => t.id === id);
    if (!tToDelete) return;

    if (user) {
      try {
        await deleteDoc(doc(db, 'tasks', id));
        showNotification(`Goal deleted: ${tToDelete.title}`);
      } catch (error) {
        console.error('Failed to delete task from firestore:', error);
      }
    } else {
      const updated = tasks.filter(t => t.id !== id);
      saveToLocalStorage(updated);
      showNotification(`Goal deleted: ${tToDelete.title}`);
    }

    if (tToDelete.title === activeTask) {
      setActiveTask(null);
      setTrackingActive(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'poet': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'story': return 'bg-amber-50 text-[#b08d2c] border-amber-200';
      case 'professional': return 'bg-stone-100 text-stone-700 border-stone-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Filter tasks specifically scheduled on the active June 2026 selected day
  const activeDayTasks = tasks.filter(t => t.dueDate === `2026-06-${String(selectedDay).padStart(2, '0')}`);

  // Filter other backlogged tasks
  const unscheduledTasks = tasks.filter(t => {
    if (!t.dueDate) return true;
    return !t.dueDate.startsWith('2026-06-');
  });

  return (
    <div className="flex h-screen bg-[#FDFBF7] font-sans text-gray-900 overflow-hidden animate-fade-in selection:bg-amber-600 selection:text-white">
      <Sidebar />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification.show && (
           <motion.div 
             initial={{ opacity: 0, y: -20, x: '-50%' }}
             animate={{ opacity: 1, y: 0, x: '-50%' }}
             exit={{ opacity: 0, y: -20, x: '-50%' }}
             className="fixed top-8 left-1/2 z-[100] bg-emerald-50 text-emerald-800 border border-emerald-200 px-6 py-3 rounded-full shadow-lg font-mono text-xs font-bold flex items-center gap-3"
           >
             <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-800">
               <Check className="w-4 h-4" />
             </div>
             {notification.msg}
           </motion.div>
        )}
      </AnimatePresence>

      {/* Alarm Warning Flashing Banner */}
      <AnimatePresence>
        {alarmActive && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed inset-x-0 top-0 z-[99] bg-red-600 text-white text-center py-4 font-mono text-sm font-bold flex items-center justify-center gap-4 shadow-2xl animate-pulse"
          >
            <Bell className="w-5 h-5 animate-bounce" />
            <span>FOCUS TARGET TIMER FINISHED!</span>
            <button 
              onClick={stopAlarm}
              className="px-4 py-1 bg-white text-red-600 hover:bg-stone-100 rounded-lg text-xs uppercase font-bold tracking-wider"
            >
              Stop Alarm
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 md:p-10 lg:p-12 space-y-8 pb-32">
          
          {/* Header styled to match premium landing page branding */}
          <header className="border-b border-[#EADAB5] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-black tracking-tight text-stone-900 flex items-center gap-2">
                Creative Writing Hub <Sparkles className="w-5 h-5 text-[#b08d2c] animate-pulse" />
              </h1>
              <p className="text-sm text-stone-600 mt-1 font-serif">
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
              <span className="px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-xs font-semibold text-[#b08d2c] font-mono">
                Active Goals: {tasks.filter(t => !t.completed).length}
              </span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            {/* LEFT COLUMN: Physical focus tracker timer & Unscheduled goals (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <span className="text-xs uppercase tracking-widest font-black text-[#b08d2c] font-sans flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span> Live Focus Assistant
                </span>
                <h3 className="text-2xl md:text-3xl font-serif font-black text-stone-900 leading-tight">
                  Stately Workspace <br />&amp; Productivity
                </h3>
                <p className="text-xs md:text-sm text-stone-600 leading-relaxed font-serif">
                  Plan your creative outputs and track milestones natively. Connect your Google Calendar with permission to sync live timelines directly into your Firestore/LocalStorage database. Use the physical styled alarm tracker below.
                </p>
                
                {/* Sync Live Button */}
                {isGoogleConnected ? (
                  <div className="flex flex-col gap-2.5">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-mono font-bold uppercase tracking-wider w-fit">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Status: Connected
                    </div>
                    <button
                      onClick={fetchGoogleCalendarEvents}
                      disabled={isSyncing}
                      className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 w-fit cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      {isSyncing ? 'Syncing...' : 'Sync Calendar'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={fetchGoogleCalendarEvents}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Synchronizing...' : 'Sync Actual Calendar'}
                  </button>
                )}
              </div>

              {/* Luxury Class stopwatch widget UI */}
              <div className="p-6 bg-gradient-to-br from-[#1C1B19] to-[#0F0E0D] border border-amber-500/20 rounded-[2rem] shadow-xl text-white relative overflow-hidden flex flex-col justify-between min-h-[310px] pb-4">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Focus Clock</span>
                  </div>
                  <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/10">
                    <button 
                      onClick={() => handleModeChange('stopwatch')}
                      className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase ${trackerMode === 'stopwatch' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                      Stopwatch
                    </button>
                    <button 
                      onClick={() => handleModeChange('countdown')}
                      className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase ${trackerMode === 'countdown' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                      Countdown
                    </button>
                  </div>
                </div>

                {/* Countdown Minutes Setter (Only visible in countdown mode) */}
                {trackerMode === 'countdown' && (
                  <div className="flex flex-col gap-2 items-center mt-1">
                    <div className="flex justify-center items-center gap-3">
                      <span className="text-[10px] font-mono text-gray-400 uppercase">Timer Target:</span>
                      <div className="flex gap-1.5">
                        {[1, 5, 15, 25].map(mins => (
                          <button
                            key={mins}
                            onClick={() => {
                              setCustomMinsInput('');
                              handleCountdownMinutesChange(mins);
                            }}
                            className={`w-7 h-5 text-[10px] font-mono font-bold rounded transition-colors ${countdownMinutes === mins && !customMinsInput ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-gray-400 hover:text-white border border-transparent'}`}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-gray-500 uppercase">Or Custom:</span>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="1440"
                          placeholder="Mins"
                          value={customMinsInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomMinsInput(val);
                            const mins = parseInt(val, 10);
                            if (!isNaN(mins) && mins > 0) {
                              handleCountdownMinutesChange(mins);
                            }
                          }}
                          className="w-24 h-7 px-2.5 bg-white/5 text-white text-xs font-mono rounded border border-white/10 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-left pr-8"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-gray-500 pointer-events-none">min</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stopwatch Large Output */}
                <div className="text-center my-2">
                  <div className="text-4xl md:text-5xl font-mono font-bold tracking-widest bg-clip-text text-transparent bg-gradient-to-b from-[#FFF] via-[#E4D1B9] to-[#D4AF37]">
                    {formatTime(secondsTracked)}
                  </div>
                  <p className="text-[10px] uppercase font-mono text-amber-500/60 mt-1 truncate max-w-xs mx-auto">
                    {activeTask ? `Tracking: ${activeTask}` : "Select a milestone to start tracking"}
                  </p>
                </div>

                {/* Stopwatch Controls */}
                <div className="flex justify-center gap-3">
                  <button 
                    onClick={() => setTrackingActive(!trackingActive)}
                    className="px-5 py-2 bg-white/10 hover:bg-amber-500 hover:text-black rounded-full text-xs font-bold uppercase tracking-wider font-mono transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {trackingActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    {trackingActive ? 'Pause' : 'Start'}
                  </button>
                  <button 
                    onClick={() => {
                      setTrackingActive(false);
                      stopAlarm();
                      if (trackerMode === 'stopwatch') {
                        setSecondsTracked(0);
                      } else {
                        setSecondsTracked(countdownMinutes * 60);
                      }
                    }}
                    className="p-2.5 bg-white/5 hover:bg-white/10 active:scale-95 rounded-full font-mono transition-all cursor-pointer"
                    title="Reset stopwatch clock"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
                  </button>
                  {alarmActive && (
                    <button
                      onClick={stopAlarm}
                      className="p-2.5 bg-red-600 hover:bg-red-500 active:scale-95 rounded-full transition-all cursor-pointer"
                      title="Stop active alarm"
                    >
                      <BellOff className="w-3.5 h-3.5 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Backlogged / Unscheduled Goals Panel */}
              <div className="p-6 bg-white border border-[#EADAB5] rounded-[2rem] shadow-sm space-y-4">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-gray-500 uppercase tracking-wider border-b pb-2 border-amber-100">
                  <span>Backlogged / Other Goals</span>
                  <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[9px]">{unscheduledTasks.length}</span>
                </div>
                
                <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin">
                  {unscheduledTasks.length === 0 ? (
                    <div className="text-center text-xs text-gray-400 py-4 font-serif">
                      No other backlogged goals. All targets are scheduled!
                    </div>
                  ) : (
                    unscheduledTasks.map(task => (
                      <div key={task.id} className="p-3 bg-[#FCFBFA] rounded-xl border border-stone-200/60 flex items-center justify-between gap-2.5 hover:border-amber-400/40 transition-colors">
                        <div className="flex items-center gap-2.5 truncate">
                          <button 
                            type="button"
                            onClick={() => handleToggleTask(task.id)}
                            className={`w-4.5 h-4.5 rounded border flex items-center justify-center transition-all shrink-0 ${
                              task.completed 
                                ? 'bg-emerald-500 border-emerald-600 text-white' 
                                : 'border-amber-600/50 hover:bg-amber-50 text-transparent cursor-pointer'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <div className="truncate">
                            <p className={`text-xs font-serif font-bold truncate ${task.completed ? 'line-through text-stone-400 font-medium' : 'text-stone-900'}`}>{task.title}</p>
                            {task.notes && <p className="text-[10px] text-stone-500 font-serif truncate">{task.notes}</p>}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          {!task.completed && (
                            <button 
                              type="button"
                              onClick={() => {
                                setActiveTask(task.title);
                                if (trackerMode === 'stopwatch') {
                                  setSecondsTracked(0);
                                } else {
                                  setSecondsTracked(countdownMinutes * 60);
                                }
                                setTrackingActive(true);
                              }}
                              className="text-[9px] font-mono text-amber-700 font-black hover:underline cursor-pointer"
                            >
                              Track
                            </button>
                          )}
                          <button 
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            className="text-stone-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Interactive Classic Calendar Bezel (7 Cols) */}
            <div className="lg:col-span-7 bg-[#FCFBFAF2] border-2 border-[#EADAB5] rounded-[2.5rem] p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.06)] flex flex-col justify-between relative">
              
              <div className="space-y-6">
                
                {/* Calendar Bar Top */}
                <div className="flex items-center justify-between border-b border-[#E6DBBD]/60 pb-4">
                  <div>
                    <h4 className="font-serif font-black text-xl text-stone-900">June 2026</h4>
                    <p className="text-[10px] uppercase tracking-widest font-mono text-[#aa7a00] font-bold">Standard Creative Milestones</p>
                  </div>
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                    <Calendar className="w-5 h-5 text-amber-700" />
                  </div>
                </div>

                {/* Calendar Days Matrix */}
                <div className="grid grid-cols-7 gap-2 text-center select-none">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, dIdx) => (
                    <span key={dIdx} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest py-1">{day}</span>
                  ))}
                  
                  {/* Skip first 1 date for June 2026 (Starts on a Monday) */}
                  <span className="py-2.5"></span>

                  {Array.from({ length: 30 }).map((_, idx) => {
                    const dayNum = idx + 1;
                    const isSelected = selectedDay === dayNum;
                    const formattedDueDate = `2026-06-${String(dayNum).padStart(2, '0')}`;
                    const dailyTasks = tasks.filter(t => t.dueDate === formattedDueDate);
                    const hasTask = dailyTasks.some(t => !t.completed);
                    const hasDone = dailyTasks.some(t => t.completed);

                    return (
                      <button 
                        key={idx}
                        onClick={() => {
                          setSelectedDay(dayNum);
                          if (dailyTasks.length > 0) {
                            const undone = dailyTasks.find(t => !t.completed);
                            setActiveTask(undone ? undone.title : dailyTasks[0].title);
                          } else {
                            setActiveTask(null);
                          }
                        }}
                        className={`relative py-2.5 rounded-xl font-mono text-xs font-bold transition-all focus:outline-none flex flex-col items-center justify-center cursor-pointer ${
                          isSelected 
                            ? 'bg-[#b08d2c] text-white shadow-md shadow-[#b08d2c]/20 scale-105' 
                            : 'hover:bg-[#EADAB5]/30 text-stone-850'
                        }`}
                      >
                        <span>{dayNum}</span>
                        {/* Tiny dots showing milestones indicators */}
                        <div className="absolute bottom-1 flex gap-0.5 justify-center">
                          {hasTask && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-red-500'}`}></span>}
                          {hasDone && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/60' : 'bg-emerald-500'}`}></span>}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Goal / Milestone Creation Bezel Form */}
                <form onSubmit={handleAddTask} className="space-y-3.5 bg-white border border-[#EADAB5] p-5 rounded-3xl shadow-xs mt-4">
                  <div className="flex items-center justify-between border-b border-amber-100 pb-2 mb-1">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider font-mono">Assign Milestone on June {selectedDay}</span>
                    <span className="text-[9px] bg-amber-100 text-[#b08d2c] px-2 py-0.5 rounded-full font-bold">New Goal</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#b08d2c] font-mono">Goal / Title</label>
                      <input 
                        type="text"
                        required
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                        maxLength={45}
                        placeholder="E.g., Write the introductory ode page..."
                        className="w-full bg-white border border-[#E6DBBD] outline-none rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 font-sans focus:border-[#b08d2c] focus:ring-1 focus:ring-[#b08d2c] transition-all"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#b08d2c] font-mono">Background Notes</label>
                      <input 
                        type="text"
                        value={newTaskNotes}
                        onChange={e => setNewTaskNotes(e.target.value)}
                        placeholder="E.g., Focus on modern layout and flow..."
                        className="w-full bg-white border border-[#E6DBBD] outline-none rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 font-sans focus:border-[#b08d2c] focus:ring-1 focus:ring-[#b08d2c] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#b08d2c] font-mono">Category</label>
                      <select
                        value={newTaskCategory}
                        onChange={e => setNewTaskCategory(e.target.value as any)}
                        className="w-full bg-white border border-[#E6DBBD] outline-none rounded-xl px-3 py-2 text-xs text-stone-900 font-semibold focus:border-[#b08d2c] focus:ring-1 focus:ring-[#b08d2c] transition-colors cursor-pointer"
                      >
                        <option value="poet">Poet / Poetry</option>
                        <option value="story">Story Writer</option>
                        <option value="professional">Professional</option>
                        <option value="general">General</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold uppercase tracking-widest text-[#b08d2c] font-mono">O'Clock / Time</label>
                      <input 
                        type="time" 
                        value={newTaskTime}
                        onChange={e => setNewTaskTime(e.target.value)}
                        className="w-full bg-white border border-[#E6DBBD] outline-none rounded-xl px-3 py-2 text-xs text-stone-900 font-mono focus:border-[#b08d2c] focus:ring-1 focus:ring-[#b08d2c] transition-all cursor-pointer"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-[#b08d2c] hover:bg-[#9a7b26] text-white rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all shadow-sm flex items-center justify-center gap-1.5 focus:outline-none active:scale-[0.98] cursor-pointer mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> Register Target Milestone
                  </button>
                </form>

                {/* Target list for June selected day */}
                <div className="space-y-2 mt-6">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">
                    <span>Targets on June {selectedDay}</span>
                    <span>{activeDayTasks.length} Milestones</span>
                  </div>

                  <AnimatePresence initial={false}>
                    {isLoading ? (
                      <div className="flex items-center justify-center py-6 text-stone-400">
                        <Loader2 className="w-5 h-5 animate-spin mr-2 text-amber-600" />
                        <span className="text-xs font-mono">Loading goals...</span>
                      </div>
                    ) : activeDayTasks.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-4 rounded-xl border border-dashed border-[#E6DBBD] text-center text-xs text-gray-400 py-6"
                      >
                        No milestones assigned on this date. Use the field above to seed your schedule!
                      </motion.div>
                    ) : (
                      <motion.div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto scrollbar-thin">
                        {activeDayTasks.map((task) => (
                          <motion.div 
                            key={task.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                              task.completed 
                                ? 'bg-stone-100/50 border-stone-200 text-stone-450 line-through' 
                                : 'bg-white border-[#E6DBBD]/80 hover:border-amber-400/60 shadow-xs'
                            }`}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <button 
                                type="button"
                                onClick={() => handleToggleTask(task.id)}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                                  task.completed 
                                    ? 'bg-emerald-500 border-emerald-600 text-white' 
                                    : 'border-[#b08d2c]/50 hover:bg-amber-50 text-transparent cursor-pointer'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              
                              <div className="truncate">
                                <span 
                                  onClick={() => {
                                    if (!task.completed) {
                                      setActiveTask(task.title);
                                      if (trackerMode === 'stopwatch') {
                                        setSecondsTracked(0);
                                      } else {
                                        setSecondsTracked(countdownMinutes * 60);
                                      }
                                      setTrackingActive(true);
                                    }
                                  }}
                                  className={`text-xs font-serif font-bold cursor-pointer truncate ${task.completed ? 'text-stone-400 font-medium' : 'text-stone-900 hover:text-[#b08d2c]'}`}
                                  title="Click to track this milestone in focus timer"
                                >
                                  {task.title}
                                </span>
                                {task.notes && (
                                  <p className="text-[10px] text-stone-500 font-serif truncate">{task.notes}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border shrink-0 ${getCategoryColor(task.category)}`}>
                                {task.category}
                              </span>
                              
                              <span className="text-[9px] font-mono text-gray-400 shrink-0 bg-stone-50 px-2 py-0.5 rounded-md border border-[#E6DBBD]/40">{task.time}</span>
                              
                              {!task.completed && (
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setActiveTask(task.title);
                                    if (trackerMode === 'stopwatch') {
                                      setSecondsTracked(0);
                                    } else {
                                      setSecondsTracked(countdownMinutes * 60);
                                    }
                                    setTrackingActive(true);
                                  }}
                                  className="text-[10px] font-mono text-amber-700 font-bold hover:underline cursor-pointer"
                                >
                                  Track
                                </button>
                              )}
                              
                              <button 
                                type="button"
                                onClick={() => deleteTask(task.id)}
                                className="text-stone-300 hover:text-red-500 transition-colors p-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
