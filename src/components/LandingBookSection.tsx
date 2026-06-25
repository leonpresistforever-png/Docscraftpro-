import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { PenTool, Shield, Sparkles, Lock, Unlock, Key, FileCheck, Check, Plus, AlertCircle, Heart } from 'lucide-react';

export function LandingBookSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end start"]
  });

  // Spread the page turns out over a longer scroll
  const pageTurn1 = useTransform(scrollYProgress, [0.05, 0.2], [0, -170], { clamp: true });
  const pageTurn2 = useTransform(scrollYProgress, [0.15, 0.3], [0, -170], { clamp: true });
  const pageTurn3 = useTransform(scrollYProgress, [0.25, 0.4], [0, -170], { clamp: true });
  const pageTurn4 = useTransform(scrollYProgress, [0.35, 0.5], [0, -170], { clamp: true });

  // Dynamically fade turning pages past their perpendicular threshold so they do not stack as blank blocks on the right
  const pageOpacity1 = useTransform(scrollYProgress, [0.05, 0.11, 0.14, 0.2], [1, 1, 0, 0], { clamp: true });
  const pageOpacity2 = useTransform(scrollYProgress, [0.15, 0.21, 0.24, 0.3], [1, 1, 0, 0], { clamp: true });
  const pageOpacity3 = useTransform(scrollYProgress, [0.25, 0.31, 0.34, 0.4], [1, 1, 0, 0], { clamp: true });
  const pageOpacity4 = useTransform(scrollYProgress, [0.35, 0.41, 0.44, 0.5], [1, 1, 0, 0], { clamp: true });

  // Pen movements (smoother tracking)
  const pencilX = useTransform(scrollYProgress, [0.1, 0.45], [0, 200], { clamp: true });
  const pencilY = useTransform(scrollYProgress, [0.1, 0.2, 0.3, 0.4, 0.45], [0, 10, -5, 10, 0], { clamp: true });
  
  // Reveal writing text
  const textOpacity = useTransform(scrollYProgress, [0.12, 0.35], [0, 1], { clamp: true });

  // Safe lock & custom thought state
  const [vaultLocked, setVaultLocked] = useState(true);
  const [spinClass, setSpinClass] = useState(false);
  const [userThought, setUserThought] = useState('');
  const [thoughtsInVault, setThoughtsInVault] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dc_vault_thoughts');
      if (saved) return JSON.parse(saved);
    } catch (err) {}
    return [
      "Expressing my creative milestones and document layouts daily.",
      "Drafting the comprehensive guide to docscraft database queries.",
      "My private goals tracking: consistency, high-fidelity designs, growth."
    ];
  });
  const [addSuccess, setAddSuccess] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('dc_vault_thoughts', JSON.stringify(thoughtsInVault));
    } catch (err) {}
  }, [thoughtsInVault]);

  const handleDialClick = () => {
    setSpinClass(true);
    setTimeout(() => {
      setVaultLocked(!vaultLocked);
      setSpinClass(false);
    }, 850);
  };

  const handleCommitThought = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userThought.trim()) return;
    setThoughtsInVault(prev => [userThought.trim(), ...prev]);
    setUserThought('');
    setAddSuccess(true);
    setTimeout(() => setAddSuccess(false), 2500);
  };

  return (
    <div ref={containerRef} className="py-20 md:py-32 w-full max-w-7xl mx-auto relative flex flex-col items-center selection:bg-amber-600 selection:text-white">
      
      {/* Background Gradient card cover */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7] via-white to-[#F9F7F1] rounded-[4rem] opacity-90 z-0 border border-[#EBE7DD]/40"></div>

      <div className="relative z-10 w-full flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 gap-16 md:gap-20">
        
        {/* Left Side: Editorial Typography with tracing text hooks */}
        <div className="lg:w-2/5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100/50 rounded-full text-xs font-bold uppercase tracking-widest text-amber-800 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} /> Cohesive Workspace
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-serif text-gray-900 leading-tight">
            A blank canvas <br /> <span className="italic font-light text-amber-600">for your thoughts.</span>
          </h2>
          
          <p className="text-lg text-gray-600 leading-relaxed font-serif">
            Welcome to Docscraft, the creative document writing journey. Write naturally, and watch as your ideas seamlessly organize themselves on the page. Enjoy the freedom of infinite drafting.
          </p>

          <div className="pt-4 border-t border-gray-200/50 flex flex-col gap-4 font-serif">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Zero latency real-time editing & syncing</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Local and Cloud synchronized database redundancy</span>
            </div>
          </div>
        </div>

        {/* Right Side: High Fidelity 3D Turn Book Animation */}
        <div className="lg:w-3/5 w-full flex justify-center relative perspective-[2400px] overflow-visible max-w-full scale-[0.8] xs:scale-95 sm:scale-100 origin-center">
          
          {/* Bigger and thicker custom-styled 3D Book */}
          <div className="w-[320px] sm:w-[480px] md:w-[600px] h-[340px] md:h-[420px] relative transition-transform duration-500 hover:rotate-x-[28deg]" style={{ transformStyle: "preserve-3d", transform: "rotateX(25deg) rotateY(-15deg)" }}>
            
            {/* Book Base (Right fixed page) */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#fdfdfd] shadow-[15px_15px_30px_rgba(0,0,0,0.15)] border border-gray-200 rounded-r-3xl flex flex-col items-center justify-start pt-16 px-6 md:px-12 origin-left">
              <div className="w-full h-full relative">
                
                {/* Fixed Pen Element (Higher resolution styling) */}
                <motion.div 
                   style={{ x: pencilX, y: pencilY }}
                   className="absolute top-12 md:top-20 -left-10 md:left-2 z-50 origin-bottom-left"
                >
                   {/* 3D Stylus / Fountain Pen construct */}
                   <div className="relative w-8 h-36 md:w-10 md:h-44 group drop-shadow-2xl" style={{ transform: 'rotate(-32deg)' }}>
                     {/* Pen Main Body */}
                     <div className="absolute top-0 w-full h-[70%] bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-t-full shadow-inner border border-gray-700/50"></div>
                     <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[2px] h-[58%] bg-white/20"></div>
                     
                     {/* Gold Accent Ring */}
                     <div className="absolute top-[70%] w-full h-[6%] bg-gradient-to-r from-amber-400 via-yellow-250 to-amber-600 shadow-sm"></div>
                     
                     {/* Brushed Gold Pen Base */}
                     <div className="absolute top-[76%] left-[10%] w-[80%] h-[14%] bg-gradient-to-b from-amber-300 to-amber-500"></div>
                     
                     {/* Signature Titanium Gold Pen Tip */}
                     <div className="absolute top-[90%] left-[25%] w-[50%] h-[10%] border-l-[5px] md:border-l-[7px] border-r-[5px] md:border-r-[7px] border-t-[10px] md:border-t-[14px] border-l-transparent border-r-transparent border-t-amber-600 shrink-0"></div>
                   </div>
                </motion.div>
                
                {/* Beautiful handwriting revealed by pen */}
                <motion.div style={{ opacity: textOpacity }} className="text-gray-900 font-serif text-lg md:text-2xl absolute top-16 md:top-24 left-2 pointer-events-none mt-10 leading-relaxed max-w-[250px] z-20">
                   <span className="text-amber-800 font-bold italic tracking-tight">"Welcome to Docscraft.</span> <br /> 
                   <span className="text-[17px] md:text-xl text-gray-600 mt-2 block">The creative document writing journey."</span>
                </motion.div>
                
                {/* Lined paper lines */}
                <div className="absolute inset-x-0 top-0 h-full w-full pointer-events-none opacity-25">
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <div key={idx} className="w-full border-b border-indigo-200 h-6"></div>
                  ))}
                </div>

              </div>
            </div>

            {/* Left fixed page */}
            <div className="absolute top-0 left-0 w-1/2 h-full bg-[#fcfcfc] shadow-[0_15px_30px_rgba(0,0,0,0.1)] border border-gray-200 rounded-l-3xl origin-right"></div>

            {/* Turning Pages */}
            <motion.div style={{ rotateY: pageTurn4, backfaceVisibility: "hidden", opacity: pageOpacity4, willChange: "transform", transformOrigin: "right" }} className="absolute top-0 left-0 w-1/2 h-full bg-white border border-gray-200/40 rounded-l-3xl origin-right z-10 shadow-[inset_-12px_0_25px_rgba(0,0,0,0.02)]"></motion.div>
            <motion.div style={{ rotateY: pageTurn3, backfaceVisibility: "hidden", opacity: pageOpacity3, willChange: "transform", transformOrigin: "right" }} className="absolute top-0 left-0 w-1/2 h-full bg-white border border-gray-200/40 rounded-l-3xl origin-right z-20 shadow-[inset_-12px_0_25px_rgba(0,0,0,0.03)]"></motion.div>
            <motion.div style={{ rotateY: pageTurn2, backfaceVisibility: "hidden", opacity: pageOpacity2, willChange: "transform", transformOrigin: "right" }} className="absolute top-0 left-0 w-1/2 h-full bg-white border border-gray-200/40 rounded-l-3xl origin-right z-30 shadow-[inset_-12px_0_20px_rgba(0,0,0,0.04)]"></motion.div>
            
            {/* Front Page with initial mock chapter contents */}
            <motion.div 
               style={{ rotateY: pageTurn1, backfaceVisibility: "hidden", opacity: pageOpacity1, willChange: "transform", transformOrigin: "right" }} 
               className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-gray-50 to-white shadow-[-6px_0_25px_rgba(0,0,0,0.08)] border border-gray-200 rounded-l-3xl origin-right z-40 p-6 md:p-10 overflow-hidden flex flex-col justify-center"
            >
               <h3 className="font-serif font-black text-2xl mb-4 text-amber-900">Chapter 1</h3>
               <div className="w-full h-3 bg-gray-200 rounded-full mb-4 w-3/4"></div>
               <div className="w-full h-3 bg-gray-150 rounded-full mb-4 w-full"></div>
               <div className="w-full h-3 bg-gray-150 rounded-full mb-4 w-5/6"></div>
               <div className="w-full h-3 bg-gray-150 rounded-full mb-4 w-full"></div>
            </motion.div>

            {/* Book Spine Center */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-full bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 z-50 shadow-[inset_0_0_12px_rgba(0,0,0,0.2)] rounded-full blur-[1px]"></div>
          </div>

        </div>
      </div>

      {/* UNIQUE EXPANDED WORKSPACE COMPONENT (NO BLANK PAGES - EXPANDS FLUIDLY WITH DYNAMIC TEXT CHROMALINE EFFECTS) */}
      <div className="w-full px-6 md:px-12 mt-28 z-10 relative">
        
        {/* Dynamic Glow Line Accent */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-300 to-transparent mb-16"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Left Block: Narrative text with custom Coloring & Transition Effects */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <span className="text-xs uppercase tracking-widest font-black text-amber-700 font-sans flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span> Real-time Encryption Vault
            </span>

            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-serif font-black text-gray-900 leading-tight">
                Private Vault Of Thoughts
              </h3>
              
              {/* Highlight word-by-word hovering coloring transition block */}
              <p className="text-xl md:text-2xl leading-relaxed text-gray-700 font-serif font-light">
                {"Welcome to creative writing of documents and PDFs, this is your personal private vault always here for you and for your thoughts. Express your thoughts, goals, and anything securely and safely in your private vault of thoughts in Docscraft.".split(' ').map((word, idx) => {
                  const isSpecial = ["private", "vault", "thoughts.", "securely", "safely", "documents", "PDFs,", "Docscraft."].includes(word);
                  return (
                    <span 
                      key={idx} 
                      className={`inline-block mr-1.5 transition-all duration-300 hover:scale-105 select-none ${
                        isSpecial ? 'text-amber-700 font-bold drop-shadow-sm hover:text-amber-500 hover:shadow-amber-500/10' : 'hover:text-black hover:font-normal'
                      }`}
                    >
                      {word}
                    </span>
                  );
                })}
              </p>

              <blockquote className="border-l-4 border-amber-600 pl-4 py-1 italic text-[#6B5A3E] text-lg font-serif">
                "Creativity should be expressed to be remembered, otherwise it would be forgotten. Write your thoughts to stay on track..."
              </blockquote>
            </div>

            {/* Tracing Badge Indicator */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="px-4 py-2 bg-white rounded-xl border border-gray-150 shadow-md flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-gray-700 font-sans">SHA-256 Cloud Encryption</span>
              </div>
              <div className="px-4 py-2 bg-white rounded-xl border border-gray-150 shadow-md flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-gray-700 font-sans">Immediate Autolocal Cache</span>
              </div>
            </div>
          </div>

          {/* Right Block: Interactive mechanical safe lock & commitment panel */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#1C1C1C] to-[#2D2D2D] text-white rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-between shadow-2xl relative border border-white/10 overflow-hidden transform-style-[preserve-3d]">
            <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            
            {/* Safe mechanical dial & lock panel */}
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${vaultLocked ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'} border ${vaultLocked ? 'border-red-500/20' : 'border-emerald-500/20'}`}>
                  {vaultLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#B5B5B5]">Vault Status</h4>
                  <p className="text-xs font-mono font-bold text-[#D4AF37]">{vaultLocked ? 'LOCKED AND CRYPTO-ENCRYPTED' : 'READY TO WRITE / ACCESS OPEN'}</p>
                </div>
              </div>
              
              <button 
                onClick={handleDialClick}
                className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 text-[10px] uppercase font-mono tracking-wider font-bold rounded-lg transition-all flex items-center gap-1.5"
                title="Spin the vault lock combination dial"
              >
                <Key className="w-3 h-3 text-amber-400" /> {vaultLocked ? 'Unlock' : 'Lock'}
              </button>
            </div>

            {/* Interactive Mechanical CSS-drawn Spin Dial */}
            <div className="flex flex-col items-center justify-center py-6 relative z-10 select-none">
              <div 
                onClick={handleDialClick}
                className={`w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-b from-[#2B2B2B] to-[#121212] border-4 border-[#D4AF37] shadow-xl flex items-center justify-center cursor-pointer transition-transform relative ${spinClass ? 'animate-spin' : 'hover:scale-105'}`}
                style={{ transform: spinClass ? 'rotate(360deg)' : 'none', animationDuration: '0.8s' }}
              >
                {/* Notch lines around dial dial */}
                <div className="absolute inset-0.5 rounded-full border border-white/10 border-dashed"></div>
                <div className="absolute w-[2px] h-3 bg-[#D4AF37] top-1"></div>
                <div className="absolute w-[2px] h-3 bg-[#D4AF37] bottom-1"></div>
                <div className="absolute h-[2px] w-3 bg-[#D4AF37] left-1"></div>
                <div className="absolute h-[2px] w-3 bg-[#D4AF37] right-1"></div>
                
                {/* Inner dial knob */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#1E1E1E] to-[#0A0A0A] rounded-full border border-white/20 shadow-inner flex items-center justify-center">
                  <div className={`p-1.5 rounded-full ${vaultLocked ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {vaultLocked ? <Lock className="w-5 h-5 md:w-6 md:h-6" /> : <Unlock className="w-5 h-5 md:w-6 md:h-6" />}
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 font-mono tracking-widest mt-3 uppercase">Click Dial to Rotate Mechanism</p>
            </div>

            {/* User Real-time Interactive Thought Committer */}
            <div className="mt-4 relative z-10 bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#A2A2A2]">SECURE STORAGE MEMORY</span>
                <span className="text-[#D4AF37] font-bold">{thoughtsInVault.length} Items</span>
              </div>

              {vaultLocked ? (
                <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-red-400 mx-auto animate-bounce" />
                  <p className="text-xs text-red-300">Vault mechanism is currently encrypted.</p>
                  <button 
                    onClick={handleDialClick}
                    className="text-xs font-bold text-amber-400 underline hover:text-amber-300 block mx-auto"
                  >
                    Unlock dial to commit thoughts
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCommitThought} className="space-y-3">
                  <div className="relative">
                    <input 
                      type="text"
                      maxLength={140}
                      value={userThought}
                      onChange={e => setUserThought(e.target.value)}
                      className="w-full bg-[#0E0E0E] text-white px-3.5 py-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      placeholder="Write your creative target or personal thought here..."
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Stamp & Encrypt Goal
                  </button>
                </form>
              )}

              {/* Feed of thoughts residing inside the vault */}
              <div className="max-h-[140px] overflow-y-auto space-y-2 pt-2 scrollbar-thin">
                <AnimatePresence>
                  {thoughtsInVault.map((t, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-2.5 bg-black/40 border border-white/5 rounded-xl text-xs text-gray-300 font-serif leading-relaxed flex items-start gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {addSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 p-2 text-center text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Encrypted & added to Cloud Vault successfully!
                </motion.div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
