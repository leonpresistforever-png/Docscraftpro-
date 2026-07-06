import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Sparkles, Monitor, Maximize, Cpu, Code, Brain, Shield, Info, Send, Loader2 } from 'lucide-react';

export function LandingVideoWorkspace() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [robotActive, setRobotActive] = useState(false);
  
  const [chatMessage, setChatMessage] = useState("");
  const [botResponse, setBotResponse] = useState("Hello! I am the Docscraft Smart Assistant. Welcome to the workspace. Ask me anything about Docscraft or just say hi!");
  const [isBotTyping, setIsBotTyping] = useState(false);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => {
        console.log("Auto-play blocked by browser sandbox; falling back smoothly:", err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleMuteUnmute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Fullscreen request failed:", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isBotTyping) return;
    
    const userPrompt = chatMessage.trim();
    setChatMessage("");
    setBotResponse("");
    setIsBotTyping(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: `You are the Docscraft Robot Assistant. The user asks: "${userPrompt}". Reply concisely in 1-2 short sentences. Keep it friendly and high-tech.`
        })
      });
      
      const data = await res.json();
      if (data.result) {
        setBotResponse(data.result);
      } else {
        setBotResponse("My circuits are a bit busy right now. Try again!");
      }
    } catch (err) {
      setBotResponse("Error connecting to my core matrix. Are you online?");
    } finally {
      setIsBotTyping(false);
    }
  };

  return (
    <div className="py-24 w-full max-w-7xl mx-auto relative flex flex-col items-center px-6 md:px-12 selection:bg-amber-600 selection:text-white">
      
      {/* Accent Background Under-Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[350px] bg-amber-100/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100/60 rounded-full text-xs font-bold uppercase tracking-widest text-[#8A5A00] border border-yellow-250">
          <Monitor className="w-3.5 h-3.5 animate-pulse text-amber-600" /> Cinematic Presentation
        </div>
        
        <h2 className="text-3xl md:text-5xl font-black font-serif text-gray-900 leading-tight">
          Docscraft Workspace Tour
        </h2>
        
        <p className="text-gray-600 text-sm md:text-base leading-relaxed font-serif max-w-2xl mx-auto">
          Take a look inside the sovereign document ecosystem. Watch our smart systems, cloud vaults, and design elements operate in real-time coordination.
        </p>
      </div>

      {/* Cinematic Glass Player Frame & Wrapper */}
      <div 
        ref={containerRef}
        className="w-full max-w-5xl rounded-[2.5rem] bg-gradient-to-br from-[#1c1c1c] via-[#101010] to-black p-4 md:p-6 shadow-[0_30px_90px_rgba(0,0,0,0.55)] border border-white/15 relative overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>

        {/* Player Header Bezel Bar */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 select-none relative z-10 w-full text-white">
          <div className="flex items-center gap-1.5 pl-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] shadow-sm shadow-[#FF5F56]/30"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] shadow-sm shadow-[#FFBD2E]/30"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] shadow-sm shadow-[#27C93F]/30"></span>
            
            <div className="ml-4 px-3 py-0.5 bg-white/5 border border-white/10 rounded-full text-[9px] uppercase font-mono tracking-widest text-amber-400">
              {videoError ? 'Robot Workspace Active' : 'Sovereign Viewport'}
            </div>
          </div>
          
          <div className="text-[10px] sm:text-xs font-mono text-gray-400 font-bold bg-[#0D0D0D] px-4 py-1 rounded-xl border border-white/5 shadow-inner">
            DOCSCRAFT_TOUR_FEED.MP4
          </div>
        </div>

        {/* Cinematic Content Section */}
        <div className="relative w-full aspect-video rounded-2xl bg-black overflow-hidden shadow-2xl border border-white/5 flex items-center justify-center">
          
          {videoError ? (
            
            /* HIGH-FIDELITY INTERACTIVE CSS/SVG FALLBACK STREAM PLAYER (THE SMART ROBOT WORKSPACE) */
            <div className="absolute inset-0 bg-[#0F0F12] overflow-hidden flex flex-col md:flex-row items-center justify-between p-6 md:p-12 gap-8 relative">
              
              {/* Dynamic Tech Matrix Background */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `
                    radial-gradient(ellipse at center, rgba(160, 115, 40, 0.1) 0%, transparent 70%),
                    linear-gradient(rgba(18, 18, 22, 0) 1px, #121216 1px),
                    linear-gradient(90deg, rgba(25, 25, 30, 0) 1px, #121216 1px)
                  `,
                  backgroundSize: '100% 100%, 25px 25px, 25px 25px'
                }}
              />

              {/* Glowing vertical trace line */}
              <div className="absolute left-[30%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-amber-500/20 to-transparent pointer-events-none"></div>

              {/* Interactive Speech & Information Panel (Left Column) */}
              <div className="w-full md:w-1/2 flex flex-col justify-center space-y-5 text-left relative z-10 text-white font-sans h-full">
                <div className="flex items-center gap-2 text-amber-500 font-mono text-xs font-bold uppercase tracking-widest">
                  <Brain className="w-4 h-4 animate-bounce" /> Gemini AI Assistant
                </div>

                <div className="flex-1 flex flex-col justify-end min-h-[140px]">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={botResponse}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.5 }}
                      className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-lg backdrop-blur-md relative"
                    >
                      {/* Tiny talk bubble arrow */}
                      <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 bg-[#1f1f25] border-t border-r border-white/10 hidden md:block"></div>
                      
                      <p className="text-sm md:text-base text-gray-200 leading-relaxed font-serif font-medium">
                        Greetings, Author! I am the Docscraft Assistant. How can I help you build the future today?
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Live typing carets / tech telemetry log line */}
                <div className="bg-black/40 border border-white/5 rounded-xl p-3.5 space-y-2.5 font-mono text-[10px] md:text-xs text-amber-400 mt-auto">
                  <div className="flex items-center gap-2">
                    <Code className="w-3.5 h-3.5 text-amber-500" />
                    <span>$ cat docscraft_vault_status.log</span>
                  </div>
                  <div className="flex flex-col gap-1 text-gray-400 text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500">● SECURE</span>
                      <span>LOCAL_CACHE_ENABLED = true</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">● SYNC</span>
                      <span>CLOUD_REDUNDANCY_STABLE = active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Magnificent Custom CSS Animated Robot Vector (Right Column) */}
              <div className="w-full md:w-1/2 h-full flex items-center justify-center relative z-10 select-none">
                <div 
                  className="relative cursor-pointer select-none group"
                  onMouseEnter={() => setRobotActive(true)}
                  onMouseLeave={() => setRobotActive(false)}
                >
                  {/* Glowing core shadow behind the robot */}
                  <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-all duration-500 ${robotActive || isBotTyping ? 'w-32 h-32 bg-amber-500/30' : 'w-20 h-20 bg-amber-500/10'}`}></div>

                  <motion.div 
                    animate={{ y: [0, -12, 0] }}
                    transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
                    className="relative flex flex-col items-center"
                  >
                    
                    {/* Floating Speeches popup above robot */}
                    <div className={`absolute -top-12 bg-amber-500 text-black py-1 px-3 text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_4px_12px_rgba(240,160,20,0.4)] transition-opacity duration-300 ${robotActive ? 'opacity-100' : 'opacity-0'}`}>
                      Hi Author!
                    </div>

                    {/* Robot Head */}
                    <div className={`w-24 h-20 rounded-[2rem] bg-gradient-to-b from-[#333] via-[#1F1F24] to-[#111] border-2 flex flex-col items-center justify-between p-3.5 shadow-2xl relative z-10 transition-colors ${isBotTyping ? 'border-amber-400' : 'border-amber-500/50'}`}>
                      
                      {/* Interactive glowing visor section */}
                      <div className="w-full h-8 rounded-xl bg-black border border-white/10 flex items-center justify-center gap-3 px-2">
                        {/* Eye 1 */}
                        <div className="relative">
                          <div className={`rounded-full bg-amber-400 transition-all ${robotActive || isBotTyping ? 'w-3 h-3' : 'w-2 h-2 animate-ping'}`}></div>
                          <div className="absolute inset-0 bg-yellow-300 rounded-full blur-[1.5px] opacity-75"></div>
                        </div>
                        {/* Eye 2 */}
                        <div className="relative">
                          <div className={`rounded-full bg-amber-400 transition-all ${robotActive || isBotTyping ? 'w-3 h-3' : 'w-2 h-2 animate-ping'}`}></div>
                          <div className="absolute inset-0 bg-yellow-300 rounded-full blur-[1.5px] opacity-75"></div>
                        </div>
                      </div>

                      {/* Speaking indicator / micro grill */}
                      <div className="flex gap-0.5 mt-1">
                        <span className={`w-1 bg-amber-500 rounded-full transition-all ${robotActive || isBotTyping ? 'h-3' : 'h-1.5 animate-pulse'}`}></span>
                        <span className={`w-1 bg-amber-500 rounded-full transition-all ${robotActive || isBotTyping ? 'h-4' : 'h-1 animate-pulse'}`}></span>
                        <span className={`w-1 bg-amber-500 rounded-full transition-all ${robotActive || isBotTyping ? 'h-3' : 'h-1.5 animate-pulse'}`}></span>
                      </div>
                    </div>

                    {/* Neck joiner pillar */}
                    <div className="w-4 h-3.5 bg-gradient-to-r from-gray-700 to-gray-900 border-x border-[#D4AF37]/40"></div>

                    {/* Robot Torso Cover */}
                    <div className="w-28 h-20 rounded-b-[2rem] rounded-t-lg bg-gradient-to-b from-[#24242B] to-[#121215] border-t-4 border-amber-500 border-2 border-white/5 shadow-2xl relative flex flex-col items-center justify-center">
                      
                      {/* Integrated heart light */}
                      <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center shadow-inner relative overflow-hidden">
                        <div className="absolute inset-0.5 rounded-full bg-amber-500/10 animate-ping"></div>
                        <Cpu className={`w-4 h-4 text-amber-500 transition-transform duration-300 ${robotActive || isBotTyping ? 'rotate-90 scale-110' : ''}`} />
                      </div>

                      {/* Small decorative serial number */}
                      <span className="text-[7px] text-[#555] font-mono mt-2 tracking-widest uppercase">DC-R712V</span>
                    </div>

                    {/* Left & Right floating shoulder cuffs */}
                    <div className="absolute left-[-10px] top-24 w-4 h-4 rounded-full bg-amber-500/30"></div>
                    <div className="absolute right-[-10px] top-24 w-4 h-4 rounded-full bg-amber-500/30"></div>

                  </motion.div>
                </div>
              </div>

            </div>
          ) : (
            
            /* TRADITIONAL NATIVE VIDEO ELEMENT WITH DYNAMIC FAIL-RESTORE AGENT CONTROLS */
            <video 
              ref={videoRef}
              src="/uploaded_video.mp4"
              className="w-full h-full object-cover"
              playsInline
              loop
              muted={isMuted}
              autoPlay
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={() => {
                console.log("Uploaded video was not found or is currently unavailable. Rendering high-fidelity custom SVG assistant space fallbacks.");
                setVideoError(true);
              }}
            />
          )}

        </div>

        {/* Video Player Bottom Control Overlay Panel */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4 select-none relative z-10 w-full text-white">
          <div className="flex items-center gap-4 pl-1">
            <button 
              onClick={handlePlayPause}
              className="p-3 bg-white/5 hover:bg-white/15 rounded-xl border border-white/10 active:scale-95 transition-all text-amber-500"
              title={isPlaying ? 'Pause presentation video' : 'Play presentation video'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            {!videoError && (
              <button 
                onClick={handleMuteUnmute}
                className="p-3 bg-white/5 hover:bg-white/15 rounded-xl border border-white/10 active:scale-95 transition-all text-gray-300"
                title={isMuted ? 'Unmute presentation sound' : 'Mute presentation sound'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 pr-1">
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 py-1.5 px-3 rounded-xl text-[10px] font-mono text-gray-400">
              <Shield className="w-3.5 h-3.5 text-amber-500" /> High-Intensity Stream Security
            </div>

            <button 
              onClick={handleFullscreen}
              className="p-3 bg-white/5 hover:bg-white/15 rounded-xl border border-white/10 active:scale-95 transition-all text-gray-300"
              title="Toggle fullscreen player"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
