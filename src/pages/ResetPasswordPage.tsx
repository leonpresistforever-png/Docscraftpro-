import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);
  const [invalidCode, setInvalidCode] = useState(false);

  const query = useQuery();
  const navigate = useNavigate();
  const oobCode = query.get('oobCode');

  useEffect(() => {
    if (!oobCode) {
      setInvalidCode(true);
      setValidating(false);
      return;
    }

    // Verify the password reset code is valid
    verifyPasswordResetCode(auth, oobCode)
      .then(() => {
        setValidating(false);
      })
      .catch((error) => {
        console.error(error);
        setInvalidCode(true);
        setValidating(false);
      });
  }, [oobCode]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    if (!oobCode) return;

    setLoading(true);
    setError('');

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to securely reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8] font-sans">
        <div className="text-[#D4AF37] font-bold text-lg animate-pulse tracking-widest">VERIFYING SECURE LINK...</div>
      </div>
    );
  }

  if (invalidCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8] font-sans px-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] text-center border border-white"
        >
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Expired or Invalid</h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Your password reset link is invalid or has expired. For security purposes, these links expire after a short time.
          </p>
          <button 
            onClick={() => navigate('/auth')}
            className="px-6 py-3 bg-[#D4AF37] hover:bg-[#b08d2b] transition-all text-white rounded-xl font-bold uppercase tracking-widest text-xs w-full shadow-sm"
          >
            Return to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8] font-sans px-4 relative">
      {/* Background with 30% Transparency Image (Consistent with AuthPage) */}
      <div className="absolute inset-0 z-0 bg-[#FDFCF8] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-multiply"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?q=80&w=2069&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCF8] via-[#FDFCF8]/60 to-[#FDFCF8]/90" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/90 backdrop-blur-xl border border-white p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]">
          <h2 className="text-2xl font-bold mb-2 text-[#1a1a1a] text-center">Reset Password</h2>
          <p className="text-center text-gray-500 text-xs mb-6 px-4">
            Create a new password for your account. Please make it secure.
          </p>

          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-amber-100">
                <CheckCircle2 className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Password Updated!</h3>
              <p className="text-gray-500 text-sm">You will be redirected to the login page momentarily.</p>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                 <p className="text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm w-full text-center border border-red-200">
                   {error}
                 </p>
              )}
              
              <div>
                <input 
                  type="password" 
                  placeholder="New Password"
                  className="w-full h-12 bg-white border border-[#E0E0E0] rounded-xl px-5 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-shadow shadow-sm text-sm"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <input 
                  type="password" 
                  placeholder="Confirm New Password"
                  className="w-full h-12 bg-white border border-[#E0E0E0] rounded-xl px-5 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#D4AF37] transition-shadow shadow-sm text-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-4 rounded-xl bg-gradient-to-b from-[#E6C655] to-[#B98F32] shadow-[0_6px_16px_rgba(212,175,55,0.3)] text-white font-bold text-sm tracking-widest uppercase flex items-center justify-center hover:brightness-110 active:scale-[0.98] transition-all"
              >
                {loading ? 'Updating...' : 'Set New Password'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
