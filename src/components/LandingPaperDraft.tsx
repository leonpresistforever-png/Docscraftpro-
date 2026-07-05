import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Sparkles, Wand2, Edit, ChevronRight, Check, Save } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

const DRAFT_TEMPLATES = [
  {
    icon: "🎯",
    label: "Today's Goals",
    text: "My main focus for today is to outline the new strategy, complete the weekly review, and spend time reading. I will approach these tasks with clarity and calm.",
    signature: "Daily Planner",
    isEditable: false
  },
  {
    icon: "✨",
    label: "Morning Quote",
    text: "The secret of getting ahead is getting started. Break your complex overwhelming tasks into small manageable tasks, and then start on the first one.",
    signature: "Morning Inspiration",
    isEditable: false
  },
  {
    icon: "📝",
    label: "Custom Draft",
    text: "Type your own daily goals, tasks, or thoughts here...",
    signature: "Your Name",
    isEditable: true
  }
];

export function LandingPaperDraft() {
  const [dbDrafts, setDbDrafts] = useState<any[]>([]);
  
  const allTemplates = [
    ...DRAFT_TEMPLATES,
    ...dbDrafts
  ];

  const [activeTemplateIdx, setActiveTemplateIdx] = useState(0);
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customText, setCustomText] = useState(DRAFT_TEMPLATES[2].text);
  const [customName, setCustomName] = useState(DRAFT_TEMPLATES[2].signature);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'paper_drafts'), orderBy('createdAt', 'desc'), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedDrafts = snapshot.docs.map(doc => ({
        id: doc.id,
        icon: "☁️",
        label: "Community Draft",
        text: doc.data().text,
        signature: doc.data().signature || "Anonymous",
        isEditable: false,
        ...doc.data()
      }));
      setDbDrafts(fetchedDrafts);
    }, (error) => {
      console.warn("Could not fetch community drafts (this is expected if rules are still propagating):", error);
    });
    return () => unsubscribe();
  }, []);

  // Progressive typewriter writing effect (Word by word)
  useEffect(() => {
    let timer: any = null;
    const currentTemplate = allTemplates[activeTemplateIdx];
    if (!currentTemplate) return;
    
    const textToType = currentTemplate.isEditable ? customText : currentTemplate.text;
    const targetWords = textToType.split(' ');
    
    // Clear previous draft text
    setDisplayedWords([]);
    
    if (currentTemplate.isEditable) {
       setDisplayedWords(targetWords);
       setIsTyping(false);
       return;
    }
    
    setIsTyping(true);
    
    // Smoothly type word-by-word
    timer = setInterval(() => {
      setDisplayedWords(prev => {
        if (prev.length >= targetWords.length) {
          clearInterval(timer);
          setIsTyping(false);
          return prev;
        }
        return targetWords.slice(0, prev.length + 1);
      });
    }, 120); // Smooth organic speed

    return () => clearInterval(timer);
  }, [activeTemplateIdx, allTemplates.length]); // We don't re-run this on customText change to avoid re-typing while user types

  const handleCopy = () => {
    const currentTemplate = allTemplates[activeTemplateIdx];
    const textToCopy = currentTemplate.isEditable ? customText : currentTemplate.text;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveDraft = async () => {
    if (!customText.trim()) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'paper_drafts'), {
        text: customText,
        signature: customName,
        createdAt: serverTimestamp(),
        ownerId: auth.currentUser?.uid || 'anonymous'
      });
      // Clear custom text after saving so they can write another one
      setCustomText('');
      setCustomName('Your Name');
    } catch (error) {
      console.error("Error saving draft: ", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="py-16 w-full max-w-7xl mx-auto px-6 md:px-12 relative z-10 selection:bg-amber-600 selection:text-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* LEFT COLUMN: Delicate interactive parchment paper component (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          
          {/* Virtual 3D thin paper sheet wrapper */}
          <div className="w-full max-w-2xl relative" style={{ perspective: "1500px" }}>
            
            {/* Soft parchment drop shadow stacking back pages */}
            <div className="absolute top-2 left-2 inset-0 bg-[#fbf9f4] border border-[#e8dfc7] rounded-3xl shadow-sm z-0 transform rotate-1"></div>
            <div className="absolute top-1 left-1 inset-0 bg-[#FAF7EE] border border-[#e8dfc7] rounded-3xl shadow-sm z-10 transform -rotate-1"></div>

            {/* Main Deluxe Parchment Sheet */}
            <div 
              className="w-full min-h-[420px] bg-gradient-to-b from-[#FAF8F5] via-[#FAF6ED] to-[#F5F1E5] border-2 border-[#E3D8BA] rounded-[2rem] p-8 md:p-12 shadow-[0_15px_30px_rgba(130,110,80,0.12)] relative z-20 overflow-hidden transform hover:scale-[1.01] transition-transform duration-500 flex flex-col"
              style={{ backgroundImage: 'radial-gradient(#AA88440A 1px, transparent 1px)', backgroundSize: '16px 16px' }}
            >
              {/* Delicate thin vertical margin rule line */}
              <div className="absolute left-8 md:left-12 top-0 bottom-0 w-[1.5px] bg-[#E3B094]/45 pointer-events-none"></div>

              {/* Lined paper fine guidelines */}
              <div className="absolute inset-x-0 top-0 h-full w-full pointer-events-none opacity-[0.14] select-none">
                {Array.from({ length: 18 }).map((_, idx) => (
                  <div key={idx} className="w-full border-b border-stone-800 h-7"></div>
                ))}
              </div>

              {/* Interactive Writing Area */}
              <div className="relative pl-6 md:pl-10 h-full flex flex-col justify-between font-serif z-10 flex-1">
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] tracking-widest font-mono text-[#D4AF37] font-semibold uppercase">{allTemplates[activeTemplateIdx]?.label || 'Draft'}</span>
                    <span className="text-xs text-gray-400 italic">Page 01</span>
                  </div>

                  {/* Progressive Text Input Block */}
                  <div className="text-stone-900 text-sm md:text-base leading-[1.8] font-serif font-medium tracking-wide min-h-[220px] cursor-text relative overflow-y-auto overflow-x-hidden break-words w-full pr-4 flex-1">
                    {allTemplates[activeTemplateIdx]?.isEditable ? (
                       <textarea 
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          className="w-full h-full min-h-[160px] bg-transparent resize-none outline-none text-stone-900 placeholder:text-stone-400 break-words"
                          placeholder="Write your custom goals..."
                          autoFocus
                       />
                    ) : (
                      <div className="whitespace-pre-wrap break-words inline">
                        {displayedWords.map((word, idx) => (
                          <span
                            key={`${activeTemplateIdx}-${idx}`}
                            className="inline-block mr-1 mb-1"
                          >
                            {word}
                          </span>
                        ))}
                        {isTyping && (
                          <motion.span 
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="inline-block w-[2px] h-4 ml-0.5 bg-amber-600 align-middle mb-1"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Floating Handwritten Style Signature */}
                <div className="mt-8 flex justify-between items-end border-t border-[#E3D8BA]/70 pt-4">
                  <div className="text-[10px] text-gray-400 font-mono flex items-center gap-4">
                    Docscraft Sovereign Archive
                    {allTemplates[activeTemplateIdx]?.isEditable && customText.trim() && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          saveDraft();
                        }}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37] text-white rounded-md text-xs font-bold hover:bg-[#b59223] transition-colors uppercase tracking-wider disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Draft'}
                      </button>
                    )}
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={isTyping ? {} : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="font-serif italic text-base md:text-lg text-amber-700 font-semibold pr-2 select-none"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    ~ {allTemplates[activeTemplateIdx]?.isEditable ? (
                       <input 
                         type="text" 
                         value={customName} 
                         onChange={(e) => setCustomName(e.target.value)}
                         className="bg-transparent border-b border-transparent focus:border-amber-300 outline-none text-right w-32 text-amber-700 placeholder:text-amber-300/50"
                         placeholder="Your Name"
                       />
                    ) : (
                      allTemplates[activeTemplateIdx]?.signature
                    )}
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
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest font-black text-amber-700 font-sans flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-500" style={{ animationDuration: '5s' }} /> Tactile Paper Drafts
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-serif font-black text-gray-950 leading-tight">
              Delicate Parchment <br /> Writing Workspace.
            </h3>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed font-serif">
              Docscraft replicates the physical comfort of paper within browser borders. Toggle prompt templates below to watch characters write progressively with beautiful typography transitions:
            </p>
          </div>

          {/* Template select grid buttons */}
          <div className="space-y-3 pt-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {allTemplates.map((tpl, idx) => {
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
