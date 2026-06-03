import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { FileText, Cpu, CheckCircle, Boxes, Search, Download, Clock } from 'lucide-react';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RobotCompanion } from '../components/ui/RobotCompanion';
import { Sparkles } from 'lucide-react'; // if not already imported
import { CODE_JOKES, TECH_NEWS } from '../data/newsAndJokes';

import { getLocalCurrencyInfo } from '../utils/currency';

export function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUserCredits } = useAuth();
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDegree, setFlipDegree] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [examinedCard, setExaminedCard] = useState<{ title: string; description: string; extraDetails?: string[] } | null>(null);

  const handleExamine = (title: string, description: string, extraDetails?: string[]) => {
    setExaminedCard({ title, description, extraDetails });
  };

  const handleReleaseExamine = () => {
    setExaminedCard(null);
  };
  
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
      <WaveGlowBackground />
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

           <motion.button className="hidden" style={{ display: 'none' }}
             onClick={handleInstallClick}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}

           >
             <div className="" />
             
             
           </motion.button>
        </motion.div>

        {/* Central Button & Robot Container */}
        <div className="flex flex-col items-center justify-center relative min-h-[500px] mb-32 z-30">
           
           {/* Background Floating Elements */}
           <FloatingElements onExamine={handleExamine} onRelease={handleReleaseExamine} />

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
                 {/* Glowing pulsing rim border */}
                 <div className="absolute -inset-[4px] rounded-[3.2rem] bg-gradient-to-r from-[#D4AF37] via-[#F5D061] to-[#C5A038] opacity-75 blur-[4px] animate-pulse -z-10 group-hover:opacity-100 group-hover:blur-[6px] transition-all" />

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
        
        <div className="max-w-[1400px] mx-auto px-6">
          <DevPulseDashboard />
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
              <TiltCard colSpan="md:col-span-2" className="bg-white p-8 overflow-hidden group" type="crdt" onExamine={handleExamine} onRelease={handleReleaseExamine}>
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
              </TiltCard>

              {/* End to End Encryption */}
              <TiltCard className="bg-white p-8 overflow-hidden group justify-between" type="security" onExamine={handleExamine} onRelease={handleReleaseExamine}>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase text-[#1a1a1a] mb-2">E2E Secure</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Enterprise-grade 256-bit encryption for all data at rest and in transit.</p>
                  </div>
                </div>
              </TiltCard>

              {/* Vector Search */}
              <TiltCard className="bg-white p-8 overflow-hidden group" type="vector" onExamine={handleExamine} onRelease={handleReleaseExamine}>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-center mb-4">
                    <Search className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase text-[#1a1a1a] mb-2">Vector Search</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Lightning-fast semantic AI queries across thousands of deeply nested blocks.</p>
                  </div>
                </div>
              </TiltCard>

              {/* Edge Computing */}
              <TiltCard colSpan="md:col-span-2" className="bg-[#1A1A1A] text-white p-8 overflow-hidden group" type="edge" onExamine={handleExamine} onRelease={handleReleaseExamine}>
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
              </TiltCard>
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

function FloatingElements({ onExamine, onRelease }: { onExamine: (title: string, desc: string, extra?: string[]) => void, onRelease: () => void }) {
  const [activePopup, setActivePopup] = useState<number | null>(null);

  const descriptions = [
    { 
      title: "Block Graph Map", 
      detail: "A real-time visual grid mapping the exact links between your document blocks. When changes occur in one node, the downstream references auto-recalculate instantly.", 
      extra: ["Relational Engine: GraphDB Isolate", "Active Edges: 142 visual links", "Compile State: Synchronized", "Latency Trace: 0.45ms"]
    },
    { 
      title: "Typed Edge Compiler", 
      detail: "Our sandboxed compilation module. It runs sub-millisecond continuous static checks to guarantee document integrity, code compatibility, and markdown compliance.", 
      extra: ["Schema Isolate: TS-V8 Isomorphic", "Compliance Checks: 18 standards ok", "Build Cycle: 0.1ms warmup", "Trace Output: Compilation Success"]
    },
    { 
      title: "Vector Embed Log", 
      detail: "Automatically parses paragraphs and turns blocks into semantic vector indexes. Retrieve relevant specifications with zero-delay natural text queries.", 
      extra: ["Embedding Vector: 1536-dim spatial", "Cosine Similarity: 99.98% accurate", "Index Status: 442 blocks cached", "Query Delay: 0.85ms"]
    }
  ];

  const createCardHandlers = (index: number) => {
    return {
      onPointerDown: (e: React.PointerEvent) => {
        e.preventDefault();
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch (err) {}
        setActivePopup(index);
        onExamine(descriptions[index].title, descriptions[index].detail, descriptions[index].extra);
      },
      onPointerUp: (e: React.PointerEvent) => {
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch (err) {}
        setActivePopup(null);
        onRelease();
      },
      onPointerCancel: (e: React.PointerEvent) => {
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch (err) {}
        setActivePopup(null);
        onRelease();
      },
      onMouseEnter: () => {
        setActivePopup(index);
      },
      onMouseLeave: () => {
        setActivePopup(null);
        onRelease();
      }
    };
  };

  return (
    <>
      <motion.div 
        animate={{ y: [-15, 15, -15], rotate: [-6, 2, -6] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.12, rotate: -2, zIndex: 100 }}
        whileTap={{ scale: 1.18, rotate: -1, zIndex: 100 }}
        {...createCardHandlers(0)}
        className="absolute left-[-10px] lg:left-[50px] top-[10%] w-[250px] rounded-2xl cursor-grab active:cursor-grabbing hover:shadow-[0_0_35px_rgba(212,175,55,0.4)] transition-all duration-300"
        style={{
          background: activePopup === 0 
            ? 'linear-gradient(90deg, #D4AF37, #FFF2B2, #AA7A00, #FFF2B2, #D4AF37)'
            : 'linear-gradient(90deg, rgba(212, 175, 55, 0.25), rgba(228, 219, 197, 0.4), rgba(212, 175, 55, 0.25))',
          backgroundSize: '200% auto',
          animation: 'rimFlow 3s linear infinite',
          padding: '2px'
        }}
      >
        <div className="w-full h-full bg-white p-4 rounded-[14px]">
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
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [20, -10, 20], rotate: [4, -2, 4] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.12, rotate: 2, zIndex: 100 }} 
        whileTap={{ scale: 1.18, rotate: 1, zIndex: 100 }}
        {...createCardHandlers(1)}
        className="absolute right-[-10px] lg:right-[80px] top-[-20%] w-[320px] rounded-2xl hidden md:block cursor-grab active:cursor-grabbing hover:shadow-[0_0_35px_rgba(212,175,55,0.4)] transition-all duration-300"
        style={{
          background: activePopup === 1 
            ? 'linear-gradient(90deg, #D4AF37, #FFF2B2, #AA7A00, #FFF2B2, #D4AF37)'
            : 'linear-gradient(90deg, rgba(212, 175, 55, 0.25), rgba(228, 219, 197, 0.4), rgba(212, 175, 55, 0.25))',
          backgroundSize: '200% auto',
          animation: 'rimFlow 3.5s linear infinite',
          padding: '2px'
        }}
      >
        <div className="w-full h-full bg-[#1A1A1A] p-5 rounded-[14px]">
          <div className="flex gap-1.5 mb-4 border-b border-[#333] pb-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
          </div>
          <div className="font-mono text-[9px] leading-[1.6]">
             <div className="text-gray-400">import { "User" } from '@models';</div>
             <div className="text-blue-300 mt-2">async function <span className="text-yellow-300">initDoc()</span> {"{"}</div>
             <div className="pl-4 text-green-300">const val = await getData();</div>
             <div className="pl-4 text-orange-300">return process(val);</div>
             <div className="text-blue-300">{"}"}</div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [-5, 10, -5], rotate: [-4, 4, -4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.12, rotate: -2, zIndex: 100 }} 
        whileTap={{ scale: 1.18, rotate: -1, zIndex: 100 }}
        {...createCardHandlers(2)}
        className="absolute right-[10px] lg:right-[80px] bottom-[20%] w-[280px] rounded-[22px] hidden md:block cursor-grab active:cursor-grabbing hover:shadow-[0_0_35px_rgba(212,175,55,0.4)] transition-all duration-300"
        style={{
          background: activePopup === 2
            ? 'linear-gradient(90deg, #D4AF37, #FFF2B2, #AA7A00, #FFF2B2, #D4AF37)'
            : 'linear-gradient(90deg, rgba(212, 175, 55, 0.25), rgba(228, 219, 197, 0.4), rgba(212, 175, 55, 0.25))',
          backgroundSize: '200% auto',
          animation: 'rimFlow 3.2s linear infinite',
          padding: '2px'
        }}
      >
        <div className="w-full h-full bg-white p-5 rounded-[20px]">
          <div className="text-[14px] font-bold mb-2">document examined</div>
          <div className="text-[10px] text-gray-500 mb-3 border-b border-gray-100 pb-2">The core initializations (ogvecter)</div>
          <div className="font-mono text-[11px] leading-relaxed space-y-2 relative">
             <div className="text-gray-600">1. <span className="text-pink-600 font-bold bg-pink-50 px-1 rounded">id</span> (UUID, PK)</div>
             <div className="text-gray-600 pl-4 border-l-2 border-gray-200 ml-1">document_id (PU...</div>
             <div className="text-gray-600 pl-4 border-l-2 border-gray-200 ml-1 bg-red-50 text-red-600 px-1 rounded"><span className="font-bold">block_id</span> (UUID, FK)</div>
             <div className="text-gray-600 pl-4 border-l-2 border-gray-200 ml-1 bg-blue-50 text-blue-600 px-1 rounded">document segment</div>
             <div className="text-gray-600 pl-4 border-l-2 border-gray-200 ml-1">in embedding (UUID)</div>
             
             {/* Fake Magnifying Glass overlaying text */}
             <div className="absolute right-[-40px] bottom-[-40px] w-36 h-36 border-none">
               <div className="absolute top-0 right-0 w-24 h-24 rounded-full border-[6px] border-[#333] bg-[#EAEAEA]/80 backdrop-blur-[2px] shadow-[inset_0_4px_10px_white,0_10px_20px_rgba(0,0,0,0.2)]">
                 <div className="absolute inset-2 rounded-full border border-white/50 bg-gradient-to-tr from-white/10 to-white/60"></div>
               </div>
               <div className="absolute top-[80px] right-[70px] w-4 h-16 bg-gradient-to-b from-[#333] to-[#111] rotate-[45deg] rounded-b-lg border border-[#555] shadow-lg origin-top"></div>
             </div>
          </div>
        </div>
      </motion.div>
    </>
  );
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

function TiltCard({ 
  children, 
  className, 
  colSpan = "", 
  type = "crdt", 
  onExamine, 
  onRelease 
}: { 
  children: React.ReactNode, 
  className: string, 
  colSpan?: string, 
  type?: string,
  onExamine?: (title: string, desc: string, extra?: string[]) => void,
  onRelease?: () => void
}) {
  // Real-time developer diagnostic monitors
  const diagnostics: Record<string, { label: string, spec: string, metrics: string[] }> = {
    crdt: {
      label: "crdt synchronization live",
      spec: "RFC-4122 peer matrix",
      metrics: ["state: synced", "peer latency: 1.4ms", "reconcile loop: active"]
    },
    security: {
      label: "cryptography safe vault",
      spec: "aes-256 secure storage",
      metrics: ["cipher: AES-GCM-256", "private keys: local", "keys status: verified"]
    },
    vector: {
      label: "vector context map",
      spec: "cosine similarity space",
      metrics: ["accuracy: 99.98%", "queries: sub-1ms", "index nodes: online"]
    },
    edge: {
      label: "host router analytics",
      spec: "sub-50ms global network",
      metrics: ["cdn route: local cache", "pop state: active", "rtt latency: 12ms"]
    }
  };

  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isHeld, setIsHeld] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Normalize coordinates
    const normX = x / (rect.width / 2);
    const normY = y / (rect.height / 2);
    
    setCoords({ x: normX, y: normY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsHeld(false);
    setCoords({ x: 0, y: 0 });
    if (onRelease) onRelease();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {}
    
    setIsHeld(true);
    
    if (onExamine) {
      const diag = diagnostics[type] || diagnostics.crdt;
      // Map to real feature titles
      const niceTitle = type === "crdt" ? "Real-time CRDT Sync" 
                      : type === "security" ? "End-To-End Security Vault"
                      : type === "vector" ? "Semantic Vector Database"
                      : "Global Edge Content Delivery";
      onExamine(niceTitle, diag.label.toUpperCase() + " | SPECS: " + diag.spec, diag.metrics);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}
    
    setIsHeld(false);
    if (onRelease) onRelease();
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}
    
    setIsHeld(false);
    if (onRelease) onRelease();
  };

  // Convert normalized coordinates to degrees for dynamic tilting
  const rotateX = -coords.y * 12; 
  const rotateY = coords.x * 12;

  // Rim lighting background gradient radial point coordinates
  const shineX = (coords.x + 1) * 50; 
  const shineY = (coords.y + 1) * 50;

  // Diagnostics moved to the top of component block

  const diagnosticsData = diagnostics[type] || diagnostics.crdt;

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={`relative rounded-3xl overflow-hidden cursor-pointer p-[2px] transition-all duration-150 ${colSpan}`}
      animate={{
        rotateX: rotateX,
        rotateY: rotateY,
        scale: isHovered || isHeld ? 1.05 : 1,
        z: isHovered || isHeld ? 50 : 0
      }}
      whileTap={{ scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
        background: isHovered || isHeld
          ? `radial-gradient(circle at ${shineX}% ${shineY}%, #D4AF37 0%, rgba(212,175,55,0.15) 70%)`
          : 'rgba(228, 219, 197, 0.45)',
        boxShadow: isHovered || isHeld
          ? '0 0 35px rgba(212,175,55,0.45), inset 0 0 20px rgba(255,255,255,0.1)'
          : 'none'
      }}
    >
      <div 
        className={`w-full h-full rounded-[23px] relative ${className} transition-all duration-300`}
        style={{
          transform: 'translateZ(20px)',
          transformStyle: 'preserve-3d'
        }}
      >
        {(isHovered || isHeld) && (
          <div 
            className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 rounded-[23px] mix-blend-overlay"
            style={{
              background: `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255, 255, 255, 0.55) 0%, transparent 60%)`
            }}
          />
        )}
        {children}

        {/* Floating Telemetry Hoverboard Overlay */}
        <AnimatePresence>
          {(isHovered || isHeld) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15, rotateX: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute z-50 bottom-4 left-4 right-4 bg-black/95 backdrop-blur-xl border border-[#D4AF37]/50 p-4 rounded-2xl shadow-2xl shadow-black/80 font-mono text-[9px] text-white"
              style={{
                transform: 'translateZ(65px)',
                backfaceVisibility: 'hidden'
              }}
            >
              <div className="flex items-center justify-between border-b border-[#D4AF37]/25 pb-2 mb-2">
                <span className="text-[#D4AF37] font-bold uppercase tracking-wider">{diagnosticsData.label}</span>
                <span className="text-gray-500 text-[8px]">{diagnosticsData.spec}</span>
              </div>
              <div className="space-y-1">
                {diagnosticsData.metrics.map((metric, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>{metric}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function WaveGlowBackground() {
  const customStyles = `
    @keyframes wateryFlow {
      0% { transform: translate(0, 0) scale(1) rotate(0deg); }
      50% { transform: translate(-30px, 15px) scale(1.03) rotate(1.5deg); }
      100% { transform: translate(0, 0) scale(1) rotate(0deg); }
    }
    @keyframes sparklyGlow {
      0%, 100% { opacity: 0.35; transform: scale(1) rotate(0deg); }
      50% { opacity: 0.9; transform: scale(1.15) rotate(4deg); }
    }
    @keyframes waveShift {
      0% { transform: translateX(0) translateY(0); }
      50% { transform: translateX(-35px) translateY(8px); }
      100% { transform: translateX(0) translateY(0); }
    }
    @keyframes waveShiftRev {
      0% { transform: translateX(0) translateY(0); }
      50% { transform: translateX(35px) translateY(-8px); }
      100% { transform: translateX(0) translateY(0); }
    }
  `;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40 select-none">
      <style>{customStyles}</style>
      
      {/* Sparkles / Blobs */}
      <div 
        className="absolute top-[8%] left-[15%] w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-[#fbcfe8]/60 via-[#bfdbfe]/50 to-[#fed7aa]/40 filter blur-[90px] mix-blend-multiply" 
        style={{ animation: 'wateryFlow 12s infinite ease-in-out' }} 
      />
      <div 
        className="absolute bottom-[15%] right-[5%] w-[750px] h-[750px] rounded-full bg-gradient-to-br from-[#fef08a]/50 via-[#bfdbfe]/60 to-[#fbcfe8]/40 filter blur-[110px] mix-blend-multiply" 
        style={{ animation: 'wateryFlow 18s infinite ease-in-out' }} 
      />
      <div 
        className="absolute top-[40%] right-[30%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#e0f2fe]/40 via-[#f3e8ff]/50 to-[#ffffff]/35 filter blur-[100px] mix-blend-screen" 
        style={{ animation: 'wateryFlow 15s infinite ease-in-out' }} 
      />
      
      {/* SVG swelling waves looping in background */}
      <svg className="absolute inset-x-0 bottom-0 min-w-[1400px] w-full h-[650px] opacity-75" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M0,160 C240,220 480,100 720,180 C960,260 1200,140 1440,240 L1440,600 L0,600 Z" 
          fill="url(#wave-gradient-1)" 
          style={{ animation: 'waveShift 14s infinite ease-in-out' }} 
        />
        <path 
          d="M0,220 C280,140 560,260 840,160 C1120,60 1280,240 1440,180 L1440,600 L0,600 Z" 
          fill="url(#wave-gradient-2)" 
          style={{ animation: 'waveShiftRev 19s infinite ease-in-out' }} 
        />
        
        <defs>
          <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(253, 240, 213, 0.45)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.65)" />
            <stop offset="100%" stopColor="rgba(191, 219, 254, 0.45)" />
          </linearGradient>
          <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(191, 219, 254, 0.4)" />
            <stop offset="50%" stopColor="rgba(253, 240, 213, 0.55)" />
            <stop offset="100%" stopColor="rgba(251, 207, 232, 0.4)" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Tiny gold sparkly pulse elements */}
      <div className="absolute inset-0">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-40 shadow-[0_0_15px_#D4AF37]"
            style={{
              top: `${10 + i * 5}%`,
              left: `${5 + (i * 17) % 91}%`,
              width: `${4 + (i % 3) * 4}px`,
              height: `${4 + (i % 3) * 4}px`,
              animation: `sparklyGlow ${2.5 + (i % 4)}s infinite ease-in-out`
            }}
          />
        ))}
      </div>
    </div>
  );
}

function DevPulseDashboard() {
  const [currentJoke, setCurrentJoke] = useState<any>(null);
  const [syncedNews, setSyncedNews] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    // Select a funny programming code joke on mount
    const randIdx = Math.floor(Math.random() * CODE_JOKES.length);
    setCurrentJoke(CODE_JOKES[randIdx]);
    setSyncedNews(TECH_NEWS);

    // Keep ticking absolute UTC time live
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerLiveSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      // Re-randomize news and grab a new joke too
      setSyncedNews(prev => [...prev].sort(() => Math.random() - 0.5));
      const randIdx = Math.floor(Math.random() * CODE_JOKES.length);
      setCurrentJoke(CODE_JOKES[randIdx]);
    }, 1200);
  };

  return (
    <div className="w-full mt-20 border-t border-gray-800 pt-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest block mb-1 font-mono">DocCraft Ecosystem Pulse</span>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight font-sans">Live Developers Console</h3>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {/* Live UTC Ticking Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111] border border-gray-800 font-mono text-[10px] text-gray-400">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{utcTime || 'SYS_SYNCING...'}</span>
          </div>

          <button 
            onClick={triggerLiveSync}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#111] hover:bg-black border border-gray-800 text-xs font-bold text-gray-400 hover:text-[#D4AF37] transition-all font-mono"
          >
            <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-green-500 animate-pulse'}`} />
            {isSyncing ? 'SYNCING...' : 'FORCE RE-SYNC'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Card: Tech News Syndication */}
        <div className="bg-[#111]/60 backdrop-blur-md rounded-2xl border border-gray-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <span className="font-mono text-xs text-gray-500 uppercase">SYS_LOG FEED</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest font-mono">Connected</span>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {syncedNews.map((news: any) => (
                <div key={news.id} className="border-b border-gray-800/40 pb-3 last:border-0 hover:bg-white/5 p-2 rounded transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/5 px-1.5 py-0.5 rounded border border-[#D4AF37]/20">{news.category}</span>
                    <span className="text-[9px] text-gray-600 font-mono">{news.time}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1 font-sans">{news.title}</h4>
                  <p className="text-xs text-gray-400 leading-normal font-sans">{news.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-800 text-[10px] text-gray-500 flex items-center justify-between font-mono">
            <span>DOCKRAFT SYNCD POOL</span>
            <span>FREQ_60HZ</span>
          </div>
        </div>

        {/* Right Card: Code Humor */}
        <div className="bg-[#111]/60 backdrop-blur-md rounded-2xl border border-gray-800 p-6 flex flex-col justify-between overflow-hidden relative">
          <div>
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <span className="font-mono text-xs text-pink-400 uppercase">COMPILER_HUMOR // SENSELESS_CODE</span>
              <span className="text-[9.5px] text-gray-500 bg-gray-900 px-1 py-0.5 rounded border border-gray-800 font-mono">RAND_LOAD_ON_REPLAY</span>
            </div>

            {currentJoke && (
              <div className="relative">
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 mb-2">
                  <span>Language: {currentJoke.language}</span>
                  <span>status: ACTIVE</span>
                </div>
                <pre className="font-mono text-xs leading-relaxed text-[#10B981] overflow-x-auto bg-[#0a0a0a] p-4 rounded-lg border border-gray-900 max-h-[320px]">
                  <code>{currentJoke.code}</code>
                </pre>
                <div className="mt-3 bg-pink-950/10 border border-pink-900/30 p-3 rounded-lg">
                  <p className="text-xs font-mono text-pink-400 italic font-bold">
                    {currentJoke.punchline}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-800 text-[10px] text-gray-500 flex items-center justify-between font-mono">
            <span>SENSELESS RUNTIME RECONCILIATION</span>
            <span>COMPLY_v2_GREEN</span>
          </div>
        </div>
      </div>
    </div>
  );
}

