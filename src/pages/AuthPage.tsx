import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Turnstile } from '@marsidev/react-turnstile';
import { VisualCaptcha } from '../components/VisualCaptcha';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAADITOkdYnpXv2YLs';

export function AuthPage() {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsDemo } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirm, setSignUpConfirm] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isCustomCaptchaVerified, setIsCustomCaptchaVerified] = useState(false);

  // If user is already logged in, redirect to landing page
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) return;
    
    const cfVerified = TURNSTILE_SITE_KEY ? !!captchaToken : true;
    const cvVerified = isCustomCaptchaVerified;
    if (!cfVerified && !cvVerified) {
      setError('Please verify the Captcha to proceed.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (captchaToken) sessionStorage.setItem('temp_cf_verified', 'true');
      if (isCustomCaptchaVerified) sessionStorage.setItem('temp_cv_verified', 'true');
      
      await signInWithEmail(signInEmail, signInPassword);
      // user effect handles redirect
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpPassword !== signUpConfirm) {
      setError("Passwords do not match");
      return;
    }
    
    const cfVerified = TURNSTILE_SITE_KEY ? !!captchaToken : true;
    const cvVerified = isCustomCaptchaVerified;
    if (!cfVerified && !cvVerified) {
      setError('Please verify the Captcha to proceed.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (captchaToken) sessionStorage.setItem('temp_cf_verified', 'true');
      if (isCustomCaptchaVerified) sessionStorage.setItem('temp_cv_verified', 'true');
      
      await signUpWithEmail(signUpEmail, signUpPassword, signUpName);
      // user effect handles redirect
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create an account.');
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    const cfVerified = TURNSTILE_SITE_KEY ? !!captchaToken : true;
    const cvVerified = isCustomCaptchaVerified;
    if (!cfVerified && !cvVerified) {
      setError('Please verify the Captcha to log in with Google.');
      return;
    }
    try {
      if (captchaToken) sessionStorage.setItem('temp_cf_verified', 'true');
      if (isCustomCaptchaVerified) sessionStorage.setItem('temp_cv_verified', 'true');
      await signInWithGoogle();
    } catch (error) {
      console.error("Auth failed:", error);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center font-sans px-4 perspective-[1500px]">
      
      {/* Background with 30% Transparency Image */}
      <div 
        className="absolute inset-0 z-0 bg-[#FDFCF8]"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-multiply"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2069&auto=format&fit=crop')` }}
        />
        {/* Soft radial fade so center is clearer */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCF8] via-[#FDFCF8]/60 to-[#FDFCF8]/90" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[460px] flex flex-col items-center relative z-10"
      >
        {/* Animated SVG Heading */}
        <div className="mb-2 text-center cursor-default shrink-0">
           <svg width="400" height="90" viewBox="0 0 400 90">
             <defs>
               <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                 <stop offset="0%" stopColor="#ff0040" />
                 <stop offset="33%" stopColor="#8a2be2" />
                 <stop offset="66%" stopColor="#00ffff" />
                 <stop offset="100%" stopColor="#ebd342" />
               </linearGradient>
             </defs>
             <text
               x="50%" y="60%"
               textAnchor="middle" dominantBaseline="middle"
               className="font-serif text-[42px] font-bold animate-text-trace fill-[#D4AF37]"
               stroke="url(#neonGlow)"
               strokeWidth="2.5"
               strokeDasharray="90 180"
             >
               DocCraft Pro
             </text>
           </svg>
           <div className="-mt-4 relative">
             <span className="font-sans font-bold tracking-[0.3em] uppercase text-gray-500 drop-shadow-sm">Workspace</span>
           </div>
        </div>
        
        {error && (
           <p className="text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm mb-4 w-full text-center border border-red-200">
             {error}
           </p>
        )}

        {/* Flipping Form Container */}
        <div className="w-full relative perspective-[1500px]">
          <div 
            className="w-full relative transition-transform duration-1000 ease-in-out [transform-style:preserve-3d] min-h-[790px]"
            style={{ transform: isSignUp ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            {/* -------------------- SIGN IN FACE (FRONT) -------------------- */}
            <div className={`absolute inset-0 w-full [backface-visibility:hidden] flex flex-col items-center bg-white/80 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-y-auto`}>
              <h2 className="text-2xl font-bold mb-5 text-[#1a1a1a]">Welcome Back</h2>
              
              <form onSubmit={handleSignIn} className="w-full flex flex-col gap-3.5 mb-5">
                <input 
                  type="email" 
                  placeholder="Email address"
                  className="w-full h-12 bg-white border border-[#E0E0E0] rounded-xl px-5 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-shadow shadow-sm text-sm"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                />
                <input 
                  type="password" 
                  placeholder="Password"
                  className="w-full h-12 bg-white border border-[#E0E0E0] rounded-xl px-5 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-shadow shadow-sm text-sm"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                />
                
                {/* Captcha Verification */}
                <VisualCaptcha onVerify={setIsCustomCaptchaVerified} theme="light" />

                {TURNSTILE_SITE_KEY && (
                  <div className="flex justify-center my-0.5">
                    <Turnstile 
                      siteKey={TURNSTILE_SITE_KEY} 
                      onSuccess={(token) => {
                        setCaptchaToken(token);
                        setError('');
                      }}
                      onError={() => setError('Captcha verification failed.')}
                      onExpire={() => setCaptchaToken(null)}
                    />
                  </div>
                )}
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 mt-1 rounded-xl bg-gradient-to-b from-[#E6C655] to-[#B98F32] shadow-[0_6px_16px_rgba(212,175,55,0.3)] text-white font-bold text-base tracking-wide flex items-center justify-center hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  {loading && !isSignUp ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="w-full flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase">Or continue with</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Demo Account Button with Captcha Check */}
              <button 
                type="button"
                onClick={() => {
                  const cfVerified = !!captchaToken;
                  const cvVerified = isCustomCaptchaVerified;
                  if (!cfVerified && !cvVerified) {
                    setError('Please verify the Captcha to continue as Demo.');
                    return;
                  }
                  if (captchaToken) sessionStorage.setItem('temp_cf_verified', 'true');
                  if (isCustomCaptchaVerified) sessionStorage.setItem('temp_cv_verified', 'true');
                  signInAsDemo();
                }}
                className="w-full h-12 bg-[#1a1a1a] text-white rounded-xl flex items-center justify-center gap-3 shadow-sm hover:bg-slate-800 transition-all duration-300 mb-2.5 text-sm"
              >
                <span className="font-bold">Demo Account (Playground)</span>
              </button>

              {/* Google Button */}
              <button 
                type="button"
                onClick={handleGoogleAuth}
                className="w-full h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-sm font-bold"
              >
                <svg viewBox="0 0 24 24" className="w-4.5 h-4.5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-gray-600">Google</span>
              </button>

              <div className="mt-6">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  Need an account?
                  <button 
                    type="button"
                    onClick={() => { setError(''); setIsSignUp(true); setIsCustomCaptchaVerified(false); setCaptchaToken(null); }}
                    className="text-gray-800 underline underline-offset-4 decoration-2 hover:text-[#CA9E3C] transition-colors"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </div>

            {/* -------------------- SIGN UP FACE (BACK) -------------------- */}
            <div 
              className={`absolute inset-0 w-full [backface-visibility:hidden] flex flex-col items-center bg-[#1a1a1a]/95 backdrop-blur-xl border border-[#333] p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-y-auto`}
              style={{ transform: 'rotateY(180deg)' }}
            >
              <h2 className="text-2xl font-bold mb-5 text-white">Create Account</h2>
              
              <form onSubmit={handleSignUp} className="w-full flex flex-col gap-3 mb-5">
                <input 
                  type="text" 
                  placeholder="Full Name"
                  className="w-full h-11 bg-[#2a2a2a] border border-[#444] rounded-xl px-5 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-shadow shadow-sm text-sm"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  required
                />
                <input 
                  type="email" 
                  placeholder="Email address"
                  className="w-full h-11 bg-[#2a2a2a] border border-[#444] rounded-xl px-5 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-shadow shadow-sm text-sm"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                />
                <input 
                  type="password" 
                  placeholder="Password"
                  className="w-full h-11 bg-[#2a2a2a] border border-[#444] rounded-xl px-5 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-shadow shadow-sm text-sm"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                />
                <input 
                  type="password" 
                  placeholder="Confirm Password"
                  className="w-full h-11 bg-[#2a2a2a] border border-[#444] rounded-xl px-5 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-shadow shadow-sm text-sm"
                  value={signUpConfirm}
                  onChange={(e) => setSignUpConfirm(e.target.value)}
                  required
                />
                
                {/* Captcha Verification */}
                <VisualCaptcha onVerify={setIsCustomCaptchaVerified} theme="dark" />

                {TURNSTILE_SITE_KEY && (
                  <div className="flex justify-center my-0.5">
                    <Turnstile 
                      siteKey={TURNSTILE_SITE_KEY} 
                      onSuccess={(token) => {
                        setCaptchaToken(token);
                        setError('');
                      }}
                      onError={() => setError('Captcha verification failed.')}
                      onExpire={() => setCaptchaToken(null)}
                      options={{ theme: 'dark' }}
                    />
                  </div>
                )}
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 mt-2 rounded-xl bg-gradient-to-b from-[#E6C655] to-[#B98F32] shadow-[0_6px_16px_rgba(212,175,55,0.4)] text-white font-bold text-base tracking-wide flex items-center justify-center hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  {loading && isSignUp ? 'Processing...' : 'Sign Up'}
                </button>
              </form>

              <div className="mt-auto">
                <p className="text-xs font-bold text-[#888] uppercase tracking-widest flex items-center gap-2">
                  Already registered?
                  <button 
                    type="button"
                    onClick={() => { setError(''); setIsSignUp(false); setIsCustomCaptchaVerified(false); setCaptchaToken(null); }}
                    className="text-white underline underline-offset-4 decoration-2 hover:text-[#CA9E3C] transition-colors"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </motion.div>
    </div>
  );
}
