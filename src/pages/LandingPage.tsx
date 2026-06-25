import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { SEOBoost } from '../components/SEOBoost';
import { LandingBookSection } from '../components/LandingBookSection';
import { LandingInteractiveImage } from '../components/LandingInteractiveImage';
import { LandingAICapabilities } from '../components/LandingAICapabilities';
import { LandingVideoWorkspace } from '../components/LandingVideoWorkspace';
import { LandingCalendarTasks } from '../components/LandingCalendarTasks';
import { LandingPaperDraft } from '../components/LandingPaperDraft';
import { KeyboardShortcutsHelper } from '../components/KeyboardShortcutsHelper';
import { FileText, Cpu, CheckCircle, Boxes, Search, Download, Clock, Shield, Database, UserCheck, PenTool, ArrowRight, Folder, Home, Users } from 'lucide-react';
import { motion, useAnimation, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RobotCompanion } from '../components/ui/RobotCompanion';
import { Sparkles } from 'lucide-react'; // if not already imported
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DetailedFeatures } from '../components/DetailedFeatures';

import { getLocalCurrencyInfo } from '../utils/currency';

export function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userData, updateUserCredits } = useAuth();

  useEffect(() => {
    if (user && userData && !userData.profileSetupComplete) {
      navigate('/welcome-setup');
    }
  }, [user, userData, navigate]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDegree, setFlipDegree] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [examinedCard, setExaminedCard] = useState<{ title: string; description: string; extraDetails?: string[] } | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [currentTime, setCurrentTime] = useState<string>('9:41');
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll animations for 3D devices
  const phoneRef = useRef<HTMLDivElement>(null);
  const laptopRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: phoneScroll } = useScroll({
    target: phoneRef,
    offset: ["start end", "end start"]
  });
  
  const { scrollYProgress: laptopScroll } = useScroll({
    target: laptopRef,
    offset: ["start end", "end start"]
  });

  const phoneRotateY = useTransform(phoneScroll, [0, 0.5, 1], [-45, 0, 45], { clamp: true });
  const phoneRotateX = useTransform(phoneScroll, [0, 0.5, 1], [35, 0, -35], { clamp: true });
  
  const laptopRotateY = useTransform(laptopScroll, [0, 0.5, 1], [-25, 0, 25], { clamp: true }); // Stunning high-fidelity 3D perspective spin
  const laptopRotateX = useTransform(laptopScroll, [0, 0.5, 1], [30, 8, -30], { clamp: true });
  const laptopScale = useTransform(laptopScroll, [0, 0.5, 1], [0.85, 1, 0.9], { clamp: true });

  useEffect(() => {
    // Battery
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      });
    }
    // Time
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      hours = hours % 12;
      hours = hours ? hours : 12; 
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
             <h2 className="font-serif font-bold text-3xl tracking-tight leading-none text-[#1A1A1A]">Docscraft Pro</h2>
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



        {/* NEW CRAFT-LIKE HERO SECTION */}
        <div className="py-20 flex flex-col items-center text-center max-w-5xl mx-auto mb-24 relative z-20">
          <h1 className="text-6xl md:text-[5.5rem] font-serif tracking-tight text-gray-900 mb-8 max-w-4xl leading-[1.1]">
            Your space for notes, tasks, and big ideas
          </h1>
          <button onClick={() => navigate('/dashboard')} className="bg-black text-white px-10 py-5 rounded-full text-xl font-bold hover:scale-105 transition-transform shadow-xl mb-24 z-10 relative">
            Try Docscraft Pro Free
          </button>
        </div>
        
        <div ref={phoneRef} className="w-full relative overflow-x-clip overflow-y-visible px-4 md:px-0 mt-32 mb-20 max-w-7xl mx-auto flex justify-center perspective-[2500px] min-h-[80vh] items-center">
             {/* Spot Light */}
             <div className="absolute top-[80%] left-1/2 -translate-x-1/2 w-[80%] md:w-[60%] h-48 bg-blue-500/20 blur-[100px] rounded-[100%] pointer-events-none transform -rotate-x-[60deg]"></div>

             {/* Background Desktop App UI Mockup */}
             <motion.div 
               style={{ rotateX: isMobile ? 0 : phoneRotateX, rotateY: isMobile ? 0 : phoneRotateY, translateZ: isMobile ? 0 : -100, opacity: 0.95, backfaceVisibility: "hidden", transformStyle: isMobile ? "flat" : "preserve-3d" }}
               className="hidden lg:flex absolute top-[10%] left-1/2 -translate-x-1/2 w-[1100px] h-[750px] bg-[#fcfcfc] rounded-2xl border border-gray-200/60 shadow-2xl overflow-hidden pointer-events-none z-10"
             >
                {/* Sidebar */}
                <div className="w-[260px] bg-[#F7F7F5] border-r border-[#E4DBC5]/50 p-4 flex flex-col pt-8">
                   <div className="flex items-center gap-2 mb-8 px-2">
                      <div className="w-5 h-5 rounded bg-blue-600 shadow border border-blue-700"></div>
                      <span className="font-bold text-sm">John's Workspace</span>
                   </div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-500 text-sm px-2 py-1.5 hover:bg-gray-200/50 rounded-md"><Search className="w-4 h-4"/> Search</div>
                      <div className="flex items-center gap-2 text-gray-900 font-bold bg-white shadow-sm border border-gray-200/50 text-sm px-2 py-1.5 rounded-md"><Home className="w-4 h-4 text-blue-600"/> Home</div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm px-2 py-1.5 hover:bg-gray-200/50 rounded-md"><Folder className="w-4 h-4"/> All Docs</div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm px-2 py-1.5 hover:bg-gray-200/50 rounded-md"><Users className="w-4 h-4"/> Shared with Me</div>
                   </div>
                   <div className="mt-8 px-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Folders</div>
                   <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-600 text-sm px-2 py-1.5 hover:bg-gray-200/50 rounded-md"><Folder className="w-3.5 h-3.5"/> Design Specs</div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm px-2 py-1.5 hover:bg-gray-200/50 rounded-md"><Folder className="w-3.5 h-3.5"/> Marketing 2026</div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm px-2 py-1.5 hover:bg-gray-200/50 rounded-md"><Folder className="w-3.5 h-3.5"/> Personal Notes</div>
                   </div>
                   <img src="https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=600&auto=format&fit=crop" className="mt-auto rounded-lg shadow-sm border border-gray-200/50 mix-blend-multiply opacity-80" alt="Sidebar decorative"/>
                </div>
                {/* Main Content Area */}
                <div className="flex-1 bg-white p-12 relative flex justify-end flex-col">
                   <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-50 to-rose-50 rounded-bl-[100%] opacity-50 blur-3xl pointer-events-none"></div>
                   <div className="w-full flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                     <h3 className="text-2xl font-serif font-bold text-gray-800">Getting Started <span className="px-2 py-0.5 ml-2 bg-rose-100 text-rose-600 text-[10px] rounded-full uppercase tracking-wider font-bold align-middle">New</span></h3>
                     <div className="flex gap-2">
                       <div className="w-8 h-8 rounded-full border border-gray-200 bg-white shadow-sm overflow-hidden">
                         <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover" />
                       </div>
                       <button className="bg-blue-600 text-white text-xs font-bold px-3 rounded-md shadow flex items-center gap-1">Share</button>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-6 h-[400px]">
                      <div className="col-span-1 rounded-xl bg-gray-50 border border-gray-100 p-6 flex flex-col shadow-sm relative overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1581287053822-fd7bf4f4bfec?q=80&w=800&auto=format&fit=crop" className="absolute top-0 right-0 w-full h-32 object-cover opacity-30 mix-blend-overlay" />
                        <h4 className="font-bold mb-2">Beautiful Code Snippets</h4>
                        <p className="text-xs text-gray-500 mb-4">Paste your code and let our AI format it beautifully with syntax highlighting.</p>
                        <div className="bg-gray-900 rounded-lg p-4 mt-auto shadow-inner text-blue-300 font-mono text-[10px]">
                           <div><span className="text-purple-400">const</span> <span className="text-yellow-200">generate</span> = () =&gt; {'{'}</div>
                           <div className="pl-4">return <span className="text-green-300">"Perfection"</span>;</div>
                           <div>{'}'}</div>
                        </div>
                      </div>
                      <div className="col-span-1 border border-gray-200/60 rounded-xl overflow-hidden shadow-sm flex items-center justify-center relative">
                         <img src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                         <div className="absolute bottom-4 left-4 right-4">
                            <h4 className="text-white font-bold text-sm mb-1">Collaborative Workspace</h4>
                            <p className="text-white/70 text-[10px]">Your team, completely in sync.</p>
                         </div>
                      </div>
                   </div>
                </div>
             </motion.div>

             {/* Phone Mockup UI */}
             <motion.div 
               style={{ rotateX: isMobile ? 0 : phoneRotateX, rotateY: isMobile ? 0 : phoneRotateY, translateZ: isMobile ? 0 : 50, transformStyle: isMobile ? "flat" : "preserve-3d", backfaceVisibility: "hidden", willChange: isMobile ? "auto" : "transform" }}
               whileInView={{ scale: [0.85, 1], opacity: [0, 1] }}
               transition={{ duration: 0.8 }}
               className="w-full max-w-[285px] min-[390px]:max-w-[340px] sm:max-w-[420px] md:max-w-[480px] lg:max-w-[550px] h-[550px] min-[390px]:h-[680px] sm:h-[800px] md:h-[900px] lg:h-[1050px] border-[12px] min-[390px]:border-[16px] md:border-[24px] border-[#0a0a0a] rounded-[2.5rem] min-[390px]:rounded-[3.5rem] md:rounded-[4.5rem] bg-[#fbfbfb] overflow-hidden shadow-[0_45px_100px_-15px_rgba(0,0,0,0.8)] relative ring-2 ring-gray-800/80 mx-auto z-20"
             >
                <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
                
                {/* Dynamic Island / Notch */}
                <div className="absolute top-0 inset-x-0 h-8 md:h-10 bg-[#0a0a0a] rounded-b-[1.75rem] w-[45%] md:w-1/2 mx-auto z-30 flex items-center justify-end pr-5">
                  {/* Camera lens */}
                  <div className="w-4 h-4 rounded-full bg-[#050505] border border-[#1a1a1a] relative shadow-inner">
                    <div className="w-1.5 h-1.5 bg-blue-500/30 rounded-full absolute top-[1px] right-[1px]"></div>
                  </div>
                </div>
                
                <div className="px-6 pb-6 h-full overflow-y-auto space-y-6 pt-16 hide-scrollbar relative z-10 bg-gradient-to-b from-gray-50 to-white">
                   
                   <div className="absolute top-6 left-6 text-sm font-bold tracking-tight text-gray-800">{currentTime}</div>
                   <div className="absolute top-6 right-6 flex items-center gap-1.5 opacity-90 text-gray-800">
                     <div className="flex gap-0.5 justify-end items-end h-[10px]">
                       <div className="w-1 h-[4px] bg-current rounded-sm" />
                       <div className="w-1 h-[6px] bg-current rounded-sm" />
                       <div className="w-1 h-[8px] bg-current rounded-sm" />
                       <div className="w-1 h-[10px] bg-current opacity-30 rounded-sm" />
                     </div>
                     <span className="text-[11px] font-bold tracking-tight">{batteryLevel}%</span>
                     <div className="w-[22px] h-[11px] outline outline-1 outline-current rounded-[3px] ml-1 relative flex items-center p-[1.5px]">
                       <div className={`h-full rounded-[1px] ${batteryLevel <= 20 ? 'bg-red-500' : 'bg-current'} transition-all`} style={{ width: `${batteryLevel}%` }} />
                       <div className="w-0.5 h-1 bg-current absolute -right-[3px] top-1/2 -translate-y-1/2 rounded-r-sm" />
                       {isCharging && <Sparkles className="w-2.5 h-2.5 text-white absolute inset-x-0 mx-auto fill-current mix-blend-difference" strokeWidth={3} />}
                     </div>
                   </div>

                   <div className="mt-8">
                     <h3 className="text-3xl font-serif font-black text-gray-900 tracking-tight leading-none mb-1">Today</h3>
                     <p className="text-sm font-medium text-gray-500 mb-6">4 upcoming tasks &amp; ideas</p>
                   </div>

                   <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                     <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-sm font-bold mb-3 relative z-10">
                       <FileText className="w-5 h-5"/>
                     </div>
                     <h4 className="font-bold text-gray-900 mb-1 text-lg relative z-10">Museums visit</h4>
                     <div className="space-y-2 mt-4 relative z-10">
                       <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                         <div>
                           <p className="font-bold text-gray-800 text-sm">White Cube</p>
                           <p className="text-[11px] text-gray-500">Bermondsey, London</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                         <div>
                           <p className="font-bold text-gray-800 text-sm">Victoria and Albert</p>
                           <p className="text-[11px] text-gray-500">Cromwell Rd, London</p>
                         </div>
                       </div>
                     </div>
                   </div>

                   <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-3xl border border-gray-700 shadow-lg text-white">
                     <h4 className="font-bold text-white text-lg mb-1 flex justify-between items-center">
                        Weekend Trip
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                     </h4>
                     <p className="text-xs text-gray-300 mb-4 line-clamp-3 leading-relaxed mt-2 font-medium">Friday Night: drop off our bags at the hotel, stretch our legs with a stroll around Vienna's historic center to get a feel for the city.</p>
                     <div className="flex gap-2">
                       <span className="px-2 py-1 bg-white/10 rounded-md text-[10px] font-bold">TRAVEL</span>
                       <span className="px-2 py-1 bg-white/10 rounded-md text-[10px] font-bold">PLANS</span>
                     </div>
                   </div>
                   
                   <div className="bg-white p-5 rounded-3xl border border-gray-100 min-h-[260px] flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
                     <h4 className="font-bold text-gray-900 mb-4 text-lg">Reading list</h4>
                     <div className="flex items-center gap-3 mb-4 bg-white/60 p-2 rounded-xl">
                        <div className="w-10 h-10 bg-rose-400/80 rounded-lg shrink-0"></div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">about love</p>
                          <p className="text-xs text-gray-500">Bella Smith</p>
                        </div>
                     </div>
                     <div className="text-[10px] text-gray-400 mb-4 leading-relaxed font-medium">
                       collection of essays exploring how society understands and practices love
                     </div>
                     <div className="flex items-center gap-3 bg-white/60 p-2 rounded-xl">
                        <div className="w-10 h-10 bg-emerald-400/80 rounded-lg shrink-0"></div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Little Experiments</p>
                          <p className="text-xs text-gray-500">Lea Cullin</p>
                        </div>
                     </div>
                   </div>
                </div>
             </motion.div>
          </div>

          {/* Laptop Mockup UI */}
          <div ref={laptopRef} className="w-full relative overflow-x-clip overflow-y-visible px-4 md:px-0 mt-20 mb-20 max-w-6xl mx-auto flex justify-center perspective-[4000px] min-h-[60vh] items-center">
            <motion.div 
              style={{ rotateX: isMobile ? 0 : laptopRotateX, rotateY: isMobile ? 0 : laptopRotateY, scale: laptopScale, transformStyle: isMobile ? "flat" : "preserve-3d", backfaceVisibility: "hidden", willChange: isMobile ? "auto" : "transform" }}
              className="w-full relative block z-20"
            >
              {/* Spot Light */}
              <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[120%] h-64 bg-blue-500/20 blur-[120px] rounded-[100%] transform -rotate-x-[60deg]"></div>

              {/* Front Screen */}
              <div className="w-full h-[400px] md:h-[650px] border-[12px] md:border-[20px] border-[#0a0a0a] rounded-t-[1.5rem] md:rounded-t-[2.5rem] bg-[#fbfbfb] overflow-hidden shadow-2xl relative block ring-2 ring-gray-800/80" style={{ transform: "translateZ(1px)", backfaceVisibility: "hidden" }}>
               <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

               {/* Laptop Camera */}
               <div className="absolute top-1 md:top-2 inset-x-0 mx-auto w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#050505] border border-gray-900 z-30 flex items-center justify-center shadow-inner">
                 <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500/30 rounded-full"></div>
               </div>

               <div className="absolute top-3 right-4 flex items-center gap-3 opacity-90 z-20 text-gray-800 text-xs font-medium bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
                   <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{currentTime}</span>
                   <span className="w-px h-3 bg-gray-300"></span>
                   <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-600"/> <span className="font-bold tracking-tight">{batteryLevel}%</span></span>
               </div>
               
               <div className="w-full h-12 border-b border-gray-200 flex items-center px-4 bg-gray-50/80 backdrop-blur-md relative z-10 transition-colors pt-2">
                   <div className="flex gap-2">
                       <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500/20 shadow-sm"></div>
                       <div className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-500/20 shadow-sm"></div>
                       <div className="w-3 h-3 rounded-full bg-green-400 border border-green-500/20 shadow-sm"></div>
                   </div>
                   <div className="mx-auto bg-white border border-gray-200 text-[11px] px-3 md:px-6 py-1.5 rounded-md shadow-sm text-gray-600 font-medium flex items-center gap-2">
                       <Shield className="w-3 h-3 text-emerald-500" /> docscraft.pro/workspace/launch
                   </div>
               </div>

               <div className="flex h-full bg-white relative">
                   {/* Mockup Sidebar */}
                   <div className="w-64 border-r border-gray-100 bg-[#FAFAFA] p-5 hidden md:flex flex-col">
                       <div className="font-bold text-gray-900 mb-8 flex items-center gap-2 text-lg">
                           <div className="w-7 h-7 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-lg shadow-sm flex items-center justify-center">
                             <Sparkles className="w-4 h-4 text-white"/>
                           </div> 
                           Docscraft Pro
                       </div>
                       <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Workspace</div>
                       <div className="space-y-1 flex-1">
                           <div className="px-3 py-2.5 bg-blue-50 text-blue-700 font-medium rounded-xl text-sm flex items-center gap-2 shadow-sm border border-blue-100 transition-all">
                               <FileText className="w-4 h-4"/> Product Launch
                           </div>
                           <div className="px-3 py-2 text-gray-600 font-medium rounded-xl text-sm flex items-center gap-2">
                               <FileText className="w-4 h-4 opacity-70"/> Design Specs
                           </div>
                           <div className="px-3 py-2 text-gray-600 font-medium rounded-xl text-sm flex items-center gap-2">
                               <Database className="w-4 h-4 opacity-70"/> Q3 Roadmap
                           </div>
                       </div>
                   </div>
                   {/* Mockup Editor */}
                   <div className="flex-1 p-8 md:p-14 overflow-y-auto pb-32">
                        <div className="max-w-2xl mx-auto">
                            <div className="w-16 h-16 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-blue-500 shadow-sm border border-blue-200">
                                <Sparkles className="w-8 h-8" strokeWidth={1.5}/>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-serif font-black text-gray-900 mb-6 tracking-tight leading-[1.1]">Product Launch Strategy</h1>
                            <p className="text-lg md:text-xl text-gray-600 mb-10 font-serif leading-relaxed">
                                This document outlines our final go-to-market plan. As we combine Firebase Auth, Firestore real-time collaboration, and deeply integrated AI, the focus remains fiercely aligned on user experience.
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200/60 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group cursor-pointer">
                                    <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-yellow-700 transition-colors">Phase 1: Alpha</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">Internal testing & Quality Assurance across all device sizes.</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 p-6 rounded-3xl relative overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer">
                                    <div className="absolute top-0 right-0 p-3 opacity-50 transition-transform group-hover:scale-110"><Sparkles className="w-6 h-6 text-blue-400"/></div>
                                    <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-blue-700 transition-colors">Phase 2: Beta</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">Invite-only access to selected workspace communities.</p>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                    <h4 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                      <CheckCircle className="w-5 h-5 text-gray-400"/> Team Tasks
                                    </h4>
                                    <div className="flex -space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-black font-sans">TM</div>
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-black font-sans relative z-10">AL</div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                        <input type="checkbox" defaultChecked className="w-5 h-5 mt-0.5 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500 shadow-sm cursor-pointer"/> 
                                        <span className="line-through text-gray-400 font-medium text-lg">Finalize Landing Page layouts</span>
                                    </div>
                                    <div className="flex items-start gap-4 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                        <input type="checkbox" className="w-5 h-5 mt-0.5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 shadow-sm cursor-pointer"/> 
                                        <span className="text-gray-800 font-bold text-lg">Integrate Google Keep API support</span>
                                    </div>
                                    <div className="flex items-start gap-4 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                        <input type="checkbox" defaultChecked className="w-5 h-5 mt-0.5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 shadow-sm cursor-pointer"/> 
                                        <span className="text-gray-400 line-through font-medium text-lg">Verify animated device battery states</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
              </div> {/* Close Laptop Screen */}
              
              {/* Screen Edges (Top, Left, Right) to fill gap between front and back */}
              <div className="absolute top-0 left-0 w-full h-[10px] bg-[#050505] origin-top" style={{ transform: "rotateX(-90deg) translateZ(-1px)" }}></div>
              <div className="absolute top-0 left-0 w-[10px] h-[400px] md:h-[650px] bg-[#050505] origin-left" style={{ transform: "rotateY(-90deg) translateZ(1px)" }}></div>
              <div className="absolute top-0 right-0 w-[10px] h-[400px] md:h-[650px] bg-[#050505] origin-right" style={{ transform: "rotateY(90deg) translateZ(1px)" }}></div>

              {/* Back Lid */}
              <div className="absolute top-0 left-0 w-full h-[400px] md:h-[650px] bg-gradient-to-tr from-[#252525] to-[#121212] rounded-t-[1.5rem] md:rounded-t-[2.5rem] flex items-center justify-center overflow-hidden border-[12px] md:border-[20px] border-[#0a0a0a] ring-2 ring-gray-600 z-10" style={{ transform: "rotateY(180deg) translateZ(1px)", backfaceVisibility: "hidden" }}>
                 <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                 <div className="w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-3xl flex items-center justify-center shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] border border-white/10">
                    <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-white/40" strokeWidth={1.5} />
                 </div>
              </div>

              {/* True 3D Laptop Base / Keyboard Deck */}
              <div className="absolute top-[100%] inset-x-0 mx-auto w-full h-[280px] md:h-[350px] shadow-[0_50px_100px_rgba(0,0,0,0.6)] z-30 transform-style-[preserve-3d]" style={{ transform: "rotateX(-90deg)", transformOrigin: "top", transformStyle: "preserve-3d" }}>
                 
                 {/* SURFACE 1: TOP SURFACE (VISIBLE FROM FRONT / TOP) */}
                 <div className="absolute inset-0 bg-gradient-to-br from-[#eaeaea] to-[#d4d4d4] rounded-b-[2rem] border-t border-white/50 relative overflow-hidden flex flex-col items-center pt-6 md:pt-10 select-none shadow-[inset_0_2px_10px_rgba(255,255,255,0.9)]" style={{ backfaceVisibility: "hidden", transform: "translateZ(0.5px)" }}>
                    {/* Keyboard chamfered container */}
                    <div className="w-[85%] h-[120px] md:h-[160px] bg-[#1c1c1c] rounded-2xl shadow-[inset_0_8px_25px_rgba(0,0,0,0.8)] p-2.5 flex flex-col justify-between border border-white/10 relative z-10 overflow-hidden">
                        {/* High fidelity silver accents keyboard keys */}
                        <div className="flex justify-between w-full h-[15%] gap-1">
                          {Array.from({ length: 14 }).map((_, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-b from-[#333] to-[#151515] rounded-sm ring-1 ring-black border-t border-white/10 shadow-sm text-[6px] text-gray-500 font-mono flex items-center justify-center font-bold">F{i+1}</div>
                          ))}
                        </div>
                        <div className="flex justify-between w-full h-[15%] gap-1">
                          <div className="w-[8%] bg-gradient-to-b from-[#333] to-[#151515] rounded-sm ring-1 ring-black border-t border-white/10"></div>
                          {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-b from-[#333] to-[#151515] rounded-sm ring-1 ring-black border-t border-white/10"></div>
                          ))}
                          <div className="w-[10%] bg-gradient-to-b from-[#333] to-[#151515] rounded-sm ring-1 ring-black border-t border-white/10"></div>
                        </div>
                        <div className="flex justify-between w-full h-[15%] gap-1">
                          <div className="w-[12%] bg-gradient-to-b from-[#333] to-[#151515] rounded-sm ring-1 ring-black border-t border-white/10"></div>
                          {Array.from({ length: 11 }).map((_, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-b from-[#333] to-[#151515] rounded-sm ring-1 ring-black border-t border-white/10"></div>
                          ))}
                          <div className="w-[14%] bg-gradient-to-b from-[#333] to-[#151515] rounded-sm ring-1 ring-black border-t border-white/10"></div>
                        </div>
                        <div className="flex justify-between w-full h-[15%] gap-1">
                          <div className="w-[16%] bg-gradient-to-b from-[#333] to-[#151515] rounded-sm ring-1 ring-black border-t border-white/10"></div>
                          {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-b from-[#333] to-[#151515] rounded-sm ring-1 ring-black border-t border-white/10"></div>
                          ))}
                          <div className="w-[18%] bg-gradient-to-b from-[#333] to-[#151515] rounded-sm ring-1 ring-black border-t border-white/10"></div>
                        </div>
                        <div className="flex justify-center w-full h-[15%] gap-2">
                          <div className="w-[15%] bg-gradient-to-b from-[#333] to-[#151515] rounded-sm ring-1 ring-black border-t border-white/10"></div>
                          <div className="w-[50%] bg-gradient-to-b from-[#333] to-[#151515] rounded-sm ring-1 ring-black border-t border-white/10 cursor-pointer hover:brightness-110 active:brightness-90 transition-all"></div>
                          <div className="w-[15%] bg-gradient-to-b from-[#333] to-[#151515] rounded-sm ring-1 ring-black border-t border-white/10"></div>
                          <div className="flex gap-0.5">
                            <div className="w-5 bg-[#151515] rounded-sm ring-1 ring-black border-t border-white/10"></div>
                            <div className="w-5 bg-[#151515] rounded-sm ring-1 ring-black border-t border-white/10"></div>
                            <div className="w-5 bg-[#151515] rounded-sm ring-1 ring-black border-t border-white/10"></div>
                          </div>
                        </div>
                    </div>

                    {/* Chamfered precision trackpad */}
                    <div className="absolute bottom-6 md:bottom-8 mx-auto w-[35%] h-[90px] md:h-[130px] bg-gradient-to-b from-[#cfcfcf] to-[#e4e4e4] rounded-xl shadow-[inset_0_3px_8px_rgba(0,0,0,0.15)] border border-gray-400"></div>
                    <div className="absolute bottom-0 inset-x-0 mx-auto w-[15%] h-[6px] md:h-[8px] bg-[#b8b8b8] rounded-t-lg shadow-inner"></div>
                 </div>

                 {/* SURFACE 2: UNDERSIDE COVER (REPLACES MIRRORED KEYBOARD FOR STABILITY WHEN IN REVERSE SPIN) */}
                 <div className="absolute inset-0 bg-gradient-to-br from-[#c0c0c0] to-[#e0e0e0] rounded-b-[2rem] border border-gray-400/80 shadow-[inset_0_4px_15px_rgba(255,255,255,0.7)] p-8 relative overflow-hidden" style={{ backfaceVisibility: "hidden", transform: "rotateX(180deg) translateZ(0.5px)" }}>
                    <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                    
                    {/* Symmetrical Ventilation Grills */}
                    <div className="w-[75%] h-[20px] md:h-[30px] bg-black/80 rounded-lg mx-auto shadow-inner flex flex-col justify-around py-1 px-4 border border-white/10 select-none">
                       <div className="h-[1px] bg-gray-800 w-full"></div>
                       <div className="h-[1px] bg-gray-800 w-full"></div>
                       <div className="h-[1px] bg-gray-800 w-full"></div>
                    </div>
                    
                    {/* Metallic Engraved docscraft sign */}
                    <div className="text-center mt-12 md:mt-20">
                      <div className="text-[10px] md:text-xs font-mono tracking-widest text-[#777] font-semibold uppercase flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500/60" /> DOCSCRAFT PRO • MODEL AI-712
                      </div>
                      <p className="text-[8px] text-gray-400 mt-2">Designed in California • Managed under Vault Sovereignty</p>
                    </div>

                    {/* 4 Rubber grip feet */}
                    <div className="absolute top-4 left-6 w-4 h-4 rounded-full bg-[#151515] border border-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]"></div>
                    <div className="absolute top-4 right-6 w-4 h-4 rounded-full bg-[#151515] border border-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]"></div>
                    <div className="absolute bottom-4 left-6 w-4 h-4 rounded-full bg-[#151515] border border-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]"></div>
                    <div className="absolute bottom-4 right-6 w-4 h-4 rounded-full bg-[#151515] border border-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]"></div>
                 </div>

                 {/* Laptop Thickness (Front Lip) */}
                 <div className="absolute top-[100%] inset-x-0 h-4 md:h-6 bg-gradient-to-b from-[#b0b0b0] to-[#808080] rounded-b-xl border-t border-[#999]" style={{ transform: "rotateX(-90deg)", transformOrigin: "top" }}>
                    <div className="absolute bottom-0 inset-x-0 h-[2px] bg-white/20"></div>
                 </div>

                 {/* Laptop Side Lips (Left/Right) for Base thickness */}
                 <div className="absolute top-0 left-0 w-4 md:w-6 h-full bg-gradient-to-r from-[#e0e0e0] to-[#c2c2c2] origin-left border-y border-[#999]" style={{ transform: "rotateY(-90deg)" }}></div>
                 <div className="absolute top-0 right-0 w-4 md:w-6 h-full bg-gradient-to-l from-[#e0e0e0] to-[#c2c2c2] origin-right border-y border-[#999]" style={{ transform: "rotateY(90deg)" }}></div>
              </div>
             </motion.div>
          </div>

          <LandingBookSection />

          <LandingPaperDraft />

          <LandingCalendarTasks />

          <LandingVideoWorkspace />

          <LandingInteractiveImage />

          <LandingAICapabilities />

          {/* Quote Section */}
          <div className="py-24 max-w-4xl mx-auto text-center px-4 mb-20 bg-white/50 backdrop-blur-md rounded-3xl border border-gray-100 shadow-xl">
             <img src="https://i.pravatar.cc/150?u=tom" alt="Tom" className="w-24 h-24 rounded-full mx-auto mb-6 object-cover shadow-md border-4 border-white" />
             <p className="font-semibold text-gray-600 mb-8 text-xl">Tom</p>
             <h2 className="text-3xl md:text-5xl font-serif italic text-gray-900 leading-[1.3] px-10">
               "Publishing directly from Docscraft Pro just feels natural &mdash; it's where I write, so it makes sense to share from there too."
             </h2>
          </div>

          {/* Connect Section */}
          <div className="w-full bg-gradient-to-br from-[#82D099] to-[#60b077] rounded-[3rem] p-12 md:p-24 text-left shadow-2xl relative overflow-hidden">
             
             {/* Decorative circles */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
             
             <span className="font-bold tracking-widest text-[#1a5a3a]/80 uppercase text-sm mb-6 block relative z-10">Imagine</span>
             <h3 className="text-4xl md:text-6xl lg:text-[4.5rem] font-serif font-medium text-[#043319] mb-8 leading-[1.1] relative z-10">
               Imagine the possibilities when everything's connected to Docscraft Pro
             </h3>
             <p className="text-2xl text-[#11502e] max-w-2xl font-serif leading-relaxed relative z-10 opacity-90">
               Make Docscraft Pro yours &mdash; connect the tools you love, build what you need.
             </p>
          </div>
          
          {/* Import / Export Section */}
          <div className="w-full mt-40 text-center px-4">
            <h3 className="text-5xl md:text-6xl font-serif font-black text-gray-900 mb-8 tracking-tight">Import & Export</h3>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto mb-20 font-serif leading-relaxed">
              Move your content in and out of Docscraft Pro with support for multiple formats and platforms.
            </p>
            
            <div className="max-w-5xl mx-auto mb-20 relative">
               <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent -translate-x-1/2"></div>
               
               <div className="space-y-12 md:space-y-24">
                 {/* Row 1 */}
                 <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-24 relative group">
                    <div className="hidden md:flex absolute left-1/2 top-1/2 w-3 h-3 bg-white border-2 border-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-150 transition-transform"></div>
                    <div className="flex-1 text-center md:text-right">
                       <h4 className="font-serif font-bold text-3xl mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">Google Docs</h4>
                       <p className="text-gray-500 text-lg">Import your Google Docs directly with rich formatting preserved.</p>
                    </div>
                    <div className="flex-1 flex justify-center md:justify-start">
                       <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shadow-sm ring-1 ring-blue-100 group-hover:bg-blue-100 transition-colors">
                         <FileText className="w-10 h-10" />
                       </div>
                    </div>
                 </div>

                 {/* Row 2 */}
                 <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-8 md:gap-24 relative group">
                    <div className="hidden md:flex absolute left-1/2 top-1/2 w-3 h-3 bg-white border-2 border-purple-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-150 transition-transform"></div>
                    <div className="flex-1 text-center md:text-left">
                       <h4 className="font-serif font-bold text-3xl mb-2 text-gray-900 group-hover:text-purple-600 transition-colors">Obsidian</h4>
                       <p className="text-gray-500 text-lg">Preserve your markdown links, tags, and structure flawlessly.</p>
                    </div>
                    <div className="flex-1 flex justify-center md:justify-end">
                       <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 shadow-sm ring-1 ring-purple-100 group-hover:bg-purple-100 transition-colors">
                         <Boxes className="w-10 h-10" />
                       </div>
                    </div>
                 </div>

                 {/* Row 3 */}
                 <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-24 relative group">
                    <div className="hidden md:flex absolute left-1/2 top-1/2 w-3 h-3 bg-white border-2 border-rose-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(244,63,94,0.5)] group-hover:scale-150 transition-transform"></div>
                    <div className="flex-1 text-center md:text-right">
                       <h4 className="font-serif font-bold text-3xl mb-2 text-gray-900 group-hover:text-rose-600 transition-colors">Notion</h4>
                       <p className="text-gray-500 text-lg">Bring your Notion databases to life in a faster environment.</p>
                    </div>
                    <div className="flex-1 flex justify-center md:justify-start">
                       <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 shadow-sm ring-1 ring-rose-100 group-hover:bg-rose-100 transition-colors">
                         <Database className="w-10 h-10" />
                       </div>
                    </div>
                 </div>

                 {/* Row 4 */}
                 <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-8 md:gap-24 relative group">
                    <div className="hidden md:flex absolute left-1/2 top-1/2 w-3 h-3 bg-white border-2 border-emerald-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(16,185,129,0.5)] group-hover:scale-150 transition-transform"></div>
                    <div className="flex-1 text-center md:text-left">
                       <h4 className="font-serif font-bold text-3xl mb-2 text-gray-900 group-hover:text-emerald-600 transition-colors">Evernote</h4>
                       <p className="text-gray-500 text-lg">Migrate all your Evernote notebooks with a single click.</p>
                    </div>
                    <div className="flex-1 flex justify-center md:justify-end">
                       <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shadow-sm ring-1 ring-emerald-100 group-hover:bg-emerald-100 transition-colors">
                         <Search className="w-10 h-10" />
                       </div>
                    </div>
                 </div>
               </div>
            </div>
            
            <h4 className="text-2xl font-bold mt-20 mb-8 uppercase tracking-widest text-gray-400 text-center text-sm">Multi-Format Compilation Engine</h4>
            
            <div className="w-full max-w-5xl mx-auto bg-[#1a1a1a] rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-14 text-white shadow-2xl relative overflow-hidden ring-1 ring-gray-900 mb-10 group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] -mr-20 -mt-20 mix-blend-screen pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-60"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -ml-20 -mb-20 mix-blend-screen pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-60"></div>
               <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #ffffff 10px, #ffffff 11px)' }}></div>
               
               <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {/* Format 1 */}
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:bg-white/10 transition-colors flex flex-col justify-between group/card">
                    <span className="text-blue-400 font-mono text-xs tracking-widest font-bold mb-6 block group-hover/card:text-blue-300">.MD / .TEXTBUNDLE</span>
                    <div>
                      <h5 className="font-serif font-black text-2xl mb-2">Native Web</h5>
                      <p className="text-gray-400 text-sm leading-relaxed">Full fidelity markdown parsing with metadata tags.</p>
                    </div>
                 </div>
                 {/* Format 2 */}
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:bg-white/10 transition-colors flex flex-col justify-between group/card">
                    <span className="text-emerald-400 font-mono text-xs tracking-widest font-bold mb-6 block group-hover/card:text-emerald-300">.PDF</span>
                    <div>
                      <h5 className="font-serif font-black text-2xl mb-2">Print Ready</h5>
                      <p className="text-gray-400 text-sm leading-relaxed">High-definition vector documents with embedded fonts.</p>
                    </div>
                 </div>
                 {/* Format 3 */}
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:bg-white/10 transition-colors flex flex-col justify-between group/card">
                    <span className="text-purple-400 font-mono text-xs tracking-widest font-bold mb-6 block group-hover/card:text-purple-300">.CSV / .JSON</span>
                    <div>
                      <h5 className="font-serif font-black text-2xl mb-2">Data Graph</h5>
                      <p className="text-gray-400 text-sm leading-relaxed">Export raw structured data tables directly.</p>
                    </div>
                 </div>
                 {/* Format 4 */}
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:bg-white/10 transition-colors flex flex-col justify-between group/card">
                    <span className="text-amber-400 font-mono text-xs tracking-widest font-bold mb-6 block group-hover/card:text-amber-300">SYNC API</span>
                    <div>
                      <h5 className="font-serif font-black text-2xl mb-2">Live Cloud</h5>
                      <p className="text-gray-400 text-sm leading-relaxed">Continuous sync to Google Drive and other nodes.</p>
                    </div>
                 </div>
               </div>
            </div>
        </div>



        {/* Existing sections wrapper end */}

        {/* Central Button & Robot Container */}
        <div className="flex flex-col items-center justify-center relative min-h-[500px] mb-32 z-30">
           
           {/* Background Floating Elements */}
           <FloatingElements onExamine={handleExamine} onRelease={handleReleaseExamine} />

           {/* Robot Positioned above/beside button */}
           <motion.div 
             initial={{ opacity: 0, scale: 0, y: 150 }}
             animate={isLoaded ? { opacity: 1, scale: 1, y: 0 } : {}}
             transition={{ type: "spring", damping: 15, delay: 0.6 }}
             className="absolute z-40 transform translate-x-[110px] md:translate-x-[220px] -translate-y-[120px] md:-translate-y-[110px] scale-[0.65] md:scale-[0.9] origin-bottom pointer-events-auto"
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
              Tap into Docscraft Pro's robust block-based architecture via our GraphQL and REST APIs. Everything is an object, letting you sculpt documentation exactly how you need it.
            </p>
            <div className="flex gap-4">
              <Link to="/docs" className="bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-gray-200 transition-colors">Read Docs</Link>
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

      <DetailedFeatures />

      {/* Section 2.5: Use Cases */}
      <section className="py-32 bg-[#FDFBF7] relative z-10 border-b border-[#E4DBC5] overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37] opacity-[0.03] rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600 opacity-[0.02] rounded-full blur-[120px]"></div>
        
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
             <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-xs mb-4 block">Platform Capabilities</span>
             <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-green-500 to-blue-500 bg-[length:200%_auto] animate-pulse">Real-World Use Cases.</h2>
             <p className="text-gray-500 font-sans text-lg max-w-2xl mx-auto">Discover how professionals leverage our platform to simplify their workload and accelerate complex writing assignments.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white p-8 rounded-[2rem] border border-[#E4DBC5] shadow-xs hover:shadow-xl hover:border-[#D4AF37]/50 transition-all min-h-[340px] flex flex-col relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full"></div>
               <div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center mb-6 text-amber-600 shadow-sm shrink-0 relative z-10">
                 <Shield className="w-7 h-7" />
               </div>
               <h3 className="text-xl font-black uppercase text-gray-900 mb-4 tracking-tight relative z-10">Legal & Contracts</h3>
               <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow relative z-10">Generate NDAs, vendor agreements, and essential contracts confidently. Apply offline editing controls and review historical versions effortlessly.</p>
               <ul className="space-y-3 relative z-10">
                 <li className="flex items-center gap-3 text-sm text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-[#D4AF37]"/> Deep Offline Privacy</li>
                 <li className="flex items-center gap-3 text-sm text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-[#D4AF37]"/> PDF Archiving Output</li>
               </ul>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white p-8 rounded-[2rem] border border-[#E4DBC5] shadow-xs hover:shadow-xl hover:border-blue-400/50 transition-all min-h-[340px] flex flex-col relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full"></div>
               <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 shadow-sm shrink-0 relative z-10">
                 <Database className="w-7 h-7" />
               </div>
               <h3 className="text-xl font-black uppercase text-gray-900 mb-4 tracking-tight relative z-10">Technical Documentation</h3>
               <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow relative z-10">Build developer manuals, structural references, and engineering blueprints right next to your codebase with embedded diagram tools.</p>
               <ul className="space-y-3 relative z-10">
                 <li className="flex items-center gap-3 text-sm text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-blue-500"/> Synchronized Blocks</li>
                 <li className="flex items-center gap-3 text-sm text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-blue-500"/> Mermaid Diagrams</li>
               </ul>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white p-8 rounded-[2rem] border border-[#E4DBC5] shadow-xs hover:shadow-xl hover:border-emerald-400/50 transition-all min-h-[340px] flex flex-col relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full"></div>
               <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 shadow-sm shrink-0 relative z-10">
                 <UserCheck className="w-7 h-7" />
               </div>
               <h3 className="text-xl font-black uppercase text-gray-900 mb-4 tracking-tight relative z-10">HR & Onboarding</h3>
               <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow relative z-10">Draft offer letters, employee directories, and performance schedules with rich formatting options that print beautifully.</p>
               <ul className="space-y-3 relative z-10">
                 <li className="flex items-center gap-3 text-sm text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500"/> Rich Typography</li>
                 <li className="flex items-center gap-3 text-sm text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500"/> Table Generators</li>
               </ul>
            </motion.div>

            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white p-8 rounded-[2rem] border border-[#E4DBC5] shadow-xs hover:shadow-xl hover:border-orange-400/50 transition-all min-h-[340px] flex flex-col relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full"></div>
               <div className="w-14 h-14 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center mb-6 text-orange-600 shadow-sm shrink-0 relative z-10">
                 <PenTool className="w-7 h-7" />
               </div>
               <h3 className="text-xl font-black uppercase text-gray-900 mb-4 tracking-tight relative z-10">Creative Content & Strategy</h3>
               <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow relative z-10">Brainstorm marketing campaigns, outline detailed research papers, and maintain structural consistency across massive content projects.</p>
               <ul className="space-y-3 relative z-10">
                 <li className="flex items-center gap-3 text-sm text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-orange-500"/> Interactive Canvases</li>
                 <li className="flex items-center gap-3 text-sm text-gray-700 font-medium"><CheckCircle className="w-5 h-5 text-orange-500"/> Outline Structuring</li>
               </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 3: Bento Box Value Proposition */}
      <section className="py-32 bg-[#FDFBF7] relative z-10 border-b border-[#E4DBC5]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase text-[#1a1a1a]">Designed for Professionals.</h2>
            <p className="text-gray-500 font-sans text-lg max-w-2xl mx-auto">Everything you need to write, edit, secure, and professionally manage your documents.</p>
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
                    <h3 className="text-2xl font-black uppercase text-[#1a1a1a] mb-2">Reliable Document Creation</h3>
                    <p className="text-gray-500 text-sm max-w-sm leading-relaxed">Continuous automatic saving protects your work context dynamically. Experience highly reliable document creating features designed for professionals.</p>
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
                    <h3 className="text-xl font-black uppercase text-[#1a1a1a] mb-2">Secure Storage</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Your data is stored in isolated, secure spaces with secure database connections and safe access points.</p>
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
                    <h3 className="text-xl font-black uppercase text-[#1a1a1a] mb-2">Create PDFs Professionally</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Design beautiful page layouts, sign PDFs securely, and append digital signatures to documents professionally.</p>
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
                    <h3 className="text-2xl font-black uppercase text-white mb-2">Multi-Format Exports</h3>
                    <p className="text-gray-400 text-sm max-w-sm leading-relaxed">Compile your creations into high-fidelity files. Instantly download standard PDF documents, Word-compatible files, or images.</p>
                  </div>
                </div>
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0,transparent_100%)]" style={{ backgroundSize: '20px 20px', backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)' }}></div>
              </TiltCard>
          </div>
        </div>
      </section>

      {/* Expanded Interactive Content Hub Section */}
      <section className="py-32 bg-[#FAF9F6] relative z-10 border-b border-[#E4DBC5]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-24">
             <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-xs mb-4 block">Interactive Architecture</span>
             <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tight text-[#1a1a1a]">Built for Scale.</h2>
             <p className="text-gray-500 font-sans text-xl max-w-3xl mx-auto">Seamlessly organize massive documentation hubs with our sticky intelligent routing and beautifully structured lengthy cards.</p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-16 relative items-start">
             {/* Sticky Sidebar */}
             <div className="w-full lg:w-1/4 lg:sticky lg:top-32 flex flex-col gap-4 font-sans border-r border-[#E4DBC5] pr-8 hidden md:flex">
                <h4 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-4">Documentation Hub</h4>
                
                {[
                  { title: "Core Principles", subtitle: "Foundation of Docscraft" },
                  { title: "Security Layers", subtitle: "Enterprise-grade protection" },
                  { title: "API Integration", subtitle: "Headless content delivery" },
                  { title: "Export Engine", subtitle: "Multi-format generation" }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 10 }}
                    className="p-4 rounded-xl border border-transparent hover:border-[#F4E091] hover:bg-white transition-all cursor-pointer group"
                  >
                     <h5 className="font-bold text-gray-900 group-hover:text-[#D4AF37] transition-colors">{item.title}</h5>
                     <p className="text-xs text-gray-500 mt-1">{item.subtitle}</p>
                  </motion.div>
                ))}
             </div>

             {/* Lengthy Cards Showcase */}
             <div className="w-full lg:w-3/4 flex flex-col gap-16">
                {[
                  {
                    title: "Immutable Core Principles",
                    tag: "FOUNDATION",
                    content: "Every document crafted on our platform adheres to strict typography constraints and pristine padding rules. We believe that constraints breed creativity. By locking down the foundational UI, your team can focus entirely on writing brilliant, structural content without fighting formatting glitches.",
                    imgUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800"
                  },
                  {
                    title: "Advanced Security Layers",
                    tag: "ENTERPRISE",
                    content: "Your data is encapsulated within mathematically secure boundaries. From the moment you type a keystroke, it is encrypted locally before being synchronized to the cloud. We utilize SOC-2 compliant infrastructure to ensure your most critical legal and technical documents remain entirely private.",
                    imgUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
                  },
                  {
                    title: "Headless Content APIs",
                    tag: "DEVELOPERS",
                    content: "Extract your documentation directly into your mobile apps or web platforms. Our high-performance GraphQL and REST APIs allow you to decouple the writing experience from the rendering experience. Deliver your docs seamlessly across any digital touchpoint.",
                    imgUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800"
                  }
                ].map((card, i) => (
                   <motion.div 
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true, margin: "-100px" }}
                     transition={{ duration: 0.6, delay: i * 0.1 }}
                     key={i} 
                     className="bg-white border border-[#E4DBC5] rounded-[2.5rem] p-8 md:p-12 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(212,175,55,0.15)] hover:-translate-y-2 hover:border-[#D4AF37]/50 transition-all duration-500 group flex flex-col md:flex-row gap-10 items-center overflow-hidden relative"
                   >
                     {/* Subtle Gold Hover Glow Background */}
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FDF0D5]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -translate-x-full group-hover:translate-x-full"></div>

                     <div className="flex-1 relative z-10 w-full">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-[#FDFCF8] border border-[#F4E091] text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
                           {card.tag}
                        </span>
                        <h3 className="text-3xl md:text-4xl font-serif font-black text-gray-900 mb-6 leading-tight">
                           {card.title}
                        </h3>
                        <p className="text-gray-600 text-lg leading-relaxed font-sans">
                           {card.content}
                        </p>
                        
                        <div className="mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400 group-hover:text-[#D4AF37] transition-colors cursor-pointer w-max border-b-2 border-transparent group-hover:border-[#D4AF37]">
                           Explore Module <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-2 transition-transform" />
                        </div>
                     </div>
                     <div className="w-full md:w-5/12 h-[300px] shrink-0 rounded-[1.5rem] overflow-hidden border border-[#E4DBC5] relative z-10 group-hover:border-[#D4AF37]/40 transition-colors">
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                        <img src={card.imgUrl} alt={card.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 blur-[2px] group-hover:blur-0" />
                     </div>
                   </motion.div>
                ))}
             </div>
          </div>
        </div>
      </section>

      <SEOBoost />
      {/* Section 6: Premium SaaS Footer */}
      <Footer />
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
        animate={activePopup === 0 
          ? { scale: 1.28, rotate: -1, zIndex: 120, y: -10 }
          : { y: [-15, 15, -15], rotate: [-6, 2, -6], scale: 1 }
        }
        transition={activePopup === 0 
          ? { type: 'spring', stiffness: 350, damping: 20 }
          : { duration: 7, repeat: Infinity, ease: "easeInOut" }
        }
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
        animate={activePopup === 1 
          ? { scale: 1.28, rotate: 1, zIndex: 120, y: -10 }
          : { y: [20, -10, 20], rotate: [4, -2, 4], scale: 1 }
        }
        transition={activePopup === 1 
          ? { type: 'spring', stiffness: 350, damping: 20 }
          : { duration: 9, repeat: Infinity, ease: "easeInOut" }
        }
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
          <div className="flex items-center justify-between mb-4 border-b border-[#332] pb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[10px] font-mono text-amber-400 tracking-wider font-bold">WORKSPACE DIRECTORY</span>
            </div>
            <span className="text-[8px] font-mono text-gray-500">v1.0.0</span>
          </div>
          <div className="font-sans text-[11px] leading-relaxed text-gray-300">
             <div className="font-bold text-white mb-1 uppercase tracking-tight">Click on document to open the documents</div>
             <p className="text-[10px] text-gray-400">Select any of your documents below to immediately load the visual workspace editor, write notes, draw diagrams, or export files.</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        animate={activePopup === 2 
          ? { scale: 1.28, rotate: -1, zIndex: 120, y: -10 }
          : { y: [-5, 10, -5], rotate: [-4, 4, -4], scale: 1 }
        }
        transition={activePopup === 2 
          ? { type: 'spring', stiffness: 350, damping: 20 }
          : { duration: 8, repeat: Infinity, ease: "easeInOut" }
        }
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
      label: "reliable document creating features",
      spec: "continuous automatic save state",
      metrics: ["status: running", "last save: just now", "draft history: active"]
    },
    security: {
      label: "robust secure data defense",
      spec: "secure sandboxed document space",
      metrics: ["encryption: AES-256", "local persistence: active", "session security: verified"]
    },
    vector: {
      label: "create PDFs full to professionally",
      spec: "precision document annotations and signatures",
      metrics: ["status: ready", "worker status: local optimized", "layout check: perfect alignment"]
    },
    edge: {
      label: "format exports and downloads",
      spec: "custom multi-format compile engine",
      metrics: ["format support: raw/compiled/pages", "export options: rich word/pdf/images", "image quality: high definition"]
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
      const niceTitle = type === "crdt" ? "Reliable Document Creation" 
                      : type === "security" ? "Secure Storage"
                      : type === "vector" ? "Create PDFs Professionally"
                      : "Multi-Format Exports";
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
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className={`relative rounded-3xl overflow-hidden cursor-pointer p-[2px] transition-all duration-300 ${colSpan}`}
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
          ? `radial-gradient(circle at ${shineX}% ${shineY}%, #D4AF37 0%, rgba(212,175,55,0.25) 75%)`
          : 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(228, 219, 197, 0.4) 50%, rgba(212,175,55,0.15) 100%)',
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
      </div>
    </motion.div>
  );
}

