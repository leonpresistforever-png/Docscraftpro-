import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ShieldCheck, Lock, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FAQPage() {
  const faqs = [
    { 
      q: "Do we collect your data?", 
      a: "No. Your data remains strictly yours. All data is private and secure. We do not use customer data to train our foundational models or sell it to third parties." 
    },
    { 
      q: "How long does implementation take?", 
      a: "Most enterprise integrations are completed within 2 to 4 weeks, depending on the complexity of your custom logic." 
    },
    { 
      q: "Is DocCraft Pro compliant with industry standards?", 
      a: "Yes. Our systems are built upon industry-leading secure architecture complying with SOC2 and HIPAA requirements." 
    },
    { 
      q: "Do you offer custom pricing?", 
      a: "Yes. For high-volume processing and custom Service Level Agreements (SLAs), please contact our sales team." 
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 pt-24 flex flex-col selection:bg-[#D4AF37] selection:text-white">
      <Navbar />

      <main className="w-full max-w-4xl mx-auto px-6 py-16 flex-1">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-serif tracking-tight mb-4">
            Platform Trust & FAQ
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about how we manage your infrastructure, secure your documents, and scale with your needs.
          </p>
        </div>

        {/* Features / Architecture Section */}
        <div className="mb-20">
          <h2 className="text-2xl font-black text-gray-900 font-serif mb-8 text-center">Built on Secure Infrastructure</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">End-to-End Encryption</h3>
              <p className="text-gray-600 text-sm">All document transit and data at rest are fully encrypted using modern cryptographic standards.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Private Data Clusters</h3>
              <p className="text-gray-600 text-sm">We provision completely isolated database clusters so your raw data never blends with others.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Strict Access Control</h3>
              <p className="text-gray-600 text-sm">Role-based systems designed from the ground up to prevent unauthorized internal or external access.</p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm mb-20">
          <h2 className="text-3xl font-black text-gray-900 font-serif mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                <h4 className="text-lg font-bold text-gray-900 mb-3">{faq.q}</h4>
                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
             <p className="text-gray-600 font-medium">Have more specific security questions?</p>
             <Link to="/contact" className="inline-block mt-3 bg-[#1A1A1A] hover:bg-[#333] text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors">
               Contact Support
             </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
