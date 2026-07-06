import React from 'react';

export function NexusLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M20 20 L50 10 L80 20 L90 50 L80 80 L50 90 L20 80 L10 50 Z" fill="url(#metalGoldLogo)" stroke="#FFF" strokeWidth="2" />
      <path d="M20 20 L80 80 M80 20 L20 80" stroke="#FFF" strokeWidth="4" />
      <path d="M30 30 L50 50 L70 30" fill="none" stroke="#D4AF37" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 70 L50 50 L70 70" fill="none" stroke="#D4AF37" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="metalGoldLogo" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#FFF2B2" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#AA8529" />
        </linearGradient>
      </defs>
    </svg>
  );
}
