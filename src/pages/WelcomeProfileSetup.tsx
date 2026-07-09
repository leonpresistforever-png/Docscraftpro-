import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Camera, ArrowRight, Loader2, User, ShieldCheck, BookOpen, Heart } from 'lucide-react';
import { motion } from 'motion/react';

export function WelcomeProfileSetup() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    avatarUrl: '',
    bio: '',
    goals: '',
    stayInTrack: true
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (userData?.profileSetupComplete) {
      navigate('/dashboard');
    } else if (userData) {
      // Pre-fill if there is existing data
      setFormData(prev => ({
        ...prev,
        firstName: userData.firstName || '',
        lastName: userData.lastName || ''
      }));
    }
  }, [user, userData, navigate]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadProgress(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
        setUploadProgress(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.warn("Notifications interface is not supported on this browser context.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        new Notification("Docscraft Notification Enabled", {
          body: "Direct browser push notifications are now active. Prepare to be kept on track!",
          icon: "/favicon.ico"
        });
      }
    } catch (err) {
      console.error("Push API notification request error:", err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const derivedUsername = `${formData.firstName}_${formData.lastName}`
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '') || user.email?.split('@')[0] || 'author';

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        username: derivedUsername,
        firstName: formData.firstName,
        lastName: formData.lastName,
        avatarUrl: formData.avatarUrl,
        bio: formData.bio,
        goals: formData.goals,
        stayInTrack: formData.stayInTrack,
        profileSetupComplete: true,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      if (formData.stayInTrack) {
        await requestNotificationPermission();
      }
      navigate('/dashboard');
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4 md:p-8 selection:bg-[#D4AF37] selection:text-white relative overflow-hidden font-sans">
      
      {/* Abstract Golden and Off-white Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl bg-white rounded-[2.5rem] border-2 border-[#D4AF37] shadow-2xl overflow-hidden relative z-10 my-8"
      >
        {/* Creative Narrative Header Cover with White and Gold Theme */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-[#AA7A00] p-8 md:p-10 text-white relative overflow-hidden border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-3 mb-4 text-amber-200">
            <BookOpen className="w-5 h-5 animate-pulse text-[#D4AF37]" />
            <span className="text-xs uppercase tracking-widest font-extrabold text-amber-100">Docscraft Creative Workspace</span>
          </div>

          <h2 className="text-2xl md:text-3.5xl font-serif font-black tracking-tight leading-tight text-white">
            Complete Your Vault Identity
          </h2>
          
          <p className="text-xs md:text-sm leading-relaxed mt-4 font-serif text-stone-200 border-l-2 border-[#D4AF37] pl-4">
            "Welcome to creative writing of documents and PDFs. This is your personal private vault, always here for you and for your thoughts. Express your thoughts, goals, and anything securely and safely in your private vault of thoughts in Docscraft. Creativity should be expressed to be remembered, otherwise it would be forgotten. Write your thoughts to stay on track..."
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="p-8 md:p-10 space-y-6">
          
          {/* Avatar Picker - Custom Select Circle only, Browse text button removed */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-stone-100">
            <div 
              onClick={handleAvatarClick}
              className="w-24 h-24 rounded-full bg-amber-50/50 border-2 border-dashed border-[#D4AF37]/40 flex items-center justify-center relative cursor-pointer hover:bg-amber-100/20 transition-all flex-shrink-0 group overflow-hidden shadow-sm"
              title="Click to select image file from your device"
            >
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-amber-800/60 font-medium">
                  <User className="w-8 h-8 text-[#D4AF37]/80 mb-1" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">Select</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white mb-1" />
                <span className="text-[9px] text-white tracking-widest uppercase font-bold">Gallery</span>
              </div>

              {uploadProgress && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin" />
                </div>
              )}
            </div>

            <div className="text-center sm:text-left space-y-1 flex-1">
              <h4 className="font-bold text-stone-800 text-base">Select Your Workspace Avatar</h4>
              <p className="text-xs text-stone-500">
                Click the circle to pick a picture from your device gallery. We store it securely right inside your personal profile account.
              </p>
            </div>

            {/* Hidden native file input element */}
            <input 
              type="file" 
              ref={fileInputRef} 
              id="avatar-file-input" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </div>

          {/* First name and Last name, username field removed as requested */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[#AA7A00]">First Name</label>
              <input 
                type="text"
                required
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all bg-[#FAF9F6] font-medium text-stone-850 placeholder-stone-300"
                placeholder="First Name"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-[#AA7A00]">Last Name</label>
              <input 
                type="text"
                required
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all bg-[#FAF9F6] font-medium text-stone-850 placeholder-stone-300"
                placeholder="Last Name"
              />
            </div>
          </div>

          {/* Bio Form Field - poet, story writer, professional writing comments & placeholders */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-widest text-[#AA7A00]">Your Bio / Background</label>
              <span className="text-[10px] text-stone-400">Poet, story writer, professional writing</span>
            </div>
            <textarea 
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all bg-[#FAF9F6] text-sm text-stone-800 font-serif leading-relaxed"
              placeholder="E.g., Poet, story writer, professional writing..."
            />
          </div>

          {/* Goals Form Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-[#AA7A00]">What are your creative writing goals?</label>
            <input 
              type="text"
              value={formData.goals}
              onChange={e => setFormData({...formData, goals: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all bg-[#FAF9F6] text-sm text-stone-800 font-serif"
              placeholder="E.g., Map creative thoughts, story drafts, or write every single day..."
            />
          </div>

          {/* Stay on track check bar toggle - opens native window browser push notifications */}
          <div className="bg-amber-50/30 border border-amber-200/50 rounded-2xl p-4 md:p-5 flex items-start gap-4 hover:bg-amber-50/50 transition-colors">
            <input 
              type="checkbox" 
              id="stayInTrack"
              checked={formData.stayInTrack}
              onChange={async (e) => {
                const checked = e.target.checked;
                setFormData({...formData, stayInTrack: checked});
                if (checked) {
                  await requestNotificationPermission();
                }
              }}
              className="w-5 h-5 text-[#D4AF37] focus:ring-[#D4AF37] border-stone-300 rounded cursor-pointer mt-0.5 accent-[#D4AF37]"
            />
            <div className="space-y-1 flex-1">
              <label htmlFor="stayInTrack" className="text-xs font-bold uppercase tracking-wide text-stone-900 cursor-pointer select-none flex items-center gap-1.5">
                Stay on Track with Docscraft Goal Reminder <Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-current animate-bounce" />
              </label>
              <p className="text-[11px] text-[#AA7A00] leading-relaxed">
                Check this box to grant direct device-level browser permissions for sending creative notifications, streaks tracking, and motivational reminders right on your personal device.
              </p>
            </div>
          </div>

          {/* Submission Control - Process & Enter action only */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-[#D4AF37] hover:bg-[#AA7A00] text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all outline-none flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>PROCESSED & ENTER</span>
            )}
            {!loading && <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
