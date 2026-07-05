import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { LogOut, Camera, X, Loader2, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export function ProfileMenu({ onClose }: { onClose: () => void }) {
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Sync profile details initially
  useEffect(() => {
    if (user) {
      const dbFullName = userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() : '';
      setDisplayName(dbFullName || user.displayName || '');
      setPhotoURL(userData?.avatarUrl || user.photoURL || '');
    }
  }, [user, userData]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        setPhotoURL(base64Data);
        setUploading(false);
      };
      reader.onerror = (err) => {
        console.error("FileReader failed:", err);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Split display name into firstName and lastName
      const nameParts = displayName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Update Firebase Auth user profile
      await updateProfile(user, {
        displayName: displayName || user.displayName,
        photoURL: photoURL || user.photoURL
      });

      // Update Firestore document/users/{uid}
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        firstName,
        lastName,
        avatarUrl: photoURL,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      onClose();
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-[2rem] border border-stone-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-6 md:p-8 max-w-sm w-full font-sans relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Title and Close Button */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl text-stone-900 tracking-tight font-sans">My Profile</h3>
          <button 
            id="close-profile-btn"
            onClick={onClose} 
            className="p-1.5 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Golden Circular Border Avatar Center Frame with Camera upload */}
        <div className="flex flex-col items-center mb-6">
          <div 
            onClick={handleAvatarClick}
            className="w-28 h-28 rounded-full border-4 border-[#b08d2c] bg-stone-100 overflow-hidden relative group cursor-pointer shadow-sm flex items-center justify-center"
            title="Click to select or change profile photo"
          >
            {photoURL ? (
              <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}&backgroundColor=e5e5e5`} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            )}
            
            {/* Camera Overlay */}
            <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Camera className="w-6 h-6 text-white mb-0.5" />
              <span className="text-[9px] text-white tracking-wider uppercase font-extrabold">Upload</span>
            </div>

            {/* Spinner when loading */}
            {(uploading) && (
              <div className="absolute inset-0 bg-white/85 flex items-center justify-center z-20">
                <Loader2 className="w-6 h-6 text-[#b08d2c] animate-spin" />
              </div>
            )}
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* INPUT: FULL NAME */}
        <div className="space-y-1.5 mb-6">
          <label className="text-[10px] font-bold text-stone-400 tracking-widest uppercase block">Full Name</label>
          <input 
            id="profile-fullname-input"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 bg-[#FCFBFA] border border-stone-200 rounded-xl outline-none focus:border-[#b08d2c] focus:ring-1 focus:ring-[#b08d2c] text-stone-850 font-semibold transition-all text-sm"
            placeholder="E.g., Foxer Dude"
          />
        </div>

        {/* Cancel and Save triggers */}
        <div className="flex gap-4 mb-6">
          <button 
            id="cancel-profile-btn"
            onClick={onClose} 
            className="flex-1 border border-stone-200 rounded-xl py-3 text-stone-500 hover:text-stone-800 font-bold hover:bg-stone-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            id="save-profile-btn"
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex-1 bg-[#b08d2c] hover:bg-[#9a7b26] disabled:opacity-60 text-white rounded-xl py-3 font-bold transition-all text-sm flex items-center justify-center gap-1.5 shadow-sm"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>✓ Save</span>
            )}
          </button>
        </div>

        {/* Horizontal Line Row */}
        <div className="h-px bg-stone-150 w-full mb-6" />

        {/* Detailed Settings Redirect Trigger Option */}
        <button 
          id="detailed-settings-redirect-btn"
          onClick={() => {
            onClose();
            navigate('/settings');
          }}
          className="w-full flex items-center justify-center gap-2 py-3 mb-3 border-2 border-stone-200/65 rounded-xl font-bold text-xs uppercase tracking-wider text-amber-900 bg-amber-50/40 hover:bg-amber-50 hover:border-amber-400 transition-all focus:outline-none"
        >
          <Settings className="w-4 h-4 text-[#b08d2c] animate-spin" style={{ animationDuration: '8s' }} />
          <span>Detailed profile settings</span>
        </button>

        {/* Centered red-link Log Out with exit doors */}
        <button 
          id="logout-profile-btn"
          onClick={() => {
            logout();
            onClose();
          }}
          className="text-red-600 hover:text-red-700 font-bold text-sm tracking-wide flex items-center gap-2 justify-center py-2 transition-transform hover:scale-[1.03] mx-auto focus:outline-none"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </motion.div>
    </div>
  );
}
