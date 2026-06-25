import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Sparkles, Wand2, Edit, ChevronRight, Check } from 'lucide-react';

const DRAFT_TEMPLATES = [
  {
    icon: "📜",
    label: "Creative Vision Letter",
    text: "Docscraft Pro enables a complete sovereign writing journey. I express my targets daily with persistent cache layers, drafting beautiful journals and outlines comfortably without formatting friction.",
    signature: "The Creative Architect"
  },
  {
    icon: "🖋️",
    label: "Milestones Summary",
    text: "June 22, 2026: Resolved the multi-dimensional 3D viewport overlaps, consolidated live tracking stopwatch mechanisms, and integrated robust context subscriptions for instantaneous profile card validation.",
    signature: "Staff Engineer Logs"
  },
  {
    icon: "💭",
    label: "Zen Draft Focus",
    text: "Deep work demands an quiet landscape. Free your attention from clutter and telemetry. Write code cleanly, style elements beautifully, and maintain absolute structural clarity over your documents.",
    signature: "Mindfulness Chapter 1"
  }
];

export function LandingPaperDraft() {
  const [activeTemplateIdx, setActiveTemplateIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);

  // Progressive typewriter writing effect
  useEffect(() => {
    let timer: any = null;
    const targetText = DRAFT_TEMPLATES[activeTemplateIdx].text;
    
    // Clear previous draft text
    setTypedText('');
    setIsTyping(true);
    
    let charIdx = 0;
    
    // Smoothly type character-by-character
    timer = setInterval(() => {
      if (charIdx < targetText.length) {
        setTypedText(prev => prev + targetText.charAt(charIdx));
        charIdx++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 28); // Standard organic speed

    return () => clearInterval(timer);
  }, [activeTemplateIdx]);

  const handleCopy = () => {
    navigator.clipboard.writeText(typedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-16 w-full max-w-7xl mx-auto px-6 md:px-12 relative z-10 selection:bg-amber-600 selection:text-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* LEFT COLUMN: Delicate interactive parchment paper component (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          
          {/* Virtual 3D thin paper sheet wrapper */}
          <div className="w-full max-w-lg relative" style={{ perspective: "1500px" }}>
            
            {/* Soft parchment drop shadow stacking back pages */}
            <div className="absolute top-2 left-2 inset-0 bg-[#fbf9f4] border border-[#e8dfc7] rounded-3xl shadow-sm z-0 transform rotate-1"></div>
            <div className="absolute top-1 left-1 inset-0 bg-[#FAF7EE] border border-[#e8dfc7] rounded-3xl shadow-sm z-10 transform -rotate-1"></div>

            {/* Main Deluxe Parchment Sheet */}
            <div 
              className="w-full min-h-[380px] bg-gradient-to-b from-[#FAF8F5] via-[#FAF6ED] to-[#F5F1E5] border-2 border-[#E3D8BA] rounded-[2rem] p-8 md:p-10 shadow-[0_15px_30px_rgba(130,110,80,0.12)] relative z-20 overflow-hidden transform hover:scale-[1.01] transition-transform duration-500"
              style={{ backgroundImage: 'radial-gradient(#AA88440A 1px, transparent 1px)', backgroundSize: '16px 16px' }}
            >
              {/* Delicate thin vertical margin rule line */}
              <div className="absolute left-8 md:left-12 top-0 bottom-0 w-[1.5px] bg-[#E3B094]/45 pointer-events-none"></div>

              {/* Lined paper fine guidelines */}
              <div className="absolute inset-x-0 top-0 h-full w-full pointer-events-none opacity-[0.14] select-none">
                {Array.from({ length: 15 }).map((_, idx) => (
                  <div key={idx} className="w-full border-b border-stone-800 h-7"></div>
                ))}
              </div>

              {/* Interactive Writing Area */}
              <div className="relative pl-6 md:pl-10 h-full flex flex-col justify-between font-serif z-10">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] tracking-widest font-mono text-[#D4AF37] font-semibold uppercase">{DRAFT_TEMPLATES[activeTemplateIdx].label}</span>
                    <span className="text-xs text-gray-400 italic">Page 01</span>
                  </div>

                  {/* Progressive Text Input Block */}
                  <div className="text-stone-900 text-sm md:text-base leading-[1.8] font-serif font-medium tracking-wide whitespace-pre-wrap min-h-[160px] cursor-text">
                    {typedText}
                    {isTyping && (
                      <motion.span 
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-1.5 h-4.5 ml-0.5 bg-amber-600 align-middle"
                      />
                    )}
                  </div>
                </div>

                {/* Floating Handwritten Style Signature */}
                <div className="mt-8 flex justify-between items-end border-t border-[#E3D8BA]/70 pt-4">
                  <div className="text-[10px] text-gray-400 font-mono">Docscraft Sovereign Archive</div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={isTyping ? {} : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="font-serif italic text-base md:text-lg text-amber-700 font-semibold pr-2 select-none"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    ~ {DRAFT_TEMPLATES[activeTemplateIdx].signature}
                  </motion.div>
                </div>

              </div>

              {/* Ambient ink drops visual decoration */}
              <div className="absolute bottom-2 left-4 w-2 h-2 rounded-full bg-amber-600/5 select-none pointer-events-none"></div>
              <div className="absolute top-1/3 right-8 w-3 h-3 rounded-full bg-amber-600/5 select-none pointer-events-none"></div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Control & Selection Panels (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest font-black text-amber-700 font-sans flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" style={{ animationDuration: '5s' }} /> Tactile Paper Drafts
            </span>
            <h3 className="text-3xl md:text-4xl font-serif font-black text-gray-950 leading-tight">
              Delicate Parchment <br /> Writing Workspace.
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed font-serif">
              Docscraft replicates the physical comfort of paper within browser borders. Toggle prompt templates below to watch characters write progressively with beautiful typography transitions:
            </p>
          </div>

          {/* Template select grid buttons */}
          <div className="space-y-3 pt-2">
            {DRAFT_TEMPLATES.map((tpl, idx) => {
              const isActive = activeTemplateIdx === idx;
              return (
                <button 
                  key={idx}
                  onClick={() => {
                    if (!isTyping) {
                      setActiveTemplateIdx(idx);
                    }
                  }}
                  disabled={isTyping && !isActive}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all outline-none focus:outline-none ${
                    isActive 
                      ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 border-[#D4AF37] text-stone-900 shadow-sm' 
                      : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-500 disabled:opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tpl.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider font-sans text-stone-850">{tpl.label}</h4>
                      <p className="text-stone-500 text-[10px] mt-0.5 truncate max-w-xs">{tpl.text}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-[#D4AF37] transition-transform ${isActive ? 'translate-x-1' : ''}`} />
                </button>
              );
            })}
          </div>

          {/* Auxiliary Action Copy to desk */}
          <div className="flex gap-3 pt-2">
            <button 
              onClick={handleCopy}
              disabled={isTyping}
              className="flex-1 py-3 bg-[#b08d2c] hover:bg-[#9a7b26] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#b08d2c]/40"
            >
              {copied ? <Check className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {copied ? 'Copied Document Draft' : 'Copy Draft Text'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
