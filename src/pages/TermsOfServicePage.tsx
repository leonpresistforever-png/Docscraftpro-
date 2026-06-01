import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { motion } from 'motion/react';
import { Gavel, Scale, AlertTriangle, Key } from 'lucide-react';

export function TermsOfServicePage() {
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
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 pt-24 flex flex-col justify-between">
      <Navbar />

      <main className="w-full max-w-[900px] mx-auto px-6 py-12 flex-1">
        <motion.div initial="hidden" animate="show" variants={container} className="space-y-8">
          
          {/* Header Section */}
          <motion.div variants={item} className="border-b border-gray-200 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs text-indigo-800 font-bold uppercase tracking-widest mb-3 font-sans">
              <Gavel className="w-3.5 h-3.5 text-indigo-600" />
              User Agreement
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[#1a1a1a] font-serif">
              Terms of Service
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Last Modified: May 2026 | Effective Date: June 1, 2026</p>
          </motion.div>

          {/* Quick Pillars Grid */}
          <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <Scale className="w-6 h-6 text-indigo-600 mb-2" />
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">Acceptance</h4>
                <p className="text-xs text-gray-500 leading-relaxed">By opening this workspace, you agree to follow our compliance rules.</p>
              </div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <Key className="w-6 h-6 text-indigo-600 mb-2" />
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">Proprietary IP</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Our layout scripts, templates, and algorithms remain our property.</p>
              </div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <AlertTriangle className="w-6 h-6 text-indigo-600 mb-2" />
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">Zero Exploit</h4>
                <p className="text-xs text-gray-500 leading-relaxed">No automated scraping, terminal hacks, or API abuses are tolerated.</p>
              </div>
            </div>
          </motion.div>

          {/* Body Chapters */}
          <div className="prose prose-gray max-w-none text-gray-600 space-y-8 leading-relaxed">

            <motion.section variants={item} className="bg-white p-7 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-indigo-600 font-serif text-lg">01.</span> Acceptance of Terms
              </h2>
              <p className="text-sm">
                Welcome to DocCraft Pro ("Platform"). This Platform is administered as a dynamic web-based productivity workspace toolset. By accessing this software, connecting your authentication profile, or editing documents, you signify that you have read, understood, and agree to stay bound by the terms outlined inside this User Agreement. If you reject these responsibilities, you are forbidden from utilizing our Platform.
              </p>
            </motion.section>

            <motion.section variants={item} className="bg-white p-7 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-indigo-600 font-serif text-lg">02.</span> Intellectual Property (IP) Rights
              </h2>
              <p className="text-sm">
                The total architecture, design presets, software code compilation, responsive grid structures, text databases, system icons, and original vector files housed herein remain the exclusive property of DocCraft Inc.
              </p>
              <p className="text-sm mt-3">
                Users retain absolute copyright over and intellectual possession of all documents, text guides, and logic mappings they author during their active editing workspace sessions. You grant the standard server process hosting permissions solely to load and render this text temporarily for your active sessions.
              </p>
            </motion.section>

            <motion.section variants={item} className="bg-white p-7 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-indigo-600 font-serif text-lg">03.</span> Strict User Conduct & Restrictions
              </h2>
              <p className="text-sm">
                To guarantee zero latency and protect platform resources for human content managers, we enforce a zero-tolerance policy against automated attacks:
              </p>
              <ul className="list-disc pl-5 text-sm mt-3 space-y-2">
                <li><strong>No Scraping:</strong> You are strictly forbidden from executing selenium bots, python crawls, scraper scripts, or automatic query loops to hoard site assets.</li>
                <li><strong>No Reverse Engineering:</strong> You must not test or exploit application code, intercept system API endpoints, or copy underlying models.</li>
                <li><strong>No Unauthorized Accounts:</strong> Creating mass fake profiles or using fraudulent tokens to exploit resources will trigger automatic user bans and immediate deletion of documents.</li>
              </ul>
            </motion.section>

            <motion.section variants={item} className="bg-white p-7 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-indigo-600 font-serif text-lg">04.</span> Limitation of Liability & Warranty Disclaimers
              </h2>
              <p className="text-sm">
                THE DEPLOYED CORE APPS AND FILES ARE PROVIDED BY DOCCRAFT INC. STRICTLY "AS IS" AND "AS AVAILABLE". TO THE UPPERMOST LEGAL THRESHOLDS, WE DISCLAIM ALL WARRANTIES, COVENANTS, AND REPRESENTATIONS, EXPRESSED OR IMPLIED—INCLUDING ANY SOUND MERCHANTABILITY OR FITNESS FOR EXCLUSIVE ROLES.
              </p>
              <p className="text-sm mt-3 font-semibold text-gray-900">
                IN NO EVENT SHALL DOCCRAFT INC., ITS DIRECTORS, ASSOCIATES, OR ITS DEVELOPERS BE LIABLE FOR ANY DAMAGES, DATA INTERRUPTS, ACCIDENTAL REMOVALS, SYSTEM OFF-LINING, FINANCIAL EXPENSES, OR HARDWARE DISRUPTIONS OUT OF OR LINED TO YOUR DOCUMENT PLATFORM WORKSPACES.
              </p>
            </motion.section>

          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
