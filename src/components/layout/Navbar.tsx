import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, User } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ProfileMenu } from './ProfileMenu';
import { AnimatePresence } from 'motion/react';

export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-transparent absolute top-0 w-full z-50">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="relative w-10 h-10 flex items-center justify-center transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
           {/* Geometric SVG Hexagon Base */}
           <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-[0_4px_8px_rgba(212,175,55,0.4)]">
             <defs>
                <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" stopColor="#FFF1B8" />
                   <stop offset="50%" stopColor="#D4AF37" />
                   <stop offset="100%" stopColor="#AA7A00" />
                </linearGradient>
                <linearGradient id="gold-grad-inner" x1="100%" y1="100%" x2="0%" y2="0%">
                   <stop offset="0%" stopColor="#FFF1B8" />
                   <stop offset="50%" stopColor="#D4AF37" />
                   <stop offset="100%" stopColor="#AA7A00" />
                </linearGradient>
             </defs>
             <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="url(#gold-grad)" className="opacity-90" />
             <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" fill="#1a1a1a" />
             <path d="M 50,25 L 70,38 L 70,62 L 50,75 L 30,62 L 30,38 Z" fill="url(#gold-grad-inner)" />
             <path d="M 50,15 L 50,85 M 20,32 L 80,68 M 20,68 L 80,32" stroke="#1a1a1a" strokeWidth="2" strokeOpacity="0.5" />
             <circle cx="50" cy="50" r="10" fill="#1a1a1a" />
             <circle cx="50" cy="50" r="3" fill="#D4AF37" />
           </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl leading-none font-serif tracking-tight">DocCraft Pro</span>
          <span className="text-xs font-bold uppercase tracking-widest text-dc-gold mt-1 drop-shadow-sm">Workspace</span>
        </div>
      </Link>
      
      <div className="hidden md:flex items-center gap-8 font-sans font-medium text-sm text-dc-text relative z-50">
        <div className="group relative cursor-pointer py-2">
          <div className="flex items-center gap-1 hover:text-dc-gold transition-colors">
            Features <ChevronDown className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform" />
          </div>
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-[#EAE6DF] shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
            <Link to="/features" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-indigo-600 transition-colors">All Features</Link>
            <Link to="/integrations" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-indigo-600 transition-colors">Integrations</Link>
          </div>
        </div>
        
        <Link to="/tip" className="cursor-pointer font-bold text-dc-gold hover:opacity-70 flex items-center gap-1 py-2">Tip Us!</Link>
        <Link to="/contact" className="cursor-pointer hover:text-dc-gold transition-colors py-2">Contact Support</Link>
        <Link to="/about" className="cursor-pointer hover:text-dc-gold transition-colors py-2">About</Link>
        
        <div className="group relative cursor-pointer py-2">
          <div className="flex items-center gap-1 hover:text-dc-gold transition-colors">
            Resources <ChevronDown className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform" />
          </div>
          <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-[#EAE6DF] shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
            <Link to="/blog" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-indigo-600 transition-colors">Blog</Link>
            <Link to="/changelog" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-indigo-600 transition-colors">Changelog</Link>
            <Link to="/privacy-policy" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 hover:text-indigo-600 transition-colors">Policies & Terms</Link>
          </div>
        </div>
      </div>
      
      <div>
        {user ? (
           <div className="flex items-center gap-4">
             <Button onClick={() => navigate('/dashboard')} variant="outline" className="rounded-full px-6 font-medium bg-[#FAF9F6]/50 backdrop-blur-sm border-[#D0D0D0]">Dashboard</Button>
             
             <div className="relative">
               <button 
                 onClick={() => setShowProfile(!showProfile)}
                 className="w-10 h-10 rounded-full border-2 border-transparent hover:border-dc-gold overflow-hidden bg-white shadow-sm transition-all focus:outline-none"
               >
                 {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || 'user'}&backgroundColor=e5e5e5`} alt="Profile" className="w-full h-full object-cover" />
                 )}
               </button>
               
               <AnimatePresence>
                 {showProfile && (
                   <ProfileMenu onClose={() => setShowProfile(false)} />
                 )}
               </AnimatePresence>
             </div>
           </div>
        ) : (
           <Button onClick={() => navigate('/auth')} variant="outline" className="rounded-full px-6 font-medium bg-[#FAF9F6]/50 backdrop-blur-sm border-[#D0D0D0]">Sign In</Button>
        )}
      </div>
    </nav>
  )
}

