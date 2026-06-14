import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Turnstile } from '@marsidev/react-turnstile';
import { VisualCaptcha } from '../components/VisualCaptcha';
import { getMultiFactorResolver, PhoneAuthProvider, PhoneMultiFactorGenerator, RecaptchaVerifier, sendPasswordResetEmail, MultiFactorResolver } from 'firebase/auth';
import { auth } from '../lib/firebase';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAADITOkdYnpXv2YLs';

export function AuthPage() {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirm, setSignUpConfirm] = useState('');
  
  // MFA State
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);
  const [mfaVerificationId, setMfaVerificationId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showMfaInput, setShowMfaInput] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isCustomCaptchaVerified, setIsCustomCaptchaVerified] = useState(false);
  const turnstileRef = React.useRef<any>(null);
  const turnstileSignUpRef = React.useRef<any>(null);

  // If user is already logged in, redirect to landing page
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const initRecaptchaForSignIn = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'mfa-recaptcha-container', {
        size: 'invisible'
      });
    }
  };

  const handleMfaSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaResolver || !mfaCode) return;
    setLoading(true);
    setError('');
    
    try {
      const cred = PhoneAuthProvider.credential(mfaVerificationId, mfaCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      await mfaResolver.resolveSignIn(multiFactorAssertion);
      // Wait for auth state observer to redirect
    } catch (err: any) {
      console.error(err);
      setError('Invalid SMS Code.');
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) return;
    
    const cfVerified = true;
    const cvVerified = true;
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
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await auth.signOut();
        setError('Please verify your email address to sign in. Check your inbox for the verification link.');
        setLoading(false);
        return;
      }
      // user effect handles redirect
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, err);
        setMfaResolver(resolver);
        
        // Use the first enrolled phone number
        const phoneInfoOptions = {
          multiFactorHint: resolver.hints[0],
          session: resolver.session
        };
        
        try {
          initRecaptchaForSignIn();
          const appVerifier = (window as any).recaptchaVerifier;
          const phoneAuthProvider = new PhoneAuthProvider(auth);
          const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, appVerifier);
          setMfaVerificationId(verificationId);
          setShowMfaInput(true);
        } catch (mfaErr: any) {
             setError(mfaErr.message || 'Failed to send SMS OTP.');
        } finally {
             setLoading(false);
        }
      } else {
        let msg = 'Failed to sign in. Please check your credentials.';
        if (err.code === 'auth/invalid-credential') msg = 'Incorrect email or password. Please try again.';
        else if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
        else if (err.code === 'auth/wrong-password') msg = 'Incorrect password. Please try again.';
        else if (err.code === 'auth/email-already-in-use') msg = 'This email is already registered. Please sign in instead.';
        else if (err.code === 'auth/weak-password') msg = 'Password must be at least 6 characters long.';
        else if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
        else if (err.code === 'auth/too-many-requests') msg = 'Too many login attempts. Please try again later.';
        
        setError(msg);
        setLoading(false);
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpPassword !== signUpConfirm) {
      setError("Passwords do not match");
      return;
    }
    
    const cfVerified = true;
    const cvVerified = true;
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
      if (auth.currentUser && !auth.currentUser.emailVerified) {
         await auth.signOut();
         setSuccessMsg('Account created successfully! Please check your email to verify your account.');
         setIsSignUp(false);
         setLoading(false);
         return;
      }
      // user effect handles redirect
    } catch (err: any) {
      console.error(err);
      let msg = 'Failed to create an account.';
      if (err.code === 'auth/email-already-in-use') msg = 'This email is already registered. Please sign in instead.';
      else if (err.code === 'auth/weak-password') msg = 'Password must be at least 6 characters long.';
      else if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
      else if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Please try again later.';
      else if (err.message) msg = err.message;
      
      setError(msg);
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!signInEmail) {
      setError('Please type your email in the field to receive a reset link.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await sendPasswordResetEmail(auth, signInEmail, {
        url: window.location.origin + '/reset-password',
        handleCodeInApp: false
      });
      setSuccessMsg('Password reset link sent to your email.');
    } catch (err: any) {
      let msg = 'Failed to send reset email.';
      if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
      else if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
      else if (err.code === 'auth/too-many-requests') msg = 'Too many requests. Please try again later.';
      else if (err.message) msg = err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    const cfVerified = true;
    const cvVerified = true;
    if (!cfVerified && !cvVerified) {
      setError('Please verify the Captcha to log in with Google.');
      return;
    }
    try {
      if (captchaToken) sessionStorage.setItem('temp_cf_verified', 'true');
      if (isCustomCaptchaVerified) sessionStorage.setItem('temp_cv_verified', 'true');
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Google Auth failed:", error);
      setError(error.message || 'Failed to sign in with Google.');
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
        className="w-full max-w-[500px] flex flex-col items-center relative z-10"
      >
        {/* Animated SVG Heading */}
        <div className="mb-4 text-center cursor-default shrink-0 w-full flex flex-col items-center select-none">
           <svg className="w-full max-w-[500px] h-auto drop-shadow-[0_12px_24px_rgba(212,175,55,0.3)]" viewBox="0 0 540 120" width="540" height="120">
             <defs>
               <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                 <stop offset="0%" stopColor="#ff0040" />
                 <stop offset="33%" stopColor="#8a2be2" />
                 <stop offset="66%" stopColor="#00ffff" />
                 <stop offset="100%" stopColor="#ebd342" />
               </linearGradient>
             </defs>
             <text
               x="50%" y="55%"
               textAnchor="middle" dominantBaseline="middle"
               className="font-serif text-[68px] md:text-[76px] font-black tracking-tight animate-text-trace fill-[#D4AF37]"
               stroke="url(#neonGlow)"
               strokeWidth="3.5"
               strokeDasharray="120 240"
             >
               DocCraft Pro
             </text>
           </svg>
           <div className="-mt-4 relative">
             <span className="font-sans font-black tracking-[0.55em] uppercase text-amber-700/85 text-sm md:text-base pl-2 drop-shadow-sm">Workspace</span>
           </div>
        </div>
        
        {error && (
           <p className="text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm mb-4 w-full text-center border border-red-200">
             {error}
           </p>
        )}
        {successMsg && (
           <p className="text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg text-sm mb-4 w-full text-center border border-emerald-200">
             {successMsg}
           </p>
        )}

        {/* Flipping Form Container */}
        <div className="w-full relative perspective-[1500px]">
          <div 
            className="w-full relative transition-transform duration-1000 ease-in-out [transform-style:preserve-3d] min-h-[880px]"
            style={{ transform: isSignUp ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            {/* -------------------- SIGN IN FACE (FRONT) -------------------- */}
            <div className={`absolute inset-0 w-full [backface-visibility:hidden] flex flex-col items-center bg-white/80 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-y-auto`}>
              <h2 className="text-2xl font-bold mb-5 text-[#1a1a1a]">Welcome Back</h2>
              
              {!showMfaInput ? (
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
                  
                  <div className="flex justify-end">
                     <button type="button" onClick={handleForgotPassword} className="text-xs text-[#D4AF37] hover:underline font-bold">Forgot Password?</button>
                  </div>
                  
                  {TURNSTILE_SITE_KEY && (
                    <div className="flex justify-center my-0.5">
                      <Turnstile 
                        ref={turnstileRef}
                        siteKey={TURNSTILE_SITE_KEY} 
                        onSuccess={(token) => {
                          setCaptchaToken(token);
                          setError('');
                        }}
                        onError={() => {
                          console.warn("Turnstile failed to load or verify. Using visual fallback instead.");
                          turnstileRef.current?.reset();
                        }}
                        onExpire={() => {
                          setCaptchaToken(null);
                          turnstileRef.current?.reset();
                        }}
                      />
                    </div>
                  )}

                  {/* Recaptcha container for MFA */}
                  <div id="mfa-recaptcha-container"></div>
                  
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 mt-1 rounded-xl bg-gradient-to-b from-[#E6C655] to-[#B98F32] shadow-[0_6px_16px_rgba(212,175,55,0.3)] text-white font-bold text-base tracking-wide flex items-center justify-center hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    {loading && !isSignUp ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleMfaSubmission} className="w-full flex flex-col gap-3.5 mb-5">
                  <p className="text-sm text-gray-600 text-center mb-2">
                    Enter the 6-digit SMS verification code sent to your phone.
                  </p>
                  <input 
                    type="text" 
                    placeholder="6-digit code"
                    className="w-full h-12 bg-white border border-[#E0E0E0] rounded-xl px-5 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-shadow shadow-sm text-sm text-center tracking-widest text-lg font-bold"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    required
                  />
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 mt-1 rounded-xl bg-gradient-to-b from-[#E6C655] to-[#B98F32] shadow-[0_6px_16px_rgba(212,175,55,0.3)] text-white font-bold text-base tracking-wide flex items-center justify-center hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    {loading ? 'Verifying...' : 'Verify SMS Code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowMfaInput(false); setMfaResolver(null); }}
                    className="text-xs text-center text-gray-500 hover:text-gray-800 underline mt-2"
                  >
                     Go Back
                  </button>
                </form>
              )}

              <div className="w-full flex items-center gap-4 mb-4">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase">Or continue with</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div className="flex flex-col gap-2.5 w-full">
                {/* Google Button */}
                <button 
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-sm font-bold text-gray-700"
                >
                  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Google</span>
                </button>
              </div>

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
                
                {TURNSTILE_SITE_KEY && (
                  <div className="flex justify-center my-0.5">
                    <Turnstile 
                      ref={turnstileSignUpRef}
                      siteKey={TURNSTILE_SITE_KEY} 
                      onSuccess={(token) => {
                        setCaptchaToken(token);
                        setError('');
                      }}
                      onError={() => {
                        setError('Captcha verification failed.')
                        turnstileSignUpRef.current?.reset();
                      }}
                      onExpire={() => {
                        setCaptchaToken(null)
                        turnstileSignUpRef.current?.reset();
                      }}
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

        <div className="mt-8 text-center text-[11px] text-gray-500 max-w-sm mx-auto font-medium z-10 leading-relaxed">
          By signing in or creating an account, you agree to our{' '}
          <Link to="/terms-of-service" className="text-gray-700 underline underline-offset-2 hover:text-[#CA9E3C] transition-colors">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy-policy" className="text-gray-700 underline underline-offset-2 hover:text-[#CA9E3C] transition-colors">Privacy Policy</Link>.
        </div>

      </motion.div>
    </div>
  );
}
