import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { motion } from 'motion/react';
import { BookOpen, Award, Sparkles, ShieldCheck } from 'lucide-react';

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
            About Our Company
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tight text-[#1a1a1a] font-serif">
            About DocCraft Pro
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium">
            We are redefining how beautifully structured documents are created, edited, and shared safely in the modern workplace.
          </p>
        </motion.div>

        <div className="space-y-12">
          
          {/* Mission & Vision Section */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white p-8 md:p-12 rounded-[2rem] border border-[#E4DBC5] shadow-xs"
          >
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-8 h-8 text-[#D4AF37]" />
              <h2 className="text-3xl font-black text-[#1a1a1a] uppercase tracking-wide font-serif">
                Our Mission Statement
              </h2>
            </div>
            <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
              <p>
                DocCraft Pro was founded with a single, clear objective: to make writing, editing, and managing your most important documents as seamless and secure as possible. Over the years, we have seen countless professionals struggle with overly complicated software, unpredictable formatting rules, and privacy concerns when storing their files online. We decided it was time for a change.
              </p>
              <p>
                Our team is passionate about building tools that feel natural to use. We believe that whether you are drafting a simple quick note, designing a comprehensive business plan, or organizing a team's creative roadmap, the software should never get in your way. Instead, your tools should gently support you, ensuring that your fonts look great, your images align perfectly, and your tables stay intact when you print or export them to a PDF.
              </p>
              <p>
                Today, our application is trusted by thousands of creators, academics, small business owners, and corporate teams. We continually listen to our community's feedback, regularly rolling out new features like improved offline saving—so you never lose your work when the internet drops—and advanced formatting controls that make your pages look professionally published right from your browser.
              </p>
            </div>
          </motion.div>

          {/* Value Proposition & Trustworthiness */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="grid md:grid-cols-2 gap-8"
          >
            <div className="bg-[#1A1A1A] p-10 rounded-[2rem] text-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-[#D4AF37]" />
                  <h3 className="text-2xl font-black uppercase tracking-wider font-serif">
                    Uncompromising Quality
                  </h3>
                </div>
                <div className="space-y-4 text-gray-300 text-sm md:text-base leading-relaxed">
                  <p>
                    We never cut corners when it comes to the quality of your output. When you take the time to format a beautiful document on your screen, we ensure that the exact layout, colors, and font styles translate perfectly when you print it or save it as a digital copy.
                  </p>
                  <p>
                    Our specialized editor handles complex elements—like interactive charts or dense multi-column tables—smoothly without lag, so your writing experience remains fluid and enjoyable from the first sentence to the final page.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2rem] border border-[#E4DBC5] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
                  <h3 className="text-2xl font-black uppercase text-[#1a1a1a] tracking-wider font-serif">
                    Absolute Privacy
                  </h3>
                </div>
                <div className="space-y-4 text-gray-600 text-sm md:text-base leading-relaxed">
                  <p>
                    In an era where every website wants to read, analyze, or train on your personal data, we stand apart. DocCraft Pro is built around a privacy-first mindset. Only you have the key to your workspace. 
                  </p>
                  <p>
                    We built our smart writing tools using local technology. This means that features which assist your writing run entirely on your own device rather than sending your sentences to external servers. It gives you the peace of mind to draft sensitive contracts, personal journals, or secret business proposals knowing they truly belong to you alone.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white p-10 rounded-[2rem] border border-[#E4DBC5] shadow-xs text-center"
          >
            <h3 className="text-2xl font-black text-[#1a1a1a] mb-6 uppercase tracking-wider font-serif">
               Join The Community Today
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
               Create an account in seconds to start building incredible documents, securely backed up, and beautifully formatted. Experience writing the way it should be.
            </p>
            <a href="/auth" className="inline-block bg-[#1A1A1A] hover:bg-[#333] text-white px-8 py-4 rounded-xl font-bold transition-colors">
               Get Started For Free
            </a>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
