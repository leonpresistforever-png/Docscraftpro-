import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { motion } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { articles } from '../data/articles';
import { BookOpen, Calendar, ChevronRight } from 'lucide-react';
import { ArticlePage } from './ArticlePage';

export function BlogPage() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get('slug');

  // If a slug is present, render the ArticlePage instead
  if (slug) {
    const article = articles.find(a => a.slug === slug);
    if (article) {
      return <ArticlePage article={article} />;
    }
  }

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

  const categories = Array.from(new Set(articles.map(a => a.category)));

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-gray-800 pt-24 flex flex-col justify-between selection:bg-[#D4AF37] selection:text-white">
      <Navbar />

      <main className="w-full max-w-5xl mx-auto px-6 py-12 flex-1">
        <motion.div initial="hidden" animate="show" variants={container}>
          
          <motion.div variants={item} className="mb-12 text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[#1a1a1a] font-serif mb-4">
              Development Hub
            </h1>
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              Explore deep dives into document architecture, PDF parsing, real-time web rendering, and scalable technical frameworks.
            </p>
          </motion.div>

          {categories.map((category) => (
            <div key={category} className="mb-12">
              <motion.div variants={item} className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-2">
                <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">{category}</h2>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.filter(a => a.category === category).map((article) => (
                  <motion.div variants={item} key={article.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group">
                    <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{article.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:text-[#D4AF37] transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-6 flex-1">
                      {article.excerpt}
                    </p>
                    <Link to={`/blog?slug=${article.slug}`} className="inline-flex items-center text-xs font-bold text-[#1a1a1a] group-hover:text-[#D4AF37] uppercase tracking-wider mt-auto">
                      Read Article <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
