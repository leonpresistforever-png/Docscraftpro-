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
                   className="absolute top-12 md:top-20 -left-10 md:left-2 z-50 origin-bottom-left transition-transform duration-300 hover:scale-110 cursor-pointer"
                >
                   {/* 3D Stylus / Fountain Pen construct */}
                   <div className="relative w-8 h-36 md:w-10 md:h-44 group drop-shadow-[0_15px_15px_rgba(0,0,0,0.4)] hover:drop-shadow-[0_20px_30px_rgba(212,175,55,0.4)] transition-all duration-300" style={{ transform: 'rotate(-32deg)', transformStyle: "preserve-3d" }}>
                     {/* Pen Main Body */}
                     <div className="absolute top-0 w-full h-[70%] bg-gradient-to-r from-gray-900 via-gray-700 to-black rounded-t-full shadow-[inset_4px_0_10px_rgba(255,255,255,0.2)] border border-gray-600"></div>
                     <div className="absolute top-4 left-[20%] w-[15%] h-[58%] bg-gradient-to-b from-white/40 to-transparent rounded-full filter blur-[1px]"></div>
                     
                     {/* Gold Accent Ring */}
                     <div className="absolute top-[70%] w-full h-[6%] bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-600 shadow-[0_2px_5px_rgba(0,0,0,0.5)]"></div>
                     <div className="absolute top-[72%] w-full h-[1px] bg-white/50"></div>
                     
                     {/* Brushed Gold Pen Base */}
                     <div className="absolute top-[76%] left-[10%] w-[80%] h-[14%] bg-gradient-to-r from-amber-600 via-amber-300 to-amber-700 rounded-b-sm shadow-[inset_2px_0_5px_rgba(255,255,255,0.4)]"></div>
                     
                     {/* Signature Titanium Gold Pen Tip */}
                     <div className="absolute top-[90%] left-[25%] w-[50%] h-[10%] border-l-[5px] md:border-l-[7px] border-r-[5px] md:border-r-[7px] border-t-[10px] md:border-t-[14px] border-l-transparent border-r-transparent border-t-amber-500 filter drop-shadow-md"></div>
                     
                     {/* Nib highlight line */}
                     <div className="absolute top-[90%] left-[45%] w-[10%] h-[8%] bg-white/40 rotate-[15deg]"></div>
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
            <motion.div style={{ rotateY: pageTurn4, opacity: pageOpacity4, willChange: "transform", transformOrigin: "right" }} className="absolute top-0 left-0 w-1/2 h-full bg-white border border-gray-200/40 rounded-l-3xl origin-right z-10 shadow-[inset_-12px_0_25px_rgba(0,0,0,0.02)]"></motion.div>
            <motion.div style={{ rotateY: pageTurn3, opacity: pageOpacity3, willChange: "transform", transformOrigin: "right" }} className="absolute top-0 left-0 w-1/2 h-full bg-white border border-gray-200/40 rounded-l-3xl origin-right z-20 shadow-[inset_-12px_0_25px_rgba(0,0,0,0.03)]"></motion.div>
            <motion.div style={{ rotateY: pageTurn2, opacity: pageOpacity2, willChange: "transform", transformOrigin: "right" }} className="absolute top-0 left-0 w-1/2 h-full bg-white border border-gray-200/40 rounded-l-3xl origin-right z-30 shadow-[inset_-12px_0_20px_rgba(0,0,0,0.04)]"></motion.div>
            
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

          </div>
  );
}