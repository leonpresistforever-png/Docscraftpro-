import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { motion } from 'motion/react';
import { BookOpen, Award, Sparkles, Server } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 pt-24 flex flex-col justify-between">
      <Navbar />

      <main className="w-full max-w-[1000px] mx-auto px-6 py-12 flex-1">
        
        {/* Masthead Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16 border-b border-gray-200 pb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-800 font-bold uppercase tracking-widest mb-4 font-sans justify-center">
            <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
            Authoritative Profile (E-E-A-T)
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tight text-[#1a1a1a] font-serif">
            About DocCraft Pro
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium">
            Bridging text manipulation with algorithmic power. We craft uncompromising tools tailored for authors, engineers, and digital curators.
          </p>
        </motion.div>

        {/* Multi-grid Core Elements */}
        <div className="space-y-10">
          
          {/* Mission & Vision Section */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white p-8 md:p-10 rounded-2xl border border-gray-200 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-[#D4AF37]" />
              <h2 className="text-2xl font-black text-[#1a1a1a] uppercase tracking-wide font-serif">
                Our Editorial & Tool Mission Statement
              </h2>
            </div>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              DocCraft Pro is dedicated to engineer and deliver specialized text manipulation utilities, high-performance document processing solutions, and seamless analytical productivity tools. We operate on a core guideline: that document compiling should be accessible, lightning-efficient, and visually spectacular. By providing deep-dive technical publications and browser-based converters, we empower technical operators globally to orchestrate files cleanly.
            </p>
          </motion.div>

          {/* Value Proposition & Trustworthiness */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="grid md:grid-cols-2 gap-6"
          >
            <div className="bg-indigo-950 p-8 rounded-2xl text-indigo-50 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-indigo-300" />
                  <h3 className="text-lg font-black uppercase text-indigo-300 tracking-wider">
                    Our No-Paywall Value Proposition
                  </h3>
                </div>
                <p className="text-xs md:text-sm leading-relaxed opacity-90">
                  Our application delivers fully operational tools natively in-browser. We solve difficult real-world data issues—such as multi-column PDF layouts, OCR scans, and mathematical charts—directly on our front end without setting up hidden paywalls, subscription cliffs, or processing fees. You get full utility, whenever you need it.
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Server className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="text-lg font-black uppercase text-[#1a1a1a] tracking-wider">
                    Privacy First Architecture
                  </h3>
                </div>
                <p className="text-xs md:text-sm leading-relaxed text-gray-600">
                  By employing client-side processing, WebAssembly engines, and localized sandboxes, we ensure user data rarely touches cloud caches. We guarantee an uncompromising privacy stance, giving you complete domain over your personal files.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Expert Profiles */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-[#FAF9F6] p-8 rounded-2xl border border-gray-200 shadow-inner"
          >
            <h3 className="text-xl font-black text-[#1a1a1a] mb-4 uppercase tracking-wider font-serif">
              The Engineering Team & Creator Profiles
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Our core development team consists of seasoned software engineers, data architects, and user experience specialists with decades of combined experience in data parsing and compiler optimizations. Specializing in advanced document schemas and visual layouts, our engineers are authors of popular text tokenizers and layout converters. Together, we sustain DocCraft Pro as a beacon of high-quality software, ensuring we deliver peerless digital processing assets.
            </p>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
