import React, { useState, useEffect } from 'react';
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

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAADITOkdYnpXv2YLs';

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
    return <>{children}</>;
  }

  return <>{children}</>;
}
