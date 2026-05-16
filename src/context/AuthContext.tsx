import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface UserData {
  credits: number;
  subscription?: string;
  updatedAt?: string;
  givenTestCredits?: boolean;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInAsDemo: () => void;
  logout: () => Promise<void>;
  updateUserCredits: (newCredits: number, subscription?: string) => Promise<void>;
  consumeCredits: (amount: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | any | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedDemo = localStorage.getItem('demoLogin');
    if (savedDemo) {
      setUser(JSON.parse(savedDemo));
      setLoading(false);
      
      // Load demo data from localStorage
      const demoData = localStorage.getItem('demoUserData');
      if (demoData) {
        setUserData(JSON.parse(demoData));
      } else {
        setUserData({ credits: 20, subscription: 'Starter' });
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Initialize user document if not exists
        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
          await setDoc(userRef, { credits: 20, subscription: 'Starter', updatedAt: new Date().toISOString() });
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.uid === 'demo-123') return;
    
    // Listen to user data
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserData;
        if (user.email === 'leonpresistforever@gmail.com' && !data.givenTestCredits) {
          updateDoc(doc(db, 'users', user.uid), { credits: 60, subscription: 'Pro', givenTestCredits: true });
        }
        setUserData(data);
      }
    });
    return unsubscribe;
  }, [user]);

  const updateUserCredits = async (addedCredits: number, subscriptionPlan?: string) => {
    if (user?.uid === 'demo-123') {
      const newData = { 
        credits: (userData?.credits || 0) + addedCredits, 
        subscription: subscriptionPlan || userData?.subscription 
      };
      setUserData(newData);
      localStorage.setItem('demoUserData', JSON.stringify(newData));
      return;
    }
    
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const currentCredits = userData?.credits || 0;
      await updateDoc(userRef, { 
        credits: currentCredits + addedCredits,
        ...(subscriptionPlan && { subscription: subscriptionPlan }),
        updatedAt: new Date().toISOString()
      });
    }
  };
  
  const consumeCredits = async (amount: number): Promise<boolean> => {
    if (!userData || userData.credits < amount) return false;
    
    if (user?.uid === 'demo-123') {
       const newData = { ...userData, credits: userData.credits - amount };
       setUserData(newData);
       localStorage.setItem('demoUserData', JSON.stringify(newData));
       return true;
    }
    
    if (user) {
       const userRef = doc(db, 'users', user.uid);
       await updateDoc(userRef, { credits: userData.credits - amount, updatedAt: new Date().toISOString() });
       return true;
    }
    return false;
  };

  const signInAsDemo = () => {
    const demoUser = { uid: 'demo-123', email: 'demo@example.com', displayName: 'Demo Account', photoURL: null };
    localStorage.setItem('demoLogin', JSON.stringify(demoUser));
    setUser(demoUser);
  };

  const signInWithGoogle = async () => {

    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name });
      // Force user state refresh to let other components know of the displayName update immediately
      setUser({ ...cred.user, displayName: name } as User);
    }
  };

  const logout = async () => {
    localStorage.removeItem('demoLogin');
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsDemo, logout, updateUserCredits, consumeCredits }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export auth wrapper if something historically expects it here
export { auth };
