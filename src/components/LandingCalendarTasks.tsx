import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Plus, Check, Play, Pause, RotateCcw, AlertCircle, Sparkles, RefreshCw, Bell, BellOff, Volume2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface Task {
  id: string;
  text: string;
  time: string;
  done: boolean;
  date: number;
}

export function LandingCalendarTasks() {
  const { user, userData, signInWithGoogle } = useAuth();
  const [selectedDay, setSelectedDay] = useState(22); // June 22, 2026
  const [taskText, setTaskText] = useState('');
  const [taskTime, setTaskTime] = useState('09:00');
  
  // Tracker States
  const [trackerMode, setTrackerMode] = useState<'stopwatch' | 'countdown'>('stopwatch');
  const [trackingActive, setTrackingActive] = useState(false);
  const [secondsTracked, setSecondsTracked] = useState(0); 
  const [countdownMinutes, setCountdownMinutes] = useState(5);
  const [customMinsInput, setCustomMinsInput] = useState('');
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [notification, setNotification] = useState<{show: boolean, msg: string}>({show: false, msg: ''});
  const [isSyncing, setIsSyncing] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const alarmIntervalRef = useRef<any>(null);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  useEffect(() => {
    setIsGoogleConnected(!!sessionStorage.getItem('google_access_token'));
  }, [user]);

  const showNotification = (msg: string) => {
    setNotification({ show: true, msg });
    setTimeout(() => setNotification({ show: false, msg: '' }), 4000);
  };

  // Web Audio API alarm sound synthesizer
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

  // Trigger alarm loops when timer finishes
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
      showNotification("Please use 'Sync' and sign in with Google to fetch calendar events.");
      // Trigger login popup
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
      // Fetch user's primary calendar events (filtering for June 2026 month or general events)
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

      const newTasks: Task[] = fetchedEvents.map((item: any) => {
        const startStr = item.start?.dateTime || item.start?.date || '';
        const startDate = new Date(startStr);
        const dayVal = startDate.getMonth() === 5 ? startDate.getDate() : selectedDay;
        
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
          text: item.summary || 'Google Calendar Event',
          time: displayTime,
          done: false,
          date: dayVal
        };
      });

      // Filter duplicates and merge
      setTasks(prev => {
        const localTasks = prev.filter(t => !t.id.startsWith('gcal-'));
        return [...newTasks, ...localTasks];
      });

      setIsGoogleConnected(true);

      showNotification(`Successfully synchronized ${newTasks.length} events from your Google Calendar!`);
    } catch (error: any) {
      console.error("Google Calendar Sync Error:", error);
      showNotification("Failed to sync actual calendar. Grant authorization and try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.done;
        if (t.text === activeTask && nextState) {
          setTrackingActive(false);
        }
        if (nextState) {
          showNotification(`Task completed: ${t.text}`);
        }
        return { ...t, done: nextState };
      }
      return t;
    }));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;
    
    const [hours, minutes] = taskTime.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    const formattedTime = `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`;

    const newTask: Task = {
      id: Date.now().toString(),
      text: taskText.trim(),
      time: formattedTime,
      done: false,
      date: selectedDay
    };
    setTasks(prev => [newTask, ...prev]);
    setActiveTask(newTask.text);
    setTaskText('');
    showNotification(`New task assigned for June ${selectedDay} at ${formattedTime}`);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const activeDayTasks = tasks.filter(t => t.date === selectedDay);

  return (
    <div className="py-20 w-full max-w-7xl mx-auto px-6 md:px-12 relative z-10 selection:bg-amber-600 selection:text-white">
      
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
            <span>ALARM TRIGGERED: TRACKER WORK TIME FINISHED!</span>
            <button 
              onClick={stopAlarm}
              className="px-4 py-1 bg-white text-red-600 hover:bg-stone-100 rounded-lg text-xs uppercase font-bold tracking-wider"
            >
              Stop Alarm
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editorial Decorative Gold Border Separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent mb-16"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        
        {/* LEFT COLUMN: Educational Copy & Classic Stopwatch (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between py-2 space-y-8">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-widest font-black text-amber-700 font-sans flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span> Live Real-Time Tracker
            </span>
            <h3 className="text-3xl md:text-4xl font-serif font-black text-gray-900 leading-tight">
              Stately Calendar <br /> &amp; Tracking.
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed font-serif">
              Plan your creative outputs and track milestones natively. Connect your actual Google Calendar account with permission to download live timelines. Use the physical styled alarm tracker below.
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
                  className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 w-fit"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Calendar'}
                </button>
              </div>
            ) : (
              <button
                onClick={fetchGoogleCalendarEvents}
                disabled={isSyncing}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
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
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Tracker</span>
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
                {activeTask ? `Tracking: ${activeTask}` : "Select or Add a task to start tracking"}
              </p>
            </div>

            {/* Stopwatch Controls */}
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setTrackingActive(!trackingActive)}
                className="px-5 py-2 bg-white/10 hover:bg-amber-500 hover:text-black rounded-full text-xs font-bold uppercase tracking-wider font-mono transition-all flex items-center gap-1.5"
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
                className="p-2.5 bg-white/5 hover:bg-white/10 active:scale-95 rounded-full font-mono transition-all"
                title="Reset stopwatch clock"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
              </button>
              {alarmActive && (
                <button
                  onClick={stopAlarm}
                  className="p-2.5 bg-red-600 hover:bg-red-500 active:scale-95 rounded-full transition-all"
                  title="Stop active alarm"
                >
                  <BellOff className="w-3.5 h-3.5 text-white" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Classic Calendar Bezel (7 Cols) */}
        <div className="lg:col-span-7 bg-[#FCFBFAF2] border-2 border-[#EADAB5] rounded-[2.5rem] p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.06)] flex flex-col justify-between relative transform transition-transform duration-500 hover:rotate-y-1">
          
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
                const hasTask = tasks.some(t => t.date === dayNum && !t.done);
                const hasDone = tasks.some(t => t.date === dayNum && t.done);

                return (
                  <button 
                    key={idx}
                    onClick={() => {
                      setSelectedDay(dayNum);
                      const dailyTasks = tasks.filter(t => t.date === dayNum);
                      if (dailyTasks.length > 0) {
                        const undone = dailyTasks.find(t => !t.done);
                        setActiveTask(undone ? undone.text : dailyTasks[0].text);
                      } else {
                        setActiveTask(null);
                      }
                    }}
                    className={`relative py-2.5 rounded-xl font-mono text-xs font-bold transition-all focus:outline-none flex flex-col items-center justify-center ${
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

            {/* Task Add form for chosen date */}
            <form onSubmit={handleAddTask} className="flex gap-2 relative mt-4">
              <input 
                type="text"
                value={taskText}
                onChange={e => setTaskText(e.target.value)}
                maxLength={45}
                placeholder={`Assign new task for June ${selectedDay}...`}
                className="flex-1 bg-white border border-[#E6DBBD] outline-none rounded-xl px-4 py-2.5 text-xs text-stone-900 placeholder-stone-400 font-sans focus:border-[#b08d2c] focus:ring-1 focus:ring-[#b08d2c] transition-all"
              />
              <div className="relative group flex items-center justify-center">
                <input 
                  type="time" 
                  value={taskTime}
                  onChange={e => setTaskTime(e.target.value)}
                  className="w-28 bg-white border border-[#E6DBBD] outline-none rounded-xl px-2 py-2.5 text-xs text-stone-900 font-mono focus:border-[#b08d2c] focus:ring-1 focus:ring-[#b08d2c] transition-all cursor-pointer opacity-0 absolute inset-0 z-10 w-full h-full"
                />
                <div className="w-28 bg-white border border-[#E6DBBD] rounded-xl px-3 py-2.5 text-xs text-stone-900 font-mono font-bold text-center flex items-center justify-center shadow-sm group-hover:border-[#b08d2c] transition-colors relative pointer-events-none">
                  {taskTime} 
                  <span className="ml-1 text-[9px] text-gray-400 uppercase tracking-wider block translate-y-[1px]">O'clock</span>
                </div>
              </div>
              <button 
                type="submit"
                className="px-4 bg-[#b08d2c] hover:bg-[#9a7b26] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 focus:outline-none active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add Task
              </button>
            </form>

            {/* Tasks list with fluid Rearranging layouts based on Framer Motion's layout prop */}
            <div className="space-y-2 mt-6 max-h-[190px] overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">
                <span>Targets on June {selectedDay}</span>
                <span>{activeDayTasks.length} Milestones</span>
              </div>

              <AnimatePresence initial={false}>
                {activeDayTasks.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-xl border border-dashed border-[#E6DBBD] text-center text-xs text-gray-400 py-6"
                  >
                    No milestones assigned on this date. Use the field above to seed your schedule!
                  </motion.div>
                ) : (
                  <motion.div className="flex flex-col gap-2">
                    {activeDayTasks.map((task) => (
                      <motion.div 
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                          task.done 
                            ? 'bg-stone-100/50 border-stone-200 text-stone-400 line-through' 
                            : 'bg-white border-[#E6DBBD]/80 hover:border-amber-400/60 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <button 
                            type="button"
                            onClick={() => handleToggleTask(task.id)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              task.done 
                                ? 'bg-emerald-500 border-emerald-600 text-white' 
                                : 'border-[#b08d2c]/50 hover:bg-amber-50 text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          
                          <span 
                            onClick={() => {
                              if (!task.done) {
                                setActiveTask(task.text);
                                if (trackerMode === 'stopwatch') {
                                  setSecondsTracked(0);
                                } else {
                                  setSecondsTracked(countdownMinutes * 60);
                                }
                                setTrackingActive(true);
                              }
                            }}
                            className={`text-xs font-serif font-bold cursor-pointer truncate ${task.done ? '' : 'text-stone-900 hover:text-[#b08d2c]'}`}
                            title="Click to track this milestone in the focus timer"
                          >
                            {task.text}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-gray-400 shrink-0 bg-stone-50 px-2 py-0.5 rounded-md border border-[#E6DBBD]/40">{task.time}</span>
                          {!task.done && (
                            <button 
                              type="button"
                              onClick={() => {
                                setActiveTask(task.text);
                                if (trackerMode === 'stopwatch') {
                                  setSecondsTracked(0);
                                } else {
                                  setSecondsTracked(countdownMinutes * 60);
                                }
                                setTrackingActive(true);
                              }}
                              className="text-[10px] font-mono text-amber-700 font-bold hover:underline"
                            >
                              Track
                            </button>
                          )}
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
  );
}
