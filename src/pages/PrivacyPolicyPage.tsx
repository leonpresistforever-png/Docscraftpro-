import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { motion } from 'motion/react';

export function PrivacyPolicyPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-dc-text pt-24 overflow-hidden">
      <Navbar />
      <main className="w-full max-w-[800px] mx-auto px-6 py-12">
        <motion.div initial="hidden" animate="show" variants={container}>
          <motion.h1 variants={item} className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tight text-[#1a1a1a]">Policies & Terms of Service</motion.h1>
          <motion.p variants={item} className="text-gray-500 mb-12 font-medium">Last Updated: May 2026</motion.p>
          
          <div className="prose prose-gray max-w-none text-gray-600 space-y-8">
            
            <motion.section variants={item} className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
              <h2 className="text-2xl font-bold text-orange-900 mt-0 mb-4">1. Early Beta Warning & Disclaimer</h2>
              <p>
                Welcome to DocCraft. Please be aware that this service is currently in <strong>Early Beta testing</strong>. The platform may be buggy, and features may change or break without prior notice. By using this platform, you explicitly acknowledge these risks. We are continuously improving the product but cannot guarantee 100% uptime or data persistence during this testing period.
              </p>
            </motion.section>

            <motion.section variants={item} className="bg-white p-8 rounded-2xl shadow-sm border border-[#EAE6DF]">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mt-0 mb-4">2. Payments, Billing & No Refunds Policy</h2>
              <p>
                We charge for premium features to sustainably maintain our servers. <strong>We do not offer refunds under any circumstances.</strong> All payments, subscriptions, and one-off purchases are strictly final. By authorizing a payment, you agree to this non-refundable policy.
              </p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Subscription limits reset according to your billing cycle.</li>
                <li>Tips are strictly donations and provide no unlockable features.</li>
              </ul>
            </motion.section>

            <motion.section variants={item} className="bg-white p-8 rounded-2xl shadow-sm border border-[#EAE6DF]">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mt-0 mb-4">3. Limitation of Liability & Legal Flaws</h2>
              <p>
                <strong>Strict Liability Clause:</strong> You agree that you will not take any legal action against the developers or operators of DocCraft for any bugs, data loss, disruptions, security vulnerabilities, or operational issues. 
              </p>
              <p className="mt-4">
                The service is provided strictly "as is" and "as available". We purposefully disclaim all warranties, express or implied. This includes but is not limited to implied warranties of merchantability and fitness for a particular purpose.
              </p>
            </motion.section>

            <motion.section variants={item} className="bg-white p-8 rounded-2xl shadow-sm border border-[#EAE6DF]">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mt-0 mb-4">4. Data Collection & Privacy</h2>
              <p>
                We only collect the absolute minimum data required to provide our service:
              </p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Authentication information (Email, profile picture from Google OAuth).</li>
                <li>Data you explicitly create within our editors (documents, logic maps).</li>
              </ul>
              <p className="mt-4">
                We enforce a <strong>Zero Data Leakage</strong> promise. We do not sell, rent, or distribute your private documents to advertisers or third parties.
              </p>
            </motion.section>

            <motion.section variants={item} className="bg-white p-8 rounded-2xl shadow-sm border border-[#EAE6DF]">
              <h2 className="text-2xl font-bold text-[#1a1a1a] mt-0 mb-4">5. Security Infrastructure</h2>
              <p>
                All endpoints are secured against unauthorized access. However, given our beta status, you are responsible for maintaining backups of any critical documentation created using our software.
              </p>
            </motion.section>

          </div>
        </motion.div>
      </main>
      
      <footer className="bg-white pt-12 pb-12 border-t border-[#E4DBC5] mt-24">
        <div className="max-w-[1400px] mx-auto px-6 text-center text-xs text-gray-400">
           <p>&copy; 2026 DocCraft Inc. All rights reserved. Read carefully before using.</p>
        </div>
      </footer>
    </div>
  );
}
