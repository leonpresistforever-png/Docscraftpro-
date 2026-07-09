import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, User, Menu, X, MessageSquare, Download } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ProfileMenu } from './ProfileMenu';
import { AnimatePresence, motion } from 'motion/react';

export function Navbar() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      alert("Docscraft Pro PWA Ready! 🚀\n\nTo install native app, click the install/download icon in your browser URL bar or select 'Add to Home screen' / 'Install' in your browser options menu.");
    }
  };

  return (
    <>
      <nav className="flex items-center justify-between px-8 py-4 bg-[#FDFBF7]/85 backdrop-blur-md border-b border-stone-200/20 fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div 
        onClick={() => {
          if (user) {
            setShowProfile(!showProfile);
          } else {
            navigate('/');
          }
        }}
        className="flex items-center gap-3 group cursor-pointer"
      >
        <div className="relative w-10 h-10 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
           <img src="/logo.svg" alt="DocsCraft Pro Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl leading-none font-serif tracking-tight">Docscraft Pro</span>
          <span className="text-xs font-bold uppercase tracking-widest text-red-600 mt-1 drop-shadow-sm">Workspace</span>
        </div>
      </div>
      
      <div className="hidden md:flex items-center gap-8 font-sans font-medium text-sm text-dc-text relative z-50">
        <Link to="/repositories" className="cursor-pointer hover:text-dc-gold transition-colors py-2">Agent Studio</Link>
        <Link to="/contact" className="cursor-pointer hover:text-dc-gold transition-colors py-2">Contact Support</Link>
        <Link to="/about" className="cursor-pointer hover:text-dc-gold transition-colors py-2">About</Link>
        
        <div className="group relative cursor-pointer py-2">
          <Link to="/compliance" className="flex items-center gap-1 hover:text-dc-gold transition-colors">
            Compliance <ChevronDown className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform" />
          </Link>
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-[#EAE6DF] shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
            <Link to="/compliance" className="block px-4 py-2 hover:bg-gray-50 text-dc-gold hover:text-[#AA7A00] transition-colors font-bold text-xs uppercase tracking-wider">Official Compliance</Link>
            <Link to="/services" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-indigo-600 transition-colors text-xs">Our Services</Link>
            <Link to="/faq" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-indigo-600 transition-colors text-xs">FAQ & Trust</Link>
            <Link to="/privacy-policy" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-indigo-600 transition-colors text-xs">Privacy Policy</Link>
            <Link to="/terms-of-service" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-indigo-600 transition-colors text-xs">Terms of Service</Link>
            <Link to="/disclaimer" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-indigo-600 transition-colors text-xs">Disclaimer</Link>
            <Link to="/changelog" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-indigo-600 transition-colors text-xs">Changelog</Link>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {user ? (
           <div className="flex items-center gap-4">
             <Button onClick={() => navigate('/dashboard')} variant="outline" className="hidden sm:inline-flex rounded-full px-6 font-medium bg-[#FAF9F6]/50 backdrop-blur-sm border-[#D0D0D0]">Dashboard</Button>
             
             <div className="relative">
               <button 
                 onClick={() => setShowProfile(!showProfile)}
                 className="w-10 h-10 rounded-full border-2 border-transparent hover:border-dc-gold overflow-hidden bg-white shadow-sm transition-all focus:outline-none"
               >
                 {userData?.avatarUrl || user.photoURL ? (
                    <img src={userData?.avatarUrl || user.photoURL || ''} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || 'user'}&backgroundColor=e5e5e5`} alt="Profile" className="w-full h-full object-cover" />
                 )}
               </button>
               
               
             </div>
           </div>
        ) : (
           <Button onClick={() => navigate('/auth')} variant="outline" className="rounded-full px-6 font-medium bg-[#FAF9F6]/50 backdrop-blur-sm border-[#D0D0D0]">Sign In</Button>
        )}

        {/* Mobile Hamburger Toggle */}
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="flex md:hidden w-10 h-10 items-center justify-center rounded-full bg-[#FAF9F6]/50 backdrop-blur-sm border border-[#D0D0D0] text-gray-700 hover:text-dc-gold transition-colors focus:outline-none relative z-50"
          aria-label="Toggle Menu"
        >
          {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 left-4 right-4 bg-white border border-[#EAE6DF] shadow-2xl rounded-2xl md:hidden overflow-hidden flex flex-col p-5 z-40 gap-4"
          >
            <div className="text-xs font-bold uppercase tracking-widest text-[#AA7A00] border-b border-gray-100 pb-2 mb-1">
              Docscraft Pro Navigation
            </div>
            
            {user && (
              <Link 
                to="/dashboard" 
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 text-[#AA7A00] font-bold text-sm"
              >
                Go to Workspace Dashboard
              </Link>
            )}

            <div className="flex flex-col gap-1 border-b border-gray-100 pb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-1">Compliance & Rules</span>
              <Link to="/compliance" onClick={() => setShowMobileMenu(false)} className="px-3 py-1.5 text-gray-700 hover:text-[#AA7A00] hover:bg-stone-50 rounded-lg text-sm font-semibold">Standard Compliance</Link>
              <div className="grid grid-cols-2 gap-1 px-3 py-1">
                <Link to="/services" onClick={() => setShowMobileMenu(false)} className="text-xs text-gray-500 hover:text-[#AA7A00]">• Our Services</Link>
                <Link to="/faq" onClick={() => setShowMobileMenu(false)} className="text-xs text-gray-500 hover:text-[#AA7A00]">• FAQ & Trust</Link>
                <Link to="/privacy-policy" onClick={() => setShowMobileMenu(false)} className="text-xs text-gray-500 hover:text-[#AA7A00]">• Privacy Policy</Link>
                <Link to="/terms-of-service" onClick={() => setShowMobileMenu(false)} className="text-xs text-gray-500 hover:text-[#AA7A00]">• Terms of Service</Link>
                <Link to="/disclaimer" onClick={() => setShowMobileMenu(false)} className="text-xs text-gray-500 hover:text-[#AA7A00]">• Disclaimer</Link>
                <Link to="/changelog" onClick={() => setShowMobileMenu(false)} className="text-xs text-gray-500 hover:text-[#AA7A00] mt-1">• Changelog</Link>
              </div>
            </div>

            <div className="flex flex-col gap-2 font-semibold text-sm text-gray-700">
              <Link to="/support-form" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 hover:bg-stone-50 hover:text-[#AA7A00] rounded-lg transition-all flex items-center gap-2">
                <MessageSquare className="w-4.5 h-4.5 text-[#D4AF37]" /> Give Feedback & Ideas
              </Link>

              <Link to="/contact" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 hover:bg-stone-50 hover:text-[#AA7A00] rounded-lg">
                Contact Support Desk
              </Link>

              <Link to="/about" onClick={() => setShowMobileMenu(false)} className="px-3 py-2 hover:bg-stone-50 hover:text-[#AA7A00] rounded-lg">
                About Workspace
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>

    <AnimatePresence>
      {showProfile && (
        <ProfileMenu onClose={() => setShowProfile(false)} />
      )}
    </AnimatePresence>
    </>
  )
}

