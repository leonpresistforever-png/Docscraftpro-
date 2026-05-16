import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { motion } from 'motion/react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-dc-text pt-24 overflow-hidden">
      <Navbar />
      <main className="w-full max-w-[1000px] mx-auto px-6 py-20 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-black mb-6 uppercase tracking-tight text-[#1a1a1a]">Designing the Future of Text</h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto font-medium">
             We aren't just building a text editor. We're forging an entirely new paradigm for knowledge workers, authors, and visionaries.
          </p>
        </motion.div>
        
        <div className="space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white p-10 md:p-14 rounded-[2rem] border border-[#E4DBC5] shadow-xl shadow-amber-50/50"
          >
             <h2 className="text-3xl font-black text-[#1a1a1a] mb-6 uppercase tracking-wide">The Genesis of DocCraft</h2>
             <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
               <p>
                 I am a solo founder. Countless ideas are lost every day simply because the tools we use to capture them are fundamentally broken. I noticed that modern document applications suffered from one of two fatal flaws: they were either overly simplistic note-taking toys that lacked the power required for serious work, or they were bloated, archaic desktop behemoths that stifled creativity with their rigid, unforgiving architectures. 
               </p>
               <p>
                 DocCraft was born from a singular, obsessive vision: to bridge this chasm. I set out to create an uncompromising workspace that feels as fluid and intuitive as an artist's sketchbook, yet houses the computational rigor and advanced artificial intelligence required by modern engineering, financial modeling, and academic publishing. I believe that your tools should never dictate the boundaries of your imagination.
               </p>
             </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="grid md:grid-cols-2 gap-8"
          >
             <div className="bg-indigo-950 p-10 rounded-[2rem] text-indigo-50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
               <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-widest text-indigo-300">Our Core Philosophy</h3>
               <p className="leading-relaxed opacity-90 text-lg">
                 Intelligence should be woven into the very fabric of the canvas, not treated as an afterthought. Every feature in DocCraft—from our zero-latency AI writing assistant to our dynamic manga-style layout engine—is thoughtfully engineered to augment human potential without ever interrupting the pure flow state of creation.
               </p>
             </div>
             <div className="bg-amber-100 p-10 rounded-[2rem] text-[#4a3f2c] border border-amber-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
               <h3 className="text-2xl font-black text-[#1a1a1a] mb-4 uppercase tracking-widest text-amber-900">Uncompromising Craft</h3>
               <p className="leading-relaxed opacity-90 text-lg">
                 We sweat the microscopic details. We care deeply about the exact bezier curve of a selection handle, the typographic rhythm of a mathematical equation, and the tactile responsiveness of inserting a block. Because when software is crafted with profound love and respect, you can feel it in every keystroke.
               </p>
             </div>
          </motion.div>
        </div>
      </main>
      <footer className="bg-white pt-12 pb-12 border-t border-[#E4DBC5]">
        <div className="max-w-[1400px] mx-auto px-6 text-center text-sm text-gray-400 font-medium">
           <p>&copy; {new Date().getFullYear()} DocCraft Inc. Engineered to perfection.</p>
        </div>
      </footer>
    </div>
  );
}
