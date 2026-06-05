import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  const errStr = JSON.stringify(errInfo);
  console.error('Firestore Error: ', errStr);
  throw new Error(errStr);
}

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
  signInWithApple: () => Promise<void>;
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
      try {
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
      } catch (err) {
        console.error("Failed to parse local demo state", err);
        localStorage.removeItem('demoLogin');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          // Initialize user document if not exists with try-catch
          try {
            const userRef = doc(db, 'users', currentUser.uid);
            const docSnap = await getDoc(userRef);
            if (!docSnap.exists()) {
              await setDoc(userRef, { credits: 20, subscription: 'Starter', updatedAt: new Date().toISOString() });
            }
          } catch (dbError: any) {
            console.error("Firestore user init failed inside AuthStateChanged:", dbError);
            if (dbError?.code === 'permission-denied' || dbError?.message?.includes('permission')) {
              try {
                handleFirestoreError(dbError, OperationType.GET, 'users');
              } catch (err) {
                console.error("Muffled permission error to guarantee loading completes:", err);
              }
            }
          }
        } else {
          setUserData(null);
        }
      } catch (err) {
        console.error("General error in onAuthStateChanged:", err);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.uid === 'demo-123') return;
    
    // Listen to user data with error handling
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserData;
        if (user.email === 'leonpresistforever@gmail.com' && !data.givenTestCredits) {
          updateDoc(doc(db, 'users', user.uid), { credits: 60, subscription: 'Pro', givenTestCredits: true }).catch((err) => {
            console.error("Failed to update test credits", err);
          });
        }
        setUserData(data);
      }
    }, (error) => {
      console.warn("Firestore subscription failed for users collection:", error);
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
    provider.addScope('https://www.googleapis.com/auth/gmail.send');
    provider.addScope('https://www.googleapis.com/auth/documents');
    provider.addScope('https://www.googleapis.com/auth/presentations');
    provider.addScope('https://www.googleapis.com/auth/forms.body');
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    provider.addScope('https://www.googleapis.com/auth/userinfo.email');
    provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      sessionStorage.setItem('google_access_token', credential.accessToken);
      try {
        const docsMod = await import('../utils/googleDocs');
        docsMod.setDocsToken(credential.accessToken);
        const slidesMod = await import('../utils/googleSlides');
        slidesMod.setSlidesToken(credential.accessToken);
        const formsMod = await import('../utils/googleForms');
        formsMod.setFormsToken(credential.accessToken);
      } catch (err) {
        console.warn('Silent token caching failed on load modules:', err);
      }
    }
  };

  const signInWithApple = async () => {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
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
    <AuthContext.Provider value={{ user, userData, loading, signInWithGoogle, signInWithApple, signInWithEmail, signUpWithEmail, signInAsDemo, logout, updateUserCredits, consumeCredits }}>
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
