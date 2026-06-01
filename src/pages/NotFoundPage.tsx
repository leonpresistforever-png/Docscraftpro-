import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { motion } from 'motion/react';
import { HelpCircle, Home, LogIn } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 pt-24 flex flex-col justify-between selection:bg-[#D4AF37] selection:text-white">
      <Navbar />

      <main className="w-full max-w-[600px] mx-auto px-6 py-20 flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Centered Graphic Icon */}
          <div className="w-20 h-20 bg-amber-50 rounded-full border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
            <HelpCircle className="w-10 h-10 text-[#D4AF37] animate-bounce" />
          </div>

          <div className="space-y-2">
            <h1 className="text-6xl font-black text-gray-900 tracking-tight font-serif">404</h1>
            <h2 className="text-2xl font-bold uppercase text-[#1a1a1a] tracking-wide">Coordinates Lost</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
              We parsed your requested byte path, but this specific page allocation does not exist across our system nodes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#333] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm uppercase tracking-wider"
            >
              <Home className="w-4 h-4" />
              Return Home
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm uppercase tracking-wider"
            >
              <LogIn className="w-4 h-4 text-dc-gold" />
              Go to Dashboard
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
