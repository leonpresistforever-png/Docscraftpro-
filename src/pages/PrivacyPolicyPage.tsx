import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { motion } from 'motion/react';
import { Shield, Eye, Lock, FileText, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export function PrivacyPolicyPage() {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isConsented, setIsConsented] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkConsent = async () => {
      // Wait a moment for auth to initialize
      await auth.authStateReady();
      const user = auth.currentUser;
      if (user) {
        try {
          const consentDoc = await getDoc(doc(db, 'privacy_consents', user.uid));
          if (consentDoc.exists()) {
            setIsConsented(true);
          }
        } catch (e) {
          console.error("Error reading consent:", e);
        }
      } else {
        // If not logged in, we check local storage just in case
        const localConsent = localStorage.getItem('dc_privacy_consent_at');
        if (localConsent) {
          setIsConsented(true);
        }
      }
      setLoading(false);
    };
    checkConsent();
  }, []);

  const handleRecordConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAgreed) {
      alert('You must check the agreement box indicating you accept these terms.');
      return;
    }

    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(db, 'privacy_consents', user.uid), {
          userId: user.uid,
          agreedAt: serverTimestamp()
        });
        setIsConsented(true);
      } catch (e) {
        alert('Failed to save your consent. Please try again or contact support.');
        console.error(e);
      }
    } else {
      // Offline fallback
      const nowStr = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
      localStorage.setItem('dc_privacy_consent_at', nowStr);
      setIsConsented(true);
    }
  };

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
                  "All custom-written document drafts, notes, and local API keys stored inside our features are preserved exclusively in secure local storage structures on your physical device. Docscraft Pro does not run unauthorized background tracking, nor does it monetize your document data under any circumstance."
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
                <li><strong>Zero Sale Pledge:</strong> Docscraft Pro explicitly confirms that your document contents, personal emails, or metadata profiles are never rented, sold, or distributed to any advertising networks.</li>
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
                  <strong>Docscraft Pro’s use and transfer of information received from Google APIs to any other app will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="underline text-indigo-700 hover:text-indigo-900 font-bold">Google API Services User Data Policy</a>, including the Limited Use requirements.</strong>
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
                  <li><strong>.../auth/drive.file:</strong> Permits uploading, creating, and modifying files that you select or create using Docscraft Pro.</li>
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
                  <strong>1. Acceptance of Terms:</strong> By registering an account or executing documents on Docscraft Pro, you agree to be bound by these standard Terms of Service and all applicable local, national, and international laws.
                </p>
                <p>
                  <strong>2. Intellectual Property:</strong> You retain complete and unconditional intellectual property ownership over all content, drafts, files, logic maps, or notes you compile inside the editor. We exert absolutely zero ownership rights over user-created documents.
                </p>
                <p>
                  <strong>3. Authorized Use:</strong> You agree not to utilize Docscraft Pro to design, compile, or transmit any malicious materials, spyware, unlawful file formats, or spam documents.
                </p>
                <p>
                  <strong>4. Disclaimer of Warranty:</strong> Docscraft Pro is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied. We do not guarantee uninterrupted server runtimes or error-free rendering parameters.
                </p>
                <p>
                  <strong>5. Contact Support:</strong> For legal disputes, compliance audits, or data deletion queries, please submit a support ticket in the support console or redirect directly to our <Link to="/support-form?type=security" className="text-indigo-600 hover:underline font-mono font-bold">Compliance & Security Desk</Link>.
                </p>
              </div>
            </motion.section>

            <motion.section variants={item} className="bg-white p-7 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-dc-gold font-serif text-lg">08.</span> Advertising & Third-Party Cookies (Google AdSense)
              </h2>
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  We primarily operate as a free service, and to maintain our server costs, we may employ third-party advertising vendors, including Google AdSense. 
                </p>
                <p>
                  <strong>Google and the DoubleClick DART Cookie:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600">
                  <li>Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website or other websites.</li>
                  <li>Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.</li>
                  <li>Users may opt out of personalized advertising by visiting <a href="https://myadcenter.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-bold">Google Ads Settings</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-bold">www.aboutads.info</a>.</li>
                </ul>
              </div>
            </motion.section>

            {/* Early Access Beta and Free Service Pledge Callout */}
            <motion.div 
              variants={item} 
              className="bg-gradient-to-br from-indigo-50 via-white to-emerald-50/50 p-6 md:p-8 rounded-3xl border border-indigo-150/80 shadow-md space-y-4 text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100/50 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-emerald-500 text-xl font-bold">✨</span> 100% Free Lifetime Guarantee
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Docscraft Pro is committed to democratic, open, and fully accessible document creation tools for everyone.
                  </p>
                </div>
                <div className="shrink-0 self-start sm:self-center px-4 py-2 bg-emerald-100/80 border border-emerald-200 text-emerald-800 rounded-full text-xs font-black tracking-wider uppercase select-none">
                  100% Free Service
                </div>
              </div>

              <div className="text-sm text-gray-650 leading-relaxed space-y-3">
                <p>
                  We are incredibly proud to provide a <strong>100% free toolset</strong> with zero paywalls, zero premium tiers, and zero credit limits. Your access to premium signature embedding, company stamps, PDF conversions, and high-fidelity text editors will remain fully free.
                </p>
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs text-indigo-900 leading-normal">
                  <p className="font-bold flex items-center gap-1.5 uppercase text-indigo-950 mb-1">
                    🚀 System Status Notice & Early Beta Access
                  </p>
                  Please keep in mind that Docscraft Pro is currently in <strong>early access beta</strong> under continuous improvement cycles. If you encounter any bugs, security flaws, rendering anomalies, or have feature proposals, please submit a report immediately! Your generous suggestions, debugging assistance, and comments light up the promising future of Docscraft. Thank you for your partnership!
                </div>
                <p className="text-xs text-gray-400 font-medium">
                  Have feedback? Submit a report anytime on our raw <Link to="/support-form?type=feedback" className="text-indigo-600 hover:underline font-bold">Feedback Form</Link> to reach our engineering desk!
                </p>
              </div>
            </motion.div>

            {isConsented && (
               <motion.div variants={item} className="mt-8 text-center">
                  <div className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-[#AA7A00] bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
                     <CheckCircle2 className="w-4 h-4" />
                     Consent Verified
                  </div>
               </motion.div>
            )}
            
          </div>
        </motion.div>
      </main>

      {!isConsented && !loading && (
        <motion.div
           initial={{ y: 100, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="fixed bottom-0 left-0 w-full bg-white border-t border-[#E4DBC5] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-50 p-4 md:px-8 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-sm mb-1">Terms & Privacy Consent</h3>
            <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
              Before proceeding, please review and accept our updated Privacy Policy. By clicking accept, you verify that you understand our data isolation protocols and standard limited-use API specifications.
            </p>
          </div>
          <form onSubmit={handleRecordConsent} className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                className="accent-[#D4AF37] focus:ring-[#D4AF37] text-[#D4AF37] w-4 h-4 cursor-pointer rounded"
              />
              <span className="text-xs text-stone-700 font-medium whitespace-nowrap">I have read & accept the policies.</span>
            </label>
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#b08d2b] transition-all text-white px-5 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-sm active:scale-95 cursor-pointer shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Accept
            </button>
          </form>
        </motion.div>
      )}

      <Footer />
    </div>
  );
}
