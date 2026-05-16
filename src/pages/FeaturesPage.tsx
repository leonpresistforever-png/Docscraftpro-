import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { motion } from 'motion/react';
import { Sparkles, PenTool, LayoutDashboard, BrainCircuit } from 'lucide-react';

export function FeaturesPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-dc-text pt-24 overflow-hidden">
      <Navbar />
      <main className="w-full max-w-[1200px] mx-auto px-6 py-20 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-dc-gold/10 text-dc-gold text-sm font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-4 h-4" /> Unparalleled Power
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tight text-[#1a1a1a]">Featuring Next-Gen <br/> Document Architecture</h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-medium">
             A masterclass in software engineering. Everything you need to write, edit, and orchestrate complex ideas, built with uncompromising speed and fluidity.
          </p>
        </motion.div>
        
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
           <motion.div variants={item} className="bg-white p-10 rounded-[2rem] border border-[#E4DBC5] shadow-xl shadow-amber-50/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform">
                 <PenTool className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-[#1a1a1a] mb-4 uppercase tracking-wide">Pro-Grade Editing Engine</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                Beneath our minimalist interface lies a powerhouse rendering engine. DocCraft handles complex nested tables, mathematical equations via KaTeX, dynamic inline logic statements, and massive documents without dropping a single frame. Enjoy buttery-smooth scrolling and instantaneous text formatting.
              </p>
           </motion.div>

           <motion.div variants={item} className="bg-indigo-950 p-10 rounded-[2rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group text-indigo-50">
              <div className="w-14 h-14 bg-indigo-900/50 rounded-2xl flex items-center justify-center text-indigo-300 mb-8 group-hover:scale-110 transition-transform">
                 <BrainCircuit className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-wide">Zero-Latency AI Intelligence</h2>
              <p className="text-indigo-200/80 leading-relaxed text-lg">
                We've integrated an advanced local WebLLM engine directly into your browser. Experience grammar correction, tone adjustment, automatic summarization, and context-aware expansion that processes in real-time, completely offline, ensuring your private drafts never leave your machine.
              </p>
           </motion.div>

           <motion.div variants={item} className="bg-white p-10 rounded-[2rem] border border-[#E4DBC5] shadow-xl shadow-amber-50/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-8 group-hover:scale-110 transition-transform">
                 <LayoutDashboard className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-[#1a1a1a] mb-4 uppercase tracking-wide">Manga & Freeform Canvas</h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                Break free from the rigid constraints of endless scrolling text. Our revolutionary Manga Panel architecture allows you to create dynamic, comic-book style grid layouts. Clip drawings precisely into frames, or use Clipper Studio to float watermark sketches anywhere on the page.
              </p>
           </motion.div>
        </motion.div>
      </main>
      <footer className="bg-white pt-12 pb-12 border-t border-[#E4DBC5]">
        <div className="max-w-[1400px] mx-auto px-6 text-center text-sm text-gray-400 font-medium">
           <p>&copy; {new Date().getFullYear()} DocCraft Inc. The Ultimate Text Tool.</p>
        </div>
      </footer>
    </div>
  );
}
