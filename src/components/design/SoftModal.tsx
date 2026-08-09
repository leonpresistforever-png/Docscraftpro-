import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface SoftModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export function SoftModal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  className,
  maxWidth = 'max-w-[560px]',
}: SoftModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120000] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-stone-900/20 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className={cn(
              'relative w-full rounded-3xl border border-[#E8DFC8] bg-gradient-to-b from-white to-[#FDFBF7] shadow-[0_24px_80px_-12px_rgba(26,26,26,0.18)]',
              maxWidth,
              className,
            )}
          >
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />
            <div className="p-8">
              <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-[#EDE6D6]">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className="p-2.5 rounded-2xl bg-[#FBF6E8] text-[#B8952D] border border-[#F0E4C0] shadow-sm">
                      {icon}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-serif font-bold text-stone-800 tracking-tight">{title}</h3>
                    {subtitle && (
                      <p className="text-xs text-stone-500 mt-0.5 font-medium">{subtitle}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
