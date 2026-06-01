import React, { useState, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { VisualCaptcha } from './VisualCaptcha';
import { Shield, CheckCircle2, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface InternalSecurityGateProps {
  children: React.ReactNode;
}

export function InternalSecurityGate({ children }: InternalSecurityGateProps) {
  const { user } = useAuth();
  
  // Track verification states
  const [captcha1Verified, setCaptcha1Verified] = useState(false); // Automated Captcha
  const [captcha2Verified, setCaptcha2Verified] = useState(false); // Code Captcha
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [needsInitialCheck, setNeedsInitialCheck] = useState(true);

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

  // Synchronize and promote session variables
  useEffect(() => {
    if (!user) return;
    
    // Retrieve credentials
    let c1 = sessionStorage.getItem(`cf_verified_${user.uid}`) === 'true';
    let c2 = sessionStorage.getItem(`cv_verified_${user.uid}`) === 'true';
    
    // Promote temporary credentials verified during Auth (login) state
    const tempC1 = sessionStorage.getItem('temp_cf_verified') === 'true';
    const tempC2 = sessionStorage.getItem('temp_cv_verified') === 'true';
    
    if (tempC1) {
      sessionStorage.setItem(`cf_verified_${user.uid}`, 'true');
      c1 = true;
    }
    if (tempC2) {
      sessionStorage.setItem(`cv_verified_${user.uid}`, 'true');
      c2 = true;
    }

    // Auto-verify automated captcha if site key is empty or not in production
    if (!siteKey) {
      sessionStorage.setItem(`cf_verified_${user.uid}`, 'true');
      c1 = true;
    }
    
    setCaptcha1Verified(c1);
    setCaptcha2Verified(c2);
    setNeedsInitialCheck(false);
  }, [user, siteKey]);

  // Handle successful Automated Captcha response
  const handleCaptcha1Success = (token: string | null) => {
    if (token && user) {
      sessionStorage.setItem(`cf_verified_${user.uid}`, 'true');
      setCaptcha1Verified(true);
    }
  };

  // Handle successful Code Captcha verification
  const handleCaptcha2Success = (verified: boolean) => {
    if (verified && user) {
      sessionStorage.setItem(`cv_verified_${user.uid}`, 'true');
      setCaptcha2Verified(true);
    }
  };

  if (needsInitialCheck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-slate-500 font-sans">
        Validating session state...
      </div>
    );
  }

  // Check if both captchas are verified
  const isFullyVerified = captcha1Verified && captcha2Verified;

  return (
    <>
      {/* 1. Main children are ALWAYS rendered of the application — No blocking overlay at all */}
      {children}

      {/* 2. Passive, non-blocking Captcha Verification Widget in bottom right corner */}
      {!isFullyVerified && (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full bg-white/95 border border-slate-200 shadow-2xl rounded-2xl p-4 font-sans backdrop-blur-md transition-all duration-300">
          
          {/* Collapsible header */}
          <div 
            className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-slate-100"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <div className="flex items-center gap-2">
              <Shield className={`w-4 h-4 ${isCollapsed ? 'text-amber-500' : 'text-indigo-600'}`} />
              <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                Captcha Verification
              </span>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {!isCollapsed ? (
            <div className="mt-3 space-y-3">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                To guarantee full session security, please complete the remaining validation.
              </p>

              {/* Status List */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${captcha1Verified ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <div>
                    <div className="font-bold text-slate-700 leading-none">Captcha 1</div>
                    <div className={`text-[9px] font-semibold ${captcha1Verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {captcha1Verified ? 'Verified' : 'Automated'}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center gap-1.5">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${captcha2Verified ? 'text-emerald-500' : 'text-slate-300'}`} />
                  <div>
                    <div className="font-bold text-slate-700 leading-none">Captcha 2</div>
                    <div className={`text-[9px] font-semibold ${captcha2Verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {captcha2Verified ? 'Verified' : 'Required'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Challenge Areas */}
              <div className="space-y-3 pt-1">
                {/* Automated Captcha Container - only rendered if initialized & key present */}
                {!captcha1Verified && siteKey && (
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex flex-col items-center gap-1 text-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Automated Captcha</span>
                    <Turnstile
                      siteKey={siteKey}
                      onSuccess={handleCaptcha1Success}
                      onError={() => console.error('Automated verification check background failure.')}
                    />
                  </div>
                )}

                {/* Code Captcha Container */}
                {!captcha2Verified && (
                  <div className="pt-1">
                    <VisualCaptcha
                      onVerify={handleCaptcha2Success}
                      theme="light"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
              <span>Complete pending verification requirements</span>
              <span className="font-mono bg-amber-50 text-amber-600 font-semibold px-2 py-0.5 rounded-full">
                Pending
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
