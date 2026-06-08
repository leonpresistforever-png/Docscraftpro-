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
                <h4 className="font-bold text-sm text-gray-900 mb-1">We Respect Your Privacy</h4>
                <p className="text-xs text-gray-500 leading-relaxed">An unwavering commitment. We never monetize, share, or inspect your private content.</p>
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
                We believe in complete transparency and minimal data footprint. We do not collect or monitor invasive digital parameters such as your IP address, physical geo-location, device rendering profiles, or browser hardware configurations. 
              </p>
              <p className="text-sm mt-3">
                The only information collected is what you explicitly provide to authenticate and preserve your session safely:
              </p>
              <ul className="list-disc pl-5 text-sm mt-3 space-y-2">
                <li><strong>Account Credentials:</strong> Your sign-up name and email address when creating an account, or secure profile credentials passed directly via Google or Apple OAuth providers.</li>
                <li><strong>Session State Keys:</strong> Simple, standard browser local storage settings specifically designed to remember your active login state and user preferences (like your dark/light appearance).</li>
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

            <motion.section variants={item} className="bg-white p-7 md:p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-indigo-500"></div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-dc-gold font-serif text-lg">05.</span> Google Integration & Limited Use Compliance
              </h2>
              <p className="text-sm mb-3">
                Our application integrates optional features that access Google Workspace APIs (including Google Docs, Google Slides, Google Forms, and related Drive resources) to provide automated document compilation, backup, and sync capabilities.
              </p>
              <div className="pl-4 border-l-4 border-indigo-500 bg-indigo-50/40 p-4 rounded-r-xl space-y-2 text-xs mb-4">
                <p className="font-bold text-indigo-950 uppercase tracking-wider text-[10px]">Google API Services Disclosure</p>
                <p className="text-gray-700 leading-relaxed font-medium">
                  <strong>DocCraft Pro’s use and transfer of information received from Google APIs to any other app will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="underline text-indigo-700 hover:text-indigo-900 font-bold">Google API Services User Data Policy</a>, including the Limited Use requirements.</strong>
                </p>
              </div>
              <div className="mt-4 space-y-4 text-sm text-gray-600">
                <p>
                  <strong>1. Scope of Data Accessed & Google OAuth Scopes:</strong> When you connect your Google Workspace account, our application requests explicit permission through the standard Google OAuth interface for the following scopes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-xs">
                  <li><strong>.../auth/documents:</strong> Allows us to write, structure, customize, and edit document files directly inside your Google Docs.</li>
                  <li><strong>.../auth/presentations:</strong> Allows us to assemble slides and present visual layouts directly inside your Google Slides.</li>
                  <li><strong>.../auth/forms.body:</strong> Allows us to inspect and modify form schemas inside Google Forms.</li>
                  <li><strong>.../auth/drive.file:</strong> Permits uploading, creating, and modifying files that you select or create using DocCraft Pro.</li>
                  <li><strong>.../auth/userinfo.email & .../auth/userinfo.profile:</strong> To verify your email address and profile identity securely to authorize account creation.</li>
                </ul>
                <p>
                  <strong>2. Purpose of Access:</strong> We access your Workspace assets exclusively to compile, write, or export your locally designed and edited document drafts directly into your personal Google account. All operations are user-directed; we never read, modify, or scan documents unless you explicitly request a transfer action on that specific document.
                </p>
                <p>
                  <strong>3. Data Storage & Sharing:</strong> We do not store, cache, upload, or transmit any user documents or data retrieved from Google APIs to any external servers or third-party entities. All API requests are processed inside your browser instance, passing parameters securely and directly between our client application and Google's official API servers.
                </p>
                <p>
                  <strong>4. Third-Party Sharing and Human-In-the-Loop Policies:</strong> No information accessed via Google API scopes is ever rented, sold, or shared with third parties, advertising systems, or used for machine learning or AI model training under any circumstances. We do not permit any human employees, contractors, or developers to read or view user data retrieved via Google API scopes unless required for security investigations, compliance audits, or if you explicitly provide troubleshooting files to our support team.
                </p>
              </div>
            </motion.section>

            <motion.section variants={item} className="bg-white p-7 md:p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-200 to-emerald-500"></div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-dc-gold font-serif text-lg">06.</span> Global Compliance & Data Privacy Rights
              </h2>
              <p className="text-sm mb-3">
                We respect your rights under the <strong>General Data Protection Regulation (GDPR)</strong>, the <strong>California Consumer Privacy Act (CCPA/CPRA)</strong>, and other global privacy laws:
              </p>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>1. Right to be Forgotten (Deletion):</strong> You can permanently delete your user profile and all accompanying document records at any time. Erasing your files permanently wipes them from our production Firestore databases and cleans up all active local caching nodes.
                </p>
                <p>
                  <strong>2. Right to Portability:</strong> You can export any document draft into multiple formats (PDF, Markdown, JSON, DOCX) directly from our editor screen. We do not run restrictive or proprietary locks; your work remains yours to download.
                </p>
                <p>
                  <strong>3. Right to Object and Restrict Processing:</strong> You are in complete control of which secondary tools (such as optional AI summary models or Google OAuth connectors) process your drafts. You can toggle permission connections off instantly via your settings page.
                </p>
                <p>
                  <strong>4. No Sale or Sharing of Personal Data:</strong> We explicitly verify that we do not sell your personal details, email list metrics, or document context to any third parties, broker agencies, or advertising providers.
                </p>
              </div>
            </motion.section>

            <motion.section variants={item} className="bg-white p-7 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-dc-gold font-serif text-lg">07.</span> Terms of Service & Legal Status
              </h2>
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  <strong>1. Acceptance of Terms:</strong> By registering an account or executing documents on DocCraft Pro, you agree to be bound by these standard Terms of Service and all applicable local, national, and international laws.
                </p>
                <p>
                  <strong>2. Intellectual Property:</strong> You retain complete and unconditional intellectual property ownership over all content, drafts, files, logic maps, or notes you compile inside the editor. We exert absolutely zero ownership rights over user-created documents.
                </p>
                <p>
                  <strong>3. Authorized Use:</strong> You agree not to utilize DocCraft Pro to design, compile, or transmit any malicious materials, spyware, unlawful file formats, or spam documents.
                </p>
                <p>
                  <strong>4. Disclaimer of Warranty:</strong> DocCraft Pro is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied. We do not guarantee uninterrupted server runtimes or error-free rendering parameters.
                </p>
                <p>
                  <strong>5. Contact Support:</strong> For legal disputes, compliance audits, or data deletion queries, please submit a support ticket in the support console or email our team directly at <span className="font-mono text-gray-900 font-semibold">{import.meta.env.VITE_SUPPORT_EMAIL || 'leonpresistforever@gmail.com'}</span>.
                </p>
              </div>
            </motion.section>

          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
