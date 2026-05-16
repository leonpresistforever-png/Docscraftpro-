import React, { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Camera, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';

export function ProfileMenu({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user, {
        displayName: displayName || user?.displayName,
        photoURL: photoURL || user?.photoURL
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute right-0 top-14 w-80 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] p-5 z-50 text-dc-text"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-lg">My Profile</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full border-2 border-dc-gold overflow-hidden bg-gray-100 relative group">
           {isEditing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 pointer-events-none">
                 <Camera className="w-6 h-6 text-white opacity-80" />
              </div>
           )}
           {user?.photoURL || photoURL ? (
             <img src={(isEditing ? photoURL : user?.photoURL) || ''} alt="Profile" className="w-full h-full object-cover" />
           ) : (
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}&backgroundColor=e5e5e5`} alt="Profile" className="w-full h-full object-cover" />
           )}
        </div>

        {isEditing ? (
          <div className="w-full flex flex-col gap-3">
             <div>
               <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 mb-1 block">Full Name</label>
               <input 
                 value={displayName}
                 onChange={(e) => setDisplayName(e.target.value)}
                 className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-dc-gold"
                 placeholder="Your Name"
               />
             </div>
             <div className="flex gap-2 mt-2">
               <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1 rounded-lg h-9 text-xs">Cancel</Button>
               <Button onClick={handleSave} className="flex-1 rounded-lg h-9 text-xs bg-dc-gold hover:bg-dc-gold-hover text-white flex items-center justify-center gap-1">
                 {saving ? 'Saving...' : <><Check className="w-3 h-3" /> Save</>}
               </Button>
             </div>
          </div>
        ) : (
          <div className="text-center w-full">
            <h4 className="font-bold text-lg leading-tight truncate">{user?.displayName || 'User'}</h4>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            <button 
              onClick={() => setIsEditing(true)}
              className="mt-2 text-xs font-bold text-dc-gold hover:text-dc-gold-hover uppercase tracking-widest"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>

      <div className="h-px w-full bg-gray-200 mb-4" />

      <button 
        onClick={() => {
          logout();
          onClose();
        }}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-600 hover:bg-red-50 bg-transparent transition-colors font-bold text-sm"
      >
        <LogOut className="w-4 h-4" />
        Log Out
      </button>
    </motion.div>
  );
}
