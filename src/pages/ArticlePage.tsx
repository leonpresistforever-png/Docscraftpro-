import { Footer } from "../components/layout/Footer";
import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, ChevronRight } from 'lucide-react';
import { Article } from '../data/articles';

export function ArticlePage({ article }: { article: Article }) {
  // Dynamic SEO Page Title & Schema markup injection for 3x site boost in Google Search Rankings
  useEffect(() => {
    // 1. Set dynamic page title
    const originalTitle = document.title;
    document.title = `${article.title} | DocsCraft Pro Official Blog`;

    // 2. Inject JSON-LD Schema markup for Google Rich Snippets
    const schemaId = "seo-article-schema";
    let scriptEl = document.getElementById(schemaId) as HTMLScriptElement;
    
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = schemaId;
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": article.title,
      "description": article.excerpt,
      "datePublished": "2026-07-01T08:00:00+00:00",
      "dateModified": "2026-07-07T08:00:00+00:00",
      "author": {
        "@type": "Organization",
        "name": "DocsCraft Pro"
      },
      "publisher": {
        "@type": "Organization",
        "name": "DocsCraft Pro",
        "logo": {
          "@type": "ImageObject",
          "url": "https://docscraft.pro/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://docscraft.pro/blog?slug=${article.slug}`
      }
    };

    // If Article has FAQs, append FAQPage schema for Google rich answers
    if (article.faqs && article.faqs.length > 0) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": article.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      };
      scriptEl.textContent = JSON.stringify([articleSchema, faqSchema]);
    } else {
      scriptEl.textContent = JSON.stringify(articleSchema);
    }

    return () => {
      document.title = originalTitle;
      const scriptToRemove = document.getElementById(schemaId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [article]);

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
    <div className="w-full flex flex-col min-h-screen">
      <motion.div initial="hidden" animate="show" variants={container} className="flex-1 max-w-4xl mx-auto px-6 py-8 w-full">
        
        {/* Breadcrumb / Back Navigation */}
        <motion.div variants={item} className="mb-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
          <Link to="/blog" className="hover:text-red-500 flex items-center transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Archive Hub
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 mx-1" />
          <span className="text-gray-400 truncate max-w-[200px] md:max-w-md">{article.title}</span>
        </motion.div>

        {/* Article Header */}
        <motion.div variants={item} className="mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full text-[10px] text-red-800 font-bold uppercase tracking-widest mb-4">
            <FileText className="w-3.5 h-3.5 text-red-500" />
            {article.category}
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#1a1a1a] font-serif mb-4 leading-tight">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
            <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-red-500" /> {article.readTime}</div>
          </div>
        </motion.div>

        {/* Article Content Body */}
        <motion.div variants={item} className="bg-white p-6 md:p-10 rounded-2xl border border-gray-200 shadow-sm mb-12">
          <div className="prose prose-stone max-w-none text-gray-700 leading-relaxed prose-headings:font-serif prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-red-500 hover:prose-a:text-red-600 prose-a:transition-colors prose-pre:bg-gray-50 prose-pre:text-gray-800 prose-pre:border prose-pre:border-gray-200 prose-pre:shadow-inner"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </motion.div>

        {/* FAQ Schema Section */}
        {article.faqs && article.faqs.length > 0 && (
          <motion.div variants={item} className="bg-white p-6 md:p-10 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden mb-12">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-200 to-red-500"></div>
             <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 font-serif">
                <span className="text-red-500">?</span> Frequently Asked Questions
             </h3>
             <div className="space-y-6">
                {article.faqs.map((faq, index) => (
                  <div key={index} className="bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-xs">
                     <h4 className="font-bold text-sm text-gray-900 mb-2">{faq.question}</h4>
                     <p className="text-xs text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
             </div>
          </motion.div>
        )}

      </motion.div>
      <Footer />
    </div>
  );
}
