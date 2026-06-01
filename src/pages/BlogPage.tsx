import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { articles, Article } from '../data/articles';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BookOpen, Clock, ArrowLeft, HelpCircle, ChevronRight, Share2, Check, Copy } from 'lucide-react';

const CATEGORIES = [
  "All Guides",
  "Core Technology & File Parsers",
  "Data Structuring & API Implementations",
  "User Interface, Data Visualization & Formatting",
  "Web Architecture & Production Optimization"
] as const;

export function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    if (categoryParam && CATEGORIES.includes(categoryParam as any)) {
      return categoryParam;
    }
    return "All Guides";
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [copied, setCopied] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Sync category state from search params whenever they change
  useEffect(() => {
    if (categoryParam && CATEGORIES.includes(categoryParam as any)) {
      setSelectedCategory(categoryParam);
    } else if (!categoryParam) {
      setSelectedCategory("All Guides");
    }
  }, [categoryParam]);

  // Filter logic
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesCategory = selectedCategory === "All Guides" || article.category === selectedCategory;
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleShare = (article: Article) => {
    const url = `${window.location.origin}/blog?slug=${article.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 pt-24 flex flex-col justify-between">
      <Navbar />

      <main className="w-full max-w-[1240px] mx-auto px-6 py-12 flex-1 relative z-10">
        <AnimatePresence mode="wait">
          {!activeArticle ? (
            // ================= INDEX VIEW =================
            <motion.div
              key="index"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-10"
            >
              {/* Hub Intro */}
              <div className="border-b border-gray-200 pb-8 text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-800 font-bold uppercase tracking-widest mb-3">
                  <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Knowledge Base
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[#1a1a1a] font-serif">
                  Technical Documentation Hub
                </h1>
                <p className="text-gray-500 mt-2 text-sm md:text-base leading-relaxed">
                  Deep-dives and production recipes crafted by engineers, for engineers. Browse our curated blueprints across parsing, schema architecture, UI layouts, and performance auditing.
                </p>
              </div>

              {/* Filtering Controls Row */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                {/* Search field */}
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search titles, concepts, and keywords..."
                    className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all text-sm bg-[#FAF9F6] text-gray-800 placeholder:text-gray-400 font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Counter */}
                <div className="text-xs font-mono text-gray-500 shrink-0">
                  Showing {filteredArticles.length} Technical Guides
                </div>
              </div>

              {/* Horizontal Scroll Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none font-medium text-xs md:text-sm">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                    }}
                    className={`px-4 py-2 rounded-full border transition-all shrink-0 cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#1A1A1A] border-[#1A1A1A] text-white font-bold"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 shadow-sm"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Live Search Error Handling */}
              {filteredArticles.length === 0 ? (
                <div className="text-center py-20 bg-white border border-gray-200 rounded-3xl shadow-sm">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-bold text-gray-700">No guides match your query</p>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto mt-1">
                    Try adjusting your search filters or select "All Guides" to explore the full index.
                  </p>
                </div>
              ) : (
                // Article Grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((article, idx) => (
                    <motion.article
                      key={article.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.4 }}
                      onClick={() => {
                        setActiveArticle(article);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-0.5"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                          <span className="truncate max-w-[200px]">{article.category}</span>
                          <span className="flex items-center gap-1 shrink-0 text-gray-400 font-mono">
                            <Clock className="w-3 h-3" />
                            {article.readTime}
                          </span>
                        </div>
                        <h2 className="text-lg font-black text-[#1a1a1a] leading-tight group-hover:text-indigo-600 transition-colors font-serif uppercase tracking-tight line-clamp-2">
                          {article.title}
                        </h2>
                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                          {article.excerpt}
                        </p>
                      </div>

                      <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold uppercase text-gray-700 group-hover:text-[#D4AF37] transition-colors">
                        <span>Read Full Blueprint</span>
                        <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            // ================= DETAIL VIEW =================
            <motion.div
              key="detail"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              {/* Back to index controls */}
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <button
                  onClick={() => {
                    setActiveArticle(null);
                    setOpenFaqIndex(null);
                  }}
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Hub Index
                </button>

                {/* Quick actions panel */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShare(activeArticle)}
                    className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-600 hover:text-[#D4AF37] transition-all flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
                    title="Copy direct share Link"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              {/* Title & Metadata (Required: Exactly one <h1> matching the title) */}
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-800 font-bold uppercase tracking-widest mb-2">
                  {activeArticle.category}
                </span>
                
                {/* Single <h1> Element as required */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase text-[#1a1a1a] font-serif leading-tight tracking-tight">
                  {activeArticle.title}
                </h1>

                <div className="flex flex-wrap gap-4 items-center text-xs font-mono text-gray-400 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Estimated: {activeArticle.readTime}
                  </span>
                  <span>|</span>
                  <span>100% Peer-Reviewed</span>
                  <span>|</span>
                  <span className="text-[#D4AF37] font-bold uppercase">Technical Blueprint</span>
                </div>
              </div>

              {/* Main Content Body */}
              <div className="bg-white p-6 md:p-10 rounded-2xl border border-gray-200 shadow-sm">
                <div 
                  className="prose prose-blue max-w-none text-gray-600 leading-relaxed space-y-6 text-sm md:text-base"
                  dangerouslySetInnerHTML={{ __html: activeArticle.content }}
                />
              </div>

              {/* DEDICATED FAQ SECTION (Mandated to address search intent) */}
              {activeArticle.faqs && activeArticle.faqs.length > 0 && (
                <div className="bg-[#FAF9F6] p-6 md:p-8 rounded-2xl border border-gray-200 space-y-6">
                  <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
                    <HelpCircle className="w-5.5 h-5.5 text-[#D4AF37]" />
                    <h3 className="text-lg font-black uppercase tracking-wider text-gray-900 font-sans">
                      Target FAQ & Search Answers
                    </h3>
                  </div>

                  <div className="space-y-3 font-sans">
                    {activeArticle.faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200"
                      >
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="w-full text-left px-5 py-4 font-bold text-gray-800 hover:text-indigo-600 flex justify-between items-center text-sm md:text-base outline-none cursor-pointer"
                        >
                          <span>{faq.question}</span>
                          <span className="text-dc-gold font-bold ml-2 shrink-0">
                            {openFaqIndex === idx ? "−" : "+"}
                          </span>
                        </button>
                        
                        <div
                          className={`transition-all duration-300 ease-in-out ${
                            openFaqIndex === idx ? "max-h-[300px] border-t border-gray-50 opacity-100 p-5" : "max-h-0 opacity-0 overflow-hidden"
                          }`}
                        >
                          <p className="text-gray-500 text-sm leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Footer Back button */}
              <div className="pt-6 border-t border-gray-200 text-center">
                <button
                  onClick={() => {
                    setActiveArticle(null);
                    setOpenFaqIndex(null);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#333] transition-all cursor-pointer shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Index Guides
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
