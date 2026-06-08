import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { motion } from 'motion/react';
import { 
  PenTool, 
  BrainCircuit, 
  Columns, 
  BarChart3, 
  FileCheck, 
  Table2, 
  History, 
  Paperclip, 
  UserCheck, 
  GitMerge, 
  Trash2, 
  Lock,
  Sparkles
} from 'lucide-react';

export function FeaturesPage() {
  const featuresList = [
    {
      title: "Clean Formatting Engine",
      desc: "Minimalist, frictionless typography sandbox equipped with real-time editing, nested checklists, code blocks with syntax highlighting, and advanced structural formats.",
      icon: <PenTool className="w-5 h-5 text-blue-600" />,
      tag: "CORE EDITOR"
    },
    {
      title: "On-Device AI Assistance",
      desc: "An integrated browser LLM processing directly on your client GPU using WebGPU under WebLLM. Rest assured, your drafts remain entirely local and private.",
      icon: <BrainCircuit className="w-5 h-5 text-indigo-600" />,
      tag: "SECURE AI"
    },
    {
      title: "Manga & Multi-Frame Grid",
      desc: "Break away from a single linear text block. Piece together complex multi-column frames and storyboards using precise manga panel bounding structures.",
      icon: <Columns className="w-5 h-5 text-purple-600" />,
      tag: "LAYOUT CANVAS"
    },
    {
      title: "Inline Recharts & Graphs",
      desc: "Build highly descriptive visual charts (Bar, Line, Pie) dynamically using D3 and Recharts, and store them directly inside your pages.",
      icon: <BarChart3 className="w-5 h-5 text-amber-600" />,
      tag: "DATA GRAPHICS"
    },
    {
      title: "Digital Signatures & Watermarks",
      desc: "Convert text, markdown files, and HTML to clean PDFs. Apply custom watermarks and secure physical digital signatures safely inside your sandbox.",
      icon: <FileCheck className="w-5 h-5 text-emerald-600" />,
      tag: "PDF TOOLKIT"
    },
    {
      title: "AI Tables & Sheets Generator",
      desc: "Instruct your local AI to layout descriptive tables with pipes. Export matrices in standard Markdown formats without building them manually.",
      icon: <Table2 className="w-5 h-5 text-cyan-600" />,
      tag: "DATA MATRICES"
    },
    {
      title: "Automatic Revision Backups",
      desc: "Complete autosaving checkpoints that store content snapshots. View detailed backlogs and easily restore previous document drafts.",
      icon: <History className="w-5 h-5 text-rose-600" />,
      tag: "VERSIONING"
    },
    {
      title: "Robust Media & Web Clipper",
      desc: "Embed rich layouts, drag-and-drop web snapshots, or upload local image assets smoothly with full rendering compliance.",
      icon: <Paperclip className="w-5 h-5 text-orange-600" />,
      tag: "MEDIA IMPORTER"
    },
    {
      title: "Autonomous Action Agent",
      desc: "Deploy client-side self-reflective agents to write out details, structural reviews, or comprehensive summaries recursively.",
      icon: <UserCheck className="w-5 h-5 text-teal-600" />,
      tag: "AUTO ENGINE"
    },
    {
      title: "Mermaid Flow Logic Maps",
      desc: "Illustrate dynamic ideas visually by mapping flow charts and complex relations natively in markdown with full Mermaid compliance.",
      icon: <GitMerge className="w-5 h-5 text-violet-600" />,
      tag: "DIAGRAMS"
    },
    {
      title: "Write Peacefully",
      desc: "Click on the document button to start writing your documents peacefully.",
      icon: <PenTool className="w-5 h-5 text-emerald-600" />,
      tag: "COMPOSER"
    },
    {
      title: "Local E2E AES Encryption",
      desc: "Secure document databases in Firestore using personal, local AES encryption keys to guarantee total private document security.",
      icon: <Lock className="w-5 h-5 text-[#D4AF37]" />,
      tag: "DEEP PRIVACY"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-dc-text pt-24 flex flex-col justify-between">
      <Navbar />
      
      <main className="w-full max-w-[1240px] mx-auto px-6 py-20 pb-32 flex-1">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-dc-gold/10 text-dc-gold text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Capabilities Overview
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tight text-[#1a1a1a] font-serif leading-tight">
            Sophisticated tools, built client-first
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Every feature is executed with pristine layout, typography, and privacy principles in mind. Here is exactly what our document engine can do.
          </p>
        </motion.div>
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featuresList.map((f, i) => (
            <motion.div 
              key={i} 
              variants={item} 
              className="bg-white p-8 rounded-2xl border border-[#E4DBC5] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <header className="flex justify-between items-center mb-6">
                  <div className="w-10 h-10 bg-[#FAF9F6] border border-dc-border rounded-xl flex items-center justify-center group-hover:bg-white group-hover:border-dc-gold transition-colors">
                    {f.icon}
                  </div>
                  <span className="text-[10px] font-bold font-mono tracking-widest text-[#D4AF37] bg-amber-50/50 px-2 py-0.5 rounded border border-amber-200/50">
                    {f.tag}
                  </span>
                </header>
                <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">{f.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
