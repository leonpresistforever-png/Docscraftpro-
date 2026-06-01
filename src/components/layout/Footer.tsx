import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1A1A] text-gray-300 pt-16 pb-12 border-t border-[#333] mt-24 w-full font-sans">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand/Compliance statement column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-[#E2BC55] to-[#996A00] flex items-center justify-center shadow-sm">
                <div className="w-4 h-4 border-2 border-white rounded-[1px] rotate-45 transform"></div>
              </div>
              <span className="font-serif font-bold text-xl text-white tracking-tight">DocCraft Pro</span>
            </div>
            <p className="text-gray-400 text-sm max-w-sm mb-6 leading-relaxed">
              Establishing a professional paradigm for document engineering. We weave generative intelligence into seamless and responsive work spaces, optimizing your workflows without limits.
            </p>
            {/* Trust badge compliance indication */}
            <div className="inline-flex items-center gap-2 p-2.5 bg-[#252525] border border-gray-800 rounded-lg text-xs text-dc-gold font-medium">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
              <span>100% Private & Locally Secure Environment</span>
            </div>
          </div>

          {/* Links Column 1: Product info */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-5">Product</h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link to="/features" className="hover:text-[#D4AF37] transition-colors text-gray-400 font-medium">
                  Workspace Features
                </Link>
              </li>
              <li>
                <Link to="/integrations" className="hover:text-[#D4AF37] transition-colors text-gray-400 font-medium">
                  Integrations Hub
                </Link>
              </li>
              <li>
                <Link to="/changelog" className="hover:text-[#D4AF37] transition-colors text-gray-400 font-medium">
                  Changelog & Updates
                </Link>
              </li>
              <li>
                <Link to="/tip" className="hover:text-[#D4AF37] transition-colors text-gray-400 font-medium">
                  Support Our Development
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Resources & Content Strategy */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-5">Resources</h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link to="/blog" className="hover:text-[#D4AF37] transition-colors text-gray-400 font-medium">
                  Technical Guides Hub
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#D4AF37] transition-colors text-gray-400 font-medium">
                  Human Help Support
                </Link>
              </li>
              <li>
                <Link to="/support-form" className="hover:text-[#D4AF37] transition-colors text-gray-400 font-medium">
                  Escalate an Issue
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Legal Compliance */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-5">Compliance</h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link to="/privacy-policy" className="hover:text-[#D4AF37] transition-colors text-gray-400 font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-[#D4AF37] transition-colors text-gray-400 font-medium">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#D4AF37] transition-colors text-gray-400 font-medium">
                  Meet the Team
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-xs text-gray-500">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>&copy; {currentYear} DocCraft Inc. Hand-crafted with absolute technical rigor. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/privacy-policy" className="hover:text-[#D4AF37] transition-colors text-gray-500">
                Privacy
              </Link>
              <span className="text-gray-800">|</span>
              <Link to="/terms-of-service" className="hover:text-[#D4AF37] transition-colors text-gray-500">
                Terms
              </Link>
              <span className="text-gray-800">|</span>
              <Link to="/about" className="hover:text-[#D4AF37] transition-colors text-gray-500">
                E-E-A-T Audit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
