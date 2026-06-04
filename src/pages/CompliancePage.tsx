import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Shield, CheckCircle, Scale, RefreshCw, Mail } from 'lucide-react';

export function CompliancePage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1a1a1a] font-sans relative overflow-hidden pt-24 pb-20">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[5%] right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#ece3c9]/40 to-transparent filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[5%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-indigo-50/30 to-transparent filter blur-[120px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20 mix-blend-multiply"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <Navbar />

      <main className="max-w-4xl mx-auto px-6 relative z-10 pt-12">
        
        {/* Breadcrumb / Category indicator */}
        <div className="flex items-center gap-2 mb-4 font-mono text-xs uppercase tracking-widest text-[#D4AF37]">
          <Scale className="w-4 h-4" />
          <span>Ecosystem Certification & Audit</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-black uppercase text-[#1a1a1a] leading-tight mb-6 tracking-tight">
          System Compliance <br/>
          & Data Governance
        </h1>

        <p className="text-gray-600 text-lg leading-relaxed mb-12 max-w-2xl">
          DocCraft Pro is designed with high-security banking, legal, and operational integrity standards. 
          We guarantee complete local client-side safety and optional cloud synchronization under strict encryption scopes.
        </p>

        {/* HELP AND FEEDBACK CALLOUT */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 mb-12 flex items-start gap-4 shadow-sm"
        >
          <div className="bg-amber-100/60 text-amber-700 rounded-xl p-3 flex-shrink-0 border border-amber-200">
            <Mail className="w-6 h-6 text-[#AA7A00]" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base mb-1">Found a bug or have an idea?</h3>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xl">
              We want to make DocCraft Pro as seamless as possible for you. If you encounter any formatting bugs, file parsers anomalies, or have ideas for improvements, please let us know so our team can refine and assist you.
            </p>
            <div className="mt-3">
              <Link to="/support-form?type=bug" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#AA7A00] hover:text-[#AA7A00]/80 underline decoration-amber-600 underline-offset-2 transition-colors">
                Report Bug / Give Feedback &rarr;
              </Link>
            </div>
          </div>
        </motion.div>

        {/* COMPLIANCE BENTO SPECS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          
          <div className="bg-white border border-[#E4DBC5] rounded-[2rem] p-8 shadow-sm">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl mb-6 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg uppercase mb-3 text-[#1a1a1a]">SOC 2 alignment</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Our backend cloud sync databases are deployed exclusively on hardened Google Cloud Platform instance zones, aligning with SOC 2 Type II controls for secure datastore pipelines.
            </p>
          </div>

          <div className="bg-white border border-[#E4DBC5] rounded-[2rem] p-8 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl mb-6 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg uppercase mb-3 text-[#1a1a1a]">GDPR Data Sovereignty</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              We strictly enforce the "Right to be Forgotten". Users can export documents at any moment, and deletion triggers clean cascading purges of associated assets.
            </p>
          </div>

          <div className="bg-white border border-[#E4DBC5] rounded-[2rem] p-8 shadow-sm">
            <div className="w-10 h-10 bg-[#FAF9F6] text-[#D4AF37] rounded-xl mb-6 flex items-center justify-center border border-[#EAE6DF]">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg uppercase mb-3 text-[#1a1a1a]">HIPAA Operational Safety</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              All personal metadata transmission is processed via transport security channels (SSL/TLS 1.3), complete with localized client keys to guard patient data nodes.
            </p>
          </div>

          <div className="bg-white border border-[#E4DBC5] rounded-[2rem] p-8 shadow-sm">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl mb-6 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg uppercase mb-3 text-[#1a1a1a]">Cascading Cryptography</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              AES-GCM encryption ensures data bundles cannot be read or tampered with on the router layers without valid security credentials.
            </p>
          </div>

        </div>

        {/* FEEDBACK BUTTON / COMPLIANCE TEAM CALLOUT */}
        <div className="border-t border-gray-200 pt-12 flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <h4 className="font-bold text-[#1a1a1a]">Need custom security credentials?</h4>
            <p className="text-sm text-gray-500 max-w-md mt-2 leading-relaxed">
              If your security review team requires dedicated compliance questionnaires (VSA, SIG), or custom service contracts, contact our operations desk.
            </p>
          </div>
          <Link 
            to="/support-form?type=security" 
            className="px-6 py-3 bg-black text-white hover:bg-neutral-800 rounded-xl font-medium tracking-wide text-sm flex items-center gap-2 transition-all shrink-0 shadow-md hover:shadow-lg active:scale-95"
          >
            <Mail className="w-4 h-4" /> Contact Security Desk
          </Link>
        </div>

      </main>
    </div>
  );
}
