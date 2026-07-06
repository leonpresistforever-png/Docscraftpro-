import { Footer } from "../components/layout/Footer";
import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, ChevronRight } from 'lucide-react';
import { Article } from '../data/articles';

export function ArticlePage({ article }: { article: Article }) {
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
    <div className="w-full">
      <motion.div initial="hidden" animate="show" variants={container}>
        
        {/* Breadcrumb / Back Navigation */}
        <motion.div variants={item} className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
          <Link to="/blog" className="hover:text-[#D4AF37] flex items-center transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Archive Hub
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 mx-1" />
          <span className="text-gray-400 truncate max-w-[200px]">{article.title}</span>
        </motion.div>

        {/* Article Header */}
        <motion.div variants={item} className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[10px] text-amber-800 font-bold uppercase tracking-widest mb-4">
            <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
            {article.category}
            <Footer />
    </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#1a1a1a] font-serif mb-4 leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> {article.readTime}</div>
            <Footer />
    </div>
        </motion.div>

        {/* Article Content Body */}
        <motion.div variants={item} className="bg-white p-6 md:p-10 rounded-2xl border border-gray-200 shadow-sm mb-12">
          <div className="prose prose-stone max-w-none text-gray-700 leading-relaxed prose-headings:font-serif prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-[#D4AF37] hover:prose-a:text-[#AA7A00] prose-a:transition-colors prose-pre:bg-gray-50 prose-pre:text-gray-800 prose-pre:border prose-pre:border-gray-200 prose-pre:shadow-inner"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </motion.div>

        {/* FAQ Schema Section */}
        {article.faqs && article.faqs.length > 0 && (
          <motion.div variants={item} className="bg-[#FAF9F6] p-6 md:p-10 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-200 to-[#D4AF37]"></div>
             <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 font-serif">
                <span className="text-[#D4AF37]">?</span> Frequently Asked Questions
             </h3>
             <div className="space-y-6">
                {article.faqs.map((faq, index) => (
                  <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                     <h4 className="font-bold text-sm text-gray-900 mb-2">{faq.question}</h4>
                     <p className="text-xs text-gray-600 leading-relaxed">{faq.answer}</p>
                    <Footer />
    </div>
                ))}
               <Footer />
    </div>
          </motion.div>
        )}

      </motion.div>
      <Footer />
    </div>
  );
}
