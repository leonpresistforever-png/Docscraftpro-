import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-[100] bg-white text-gray-600 pt-16 pb-12 border-t border-gray-100 mt-24 w-full font-sans">
      <div className="max-w-[1240px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-10 mb-16">
          {/* Brand statement column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-[#E2BC55] to-[#996A00] flex items-center justify-center shadow-sm">
                <div className="w-4 h-4 border-2 border-white rounded-[1px] rotate-45 transform"></div>
              </div>
              <span className="font-serif font-bold text-xl text-gray-900 tracking-tight">Docscraft Pro</span>
            </div>
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
              The intelligent, seamless workspace for high-velocity teams. Write down your ideas, and let our intelligence build the connections.
            </p>
          </div>

          {/* PRODUCT */}
          <div>
            <h4 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider mb-5">Product</h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link to="/features" className="hover:text-[#D4AF37] transition-colors text-gray-500 font-medium">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#D4AF37] transition-colors text-gray-500 font-medium">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/integrations" className="hover:text-[#D4AF37] transition-colors text-gray-500 font-medium">
                  Integrations
                </Link>
              </li>
              <li>
                <Link to="/changelog" className="hover:text-[#D4AF37] transition-colors text-gray-500 font-medium">
                  Changelog
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#D4AF37] transition-colors text-gray-500 font-medium">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* SOLUTIONS */}
          <div>
            <h4 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider mb-5">Solutions</h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link to="/enterprise-platform" className="hover:text-[#D4AF37] transition-colors text-gray-500 font-medium">
                  Enterprise Platform
                </Link>
              </li>
              <li>
                <Link to="/ai-document-automation" className="hover:text-[#D4AF37] transition-colors text-gray-500 font-medium">
                  Document Automation
                </Link>
              </li>
              <li>
                <Link to="/security-infrastructure" className="hover:text-[#D4AF37] transition-colors text-gray-500 font-medium">
                  Security & Infrastructure
                </Link>
              </li>
            </ul>
          </div>

          {/* DEVELOPERS */}
          <div>
            <h4 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider mb-5">Developers</h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link to="/docs" className="hover:text-[#D4AF37] transition-colors text-gray-500 font-medium">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h4 className="font-bold text-gray-900 uppercase text-[11px] tracking-wider mb-5">Company</h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-[#D4AF37] transition-colors text-gray-500 font-medium">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#D4AF37] transition-colors text-gray-500 font-medium">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col items-center text-center">
          <p className="text-xs text-gray-800 font-bold mb-3">&copy; {currentYear} Docscraft Inc. All rights reserved.</p>
          <p className="text-[11px] text-gray-500 max-w-2xl leading-relaxed mb-6">
            We believe in transparent, honest privacy policies. You own your data. We don't train our models on your private documents unless you explicitly opt in, and you can delete your account at any time.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-[11px] font-medium text-gray-500">
            <Link to="/privacy-policy" className="hover:text-gray-900 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/compliance" className="hover:text-gray-900 transition-colors">
              Compliance
            </Link>
            <Link to="/terms-of-service" className="hover:text-gray-900 transition-colors">
              Terms of Service
            </Link>
            <Link to="/disclaimer" className="hover:text-gray-900 transition-colors">
              Disclaimer
            </Link>
            <Link to="/privacy-policy" className="hover:text-gray-900 transition-colors">
              Cookie Setting
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
