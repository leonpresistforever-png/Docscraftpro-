import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Library, Edit3, Smartphone, Laptop, HelpCircle, Code, Award } from 'lucide-react';

export function DocumentationPage() {
  const [activeGuide, setActiveGuide] = useState('getting-started');

  const guides = {
    'getting-started': {
      title: "Docscraft Workspace Overview",
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Welcome to Docscraft Pro, the premier document writing and drafting assistant designed specifically for authors, professionals, and teams. Our workspace offers a clean, distraction-free atmosphere where you can focus entirely on your words. It saves drafts directly to your local browser storage instantly, meaning you never lose a single keystroke.
          </p>
          <h3 className="font-bold text-gray-900 text-lg mt-6 mb-2">Creating and Organizing Drafts</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            To create a draft, head to your central Dashboard and click the <strong className="text-dc-gold">+ Create Document</strong> button. This instantly initializes a clean canvas. From the dashboard, you can also view your active writing stats, use our physical-style writing stopwatch to complete timed sprints, and organize files into folders or send old drafts to the trash.
          </p>
          <div className="bg-[#FAF9F6] border border-dc-border rounded-xl p-5 space-y-2 text-xs">
            <h4 className="font-bold text-gray-900 uppercase tracking-widest text-[10px]">💡 WRITING TIP</h4>
            <p className="text-gray-600 leading-relaxed">
              Use our built-in focus countdown timer with real audio alerts! Setting a 25-minute timer encourages consistent writing sessions. When the timer finishes, a pleasant audio chime plays to let you know it is time to rest.
            </p>
          </div>
        </div>
      )
    },
    'writing-formatting': {
      title: "Formatting & Layout Elements",
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Docscraft makes styling your pages fast and intuitive. As you write, a floating formatting toolbar appears when you select text, enabling you to apply bold, italic, underline, or highlight states instantly.
          </p>
          <div className="space-y-4">
            <div className="bg-[#FAF9F6] p-5 rounded-xl border border-dc-border">
              <h4 className="font-bold text-gray-900 text-sm mb-3">Convenient Editor Triggers</h4>
              <ul className="space-y-2.5 text-xs text-gray-600 pl-4 list-disc">
                <li>Type <code className="bg-white border border-gray-300 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold"># </code> to quickly insert a prominent heading.</li>
                <li>Type <code className="bg-white border border-gray-300 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">- [ ] </code> to spawn an interactive task checkbox list directly inside your editor.</li>
                <li>Type <code className="bg-white border border-gray-300 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">[[ </code> to open the document link popup to connect different drafts together.</li>
              </ul>
            </div>
            
            <h3 className="font-bold text-gray-900 text-lg mt-6">Professional Dividers & Spacers</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              When drafting comprehensive manuals or multi-chapter narratives, organizing sections with visual boundaries is crucial. Our custom divider tool lets you split your canvas perfectly. You can customize dividers dynamically with 15 beautiful colors, and fine-tune their thickness and width to suit your design. Once applied, the cursor automatically shifts to a new typing block below the divider, keeping your creative flow going.
            </p>
          </div>
        </div>
      )
    },
    'affidavit-notary': {
      title: "Affidavit Writing & Hand-Signed Certifications",
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            For users requiring authenticated document structures, Docscraft includes a professional Affidavit generator. This tool inserts a fully formatted, legally minded affidavit template directly into your editing canvas, allowing you to fill out identity details, certify statements, and provide hand-drawn digital signatures.
          </p>
          <h3 className="font-bold text-gray-900 text-lg mt-4 mb-2">How to Draft and Sign an Affidavit</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Creating a certified affidavit statement is simple, direct, and completely secure:
          </p>
          <ul className="list-decimal pl-5 text-xs text-gray-600 space-y-3 leading-relaxed">
            <li>
              <strong>Insert Affidavit Template:</strong> Click on the Affidavit tool inside the canvas settings panel. This loads a professional layout containing standard headings (such as Affiant Identity, Statements of Truth, and Notary Certification).
            </li>
            <li>
              <strong>Fill Out Credentials:</strong> Enter the full legal name, address, and official identity details in the designated input fields.
            </li>
            <li>
              <strong>Statement Checklists:</strong> Certify the zero-trust compliance checkmark list to verify that the statement is compiled by a verified human author.
            </li>
            <li>
              <strong>Digital Signature Pad:</strong> Use your mouse, stylus, or touch screen to draw your authentic hand-written signature on our responsive signature pad. This embeds your signature permanently and securely on the document before exporting.
            </li>
          </ul>
        </div>
      )
    },
    'on-device-ai': {
      title: "Google Gemini Writing Assistant",
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Docscraft is fully integrated with Google Gemini to act as your real-time co-author. Leverage intelligent models to translate paragraphs into multiple languages, fix grammatical errors, summarize chapters, or generate fresh content ideas.
          </p>
          <h3 className="font-bold text-gray-900 text-lg mt-4 mb-2">Leveraging the LLM Assistant</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Our assistant operates entirely server-side, protecting your draft details. Simply click the AI Assistant panel on the editor, choose your desired task (such as "Summarize" or "Enhance Style"), or ask a direct question, and watch the model draft responses in real-time.
          </p>
        </div>
      )
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-dc-text pt-24 flex flex-col justify-between">
      <Navbar />

      <main className="w-full max-w-[1200px] mx-auto px-6 py-12 flex-1">
        <div className="border-b border-gray-200 pb-8 mb-12">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[#1a1a1a] font-serif mb-2">Technical Guides & Manuals</h1>
          <p className="text-gray-500 font-medium">Step-by-step documentation for compiling and formatting documents.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Documentation navigation */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="space-y-1 bg-white border border-gray-200 rounded-2xl p-4 shadow-xs sticky top-28">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 py-2">Quick Manuals</p>
              <button 
                onClick={() => setActiveGuide('getting-started')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${activeGuide === 'getting-started' ? 'bg-[#1a1a1a] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Library className="w-4 h-4" /> Workspace Basics
              </button>
              <button 
                onClick={() => setActiveGuide('writing-formatting')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${activeGuide === 'writing-formatting' ? 'bg-[#1a1a1a] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Edit3 className="w-4 h-4" /> Formatting Tricks
              </button>
              <button 
                onClick={() => setActiveGuide('affidavit-notary')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${activeGuide === 'affidavit-notary' ? 'bg-[#1a1a1a] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Award className="w-4 h-4" /> Affidavit Drafting
              </button>
              <button 
                onClick={() => setActiveGuide('on-device-ai')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${activeGuide === 'on-device-ai' ? 'bg-[#1a1a1a] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Code className="w-4 h-4" /> Gemini AI Writing
              </button>
            </nav>
          </aside>

          {/* Active Manual Display */}
          <div className="flex-1 max-w-3xl bg-white border border-[#E4DBC5] rounded-3xl p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] uppercase tracking-wide mb-6 border-b border-gray-100 pb-4 font-serif">
              {guides[activeGuide as keyof typeof guides].title}
            </h2>
            {guides[activeGuide as keyof typeof guides].content}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
