import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProcessingOverlayProps {
  show: boolean;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function ProcessingOverlay({ show, title, description, icon }: ProcessingOverlayProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAF9F6]/90 backdrop-blur-md"
        >
          <div className="relative flex items-center justify-center w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-[#F0E4C0]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#D4AF37] animate-spin" />
            {icon ?? <Loader2 className="w-10 h-10 text-[#C5A017] animate-pulse" />}
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-800 tracking-tight mb-2">{title}</h3>
          {description && (
            <p className="text-stone-500 text-sm max-w-sm text-center leading-relaxed px-4">{description}</p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
