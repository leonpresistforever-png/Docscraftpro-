import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Plus, Check, Play, Pause, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  time: string;
  done: boolean;
  date: number;
}

export function LandingCalendarTasks() {
  const [selectedDay, setSelectedDay] = useState(22); // June 22, 2026
  const [taskText, setTaskText] = useState('');
  const [taskTime, setTaskTime] = useState('09:00');
  const [trackingActive, setTrackingActive] = useState(false);
  const [secondsTracked, setSecondsTracked] = useState(0); 
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [notification, setNotification] = useState<{show: boolean, msg: string}>({show: false, msg: ''});

  const [tasks, setTasks] = useState<Task[]>([]);

  const showNotification = (msg: string) => {
    setNotification({ show: true, msg });
    setTimeout(() => setNotification({ show: false, msg: '' }), 3000);
  };

  // Real-time tracking tick
  useEffect(() => {
    let interval: any = null;
    if (trackingActive) {
      interval = setInterval(() => {
        setSecondsTracked(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [trackingActive]);

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
    
    // Convert 24h to 12h am/pm format for display
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

  // Human readable time formatter
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

      {/* Editorial Decorative Gold Border Separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent mb-16"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        
        {/* LEFT COLUMN: Educational Copy & Classic Stopwatch (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between py-2 space-y-8">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-widest font-black text-amber-700 font-sans flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span> Live Real-Time Tracking
            </span>
            <h3 className="text-3xl md:text-4xl font-serif font-black text-gray-900 leading-tight">
              Stately Calendar <br /> &amp; Time Capsule.
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed font-serif">
              Plan your creative outputs and track milestones natively. When you assign tasks to calendar days, track them in real-time with our physical style chronometer. Keep tabs on high-end focus hours.
            </p>
          </div>

          {/* Luxury Class stopwatch widget UI */}
          <div className="p-6 bg-gradient-to-br from-[#1C1B19] to-[#0F0E0D] border border-amber-500/20 rounded-[2rem] shadow-xl text-white relative overflow-hidden flex flex-col justify-between h-[210px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Aesthetic Focus Timer</span>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wide font-bold ${trackingActive ? 'bg-amber-500 text-black animate-pulse' : 'bg-white/10 text-gray-400'}`}>
                {trackingActive ? 'ACTIVE_TICK' : 'PAUSED'}
              </span>
            </div>

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
                className="px-4 py-1.5 bg-white/10 hover:bg-amber-500 hover:text-black rounded-full text-xs font-bold uppercase tracking-wider font-mono transition-all flex items-center gap-1.5"
              >
                {trackingActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                {trackingActive ? 'Pause' : 'Start'}
              </button>
              <button 
                onClick={() => { setSecondsTracked(0); setTrackingActive(false); }}
                className="p-2 bg-white/5 hover:bg-white/10 active:scale-95 rounded-full font-mono transition-all"
                title="Reset stopwatch clock"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
              </button>
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