function WaveGlowBackground() {
  const customStyles = `
    @keyframes wateryFlow {
      0% { transform: translate(0, 0) scale(1) rotate(0deg); }
      50% { transform: translate(-15px, 10px) scale(1.02) rotate(1deg); }
      100% { transform: translate(0, 0) scale(1) rotate(0deg); }
    }
    @keyframes sparklyGlow {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.75; transform: scale(1.1); }
    }
    @keyframes waveShift {
      0% { transform: translateX(0) translateY(0); }
      50% { transform: translateX(-15px) translateY(5px); }
      100% { transform: translateX(0) translateY(0); }
    }
    @keyframes waveShiftRev {
      0% { transform: translateX(0) translateY(0); }
      50% { transform: translateX(15px) translateY(-5px); }
      100% { transform: translateX(0) translateY(0); }
    }
  `;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-30 select-none w-screen h-screen">
      <style>{customStyles}</style>
      
      {/* Sparkles / Blobs in fixed viewport bounds (Highly performant, lighter blurs, no mix-blend-multiply recalculations) */}
      <div 
        className="absolute top-[10%] left-[10%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-[#fbcfe8]/40 via-[#bfdbfe]/30 to-[#fed7aa]/20 blur-[60px]" 
        style={{ animation: 'wateryFlow 14s infinite ease-in-out', willChange: 'transform' }} 
      />
      <div 
        className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#fef08a]/30 via-[#bfdbfe]/30 to-[#fbcfe8]/25 blur-[70px]" 
        style={{ animation: 'wateryFlow 18s infinite ease-in-out', willChange: 'transform' }} 
      />
      <div 
        className="absolute top-[35%] right-[25%] w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-[#e0f2fe]/30 via-[#f3e8ff]/30 to-white/20 blur-[50px]" 
        style={{ animation: 'wateryFlow 16s infinite ease-in-out', willChange: 'transform' }} 
      />
      
      {/* SVG swelling waves looping in bottom background of active view */}
      <svg className="absolute inset-x-0 bottom-0 min-w-[1400px] w-full h-[350px] opacity-40 pointer-events-none" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M0,250 C240,290 480,180 720,240 C960,300 1200,200 1440,280 L1440,600 L0,600 Z" 
          fill="url(#wave-gradient-1)" 
          style={{ animation: 'waveShift 16s infinite ease-in-out' }} 
        />
        <path 
          d="M0,320 C280,240 560,360 840,260 C1120,160 1280,340 1440,280 L1440,600 L0,600 Z" 
          fill="url(#wave-gradient-2)" 
          style={{ animation: 'waveShiftRev 22s infinite ease-in-out' }} 
        />
        
        <defs>
          <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(253, 240, 213, 0.3)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.5)" />
            <stop offset="100%" stopColor="rgba(191, 219, 254, 0.3)" />
          </linearGradient>
          <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(191, 219, 254, 0.3)" />
            <stop offset="50%" stopColor="rgba(253, 240, 213, 0.4)" />
            <stop offset="100%" stopColor="rgba(251, 207, 232, 0.3)" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Tiny gold sparkly pulse elements */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-35 shadow-[0_0_10px_#D4AF37]"
            style={{
              top: `${15 + i * 7}%`,
              left: `${10 + (i * 23) % 81}%`,
              width: `${3 + (i % 2) * 3}px`,
              height: `${3 + (i % 2) * 3}px`,
              animation: `sparklyGlow ${3 + (i % 3)}s infinite ease-in-out`
            }}
          />
        ))}
      </div>
    </div>
  );
}

