import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Settings, User, Shield, CreditCard, Zap, Download, Moon, Sun, Palette, Globe, Key, Database, BarChart3, ChevronRight, Sparkles, Heart } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator, RecaptchaVerifier } from 'firebase/auth';

export function PreferencesPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  
  const [phoneToVerify, setPhoneToVerify] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [isVerifyingState, setIsVerifyingState] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (user) {
      const isMfa = multiFactor(user).enrolledFactors.length > 0;
      setIsEnrolled(isMfa);
    }
  }, [user]);

  const initRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-verifier-container', {
        size: 'invisible'
      });
    }
  };

  const handleSendOTP = async () => {
    if (!user) return;
    setMfaError('');
    try {
      initRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const session = await multiFactor(user).getSession();
      const phoneInfoOptions = {
        phoneNumber: phoneToVerify,
        session
      };
      
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verifyId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, appVerifier);
      
      setVerificationId(verifyId);
      setIsVerifyingState(true);
    } catch (err: any) {
      console.error(err);
      setMfaError(err.message || 'Failed to send OTP.');
    }
  };

  const handleVerifyOTPAndEnroll = async () => {
    if (!user) return;
    setMfaError('');
    try {
      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      await multiFactor(user).enroll(multiFactorAssertion, 'Phone Backup');
      setIsEnrolled(true);
      setIsVerifyingState(false);
      setPhoneToVerify('');
      setVerificationCode('');
    } catch (err: any) {
      console.error(err);
      setMfaError(err.message || 'Invalid code.');
    }
  };

  const handleUnenroll = async () => {
    if (!user) return;
    try {
      const enrolled = multiFactor(user).enrolledFactors;
      if (enrolled.length > 0) {
        await multiFactor(user).unenroll(enrolled[0]);
        setIsEnrolled(false);
      }
    } catch(err: any) {
      console.error(err);
      alert('Failed to unenroll: ' + err.message);
    }
  };
  const [profilePic, setProfilePic] = useState<string | null>(() => {
    return localStorage.getItem('dc-profile-pic') || (user?.photoURL || null);
  });

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setProfilePic(dataUrl);
        localStorage.setItem('dc-profile-pic', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'appearance';
  });
  const [docCount, setDocCount] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchDocCount = async () => {
      try {
        const q = query(collection(db, 'documents'), where('ownerId', '==', user.uid));
        const snapshot = await getDocs(q);
        setDocCount(snapshot.size);
      } catch (e) {
        console.error("Failed to fetch doc count:", e);
        setDocCount(0);
      }
    };
    fetchDocCount();
  }, [user]);

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
    { id: 'account', label: 'Account & Security', icon: <User className="w-4 h-4" /> },
    { id: 'data', label: 'Data & Export', icon: <Database className="w-4 h-4" /> },
  ];

  const handleExportZIP = async () => {
      if (!user) return;
      setIsExporting(true);
      try {
        const q = query(collection(db, 'documents'), where('ownerId', '==', user.uid));
        const snapshot = await getDocs(q);
        const zip = new JSZip();
        
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            let content = data.content || '';
            const fileContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
            const fileName = `${data.title || 'Untitled'}_${docSnap.id}.json`;
            zip.file(fileName, fileContent);
        });

        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'workspace_export.zip');
      } catch (err) {
        console.error(err);
      } finally {
        setIsExporting(false);
      }
  };

  const handleExportJSON = async () => {
      if (!user) return;
      setIsExporting(true);
      try {
        const q = query(collection(db, 'documents'), where('ownerId', '==', user.uid));
        const snapshot = await getDocs(q);
        const allData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        saveAs(blob, 'workspace_snapshot.json');
      } catch (err) {
        console.error(err);
      } finally {
        setIsExporting(false);
      }
  };

  const handleExportPDF = async () => {
      if (!user) return;
      setIsExporting(true);
      try {
        const q = query(collection(db, 'documents'), where('ownerId', '==', user.uid));
        const snapshot = await getDocs(q);
        const doc = new jsPDF();
        let yOffset = 20;

        doc.setFontSize(20);
        doc.text("DocCraft Workspace Export", 20, yOffset);
        yOffset += 15;

        let index = 0;
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const title = data.title || 'Untitled';
            
            if (index > 0) doc.addPage();
            yOffset = 20;
            
            doc.setFontSize(16);
            doc.text(title, 20, yOffset);
            yOffset += 10;
            
            doc.setFontSize(10);
            let contentText = "";
            let parsed = data.content;
            if (typeof parsed === 'string') {
               // Try to strip html simply
               contentText = parsed.replace(/<[^>]*>?/gm, '');
            } else if (parsed && parsed.content) {
               // roughly extract text from PM schema
               contentText = JSON.stringify(parsed);
               // Very crude text representation
            }
            
            const lines = doc.splitTextToSize(contentText.substring(0, 5000) + (contentText.length > 5000 ? '...' : ''), 170);
            doc.text(lines, 20, yOffset);
            
            index++;
        });

        doc.save('workspace_export.pdf');
      } catch (err) {
        console.error(err);
      } finally {
        setIsExporting(false);
      }
  };

  return (
    <div className="flex h-screen bg-dc-bg-page font-sans text-dc-text">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto p-8 md:p-12 lg:p-16">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="text-3xl font-bold font-serif mb-2">Workspace Preferences</h1>
            <p className="text-gray-500">Manage your account, appearance, and AI configuration.</p>
          </header>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Nav Tabs */}
            <nav className="w-full md:w-64 shrink-0 flex flex-col gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id 
                    ? 'bg-white shadow-sm text-dc-gold border border-dc-border' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight className="ml-auto w-4 h-4 opacity-50" />}
                </button>
              ))}
            </nav>

            {/* Content Area */}
            <div className="flex-1 space-y-6">
              
              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-dc-border p-8 shadow-sm space-y-8">
                  <div>
                    <h2 className="text-lg font-bold mb-4">Theme Settings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Light Theme */}
                      <button 
                        onClick={() => setTheme('light')}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all text-left w-full ${
                          theme === 'light' || !theme ? 'border-dc-gold bg-yellow-50/50 scale-[1.02]' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full aspect-video bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
                          <Sun className="w-8 h-8 text-dc-gold" />
                        </div>
                        <span className="text-sm font-bold text-gray-800">Light Mode</span>
                      </button>

                      {/* Dark Theme */}
                      <button 
                        onClick={() => setTheme('dark')}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all text-left w-full ${
                          theme === 'dark' ? 'border-dc-gold bg-slate-900/30 scale-[1.02]' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full aspect-video bg-gray-950 rounded-lg border border-gray-800 shadow-sm flex items-center justify-center">
                          <Moon className="w-8 h-8 text-indigo-400" />
                        </div>
                        <span className="text-sm font-bold text-gray-800">Dark Mode</span>
                      </button>

                      {/* Soothing Theme */}
                      <button 
                        onClick={() => setTheme('soothing')}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all text-left w-full ${
                          theme === 'soothing' ? 'border-dc-gold bg-amber-50/20 scale-[1.02]' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full aspect-video bg-[#FAF6ED] rounded-lg border border-[#E6DFD3] shadow-sm flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-amber-600" />
                        </div>
                        <span className="text-sm font-bold text-gray-800">Eye Soothing Mode</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold mb-4">Accent Color</h2>
                    <div className="flex flex-wrap gap-4">
                      {['#D4AF37', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#1A1A1A'].map(color => (
                        <button 
                          key={color}
                          onClick={() => setAccentColor(color)}
                          className={`w-10 h-10 rounded-full border-2 border-white shadow-sm ring-2 transition-all cursor-pointer ${
                            accentColor === color ? 'ring-active ring-[var(--dc-gold)] scale-110' : 'ring-transparent hover:ring-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-dc-border p-8 shadow-sm space-y-8">
                  <div>
                    <h2 className="text-lg font-bold mb-4">Account Details</h2>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative group w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                        {profilePic ? (
                          <img src={profilePic} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="w-8 h-8" />
                        )}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold cursor-pointer transition-opacity">
                          Upload
                          <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                        </label>
                      </div>
                      <div>
                        <p className="font-bold">{user?.email}</p>
                        <p className="text-sm text-gray-500">Free Tier Account</p>
                      </div>
                    </div>

                    {/* Account Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Account Created</span>
                        <p className="text-base font-bold text-gray-800 mt-2">
                          {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'June 10, 2026'}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Last Sign In</span>
                        <p className="text-base font-bold text-gray-800 mt-2">
                          {user?.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just Now'}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">PDFs Created</span>
                        <p className="text-2xl font-black text-purple-600 mt-2">
                          {docCount !== null ? docCount : '...'}
                        </p>
                      </div>
                    </div>

                    {/* Account Deletion Alert Banner */}
                    {localStorage.getItem('dc-deletion-scheduled') === 'true' && (
                      <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 flex flex-col gap-1.5 text-xs mb-8">
                        <p className="font-bold flex items-center gap-1.5">
                          <Shield className="w-4 h-4 text-red-600 animate-pulse" />
                          ⚠️ SECURITY PURGE ACTIVE: Deletion Scheduled
                        </p>
                        <p>Under our strict user privacy protocol, your account and 100% of your cloud database documents are queued for irreversible wipeout. Total purge will execute securely in exactly <strong>30 days</strong>. If you would like to undo this deletion, please click the "Cancel Deletion Request" button below or contact support.</p>
                      </div>
                    )}
                  </div>

                  {/* 2 Factor Auth Settings */}
                  <div className="pt-6 border-t border-gray-100">
                    <h2 className="text-lg font-bold mb-2">Two-Factor Security (2FA)</h2>
                    <p className="text-sm text-gray-500 mb-6">Enhance your account security with SMS OTP verification.</p>
                    
                    <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl">
                      {!user?.email ? (
                        <p className="text-sm text-amber-700">Please sign in to configure 2FA.</p>
                      ) : isEnrolled ? (
                         <div className="space-y-4">
                           <div className="flex items-center gap-2">
                             <Shield className="w-5 h-5 text-emerald-600" />
                             <span className="font-bold text-gray-800">Phone Authentication Active</span>
                           </div>
                           <p className="text-xs text-gray-600 leading-relaxed max-w-sm">
                             Your account is currently protected by Two-Factor Authentication via SMS.
                           </p>
                           <Button onClick={handleUnenroll} variant="outline" className="text-sm border-red-200 text-red-600 hover:bg-red-50">
                              Disable 2FA
                           </Button>
                         </div>
                      ) : (
                         <div className="space-y-4">
                           <div className="flex items-center gap-2">
                             <Shield className="w-5 h-5 text-amber-600" />
                             <span className="font-bold text-gray-800">Phone Authentication Setup</span>
                           </div>
                           <p className="text-xs text-gray-600 leading-relaxed max-w-sm">
                             Enter your phone number below to receive an enrollment code. This enrolls your number for future logins.
                           </p>

                           {/* Recaptcha Container */}
                           <div id="recaptcha-verifier-container" className="my-2"></div>

                           {mfaError && <p className="text-xs font-bold text-red-500 my-2">{mfaError}</p>}

                           {!isVerifyingState ? (
                             <div className="flex flex-col gap-3 max-w-sm">
                               <input 
                                 type="tel" 
                                 placeholder="+1 234 567 8900" 
                                 value={phoneToVerify} 
                                 onChange={(e) => setPhoneToVerify(e.target.value)}
                                 className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-amber-500"
                               />
                               <Button 
                                 onClick={handleSendOTP} 
                                 variant="outline" 
                                 disabled={!phoneToVerify}
                                 className="text-sm border-amber-300 text-amber-700 hover:bg-amber-100"
                               >
                                  Send SMS OTP
                               </Button>
                             </div>
                           ) : (
                             <div className="flex flex-col gap-3 max-w-sm">
                               <input 
                                 type="text" 
                                 placeholder="Enter 6-digit code" 
                                 value={verificationCode} 
                                 onChange={(e) => setVerificationCode(e.target.value)}
                                 className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-amber-500"
                               />
                               <div className="flex gap-2">
                                 <Button 
                                   onClick={handleVerifyOTPAndEnroll} 
                                   className="text-sm bg-amber-600 hover:bg-amber-700 text-white flex-1"
                                 >
                                    Verify & Enroll
                                 </Button>
                                 <Button 
                                   onClick={() => setIsVerifyingState(false)} 
                                   variant="ghost" 
                                   className="text-sm"
                                 >
                                    Cancel
                                 </Button>
                               </div>
                             </div>
                           )}
                         </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <h2 className="text-lg font-bold mb-2 text-red-600">Danger Zone</h2>
                    <p className="text-sm text-gray-500 mb-6">Irreversible and destructive actions.</p>
                    
                    <div className="space-y-4">
                      {/* Delete session logs */}
                      <button 
                        className="flex items-center gap-3 w-full p-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-left"
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete all permanent sessions and local data? This will clear cookies, logs, and completely log you out.')) {
                            try {
                              localStorage.clear();
                              sessionStorage.clear();
                              // Clear active cookies
                              document.cookie.split(";").forEach((c) => {
                                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                              });
                              await logout();
                              window.location.href = '/';
                            } catch (err) {
                              console.error("Failed to delete permanent session:", err);
                              window.location.reload();
                            }
                          }
                        }}
                      >
                        <Shield className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-sm">Delete Permanent Session</p>
                          <p className="text-xs text-red-500 opacity-80">Irreversibly logs you out, clearing all cookies, tokens, logs, and session history on this device.</p>
                        </div>
                      </button>

                      {/* Delete account */}
                      {localStorage.getItem('dc-deletion-scheduled') === 'true' ? (
                        <button 
                          className="flex items-center gap-3 w-full p-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                          onClick={async () => {
                            if (window.confirm('Cancel account deletion request? This will keep your documents active.')) {
                              localStorage.removeItem('dc-deletion-scheduled');
                              if (user) {
                                await setDoc(doc(db, 'users', user.uid), {
                                  deletionScheduledAt: null,
                                  deletionDaysRemaining: null
                                }, { merge: true });
                              }
                              alert('Your account secure deletion request has been canceled.');
                              window.location.reload();
                            }
                          }}
                        >
                          <User className="w-5 h-5 flex-shrink-0 text-gray-500" />
                          <div>
                            <p className="font-bold text-sm">Cancel Deletion Request</p>
                            <p className="text-xs text-gray-500">Keep your documents active and abort the scheduled account purge.</p>
                          </div>
                        </button>
                      ) : (
                        <button 
                          className="flex items-center gap-3 w-full p-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-left"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to schedule deletion? Your account and 100% of your cloud files will be securely and permanently purged after a 30-day hold.')) {
                              try {
                                localStorage.setItem('dc-deletion-scheduled', 'true');
                                if (user) {
                                  await setDoc(doc(db, 'users', user.uid), {
                                    deletionScheduledAt: new Date().toISOString(),
                                    deletionDaysRemaining: 30,
                                    email: user.email || ''
                                  }, { merge: true });
                                }
                                alert('Your account deletion sequence has been scheduled. Your data will be securely purged in 30 days under our privacy terms.');
                                window.location.reload();
                              } catch (err: any) {
                                console.error("Deletion schedule failed:", err);
                                alert("Failed to schedule account deletion: " + err.message);
                              }
                            }
                          }}
                        >
                          <User className="w-5 h-5 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-sm">Delete Account</p>
                            <p className="text-xs text-red-500 opacity-80">Queues your account and all owned documents for a complete database purge in exactly 30 days.</p>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Data Tab */}
              {activeTab === 'data' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-dc-border p-8 shadow-sm space-y-8">
                  <div>
                    <h2 className="text-lg font-bold mb-2">Bulk Export & Backup</h2>
                    <p className="text-sm text-gray-500 mb-6">Archive your entire workspace or individual collections.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button onClick={handleExportZIP} disabled={isExporting} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-dc-gold hover:bg-yellow-50 transition-all text-left disabled:opacity-50">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                           <Download className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Workspace ZIP</p>
                          <p className="text-[10px] text-gray-500">All docs as Markdown/JSON</p>
                        </div>
                      </button>
                      <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-dc-gold hover:bg-yellow-50 transition-all text-left disabled:opacity-50">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                           <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Consolidated PDF</p>
                          <p className="text-[10px] text-gray-500">Merge all into one book</p>
                        </div>
                      </button>
                      <button onClick={handleExportJSON} disabled={isExporting} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-dc-gold hover:bg-yellow-50 transition-all text-left disabled:opacity-50">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                           <Database className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">JSON Snapshot</p>
                          <p className="text-[10px] text-gray-500">Portability for other apps</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FileText({ className }: { className?: string }) {
  return (
     <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  );
}
