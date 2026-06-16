import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ShieldCheck, Lock, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FAQPage() {
  const faqs = [
    { 
      q: "If I write sensitive personal information, who can read it?", 
      a: "Only you. We have built our architecture to place user privacy at the core of the document creation process. Because many of the advanced features—such as grammar correction and text formatting—are run using local models securely within your own device, your drafts never have to travel across the internet. When you do decide to save and sync your work securely to our cloud database across your different devices, we encrypt everything so it remains unreadable to anyone else." 
    },
    { 
      q: "What happens if my internet connection cuts out while I'm writing?", 
      a: "Your work is perfectly safe. Our text editor is designed to run completely offline. When you are writing a document, adding pictures, or modifying tables, we save all those changes straight to your computer's local storage incrementally. If your connection drops smoothly or abruptly, you can continue to draft pages without any interruptions. Once you reconnect to Wi-Fi or cellular networks, the application automatically catches up and quietly syncs your offline revisions with your cloud account, ensuring not a single word is lost." 
    },
    { 
      q: "How does the automatic saving feature work?", 
      a: "Instead of remembering to manually press 'Save' every few minutes, our application continuously tracks your keystrokes and structural changes in the background. If you make a mistake, you can instantly undo your actions. Furthermore, your saved timeline generates independent versions of your document in your history logs, so if you decide you actually preferred what you wrote yesterday afternoon, you can easily restore previous drafts without losing your current progress." 
    },
    { 
      q: "Can I use DocCraft Pro on my tablet or mobile phone?", 
      a: "Absolutely. We designed our entire system to be fully responsive. Whether you are typing comfortably on a wide desktop screen, adjusting columns on an iPad, or quickly drafting a quick memo on your smartphone, our interface adapts to your screen size. The core tools, including PDF exporting and complex table modifications, remain accessible and fully operational regardless of the device you are using." 
    },
    { 
      q: "How does exporting and printing work for complicated pages?", 
      a: "We understand how frustrating it is when a document looks beautiful on screen but gets entirely wrecked when you try to print it. We custom-built a reliable printing and PDF conversion engine that securely locks down your layout before downloading. This means that if you spend time organizing text into tables, configuring images alongside headers, and building out nested checklists, our PDF output respects your exact design parameters, so there is no text clipping or strange page breaks." 
    },
    {
      q: "Why do some features say they are 'Powered by Local AI'?",
      a: "Many standard AI writing tools operate transparently by sending your documents to massive, centralized servers to process the text, which poses severe privacy risks. To eliminate this issue entirely, we utilize 'Local AI'. This means the artificial intelligence tools that help you with grammar formatting and text summaries actually download and run entirely within your computer or browser. There's no middleman watching your keystrokes. While this means the features might be slightly slower depending on the age of your computer hardware, it perfectly guarantees absolute confidentiality."
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
            <div className="bg-white p-6 rounded-[2rem] border border-[#E4DBC5] shadow-xs text-center">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Complete Content Encryption</h3>
              <p className="text-gray-600 text-sm">All of your documents are scrambled into unreadable text when stored on our servers so nobody can ever see your hard work.</p>
            </div>
            
            <div className="bg-white p-6 rounded-[2rem] border border-[#E4DBC5] shadow-xs text-center">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Isolated File Storage</h3>
              <p className="text-gray-600 text-sm">We make sure your files are kept completely separate from others in our secure cloud storage locations.</p>
            </div>
            
            <div className="bg-white p-6 rounded-[2rem] border border-[#E4DBC5] shadow-xs text-center">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Strict Login Security</h3>
              <p className="text-gray-600 text-sm">We provide advanced identity security checkpoints to ensure only you can log in, edit, or delete the documents you create.</p>
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
