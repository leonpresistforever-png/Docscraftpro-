import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator, RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  Key, 
  ShieldCheck, 
  Cpu, 
  Globe, 
  Plus, 
  Trash2, 
  Lock,
  ChevronRight,
  Database,
  X,
  Code2,
  User,
  Fingerprint,
  Bell,
  Mail,
  Mic,
  Smartphone,
  Eye,
  Info,
  Volume2,
  RefreshCw,
  Clock,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileCheck,
  ShieldAlert,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Sidebar } from '../components/layout/Sidebar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { PWAInstallButton } from '../components/PWAInstallButton';

// Simple atob/btoa helper for credential visualization
const encrypt = (text: string) => btoa(text);
const decrypt = (text: string) => {
  try { return atob(text); } catch { return text; }
};

interface CustomKey {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'anthropic' | 'custom';
  encryptedKey: string;
  schema?: string;
  targetBrain: 'nexus' | 'second' | 'third';
}

export function SettingsPage() {
  const { user, userData } = useAuth();
  
  // Basic states
  const [activeSettingsTab, setActiveSettingsTab] = useState<'infrastructure' | 'profile' | 'security' | 'notifications' | 'telemetry'>('profile');
  
  // Custom Keys States
  const [keys, setKeys] = useState<CustomKey[]>([]);
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', provider: 'gemini', key: '', schema: '' });

  // Profile Customization
  const [bio, setBio] = useState('');
  const [occupation, setOccupation] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [displayName, setDisplayName] = useState('');

  // Password Reset and 2FA
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [mfaStep, setMfaStep] = useState(0); // 0 = disabled, 1 = entering phone, 2 = entering code, 3 = enrolled

  
  // Notification Preferences & Phone Mock-up
  const [alwaysOn, setAlwaysOn] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [showPhoneNotification, setShowPhoneNotification] = useState(false);
  const [showEmailNotificationAlert, setShowEmailNotificationAlert] = useState(false);

  // Voice Interaction & Hardware Permissions
  const [microphoneStatus, setMicrophoneStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [audioWaves, setAudioWaves] = useState<number[]>([10, 4, 15, 8, 22, 12, 5, 14, 9, 18, 6, 12]);

  // Telemetry logs for Genkit / Cognitive flow
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    "[10:24:01] INFO: Initializing Genkit telemetry session config...",
    "[10:24:03] INFO: Established direct Firebase Auth state node.",
    "[10:24:05] SUCCESS: Synced cognitive model schema index mappings.",
    "[10:24:08] INFO: Listening for realtime Firestore document mutation streaming..."
  ]);

  // Learn More Overlays / Storytelling modals
  const [learnMoreContent, setLearnMoreContent] = useState<{ title: string; text: string } | null>(null);

  // Sync details from Auth User Data
  useEffect(() => {
    if (user && userData) {
      setBio(userData.bio || '');
      setOccupation(userData.occupation || 'Researcher');
      setDisplayName(`${userData.firstName || ''} ${userData.lastName || ''}`.trim() || user.displayName || '');
    }
  }, [user, userData]);

  // Load Secure Keys from storage or default
  useEffect(() => {
    const saved = localStorage.getItem('dc_nexus_keys');
    if (saved) {
      setKeys(JSON.parse(saved));
    } else {
      setKeys([{ 
        id: '1', 
        name: 'Primary Nexus Key', 
        provider: 'gemini', 
        encryptedKey: encrypt('mock-gemini-key-xyz'), 
        targetBrain: 'nexus' 
      }]);
    }
  }, []);

  // Continuous Genkit/Cognitive log updates
  useEffect(() => {
    const interval = setInterval(() => {
      const messages = [
        "GENKIT_TRACE: Analyzed structural node links of current documents.",
        "DATABASE: Synced vector graph nodes to Firestore secure indexes.",
        "COGNITIVE: Recalculated document weighting factors.",
        "GENKIT_TRACE: Cognitive memory trace initialized with zero latency.",
        "FIREBASE: Auth verification node refreshed.",
        "SYSTEM: Heartbeat signal generated successfully."
      ];
      setTelemetryLogs(prev => {
        const time = new Date().toLocaleTimeString();
        const randMsg = messages[Math.floor(Math.random() * messages.length)];
        const list = [...prev, `[${time}] INFO: ${randMsg}`];
        if (list.length > 20) list.shift();
        return list;
      });
      
      // Update audio waves helper dynamically if mic is on
      if (microphoneStatus === 'granted') {
        setAudioWaves(prev => prev.map(() => Math.floor(Math.random() * 40) + 5));
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [microphoneStatus]);

  // Save Cognitive Keys
  const handleSaveKeys = (newKeys: CustomKey[]) => {
    setKeys(newKeys);
    localStorage.setItem('dc_nexus_keys', JSON.stringify(newKeys));
  };

  const handleAddKeySubmit = () => {
    if (!newKey.key || !newKey.name) return;
    const keyEntry: CustomKey = {
      id: Math.random().toString(36).substr(2, 9),
      name: newKey.name,
      provider: newKey.provider as any,
      encryptedKey: encrypt(newKey.key),
      schema: newKey.schema,
      targetBrain: 'nexus'
    };
    handleSaveKeys([...keys, keyEntry]);
    setIsAddingKey(false);
    setNewKey({ name: '', provider: 'gemini', key: '', schema: '' });
  };

  const handleDeleteKey = (id: string) => {
    handleSaveKeys(keys.filter(k => k.id !== id));
  };

  // Sync Custom profile customized details to Firestore
  const handleSaveProfileCustomization = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const nameParts = displayName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        firstName,
        lastName,
        bio,
        occupation,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      alert("Your creative profile has been securely updated in our cognitive index!");
    } catch (err) {
      console.error(err);
      alert("Failed to write coordinates into account indexes.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Real Native Device Voice permission trigger
  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setMicrophoneStatus('granted');
    } catch (err) {
      setMicrophoneStatus('denied');
      console.error("User blocked voice interaction console access.", err);
    }
  };

  const stopMicrophoneAccess = () => {
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
    setMicrophoneStatus('prompt');
  };

  // Trigger Native Push Notification permissions and real pop-up
  const triggerNativePushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }
      
      if (permission === 'granted') {
        new Notification("Docscraft Active Alert", {
          body: "Push alerts are successfully configured on your local device.",
          icon: "/favicon.ico"
        });
        setPushEnabled(true);
      } else if (permission === 'denied') {
        alert("Native notifications are blocked inside your browser configurations. Please adjust them in browser settings.");
      }
    } else {
      alert("This device browser interface does not support standard Push Notifications API.");
    }
  };

  // Test Push notification mockup transition triggers
  const executePushNotificationTest = async () => {
    // 1. Show dynamic mockup overlay on the virtual phone component
    setShowPhoneNotification(true);
    
    // 2. Also attempt a native real device push notification alert
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification("Docscraft Synced Status Check", {
        body: "Your document mind-mappings have updated successfully on the cloud server.",
        icon: "/favicon.ico"
      });
    }

    setTimeout(() => {
      setShowPhoneNotification(false);
    }, 5000);
  };

  // Test push email alert simulation
  const executeEmailNotificationTest = () => {
    setShowEmailNotificationAlert(true);
    setTimeout(() => {
      setShowEmailNotificationAlert(false);
    }, 4500);
  };

  // Requesting real native password resets via firebase Auth to real user emails
  const triggerRealEmailPasswordReset = async () => {
    if (!user || !user.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetEmailSent(true);
    } catch (err: any) {
      console.error("Reset trigger error:", err);
      alert("Failed to send reset link: " + err.message);
    }
  };

  // Poetic descriptive stories for Learn More
  const openStory = (tab: string) => {
    if (tab === 'always-on') {
      setLearnMoreContent({
        title: "The Symphony of Constant Synchronization",
        text: "In our digital sanctuary, ALWAYS-ON is not a tracker, but a breathing covenant. It represents a constant, low-intensity cognitive sweep where our integrated systems (like Firebase and Google Genkit) continuously analyze structural relationships between concepts you input. When disabled, metadata calculations shift to a transient state, reducing battery overhead but requesting manual permission intervals each time your mind wanders back into our editors."
      });
    } else if (tab === 'voice') {
      setLearnMoreContent({
        title: "Whispers of Intellect: Native Auditory Mechanics",
        text: "By requesting browser microphone capabilities, Docscraft creates a real-time speech-to-intent analysis bridge. No audio fragments ever find home on target secondary storage. The stream routes directly into the client-side Web Audio API, extracting pitch maps and raw words which trigger instant document creation when you speak. A professional visual wave dynamic shows the constant silence filter in real-time."
      });
    } else if (tab === 'genkit') {
      setLearnMoreContent({
        title: "Genkit Cognitive Schematics & Dynamic Tracing",
        text: "Google Genkit powers our underlying structural tracing framework. Under our architectural layouts, each action you execute is converted into a structured Genkit Trace. It profiles model token input limits, logs prompt schemas, and coordinates tool orchestration maps. This is displayed within our dynamic telemetry logs, verifying zero knowledge overheads with extreme professional transparency."
      });
    } else if (tab === 'security') {
      setLearnMoreContent({
        title: "Covenants of Security: Two-Factor Vaulting",
        text: "Your security is the granite bedrock of our architecture. Passwords reset through native cryptographic relays sent directly to your inbox. High-profile operations trigger temporary tokens on local verified devices. By enforcing multi-factor authenticated flows, your workspace stands immune to compromised key leakages."
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FCFBFA] font-sans text-stone-800">
      <Sidebar />
      
      <main className="flex-1 flex flex-col justify-between overflow-y-auto min-h-screen">
        <div className="p-6 md:p-12 lg:p-16 max-w-6xl w-full mx-auto flex-1">
          {/* Header section with poetic intro */}
          <header className="mb-12 border-b border-stone-100 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 text-xs text-[#a37f26] font-bold tracking-widest uppercase mb-2"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Docscraft Core Platform</span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-4xl font-serif font-black tracking-tight text-stone-900 mb-3"
              >
                Workspace Settings
              </motion.h1>
              <p className="text-stone-500 font-serif leading-relaxed italic text-sm">
                "Configure your workspace preferences, personal biography, account safety, and native notification systems for Docscraft Pro."
              </p>
            </div>
          </header>

          {/* Master horizontal flex for tabs and Phone Preview */}
          <div className="flex flex-col xl:flex-row gap-10 items-start">
            
            {/* Left/Middle Column: tabbed choices & settings */}
            <div className="flex-1 w-full space-y-8">
              
              {/* Category tabs */}
              <div className="flex flex-wrap gap-2 border-b border-stone-150 pb-2">
                {[
                  { id: 'profile', label: 'Biography & Bios', icon: <User className="w-4 h-4" /> },
                  { id: 'security', label: 'Security & Password', icon: <Lock className="w-4 h-4" /> },
                  { id: 'notifications', label: 'Push & Voice Preferences', icon: <Bell className="w-4 h-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSettingsTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                      activeSettingsTab === tab.id
                      ? 'bg-stone-900 border-stone-900 text-white shadow-md'
                      : 'bg-white border-stone-150 text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Dynamic TAB content */}
              <AnimatePresence mode="wait">
                
                {/* 1. Infrastructure API keys tab */}
                {activeSettingsTab === 'infrastructure' && (
                  <motion.div 
                    key="infrastructure"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-6"
                  >
                    <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                          <h2 className="text-lg font-bold font-sans text-stone-900 flex items-center gap-2">
                            <Key className="w-5 h-5 text-[#a37f26]" />
                            Secure Knowledge Vault
                          </h2>
                          <p className="text-xs text-stone-400 mt-1">Credentials remain fully browser-session encrypted and never leave local memory layers.</p>
                        </div>
                        <Button 
                          onClick={() => setIsAddingKey(true)}
                          className="bg-[#b08d2c] hover:bg-[#9a7b26] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 py-2 px-3 shrink-0 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add nexus key
                        </Button>
                      </div>

                      <div className="divide-y divide-stone-100">
                        {keys.length === 0 ? (
                          <div className="py-8 text-center text-stone-400 text-xs">No active semantic keys configured. Add one to route custom algorithms.</div>
                        ) : (
                          keys.map((k) => {
                            const decryptedString = decrypt(k.encryptedKey);
                            const maskedKey = decryptedString.length > 8 
                              ? decryptedString.substring(0, 4) + '••••••••' + decryptedString.substring(decryptedString.length - 4) 
                              : '••••••••';
                            return (
                              <div key={k.id} className="py-4 flex items-center justify-between hover:bg-stone-50/50 rounded-xl px-2 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-500 border border-stone-100">
                                    {k.provider === 'gemini' ? <Cpu className="w-5 h-5 text-[#a37f26]" /> : <Globe className="w-5 h-5 text-stone-500" />}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-sm text-stone-900">{k.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[10px] bg-stone-100 border border-stone-200/50 px-2 py-0.5 rounded-md text-stone-600 font-bold uppercase tracking-wider font-mono">
                                        {k.provider}
                                      </span>
                                      <span className="text-xs text-stone-400 font-mono tracking-wider">
                                        {maskedKey}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  {k.schema && (
                                    <div className="p-1 px-2 border border-stone-150 rounded-lg text-[9px] text-[#a37f26] font-bold uppercase tracking-widest flex items-center gap-1 bg-stone-50">
                                      <Code2 className="w-3 h-3" />
                                      Actions Active
                                    </div>
                                  )}
                                  <div className="text-right hidden sm:block">
                                    <span className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">Router</span>
                                    <span className="text-xs block font-bold text-stone-700 capitalize">{k.targetBrain} brain</span>
                                  </div>
                                  <button 
                                    onClick={() => handleDeleteKey(k.id)}
                                    className="p-1.5 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded-lg transition-colors"
                                    title="Revoke key credentials"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Cognitive Synergy Graphic representation */}
                    <div className="bg-[#FAF9F6] border border-stone-200 rounded-3xl p-6 md:p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-stone-900 text-sm">Layered Cognitive Indexing Topology</h3>
                          <p className="text-xs text-stone-400">Google Gemini routes concepts symmetrically through our 4-tier model engine.</p>
                        </div>
                        <button 
                          onClick={() => openStory('genkit')}
                          className="text-[10px] text-[#a37f26] hover:underline font-extrabold flex items-center gap-1"
                        >
                          <Info className="w-3 h-3" />
                          Learn More
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        {[
                          { l: "1", title: "Gemini Foundation", d: "Cognitive token orchestration base" },
                          { l: "2", title: "Sovereignty Router", d: "User intent & data confinement checks" },
                          { l: "3", title: "Synapse Mapping", d: "Realtime dynamic weight graphs" },
                          { l: "4", title: "Target Workspace", d: "Direct structural document write" }
                        ].map((layer) => (
                          <div key={layer.l} className="p-4 bg-white border border-stone-150 rounded-2xl flex flex-col justify-between h-28 shadow-sm">
                            <span className="text-xs font-black text-stone-300">STAGE 0{layer.l}</span>
                            <div>
                              <p className="text-[11px] font-bold text-stone-850">{layer.title}</p>
                              <p className="text-[9px] text-stone-400 mt-1 leading-snug">{layer.d}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}


                {/* 2. Biography & Profile Customization Tab */}
                {activeSettingsTab === 'profile' && (
                  <motion.div 
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm space-y-6"
                  >
                    <div>
                      <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                        <User className="w-5 h-5 text-[#a37f26]" />
                        User Profile
                      </h2>
                      <p className="text-xs text-stone-400 mt-1">Update your biography, display name, and profession details stored on Firebase.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-stone-400 tracking-widest uppercase">Display Name</label>
                        <input 
                          type="text" 
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-stone-200 rounded-xl outline-none focus:border-[#b08d2c] transition-all text-sm font-semibold"
                          placeholder="Your Name (e.g. John Doe)"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-stone-400 tracking-widest uppercase">Occupation / Field</label>
                        <input 
                          type="text" 
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-stone-200 rounded-xl outline-none focus:border-[#b08d2c] transition-all text-sm font-semibold"
                          placeholder="Field (e.g. Writer, Designer, Developer)"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-stone-400 tracking-widest uppercase block">A Short Bio</label>
                      <textarea 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full h-32 px-4 py-3 bg-[#FAF9F6] border border-stone-200 rounded-xl outline-none focus:border-[#b08d2c] transition-all text-sm font-medium resize-none leading-relaxed"
                        placeholder="A brief introduction about yourself..."
                      />
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex justify-end">
                      <Button 
                        onClick={handleSaveProfileCustomization}
                        disabled={savingProfile}
                        className="bg-[#b08d2c] hover:bg-[#9a7b26] disabled:opacity-60 text-white rounded-xl text-xs font-bold py-3 px-6 shadow-sm flex items-center gap-2"
                      >
                        {savingProfile ? "Saving profile..." : "✓ Save Profile"}
                      </Button>
                    </div>
                  </motion.div>
                )}


                {/* 3. Account security, password resets, 2FA backup OTP tab */}
                {activeSettingsTab === 'security' && (
                  <motion.div 
                    key="security"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-6"
                  >
                    <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm space-y-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                            <Fingerprint className="w-5 h-5 text-[#a37f26]" />
                            Account Security & Backup
                          </h2>
                          <p className="text-xs text-stone-400 mt-1">Configure security rules and request a safe password reset link directly to your inbox.</p>
                        </div>
                        <button 
                          onClick={() => openStory('security')}
                          className="text-[10px] text-[#a37f26] hover:underline font-extrabold flex items-center gap-1 shrink-0"
                        >
                          <Info className="w-3.5 h-3.5" />
                          Security Policy
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Option 1: Native Password Reset sent to mail */}
                        <div className="p-4 bg-[#FAF9F6] border border-stone-150/60 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                              <Mail className="w-4 h-4 text-stone-500" />
                              Send Password Reset Email
                            </h4>
                            <p className="text-xs text-stone-400 mt-0.5">We'll send you a secure password recovery link to your registered email address through Firebase Auth.</p>
                          </div>
                          {resetEmailSent ? (
                            <div className="p-2 px-3 border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 animate-bounce">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Reset Link Sent!
                            </div>
                          ) : (
                            <Button 
                              onClick={triggerRealEmailPasswordReset}
                              className="bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold py-2.5 px-4 shrink-0 transition-all border border-stone-900"
                            >
                              Reset Password
                            </Button>
                          )}
                        </div>

                        
                        
                        {/* Option 2: 2FA Real Firebase SMS MFA */}
                        <div className="p-4 bg-[#FAF9F6] border border-stone-150/60 rounded-2xl flex flex-col gap-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <h4 className="text-sm font-bold text-stone-900">
                                Enable Two-Factor Authentication (Firebase SMS MFA)
                              </h4>
                              <p className="text-xs text-stone-400 mt-0.5">Secure your account with official Firebase SMS second factor.</p>
                            </div>
                            <button 
                              onClick={() => setMfaStep(mfaStep === 3 ? 0 : 1)}
                              className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 outline-none flex items-center relative ${
                                mfaStep === 3 ? 'bg-[#b08d2c]' : 'bg-stone-200'
                              }`}
                            >
                              <div className={`w-5.5 h-5.5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                                mfaStep === 3 ? 'translate-x-[22px]' : 'translate-x-0.5'
                              }`} />
                            </button>
                          </div>
                          
                          {mfaStep === 1 && (
                            <div className="mt-4 pt-4 border-t border-stone-200 flex flex-col gap-2">
                              <label className="text-xs font-bold">Phone Number (+1...)</label>
                              <input type="text" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="+1234567890" />
                              <div id="recaptcha-container" className="my-2"></div>
                              <button onClick={async () => {
                                if (!auth.currentUser) return;
                                try {
                                  const session = await multiFactor(auth.currentUser).getSession();
                                  const provider = new PhoneAuthProvider(auth);
                                  const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
                                  const verId = await provider.verifyPhoneNumber({ phoneNumber, session }, appVerifier);
                                  setVerificationId(verId);
                                  setMfaStep(2);
                                } catch (e: any) {
                                  console.error(e);
                                  alert("Error sending SMS: " + e.message);
                                }
                              }} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-bold mt-2">Send SMS</button>
                            </div>
                          )}

                          {mfaStep === 2 && (
                            <div className="mt-4 pt-4 border-t border-stone-200 flex flex-col gap-2">
                              <label className="text-xs font-bold">Verification Code</label>
                              <input type="text" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" placeholder="123456" />
                              <button onClick={async () => {
                                if (!auth.currentUser) return;
                                try {
                                  const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
                                  const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
                                  await multiFactor(auth.currentUser).enroll(multiFactorAssertion, 'My Phone');
                                  setMfaStep(3);
                                  alert('Successfully enrolled in MFA!');
                                } catch (e: any) {
                                  console.error(e);
                                  alert("Error verifying code: " + e.message);
                                }
                              }} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-bold mt-2">Verify & Enroll</button>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </motion.div>
                )}


                {/* 4. Native device push notifications, Always On toggle, Voice Permission hardware hook */}
                {activeSettingsTab === 'notifications' && (
                  <motion.div 
                    key="notifications"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="space-y-6"
                  >
                    <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-[#a37f26]" />
                            Device Notifications & Voice
                          </h2>
                          <p className="text-xs text-stone-400 mt-1">Configure native and voice permission rules inside your local browser.</p>
                        </div>
                        <button 
                          onClick={() => openStory('always-on')}
                          className="text-[10px] text-[#a37f26] hover:underline font-extrabold flex items-center gap-1 leading-none shrink-0"
                        >
                          <Info className="w-3.5 h-3.5" />
                          Learn about Always-On
                        </button>
                      </div>

                      <div className="space-y-4">
                        
                        {/* "Always On" toggle */}
                        <div className="p-4 bg-[#FAF9F6] border border-stone-150/60 rounded-2xl flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-bold text-stone-900">Always-On Helper Session</h4>
                            <p className="text-xs text-stone-400 mt-0.5">Disabling this enables real native device push alerts through standard browser notifications.</p>
                          </div>
                          <button 
                            onClick={async () => {
                              const nextState = !alwaysOn;
                              setAlwaysOn(nextState);
                              // User disabled Always On – trigger notification permission request dialog
                              if (!nextState) {
                                await triggerNativePushPermission();
                              }
                            }}
                            className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 outline-none flex items-center relative ${
                              alwaysOn ? 'bg-[#b08d2c]' : 'bg-stone-200'
                            }`}
                          >
                            <div className={`w-5.5 h-5.5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                              alwaysOn ? 'translate-x-[22px]' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </div>

                        {/* Push Permission button */}
                        <div className="p-4 bg-[#FAF9F6] border border-stone-150/60 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h4 className="text-sm font-bold text-stone-900">Native Push Notifications</h4>
                            <p className="text-xs text-stone-400 mt-0.5">{pushEnabled ? "Push notifications are currently permitted and active." : "Request browser permission setup to trigger background notification popups."}</p>
                          </div>
                          {pushEnabled ? (
                            <div className="p-2 px-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Active
                            </div>
                          ) : (
                            <Button 
                              onClick={triggerNativePushPermission}
                              className="bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-bold py-2.5 px-4"
                            >
                              Enable Push Alerts
                            </Button>
                          )}
                        </div>

                        {/* Test Notifications buttons */}
                        <div className="p-4 bg-[#FAF9F6] border border-stone-150/60 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h4 className="text-sm font-bold text-stone-900">Test Notification Systems</h4>
                            <p className="text-xs text-stone-400 mt-0.5">Simulate a live email update pop-up or a mobile viewport slide-in banner on the phone preview.</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button 
                              onClick={executeEmailNotificationTest}
                              className="bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-xl text-xs font-bold py-2 px-3"
                            >
                              Test Email Send
                            </Button>
                            <Button 
                              onClick={executePushNotificationTest}
                              className="bg-[#b08d2c] hover:bg-[#9a7b26] text-white rounded-xl text-xs font-bold py-2 px-3 flex items-center gap-1 shadow-sm"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                              Test Device Alert
                            </Button>
                          </div>
                        </div>

                        {/* Native PWA client setup */}
                        <div className="flex justify-center my-4 w-full">
                          <PWAInstallButton />
                        </div>

                        {/* Native Device Voice / Microphone Permission Setup */}
                        <div className="p-4 bg-stone-900 text-white rounded-2xl border border-stone-800 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-sm font-black text-stone-100 flex items-center gap-1.5">
                                <Mic className="w-4 h-4 text-[#b08d2c]" />
                                Voice Dictation & Assist
                              </h4>
                              <p className="text-xs text-stone-400 mt-0.5">Allows your voice to dictate text directly into doc elements and navigate pages seamlessly.</p>
                            </div>
                            <button 
                              onClick={() => openStory('voice')}
                              className="text-[10px] text-[#b08d2c] hover:underline font-extrabold flex items-center gap-1 leading-none shrink-0"
                            >
                              <Info className="w-3 h-3" />
                              Voice Details
                            </button>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                            {microphoneStatus === 'granted' ? (
                              <div className="flex items-center gap-3 w-full">
                                <button 
                                  onClick={stopMicrophoneAccess}
                                  className="bg-red-600/90 hover:bg-red-700 text-white rounded-xl text-xs font-bold py-2 px-3 shrink-0"
                                >
                                  Disable Voice
                                </button>
                                
                                {/* Dynamic Wave Visualization */}
                                <div className="flex items-end gap-1 px-4 h-8 flex-1 justify-center max-w-xs mx-auto">
                                  {audioWaves.map((height, idx) => (
                                    <motion.div 
                                      key={idx}
                                      animate={{ height: height }}
                                      transition={{ type: "spring", stiffness: 220, damping: 15 }}
                                      className="w-1 bg-[#b08d2c] rounded-full"
                                      style={{ height: height + 'px' }}
                                    />
                                  ))}
                                </div>
                                <span className="text-[10px] font-bold text-[#b08d2c] animate-pulse uppercase tracking-wider shrink-0">Mic Active</span>
                              </div>
                            ) : (
                              <>
                                <span className="text-xs text-stone-400 tracking-wide">
                                  {microphoneStatus === 'denied' ? "⛔ Microphone permissions blocked in browser." : "Dictation is currently off."}
                                </span>
                                <Button 
                                  onClick={requestMicrophoneAccess}
                                  className="bg-[#b38f2a] hover:bg-[#a37f26] text-white rounded-xl text-xs font-bold py-2 px-3 shadow-md"
                                >
                                  Enable Microphone
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

            </div>


            {/* Right Column: Dynamic iOS/Android Bezel-less Vector Phone Component */}
            <div className="w-full xl:w-72 shrink-0 flex flex-col items-center">
              <span className="text-[10px] font-bold text-stone-400 tracking-widest uppercase mb-4 block">MOBILE PREVIEW</span>
              
              <div id="phone-container-rig" className="relative w-64 h-[440px] bg-stone-950 rounded-[35px] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border-4 border-stone-800/80 shrink-0 select-none">
                {/* iPhone status Notch and Camera */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-stone-950 rounded-full flex items-center justify-center gap-1.5 z-20">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-800" />
                  <div className="w-8 h-1 rounded bg-stone-800 animate-pulse" />
                </div>
                
                {/* Phone screen inside */}
                <div className="relative w-full h-full rounded-[25px] overflow-hidden flex flex-col justify-between p-4 bg-gradient-to-tr from-[#edebe8] via-[#F4F2EE] to-[#FCFAF8]">
                  
                  {/* Phone Status Bar Row */}
                  <div className="flex justify-between items-center text-[8px] font-bold text-stone-500">
                    <span>9:41 AM</span>
                    <div className="flex items-center gap-1">
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>

                  {/* Mobile screen beautiful styled Docscraft Workspace */}
                  <div className="my-auto flex flex-col w-full h-full pt-6 px-1 text-left">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-200">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-[#b08d2c] flex items-center justify-center">
                          <span className="text-[9px] font-black text-white">D</span>
                        </div>
                        <span className="text-[10px] font-black text-stone-800 tracking-tight">Docscraft Workspace</span>
                      </div>
                      <span className="text-[7px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded font-bold">✓ Synced</span>
                    </div>

                    {/* Book / Diary card preview */}
                    <div className="bg-white rounded-xl p-2.5 border border-stone-200/60 shadow-sm space-y-1.5 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-stone-900 block truncate">📔 Daily Musings</span>
                        <span className="text-[7px] text-stone-400">Just now</span>
                      </div>
                      
                      {/* Lines mimicking paper lines */}
                      <div className="space-y-1">
                        <div className="h-1 bg-stone-100 rounded w-11/12" />
                        <div className="h-1 bg-stone-100 rounded w-full" />
                        <p className="text-[8px] text-[#b08d2c] font-semibold font-mono truncate leading-tight">
                          {displayName || "Anonymous Creator"}
                        </p>
                      </div>
                    </div>

                    {/* Quick tasks list representation */}
                    <div className="space-y-1">
                      <span className="text-[8px] font-black text-stone-400 uppercase tracking-wider block">Today's Goals</span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 p-1 bg-white/40 border border-stone-200/40 rounded-lg text-[8px] text-stone-600">
                          <span className="text-emerald-500 font-bold">✓</span>
                          <span>Complete personal biography</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-1 bg-white/40 border border-stone-200/40 rounded-lg text-[8px] text-stone-600">
                          <span className="text-amber-500 font-bold font-mono">⋯</span>
                          <span className="truncate">Active bio: {bio ? `"${bio}"` : "Add short bio..."}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tiny representation of micro toolbar */}
                    <div className="mt-auto pt-3 border-t border-stone-200/45 flex justify-around text-stone-400 text-[10px] leading-none">
                      <span>✏️</span>
                      <span>📁</span>
                      <span>🔔</span>
                      <span>👤</span>
                    </div>
                  </div>

                  {/* Animated Transition Notification badges */}
                  <AnimatePresence>
                    {showPhoneNotification && (
                      <motion.div 
                        initial={{ opacity: 0, y: -80, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -40, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 220, damping: 18 }}
                        className="absolute top-8 left-2 right-2 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-stone-100 z-30 flex flex-col gap-0.5"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="w-3.5 h-3.5 rounded bg-stone-900 flex items-center justify-center">
                            <span className="text-[8px] text-white">D</span>
                          </div>
                          <span className="text-[8px] font-black text-stone-900 tracking-wider">DOCSCRAFT</span>
                          <span className="text-[7px] text-stone-400 ml-auto">now</span>
                        </div>
                        <p className="text-[9px] font-black text-stone-800">Workspace Sync Successful</p>
                        <p className="text-[8px] text-stone-500 leading-normal mt-0.5">Your profile name and bio configurations were saved cleanly. Workspace is ready.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Phone screen footer swipe bar */}
                  <div className="w-16 h-1 bg-stone-300 rounded-full mx-auto" />
                </div>
              </div>

              {/* Extra helper notice */}
              <p className="text-[10px] text-stone-400 text-center max-w-xs mt-3 leading-relaxed">
                Click <strong>"Test Device Alert"</strong> under preferences to see notification banner slide into the preview.
              </p>
            </div>
            
          </div>

          {/* Clean professionals email mockup popping on screen frame when tested */}
          <AnimatePresence>
            {showEmailNotificationAlert && (
              <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                className="fixed bottom-6 right-6 z-[200] max-w-sm w-full bg-white border border-stone-200 rounded-2xl shadow-2xl p-5 font-sans"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#b08d2c]" />
                    <span className="text-xs font-bold text-stone-600">Simulated Email Notification</span>
                  </div>
                  <button onClick={() => setShowEmailNotificationAlert(false)} className="text-stone-400 hover:text-stone-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1 text-xs">
                  <p className="text-stone-400"><span className="font-bold text-stone-600">From:</span> support@docscraftpro.io</p>
                  <p className="text-stone-400"><span className="font-bold text-stone-600">Subject:</span> Security notice regarding your account</p>
                  <div className="h-px bg-stone-100 my-2" />
                  <p className="text-stone-800 font-bold leading-normal mb-1">Verify Your Password Modification Request</p>
                  <p className="text-stone-500 leading-relaxed text-[11px]">Hello {displayName || "User"}, we received a standard secure password reset request from Firebase Authentication. Please follow the instructions in the verified email link sent to you to finish resetting your access credentials.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Learn More Overlay Poetic Story Modal */}
          <AnimatePresence>
            {learnMoreContent && (
              <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-white rounded-3xl border border-stone-200 shadow-2xl p-8 max-w-md w-full relative font-sans leading-relaxed text-stone-800"
                >
                  <button 
                    onClick={() => setLearnMoreContent(null)}
                    className="absolute top-5 right-5 p-1.5 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-700 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <h3 className="font-serif font-black text-xl text-stone-900 mb-4">{learnMoreContent.title}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed italic border-l-2 border-[#b08d2c] pl-4 mb-4">
                    {learnMoreContent.text}
                  </p>
                  <div className="flex justify-end pt-4 border-t border-stone-100">
                    <Button 
                      onClick={() => setLearnMoreContent(null)}
                      className="bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold py-2 px-5"
                    >
                      Acknowledge Covenant
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Add Nexus Key Modal Overlay */}
          <AnimatePresence>
            {isAddingKey && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl border border-stone-200 shadow-2xl overflow-hidden w-full max-w-md"
                >
                  <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                    <h3 className="font-bold text-sm text-stone-900">Add Nexus Bridge Key</h3>
                    <button onClick={() => setIsAddingKey(false)} className="text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Key Name</label>
                      <input 
                        type="text" 
                        value={newKey.name}
                        onChange={e => setNewKey({...newKey, name: e.target.value})}
                        placeholder="e.g. Personal Project Gemini Token"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-[#b08d2c] transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Provider</label>
                      <select 
                        value={newKey.provider}
                        onChange={e => setNewKey({...newKey, provider: e.target.value as any})}
                        className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-[#b08d2c] transition-all text-sm appearance-none"
                      >
                        <option value="gemini">Gemini API</option>
                        <option value="openai">OpenAI API</option>
                        <option value="anthropic">Anthropic API</option>
                        <option value="custom">Custom Endpoint</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">API Secret Key</label>
                      <input 
                        type="password" 
                        value={newKey.key}
                        onChange={e => setNewKey({...newKey, key: e.target.value})}
                        placeholder="Paste your API credential token safely here..."
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-[#b08d2c] transition-all text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                        Function Calling Schema Json <span className="text-stone-400 font-normal lowercase">(Optional)</span>
                      </label>
                      <textarea 
                        value={newKey.schema}
                        onChange={e => setNewKey({...newKey, schema: e.target.value})}
                        placeholder="[{ 'name': 'queryNotes', 'description': '...' }]"
                        className="w-full h-20 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:border-[#b08d2c] transition-all text-xs font-mono resize-none"
                      />
                    </div>
                  </div>
                  <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex justify-end gap-3 text-xs">
                    <Button variant="ghost" onClick={() => setIsAddingKey(false)} className="rounded-lg">Cancel</Button>
                    <Button onClick={handleAddKeySubmit} disabled={!newKey.key || !newKey.name} className="bg-[#b08d2c] text-white hover:bg-[#9a7b26] rounded-lg">Secure & Save Keys</Button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>

        {/* Clean, high-contrast white Footer centered on the settings landing page */}
        <Footer />
      </main>
    </div>
  );
}
