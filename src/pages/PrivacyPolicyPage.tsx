import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { motion } from 'motion/react';
import { Shield, Eye, Lock, FileText } from 'lucide-react';

export function PrivacyPolicyPage() {
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
          
          {/* Header Title Section */}
          <motion.div variants={item} className="border-b border-gray-200 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-800 font-bold uppercase tracking-widest mb-3">
              <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
              Compliance Document
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[#1a1a1a] font-serif">
              Privacy Policy & Disclosures
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Last Revised: May 2026 | Effective Date: June 1, 2026</p>
          </motion.div>

          {/* Quick overview grid cards */}
          <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <Eye className="w-6 h-6 text-[#D4AF37] mb-2" />
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">Data Visibility</h4>
                <p className="text-xs text-gray-500 leading-relaxed">No model training or sharing of private text assets.</p>
              </div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <Lock className="w-6 h-6 text-[#D4AF37] mb-2" />
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">Encrypted Pipelines</h4>
                <p className="text-xs text-gray-500 leading-relaxed">SSL and database security locks protect user metadata.</p>
              </div>
            </div>
            <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <FileText className="w-6 h-6 text-[#D4AF37] mb-2" />
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">Client-Side Control</h4>
                <p className="text-xs text-gray-500 leading-relaxed">We process data inside your local sandbox environments.</p>
              </div>
            </div>
          </motion.div>

          {/* Policy Body Chapters */}
          <div className="prose prose-gray max-w-none text-gray-600 space-y-8 leading-relaxed">
            
            <motion.section variants={item} className="bg-white p-7 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-dc-gold font-serif text-lg">01.</span> Information We Collect
              </h2>
              <p className="text-sm">
                To maintain high-quality document calculations and secure application runtimes, we log standard web parameters during service execution. This data includes:
              </p>
              <ul className="list-disc pl-5 text-sm mt-3 space-y-2">
                <li><strong>IP Addresses & Geo-location:</strong> Used to filter malicious traffic, monitor spam patterns, and guide geographic Content Delivery Network (CDN) routings.</li>
                <li><strong>Device & Browser Profile:</strong> Monitors browser types, operating platforms, display dimensions, and rendering engines to optimize UI response times.</li>
                <li><strong>Browser Identifiers (Cookies):</strong> Standard local storage keys and browser cookies set to preserve dark/light styling preferences and validate active secure user logins.</li>
              </ul>
            </motion.section>

            <motion.section variants={item} className="bg-white p-7 md:p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-200 to-[#D4AF37]"></div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-[#D4AF37] font-serif text-lg">02.</span> Local Device Persistence & Offline Support
              </h2>
              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-3">
                <p className="text-sm text-amber-950 font-medium">
                  We guarantee total local privacy and user sandbox isolation:
                </p>
                <p className="text-sm text-gray-700 italic border-l-4 border-[#D4AF37] pl-4 bg-white py-3 pr-3 rounded-r-lg">
                  "All custom-written document drafts, notes, and local API keys stored inside our features are preserved exclusively in secure local storage structures on your physical device. DocCraft Pro does not run unauthorized background tracking, nor does it monetize your document data under any circumstance."
                </p>
              </div>
              <p className="text-sm mt-4">
                We believe in genuine, distraction-free document execution. Your data is owned entirely by you, cached inside your immediate browser session or local machine, and is never uploaded to external advertising systems.
              </p>
            </motion.section>

            <motion.section variants={item} className="bg-white p-7 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-dc-gold font-serif text-lg">03.</span> Strict Data Protection Measures
              </h2>
              <p className="text-sm">
                We believe that human document intellectual assets are absolute, proprietary properties. We implement industry-leading encryption parameters and secure practices to guard your metadata:
              </p>
              <ul className="list-disc pl-5 text-sm mt-3 space-y-2">
                <li><strong>SSL Transports:</strong> All data packets are encrypted in-transit using Secure Sockets Layer (SSL) protocols.</li>
                <li><strong>Zero Sale Pledge:</strong> DocCraft Pro explicitly confirms that your document contents, personal emails, or metadata profiles are never rented, sold, or distributed to any advertising networks.</li>
                <li><strong>No Model Training:</strong> Unlike generic workspace platforms, we never train models on your private document history files without explicit, double-confirmed user opt-in properties.</li>
              </ul>
            </motion.section>

            <motion.section variants={item} className="bg-white p-7 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-dc-gold font-serif text-lg">04.</span> Retaining & Deleting Assets
              </h2>
              <p className="text-sm">
                Users retain total ownership over their files. You can erase any document permanently from our databases utilizing the Trash controls in your personal account settings menu, triggering instantaneous physical data wipes.
              </p>
            </motion.section>

          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
