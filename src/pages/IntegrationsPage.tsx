import React from 'react';
import { Navbar } from '../components/layout/Navbar';

export function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-dc-text pt-24">
      <Navbar />
      <main className="w-full max-w-[1000px] mx-auto px-6 py-12">
        <h1 className="text-4xl md:text-5xl font-black mb-8 uppercase tracking-tight text-[#1a1a1a]">Integrations</h1>
        <div className="bg-white p-8 rounded-2xl border border-[#E4DBC5] shadow-sm">
           <h2 className="text-2xl font-black text-[#1a1a1a] mb-4">Connect Your Stack</h2>
           <p className="text-gray-600 mb-6 leading-relaxed">
             Seamlessly integrate DocCraft with your favorite tools and platforms.
           </p>
        </div>
      </main>
      <footer className="bg-white pt-12 pb-12 border-t border-[#E4DBC5] mt-24">
        <div className="max-w-[1400px] mx-auto px-6 text-center text-xs text-gray-400">
           <p>&copy; 2026 DocCraft Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
