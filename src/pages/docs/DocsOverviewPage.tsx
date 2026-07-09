import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { DocsSidebar } from '../../components/docs/DocsSidebar';
import { Sparkles, Terminal } from 'lucide-react';

export function DocsOverviewPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] font-sans text-stone-850 selection:bg-[#D4AF37] selection:text-white">
      <Navbar />
      
      <div className="flex flex-1 pt-20">
        {/* Left Hand Document Sidebar Navigation */}
        <div className="hidden lg:block border-r border-stone-200 bg-white">
          <DocsSidebar />
        </div>

        {/* Core Editorial Narrative Flow */}
        <main className="flex-1 overflow-y-auto w-full relative">

          <div className="max-w-4xl mx-auto px-6 py-12 lg:px-12 lg:py-20">
            
            {/* Display Editorial Heading */}
            <header className="mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[10px] text-amber-800 font-bold uppercase tracking-widest mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                User Help Center & Manuals
              </div>
              <h1 className="text-4xl lg:text-6xl font-serif font-black tracking-tight mb-6 text-stone-900 leading-tight">
                Docscraft Pro System Overview
              </h1>
              <p className="text-xl text-stone-600 font-serif leading-relaxed italic pl-6 border-l-4 border-[#D4AF37]">
                "A comprehensive, easy-to-use guide to managing documents, designing clear layouts, and keeping your ideas safe and organized. Crafted for writers, designers, and teams who value beautiful, fast, and secure word processing."
              </p>
            </header>

            {/* SPACED SECTION: DESIGN PHILOSOPHY */}
            <section className="py-12 space-y-6">
              <h2 className="text-3xl font-serif font-black text-stone-900 tracking-tight">
                1. Simple Document Creation & Instant Saving
              </h2>
              <p className="text-stone-700 leading-relaxed text-sm md:text-base">
                Docscraft Pro is designed to provide a seamless and fast document writing experience. Unlike traditional clunky document editors that constantly lag, Docscraft Pro is built on a high-speed local environment that saves every single character as you type. All your notes, layout outlines, and draft edits are instantly preserved in your browser's local database.
              </p>
              
              <p className="text-stone-700 leading-relaxed text-sm md:text-base">
                When you create a document, you can organize it with flexible headings, checklists, nested pages, and clean folders. This offline-first approach ensures that your content remains safe, accessible, and fast, whether you are on a train with no signal or at your desk. It avoids losing work due to accidental tab closures, and syncs safely to your cloud account whenever you are online.
              </p>

              <div className="p-6 bg-stone-50 text-stone-850 rounded-2xl border border-stone-200 text-xs space-y-3 leading-relaxed">
                <h4 className="font-bold text-stone-900 uppercase tracking-widest text-[10px]">✨ ORGANIZING YOUR SYSTEM</h4>
                <p>
                  To keep your drafts tidy, use the <strong>Sidebar Navigator</strong> to create custom directories. You can drag and drop folders, mark important items as favorites, or quickly send old ideas to the trash. It's a completely digital notebook experience tailored for modern writing.
                </p>
              </div>

              <p className="text-stone-700 leading-relaxed text-sm md:text-base">
                Our workspace includes several tools to boost your daily writing habit. The built-in stopwatch lets you run timed sprint sessions, tracking your speed and duration to improve productivity. You can also view active reading stats such as word count and character count at a glance, giving you a clear sense of progress as you develop your manuscript or project briefs.
              </p>
            </section>

            {/* DYNAMIC DESIGN CUT & LARGE SPACE */}
            <div className="py-20 flex items-center justify-center">
              <div className="w-24 h-px bg-[#D4AF37]/50" />
              <div className="mx-4 text-[10px] uppercase tracking-widest text-[#AA7A00] font-bold font-mono">
                DOCUMENT STRUCTURE & LAYOUTS
              </div>
              <div className="w-24 h-px bg-[#D4AF37]/50" />
            </div>

            {/* SPACED SECTION: HUMAN COLLABORATION */}
            <section className="py-16 space-y-6">
              <h2 className="text-3xl font-serif font-black text-stone-900 tracking-tight">
                2. Collaboration & Team Work
              </h2>
              <p className="text-stone-700 leading-relaxed text-sm md:text-base">
                Sharing and drafting together has never been cleaner. Docscraft Pro allows multiple authors to contribute to documents and sync updates in real-time. Whether you are collaborating on a shared project plan, outlining an executive report, or writing a team handbook, you will see edits flow dynamically.
              </p>
              
              {/* Decorative block quote with custom border styling */}
              <blockquote className="border-l-4 border-stone-900 pl-6 my-8 py-2 italic text-stone-600 bg-stone-50 rounded-r-xl pr-4">
                "Writing is inherently collaborative. Our platform ensures that team brainstorming and collaborative outlining feel natural, fast, and completely safe."
              </blockquote>

              <p className="text-stone-700 leading-relaxed text-sm md:text-base">
                When collaborating, team members can access real-time revision histories and see who edited each block last. All communication is managed securely through standard web pathways, avoiding unnecessary external servers or tracking scripts, and keeping your workspace completely clean and lightweight.
              </p>
            </section>

            {/* SPACED SECTION: ENTERPRISE DATA PRIVACY */}
            <section className="py-12 space-y-6">
              <h2 className="text-3xl font-serif font-black text-stone-900 tracking-tight">
                3. Absolute Data Privacy & Clean Infrastructure
              </h2>
              <p className="text-stone-700 leading-relaxed text-sm md:text-base">
                We believe that you should have full control over what you write. Every single document, notes page, and folder directory remains strictly private to you or your designated teammates. We comply with industry-standard privacy guidelines to ensure your data is kept secure and handled with maximum care. No tracking cookies are sold, and your text data is never used to train unsolicited marketing algorithms.
              </p>
              <p className="text-stone-700 leading-relaxed text-sm md:text-base">
                By sticking to a clean, minimal infrastructure, Docscraft Pro loads instantly and consumes very little device resource. It is designed to be the ultimate safe haven for personal thoughts, meeting records, professional manuscripts, and sensitive company wikis.
              </p>
            </section>

            {/* DOUBLE DESIGN PAGE BREAK DIVIDER */}
            <div className="py-24 relative flex flex-col items-center justify-center gap-1.5 select-none">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
              <div className="text-[10px] uppercase tracking-widest text-[#AA7A00] font-bold font-mono">
                CLEAN & SECURE WRITING ENVIRONMENT
              </div>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
            </div>





          </div>
        </main>
      </div>
    </div>
  );
}
