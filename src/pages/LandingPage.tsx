import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { FileText, Cpu, CheckCircle, Boxes, Search, Download } from 'lucide-react';
import { motion, useAnimation } from 'motion/react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RobotCompanion } from '../components/ui/RobotCompanion';
import { Sparkles } from 'lucide-react'; // if not already imported

import { getLocalCurrencyInfo } from '../utils/currency';

export function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUserCredits } = useAuth();
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDegree, setFlipDegree] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const currency = getLocalCurrencyInfo();
  
  const tier1Price = (299 * currency.rateToRupee).toFixed(currency.code === 'INR' ? 0 : 2);
  const tier2Price = (799 * currency.rateToRupee).toFixed(currency.code === 'INR' ? 0 : 2);
  const tier3Price = (1299 * currency.rateToRupee).toFixed(currency.code === 'INR' ? 0 : 2);

  useEffect(() => {
    setIsLoaded(true);
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('scrollTo') === 'subscription') {
      const scroll = () => {
         const el = document.getElementById('subscription');
         if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
         } else {
            setTimeout(scroll, 100);
         }
      };
      setTimeout(scroll, 100);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [location]);

  const handleInstallClick = async () => {
    const isIframe = window !== window.top;

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIframe) {
      alert('To install the app, please open it in a new tab first (using the link icon at the top right of the preview). Browsers restrict PWA installation inside iframes.');
    } else {
      alert('Ensure you are using a Chromium-based browser (Chrome/Edge/Brave) or Safari on iOS, and the app is done loading. It may also already be installed.');
    }
  };

  const handleLaunch = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setFlipDegree(1080);
    }, 350);
  };
  
  const finishLaunch = () => {
    navigate('/dashboard'); // or whatever workspace route
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FDFBF7] font-sans text-dc-text pt-24 group">
      {/* Subtle Grid Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-transparent pointer-events-none z-0" />

      <Navbar />

      <main className="w-full max-w-[1400px] mx-auto px-6 relative z-10 pt-10">
        
        {/* Top Text Block */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col lg:flex-row justify-between items-start mb-24 gap-12"
        >
          {/* Custom 3D Logo Section */}
          <div className="flex-shrink-0 flex flex-col items-center ml-8 hidden lg:flex">
             <div className="relative w-32 h-32 mb-4 drop-shadow-[0_15px_15px_rgba(212,175,55,0.4)]">
               <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                 <path d="M20 20 L50 10 L80 20 L90 50 L80 80 L50 90 L20 80 L10 50 Z" fill="url(#metalGold)" stroke="#FFF" strokeWidth="2" />
                 <path d="M20 20 L80 80 M80 20 L20 80" stroke="#FFF" strokeWidth="4" />
                 <path d="M30 30 L50 50 L70 30" fill="none" stroke="#D4AF37" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                 <path d="M30 70 L50 50 L70 70" fill="none" stroke="#D4AF37" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                 <defs>
                   <linearGradient id="metalGold" x1="0" y1="0" x2="100" y2="100">
                     <stop offset="0%" stopColor="#FFF2B2" />
                     <stop offset="50%" stopColor="#D4AF37" />
                     <stop offset="100%" stopColor="#AA7A00" />
                   </linearGradient>
                 </defs>
               </svg>
             </div>
             <h2 className="font-serif font-bold text-3xl tracking-tight leading-none text-[#1A1A1A]">DocCraft Pro</h2>
             <span className="text-sm font-sans tracking-widest text-[#555] uppercase mt-2">Workspace</span>
          </div>

          {/* Huge Main Text */}
          <div className="lg:max-w-[70%]">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-sans font-black tracking-tight leading-[0.95] text-[#1a1a1a] uppercase">
              Experience the future of <br/>
              collaborative document <br/>
              engineering. Seamless. <br/>
              Integrated. Limitless. <br/>
              <span className="text-gray-500 transform inline-block">The Ultimate Ecosystem <br/>for Intelligent Work.</span>
            </h1>
          </div>
        </motion.div>

        {/* Outline Text */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
           transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
           className="flex flex-col items-center justify-center mb-24 relative z-20"
        >
           <h2 className="text-center text-3xl md:text-5xl lg:text-[4rem] font-black uppercase text-[#1a1a1a] leading-[1.1] max-w-5xl tracking-tight">
             <svg viewBox="0 0 450 80" className="inline-block w-[240px] md:w-[320px] lg:w-[420px] -mb-2 align-middle">
               <defs>
                 <linearGradient id="neonText" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" stopColor="#ff0040" />
                   <stop offset="25%" stopColor="#ff8c00" />
                   <stop offset="50%" stopColor="#D4AF37" />
                   <stop offset="75%" stopColor="#4169e1" />
                   <stop offset="100%" stopColor="#8a2be2" />
                 </linearGradient>
               </defs>
               <text
                 x="10" y="65%"
                 textAnchor="start" dominantBaseline="middle"
                 className="font-sans text-[65px] md:text-[80px] tracking-tighter font-black animate-text-trace fill-transparent"
                 stroke="url(#neonText)"
                 strokeWidth="3"
                 strokeDasharray="100 200"
               >
                 NEXUS DOCS
               </text>
             </svg>
             {" "}IS THE NEXT GENERATION AI-FIRST WORKSPACE.
           </h2>

           <motion.button
             onClick={handleInstallClick}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="mt-12 flex items-center gap-3 px-8 py-4 bg-[#1a1a1a] hover:bg-black text-white rounded-full font-bold uppercase tracking-widest text-sm shadow-[0_10px_20px_rgba(0,0,0,0.2)] transition-colors border border-gray-700 overflow-hidden group relative"
           >
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out" />
             <Download className="w-5 h-5 group-hover:animate-bounce text-[#D4AF37]" />
             <span>Install App</span>
           </motion.button>
        </motion.div>

        {/* Central Button & Robot Container */}
        <div className="flex flex-col items-center justify-center relative min-h-[500px] mb-32 z-30">
           
           {/* Background Floating Elements */}
           <FloatingElements />

           {/* Robot Positioned above/beside button */}
           <motion.div 
             initial={{ opacity: 0, scale: 0, y: 150 }}
             animate={isLoaded ? { opacity: 1, scale: 1, y: 0 } : {}}
             transition={{ type: "spring", damping: 15, delay: 0.6 }}
             className="absolute z-40 transform translate-x-[40px] md:translate-x-[180px] -translate-y-[110px] md:-translate-y-[110px] scale-[0.85] md:scale-[1.1] origin-bottom pointer-events-auto"
           >
             <RobotCompanion isActionTriggered={isFlipping} onFlipComplete={finishLaunch} />
           </motion.div>

           {/* Flippable Button Container */}
           <motion.div 
             initial={{ opacity: 0, y: 40 }}
             animate={isLoaded ? (isFlipping ? { rotateY: flipDegree, scale: 0.9, y: 20, opacity: 1 } : { rotateY: 0, scale: 1, y: 0, opacity: 1 }) : { opacity: 0 }}
             transition={isFlipping ? { duration: 1.8, ease: "backInOut" } : { duration: 0.8, delay: 0.4 }}
             className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] [transform-style:preserve-3d] perspective-[1500px] z-30 cursor-pointer group"
             onClick={handleLaunch}
           >
              {/* Front Face - Golden Button */}
              <div className="absolute inset-0 [backface-visibility:hidden] bg-gradient-to-br from-[#E2BC55] via-[#C5A038] to-[#996A00] rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(212,175,55,0.6),inset_0_4px_10px_rgba(255,255,255,0.7),inset_0_-8px_20px_rgba(0,0,0,0.4)] border-2 border-[#F4E091] flex items-center justify-center transition-transform hover:scale-105 hover:-translate-y-2 duration-300">
                 {/* Neon Blue accent lines */}
                 <div className="absolute left-0 top-10 bottom-10 w-[4px] bg-[#60A5FA] blur-[2px] rounded-full opacity-80" />
                 <div className="absolute left-1 top-10 bottom-10 w-[2px] bg-[#93C5FD] rounded-full opacity-100 shadow-[0_0_12px_#60A5FA]" />
                 <div className="absolute bottom-1 right-10 left-10 h-[2px] bg-[#93C5FD] rounded-full opacity-60 shadow-[0_0_12px_#60A5FA]" />
                 
                 <span className="text-white font-serif text-3xl md:text-4xl shadow-sm drop-shadow-md text-center leading-tight">Your<br/>Documents</span>
              </div>

              {/* Back Face - Waking Console */}
              <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#1A1A1A] rounded-[3rem] shadow-2xl border-2 border-[#D4AF37]/50 flex items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #D4AF37 2px, #D4AF37 4px)' }}></div>
                 <span className="text-[#D4AF37] font-mono font-bold text-2xl relative z-10 animate-pulse">WAKING...</span>
              </div>
           </motion.div>
        </div>

        {/* Feature Cards Bottom */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto z-40 relative">
          <FeatureCard 
            title="SMART CREATION"
            description="Create template-driven and interview-based dynamic documents."
            icon={<FileText className="w-8 h-8 text-[#D4AF37] opacity-80" strokeWidth={1.5} />}
          />
          <FeatureCard 
            title="DATA EXTRACTION"
            description="AI-powered data extraction for advanced document processing"
            icon={<Boxes className="w-8 h-8 text-[#D4AF37] opacity-80" strokeWidth={1.5} />}
          />
        </div>
      </main>

      {/* Section 1: Dark Mode API / Code Showcase */}
      <section className="bg-[#0a0a0a] text-white py-32 relative border-t-[6px] border-[#D4AF37] mt-32">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-xs mb-4 block">Developer-First</span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight uppercase font-sans tracking-tight">
              Headless.<br /> Composable.<br /> Brilliant.
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed font-sans max-w-md">
              Tap into DocCraft Pro's robust block-based architecture via our GraphQL and REST APIs. Everything is an object, letting you sculpt documentation exactly how you need it.
            </p>
            <div className="flex gap-4">
              <button className="bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-gray-200 transition-colors">Read Docs</button>
              <button className="border border-gray-700 text-white font-semibold px-6 py-3 rounded-full hover:border-[#D4AF37] transition-colors">View API Reference</button>
            </div>
          </div>
          <div className="bg-[#111] rounded-2xl border border-gray-800 shadow-2xl p-6 relative overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="flex gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <pre className="font-mono text-sm leading-relaxed overflow-x-auto text-gray-300">
              <code>
                <span className="text-purple-400">const</span> doc = <span className="text-purple-400">await</span> Nexus.<span className="text-blue-400">createDocument</span>({'{'}<br />
                {'  '}title: <span className="text-green-400">'Project Orion Requirements'</span>,<br />
                {'  '}workspaceId: <span className="text-green-400">'wksp_09xjf'</span>,<br />
                {'  '}blocks: [<br />
                {'    '}{'{'} type: <span className="text-green-400">'h1'</span>, content: <span className="text-green-400">'System Overview'</span> {'}'},<br />
                {'    '}{'{'} type: <span className="text-green-400">'code'</span>, language: <span className="text-green-400">'typescript'</span>, content: <span className="text-green-400">'...'</span> {'}'}<br />
                {'  '}]<br />
                {'}'});<br /><br />
                <span className="text-gray-500">// Real-time broadcast automatically handles CRDT sync</span><br />
                <span className="text-purple-400">await</span> doc.<span className="text-blue-400">publish</span>();
              </code>
            </pre>
            <div className="absolute top-0 right-0 p-4">
              <span className="bg-white/10 text-white text-[10px] px-2 py-1 rounded-full border border-white/20 uppercase tracking-widest font-bold">API v2</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Infinite Integrations Marquee */}
      <section className="py-24 bg-white border-y border-gray-100 overflow-hidden isolate relative z-10 w-full">
        <div className="text-center mb-12">
          <p className="text-sm font-bold tracking-widest text-gray-400 uppercase">Seamlessly Integrates With Your Stack</p>
        </div>
        <div className="flex w-fit animate-marquee hover:[animation-play-state:paused]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-16 items-center px-8 shrink-0">
              <div className="flex items-center gap-3 font-black text-2xl text-gray-300"><FileText size={32} /> Google Docs</div>
              <div className="flex items-center gap-3 font-black text-2xl text-gray-300"><FileText size={32} /> Microsoft Word</div>
              <div className="flex items-center gap-3 font-black text-2xl text-gray-300"><Boxes size={32} /> Notion</div>
              <div className="flex items-center gap-3 font-black text-2xl text-gray-300"><Boxes size={32} /> Obsidian</div>
              <div className="flex items-center gap-3 font-black text-2xl text-gray-300"><FileText size={32} /> Evernote</div>
              <div className="flex items-center gap-3 font-black text-2xl text-gray-300"><FileText size={32} /> Apple Pages</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Bento Box Value Proposition */}
      <section className="py-32 bg-[#FDFBF7] relative z-10 border-b border-[#E4DBC5]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase text-[#1a1a1a]">Built for Scale.</h2>
            <p className="text-gray-500 font-sans text-lg max-w-2xl mx-auto">Everything you need to write, manage, and scale your documentation securely. Under the hood, we use cutting-edge tech.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto auto-rows-[250px]">
             {/* CRDT Block */}
             <div className="md:col-span-2 relative bg-white rounded-3xl p-8 border border-[#E4DBC5] shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(212,175,55,0.2)] transition-all duration-300 overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#FDF0D5]/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="relative z-10 flex flex-col h-full justify-between">
                 <div className="w-12 h-12 bg-[#FDFCF8] rounded-xl border border-[#F4E091] flex items-center justify-center mb-4">
                   <Boxes className="text-[#D4AF37]" />
                 </div>
                 <div>
                   <h3 className="text-2xl font-black uppercase text-[#1a1a1a] mb-2">Real-time CRDT Sync</h3>
                   <p className="text-gray-500 text-sm max-w-sm leading-relaxed">P2P synchronization ensures you never encounter merge conflicts. Multiple cursors move seamlessly simultaneously.</p>
                 </div>
               </div>
               <div className="absolute right-[-20%] bottom-[-50%] w-64 h-64 border-[40px] border-[#F4E091]/20 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
             </div>

             {/* End to End Encryption */}
             <div className="relative bg-white rounded-3xl p-8 border border-[#E4DBC5] shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(212,175,55,0.2)] transition-all duration-300 overflow-hidden group">
               <div className="relative z-10 flex flex-col h-full justify-between">
                 <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
                   <CheckCircle className="text-white" />
                 </div>
                 <div>
                   <h3 className="text-xl font-black uppercase text-[#1a1a1a] mb-2">E2E Secure</h3>
                   <p className="text-gray-500 text-sm leading-relaxed">Enterprise-grade 256-bit encryption for all data at rest and in transit.</p>
                 </div>
               </div>
             </div>

             {/* Vector Search */}
             <div className="relative bg-white rounded-3xl p-8 border border-[#E4DBC5] shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(212,175,55,0.2)] transition-all duration-300 overflow-hidden group">
               <div className="relative z-10 flex flex-col h-full justify-between">
                 <div className="w-12 h-12 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-center mb-4">
                   <Search className="text-blue-500" />
                 </div>
                 <div>
                   <h3 className="text-xl font-black uppercase text-[#1a1a1a] mb-2">Vector Search</h3>
                   <p className="text-gray-500 text-sm leading-relaxed">Lightning-fast semantic AI queries across thousands of deeply nested blocks.</p>
                 </div>
               </div>
             </div>

             {/* Edge Computing */}
             <div className="md:col-span-2 relative bg-[#1A1A1A] text-white rounded-3xl p-8 border border-black shadow-lg overflow-hidden group">
               <div className="relative z-10 flex flex-col h-full justify-between">
                 <div className="w-12 h-12 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center mb-4">
                   <Cpu className="text-white" />
                 </div>
                 <div>
                   <h3 className="text-2xl font-black uppercase text-white mb-2">Edge Delivery</h3>
                   <p className="text-gray-400 text-sm max-w-sm leading-relaxed">Your content is served from locations physically closest to your users. Sub-50ms latency anywhere in the world.</p>
                 </div>
               </div>
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0,transparent_100%)]" style={{ backgroundSize: '20px 20px', backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)' }}></div>
             </div>
          </div>
        </div>
      </section>

      {/* Section 6: Premium SaaS Footer */}
      <footer className="bg-white pt-24 pb-12 border-t border-[#E4DBC5]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
             {/* Brand Column */}
             <div className="lg:col-span-2">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded bg-gradient-to-br from-[#E2BC55] to-[#996A00] flex items-center justify-center shadow-sm">
                   <div className="w-4 h-4 border-2 border-white rounded-[1px] rotate-45 transform"></div>
                 </div>
                 <span className="font-serif font-bold text-xl text-[#1a1a1a]">DocCraft Pro</span>
               </div>
               <p className="text-gray-500 text-sm max-w-xs mb-8 leading-relaxed">
                 The intelligent, seamless workspace for high-velocity teams. Write down your ideas, and let our intelligence build the connections.
               </p>
               {/* Newsletter Input */}
               <div className="bg-[#FAF9F6] border border-[#E4DBC5] rounded-full p-1.5 flex max-w-sm focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/20 transition-all">
                  <input type="email" placeholder="Join our newsletter" className="bg-transparent border-none outline-none pl-4 text-sm w-full text-[#1a1a1a] placeholder:text-gray-400" />
                  <button className="bg-[#1A1A1A] hover:bg-[#333] transition-colors text-white w-10 h-10 rounded-full flex items-center justify-center ml-2 shrink-0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#D4AF37]"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
               </div>
             </div>

             {/* Links Columns */}
             <div>
               <h4 className="font-bold text-[#1a1a1a] uppercase text-xs tracking-wider mb-6">Product</h4>
               <ul className="space-y-4 text-sm text-gray-500">
                 <li><Link to="/features" className="hover:text-[#D4AF37] transition-colors">Features</Link></li>
                 <li><Link to="/integrations" className="hover:text-[#D4AF37] transition-colors">Integrations</Link></li>
                 <li><Link to="/changelog" className="hover:text-[#D4AF37] transition-colors">Changelog</Link></li>
               </ul>
             </div>
             
             <div>
               <h4 className="font-bold text-[#1a1a1a] uppercase text-xs tracking-wider mb-6">Developers</h4>
               <ul className="space-y-4 text-sm text-gray-500">
                 <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Documentation</a></li>
                 <li><a href="#" className="hover:text-[#D4AF37] transition-colors">API Reference</a></li>
                 <li><a href="#" className="hover:text-[#D4AF37] transition-colors">Status</a></li>
                 <li><a href="#" className="hover:text-[#D4AF37] transition-colors">GitHub Repo</a></li>
               </ul>
             </div>

             <div>
               <h4 className="font-bold text-[#1a1a1a] uppercase text-xs tracking-wider mb-6">Company</h4>
               <ul className="space-y-4 text-sm text-gray-500">
                 <li><Link to="/about" className="hover:text-[#D4AF37] transition-colors">About</Link></li>
                 <li><Link to="/blog" className="hover:text-[#D4AF37] transition-colors">Blog</Link></li>
                 <li><Link to="/careers" className="hover:text-[#D4AF37] transition-colors">Careers</Link></li>
                 <li><Link to="/contact" className="hover:text-[#D4AF37] transition-colors">Contact</Link></li>
               </ul>
             </div>
          </div>
          
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
            <p>&copy; 2026 DocCraft Inc. All rights reserved.</p>
            <p className="text-center md:text-left text-gray-400 text-xs max-w-xl mx-auto">
              We believe in transparent, honest privacy policies. You own your data. We don't train our models on your private documents unless you explicitly opt in, and you can delete your account at any time.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy-policy" className="hover:text-gray-600">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-gray-600">Terms of Service</Link>
              <Link to="/cookies" className="hover:text-gray-600">Cookie Setting</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FloatingElements() {
  return (
    <>
      <motion.div 
        animate={{ y: [-15, 15, -15], rotate: [-6, 2, -6] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[-10px] lg:left-[50px] top-[10%] w-[250px] bg-white p-4 rounded-xl shadow-xl shadow-gray-200/50 border border-gray-100 z-10"
      >
        <div className="text-[9px] font-bold tracking-wider mb-3 text-gray-500 uppercase">Datagram Flow document</div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-6 bg-green-100 rounded-md border border-green-200"></div>
          <div className="h-4 w-[1px] bg-gray-300"></div>
          <div className="w-24 h-8 bg-blue-50 rounded-md border border-blue-200 flex items-center justify-center px-2">
             <div className="h-1.5 w-full bg-blue-200 rounded-full"></div>
          </div>
          <div className="flex w-full justify-center gap-4 mt-1">
             <div className="w-16 h-8 bg-[#FDF0D5] transform -skew-x-12 border border-[#F4E091] mt-2"></div>
             <div className="w-16 h-8 bg-purple-50 rounded border border-purple-200 mt-6"></div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [20, -10, 20], rotate: [4, -2, 4] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-10px] lg:right-[80px] top-[-20%] w-[320px] bg-[#222] p-5 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] z-10 hidden md:block"
      >
        <div className="flex gap-1.5 mb-4 border-b border-[#333] pb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
        </div>
        <div className="font-mono text-[9px] leading-[1.6]">
           <div className="text-gray-400">import <span className="text-pink-400">{'User'}</span> from '@models';</div>
           <div className="text-blue-300 mt-2">async function <span className="text-yellow-300">initDoc()</span> {'{'}</div>
           <div className="pl-4 text-green-300">const val = await getData();</div>
           <div className="pl-4 text-orange-300">return process(val);</div>
           <div className="text-blue-300">{'}'}</div>
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [-5, 10, -5], rotate: [-4, 4, -4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[10px] lg:right-[80px] bottom-[20%] w-[280px] bg-white p-5 rounded-[20px] shadow-2xl shadow-gray-200/50 border border-gray-100 z-40 hidden md:block"
      >
        <div className="text-[14px] font-bold mb-2">document examined</div>
        <div className="text-[10px] text-gray-500 mb-3 border-b border-gray-100 pb-2">The core initializations (ogvecter)</div>
        <div className="font-mono text-[11px] leading-relaxed space-y-2 relative">
           <div className="text-gray-600">1. <span className="text-pink-600 font-bold bg-pink-50 px-1 rounded">id</span> (UUID, PK)</div>
           <div className="text-gray-600 pl-4 border-l-2 border-gray-200 ml-1">document_id (PU...</div>
           <div className="text-gray-600 pl-4 border-l-2 border-gray-200 ml-1 bg-red-50 text-red-600 px-1 rounded"><span className="font-bold">block_id</span> (UUID, FK)</div>
           <div className="text-gray-600 pl-4 border-l-2 border-gray-200 ml-1 bg-blue-50 text-blue-600 px-1 rounded">document segment</div>
           <div className="text-gray-600 pl-4 border-l-2 border-gray-200 ml-1">in embedding (UUID)</div>
           
           {/* Fake Magnifying Glass overlaying text */}
           <div className="absolute right-[-40px] bottom-[-40px] w-36 h-36">
             <div className="absolute top-0 right-0 w-24 h-24 rounded-full border-[6px] border-[#333] bg-[#EAEAEA]/80 backdrop-blur-[2px] shadow-[inset_0_4px_10px_white,0_10px_20px_rgba(0,0,0,0.2)]">
               <div className="absolute inset-2 rounded-full border border-white/50 bg-gradient-to-tr from-white/10 to-white/60"></div>
             </div>
             <div className="absolute top-[80px] right-[70px] w-4 h-16 bg-gradient-to-b from-[#333] to-[#111] rotate-[45deg] rounded-b-lg border border-[#555] shadow-lg origin-top"></div>
           </div>
        </div>
      </motion.div>
    </>
  )
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="bg-[#FAF9F6] border border-[#E4DBC5] p-8 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-10px_rgba(212,175,55,0.15)] hover:-translate-y-[2px] transition-all duration-300 relative group flex flex-col justify-between min-h-[220px]">
      <div>
        <h3 className="font-black text-xl tracking-tight mb-3 text-[#1a1a1a] uppercase">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed max-w-[80%] relative z-10">{description}</p>
      </div>
      <div className="absolute bottom-8 right-8">
        <div className="bg-[#FDFCF8] p-3 rounded-xl border border-[#F4E091] shadow-sm transform group-hover:scale-110 transition-transform duration-300">
           {icon}
        </div>
      </div>
    </div>
  )
}

