import React from 'react';
import { Navbar } from '../components/layout/Navbar';

export function BlogPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-dc-text pt-24">
      <Navbar />
      <main className="w-full max-w-[1000px] mx-auto px-6 py-12">
        <h1 className="text-4xl md:text-5xl font-black mb-8 uppercase tracking-tight text-[#1a1a1a]">Blog</h1>
        
        <div className="space-y-12">
          <article className="bg-white p-8 rounded-2xl border border-[#E4DBC5] shadow-sm">
             <div className="text-sm font-bold text-[#D4AF37] mb-2 uppercase tracking-widest">Company News</div>
             <h2 className="text-2xl font-black text-[#1a1a1a] mb-4">DocCraft Pro Launches Next-Gen Workspace</h2>
             <p className="text-gray-600 mb-6 leading-relaxed">
               Welcome to the future of collaborative document engineering. We are thrilled to announce out new features focusing on secure, reliable, and frictionless documentation experiences.
             </p>
             <button className="text-sm font-bold uppercase disabled opacity-50">Read More</button>
          </article>

          <article className="bg-white p-8 rounded-2xl border border-[#E4DBC5] shadow-sm">
             <div className="text-sm font-bold text-[#D4AF37] mb-2 uppercase tracking-widest">Engineering</div>
             <h2 className="text-2xl font-black text-[#1a1a1a] mb-4">Building a Scalable CRDT Engine</h2>
             <p className="text-gray-600 mb-6 leading-relaxed">
               Discover how our engineering team optimized peer-to-peer data synchronization to handle concurrent user typing across large enterprise documents with zero visual merge conflicts.
             </p>
             <button className="text-sm font-bold uppercase disabled opacity-50">Read More</button>
          </article>
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
