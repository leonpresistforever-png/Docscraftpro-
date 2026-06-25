import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { SupportFormPage } from './SupportFormPage';
import { ZendeskSupportForm } from '../components/ZendeskSupportForm';
import { Mail, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ContactPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item: any = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 pt-24 flex flex-col justify-between selection:bg-[#D4AF37] selection:text-white">
      <Navbar />

      <main className="w-full max-w-[1100px] mx-auto px-6 py-12 flex-1">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct contact info & Commitments */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-8">
            <motion.div variants={item} initial="hidden" animate="show">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-800 font-bold uppercase tracking-widest mb-3">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                Support Matrix
              </div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[#1a1a1a] font-serif mb-4">
                Contact Us
              </h1>
              <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                Whether you encounter a rendering bug, need help compiling a complex structure, or want to discuss enterprise features, our dedicated human support desk is standing by.
              </p>
            </motion.div>

            {/* Direct Cards */}
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
              <motion.div variants={item} className="flex gap-4 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 border border-amber-200">
                  <Mail className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Digital Support Center</h4>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1">
                    Submit file attachments, pictures, and multi-format document packages natively using our internal ticket transmitter below. All files are encrypted up to 2.5MB.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={item} className="flex gap-4 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 border border-amber-200">
                  <Clock className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Response Window</h4>
                  <span className="inline-block text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded mt-0.5">
                    Within 24 to 48 business hours
                  </span>
                  <p className="text-xs text-gray-400 mt-1">Our average response speed for standard tickets is less than 6 hours.</p>
                </div>
              </motion.div>

              <motion.div variants={item} className="flex gap-4 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 border border-amber-200">
                  <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Security & Integrity</h4>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1">
                    All support requests are routed privately over SSL channels. We never request passwords or private API key tokens.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column: Dynamic Form Block */}
          <div className="lg:col-span-12 xl:col-span-7">
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm w-full">
              <h3 className="text-lg font-black uppercase text-[#1a1a1a] mb-4 font-sans tracking-wide">
                Submit an Issue Ticket
              </h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Please complete the registry fields below. This connects cleanly to our background event framework for instant validation routing.
              </p>

              <SupportFormPage isEmbedded={true} hideCategorySelector={true} defaultCategory="general" />
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
