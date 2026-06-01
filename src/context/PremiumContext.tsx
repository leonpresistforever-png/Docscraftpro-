import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface PremiumContextProps {
  isPremium: boolean;
  sheetsUsage: number;
  modelsUsage: number;
  handleAction: (actionType: 'sheets' | 'models', callback: () => void) => void;
  showAdModal: boolean;
  setShowAdModal: (show: boolean) => void;
  adActionCallback: (() => void) | null;
  adWatchTimer: number;
  actionBlockedReason: string | null;
  setActionBlockedReason: (msg: string | null) => void;
  checkoutPremium: () => void;
  simulatePurchase: () => void; // Mock to remove ads
}

const PremiumContext = createContext<PremiumContextProps | undefined>(undefined);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [isPremium, setIsPremium] = useState(false);
  const [sheetsUsage, setSheetsUsage] = useState(0);
  const [modelsUsage, setModelsUsage] = useState(0);
  
  // Ad Modal state
  const [showAdModal, setShowAdModal] = useState(false);
  const [adActionCallback, setAdActionCallback] = useState<(() => void) | null>(null);
  const [adWatchTimer, setAdWatchTimer] = useState(5);
  const [actionBlockedReason, setActionBlockedReason] = useState<string | null>(null);
  
  // Check local/Firebase limits on mount
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Fallback to local storage if not logged in
      loadLocalData();
    }
  }, [user]);

  const loadLocalData = () => {
    const data = JSON.parse(localStorage.getItem('premiumSettings') || '{}');
    const today = new Date().toDateString();
    if (data.date !== today) {
      // reset
      setSheetsUsage(0);
      setModelsUsage(0);
      setIsPremium(data.isPremium || false);
    } else {
      setSheetsUsage(data.sheetsUsage || 0);
      setModelsUsage(data.modelsUsage || 0);
      setIsPremium(data.isPremium || false);
    }
  };

  const loadUserData = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setIsPremium(data.isPremium || user.email === 'leonpresistforever@gmail.com');
        const today = new Date().toDateString();
        if (data.usageDate !== today) {
          setSheetsUsage(0);
          setModelsUsage(0);
          await setDoc(userRef, { usageDate: today, sheetsUsage: 0, modelsUsage: 0 }, { merge: true });
        } else {
          setSheetsUsage(data.sheetsUsage || 0);
          setModelsUsage(data.modelsUsage || 0);
        }
      }
    } catch (err) {
      console.warn("Could not load user data from firestore, using local fallback");
      loadLocalData();
    }
  };

  const saveUsage = async (type: 'sheets' | 'models') => {
    const newSheets = type === 'sheets' ? sheetsUsage + 1 : sheetsUsage;
    const newModels = type === 'models' ? modelsUsage + 1 : modelsUsage;
    
    setSheetsUsage(newSheets);
    setModelsUsage(newModels);
    
    const today = new Date().toDateString();
    
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          sheetsUsage: newSheets,
          modelsUsage: newModels,
          usageDate: today
        }, { merge: true });
      } catch(e) {}
    } else {
      localStorage.setItem('premiumSettings', JSON.stringify({
        date: today,
        sheetsUsage: newSheets,
        modelsUsage: newModels,
        isPremium
      }));
    }
  };

  // Timer logic for Ad
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showAdModal && adWatchTimer > 0) {
      interval = setInterval(() => {
        setAdWatchTimer(p => p - 1);
      }, 1000);
    } else if (showAdModal && adWatchTimer === 0) {
      // Ad finished
      if (adActionCallback) {
        setTimeout(() => {
          adActionCallback();
          setAdActionCallback(null);
          setShowAdModal(false);
          setAdWatchTimer(5);
        }, 500);
      }
    }
    return () => clearInterval(interval);
  }, [showAdModal, adWatchTimer, adActionCallback]);

  const handleAction = (actionType: 'sheets' | 'models', callback: () => void) => {
    if (actionType === 'sheets') {
      saveUsage('sheets');
      callback();
    }

    if (actionType === 'models') {
       saveUsage('models');
       callback();
    }
  };

  const checkoutPremium = () => {
     // No longer applicable
  };

  const simulatePurchase = async () => {
    // No longer applicable
  };

  const computedIsPremium = true;

  return (
    <PremiumContext.Provider value={{
      isPremium: computedIsPremium, sheetsUsage, modelsUsage, handleAction, showAdModal, setShowAdModal, adActionCallback, adWatchTimer, actionBlockedReason, setActionBlockedReason, checkoutPremium, simulatePurchase
    }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return context;
}
