import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Library, Edit3, Smartphone, Laptop, HelpCircle, Code } from 'lucide-react';

export function DocumentationPage() {
  const [activeGuide, setActiveGuide] = useState('getting-started');

  const guides = {
    'getting-started': {
      title: "Docscraft Core Workspace Overview",
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Welcome to Docscraft Pro, the ultimate local text design and canvas tool. Our system operates client-first, leveraging advanced local browser caches, localized databases, and WebAssembly packages to compile and design documents securely.
          </p>
          <h3 className="font-bold text-gray-900 text-lg mt-6 mb-2">Creating Your First Document</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Navigate to the primary user Dashboard, then press the <strong className="text-dc-gold">+ Create</strong> button. This instantiates a blank template in the browser and loads our minimalist text sandbox. Write freely, format instantly via the floating markup bar, and copy markdown styles smoothly.
          </p>
          <div className="bg-[#FAF9F6] border border-dc-border rounded-xl p-5 space-y-2 text-xs">
            <h4 className="font-bold text-gray-900 uppercase tracking-widest text-[10px]">💡 WORKSPACE DESIGN TIP</h4>
            <p className="text-gray-600 leading-relaxed">
              If you require a fully decoupled and private experience, register a local Demo Account. All pages created will save directly to your physical browser's local cache without transmitting document content to external servers.
            </p>
          </div>
        </div>
      )
    },
    'writing-formatting': {
      title: "Formatting & Inline Logic",
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Docscraft supports standard Markdown formatting and inline blocks out of the box, letting you structure drafts cleanly using rapid triggers.
          </p>
          <div className="space-y-4">
            <div className="bg-[#FAF9F6] p-5 rounded-xl border border-dc-border">
              <h4 className="font-bold text-gray-900 text-sm mb-3">Core Keyboard Triggers</h4>
              <ul className="space-y-2.5 text-xs text-gray-600 pl-4 list-disc">
                <li>Type <code className="bg-white border border-gray-300 font-mono text-[10px] px-1.5 py-0.5 rounded font-black"># </code> to write standard display headings.</li>
                <li>Type <code className="bg-white border border-gray-300 font-mono text-[10px] px-1.5 py-0.5 rounded font-black">- [ ] </code> to spawn a dynamic checkbox checklist directly on any line.</li>
                <li>Type <code className="bg-white border border-gray-300 font-mono text-[10px] px-1.5 py-0.5 rounded font-black">[[ </code> inside the active document text to open the inline document link finder.</li>
              </ul>
            </div>
            
            <h3 className="font-bold text-gray-900 text-lg mt-6">KaTeX & Mathematical Equating</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              To write professional math equations and matrix formulas inline, wrap your variables inside double dollar signs <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-800">$$</code>. The engine compiles and renders math symbols in real-time.
            </p>
          </div>
        </div>
      )
    },
    'on-device-ai': {
      title: "Offline AI & WebGPU Models",
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Docscraft ships with integration for offline localized intelligence. Run on-device micro-models (such as SmolLM or Llama) directly inside your GPU without sending data to any cloud service.
          </p>
          <h3 className="font-bold text-gray-900 text-lg mt-4 mb-2">WebGPU Checklist</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            To execute local models, confirm that your current web browser and device hardware support native WebGPU access (recommended browsers are Google Chrome, Microsoft Edge, or Opera Desktop).
          </p>
          <ul className="list-decimal pl-5 text-xs text-gray-600 space-y-2 leading-relaxed">
            <li>Navigate to the <strong>Model Library</strong> from your sidebar dashboard.</li>
            <li>Select an appropriate model configuration (e.g. <strong>SmolLM (135M) - MICRO</strong> for fast prototypes on limited RAM).</li>
            <li>Press <strong>Init Model</strong>. The browser will retrieve shard segments to local storage, initialize WebGPU kernels, and set up your secure on-device AI terminal.</li>
          </ul>
        </div>
      )
    },
    'mermaid-diagrams': {
      title: "Mermaid Diagrams & Flowcharts",
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Docscraft Pro supports natively rendering code-driven diagrams and flowcharts directly inside your document canvas using <strong>Mermaid.js</strong>.
          </p>
          <h3 className="font-bold text-gray-900 text-lg mt-4 mb-2">How to Render Diagrams</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            You can insert beautiful schema blueprints and logic flowcharts without leaving your keyboard or drawing manually.
          </p>
          <ul className="list-decimal pl-5 text-xs text-gray-600 space-y-3 leading-relaxed">
            <li>
              <strong>Direct Button Insert:</strong> Click on the <strong className="text-purple-600">Share/Network icon</strong> inside the floating rich-text toolbar at the top of the editor. This instantly embeds a new Mermaid Box.
            </li>
            <li>
              <strong>Toggling Code:</strong> Inside the rendered diagram block, click the <strong>"Edit Script"</strong> button. The box flips to an embedded code terminal where you can write Mermaid syntax (e.g., <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">graph TD</code>).
            </li>
            <li>
              <strong>Render & Verify:</strong> Click <strong>"View Diagram"</strong> on the box header to compile the syntax into a beautifully scaled, interactive SVG flowchart right within the page. If there is a typo, the syntax error will be highlighted gracefully.
            </li>
          </ul>
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
                onClick={() => setActiveGuide('on-device-ai')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${activeGuide === 'on-device-ai' ? 'bg-[#1a1a1a] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Code className="w-4 h-4" /> Local GPU Models
              </button>
              <button 
                onClick={() => setActiveGuide('mermaid-diagrams')}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-colors cursor-pointer ${activeGuide === 'mermaid-diagrams' ? 'bg-[#1a1a1a] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Code className="w-4 h-4" /> Mermaid Diagrams
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
