import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, Volume2 } from 'lucide-react';

interface VisualCaptchaProps {
  onVerify: (verified: boolean) => void;
  theme?: 'light' | 'dark';
}

export function VisualCaptcha({ onVerify, theme = 'light' }: VisualCaptchaProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [captchaText, setCaptchaText] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isError, setIsError] = useState(false);

  // Generate random broken-word / alphanumeric captcha text
  const generateCaptchaText = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude confusing ones (1, 0, I, O)
    // Create random syllables / characters
    let result = '';
    
    // Construct broken word structure: e.g. "K9-XYZ", "C6-789"
    const prefix = chars.charAt(Math.floor(Math.random() * chars.length));
    const num = Math.floor(Math.random() * 8) + 2; // 2 to 9
    result += `${prefix}${num}-`;
    
    for (let i = 0; i < 3; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result; // Format "A4-XYZ"
  };

  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Clear with gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    if (theme === 'dark') {
      gradient.addColorStop(0, '#1E293B');
      gradient.addColorStop(1, '#0F172A');
    } else {
      gradient.addColorStop(0, '#F8FAFC');
      gradient.addColorStop(1, '#E2E8F0');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Render background grids & noise dots
    ctx.strokeStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 12;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Noise dots behind text
    for (let i = 0; i < 45; i++) {
      ctx.fillStyle = `hsla(${Math.random() * 360}, 60%, ${theme === 'dark' ? '60%' : '40%'}, 0.3)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Draw distortive lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `hsla(${Math.random() * 360}, 75%, ${theme === 'dark' ? '70%' : '50%'}, 0.55)`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * (width * 0.2), Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        Math.random() * (width * 0.8) + (width * 0.2), Math.random() * height
      );
      ctx.stroke();
    }

    // 4. Draw each character with custom transformation to bypass AI OCR
    const fontFamilies = [
      'Georgia', 'Impact', 'Courier New', 'Trebuchet MS', 'Arial Black', 'Palatino', 'Verdana'
    ];
    
    ctx.textBaseline = 'middle';
    
    // Distribute characters across canvas
    const charSpacing = width / (text.length + 1.2);
    
    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      const font = fontFamilies[Math.floor(Math.random() * fontFamilies.length)];
      const size = Math.floor(Math.random() * 6) + 21; // 21px to 27px
      
      ctx.font = `bold ${size}px ${font}`;
      
      const charX = charSpacing * (i + 0.7) + (Math.random() * 4 - 2);
      const charY = height / 2 + (Math.random() * 6 - 3);
      
      ctx.save();
      ctx.translate(charX, charY);
      
      // Rotate between -22 and +22 degrees
      const angle = (Math.random() * 44 - 22) * Math.PI / 180;
      ctx.rotate(angle);
      
      // Text styling
      ctx.fillStyle = `hsla(${Math.random() * 360}, 85%, ${theme === 'dark' ? '75%' : '30%'}, 0.95)`;
      
      // Some text filled, some outlined
      if (Math.random() > 0.75) {
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1.5;
        ctx.strokeText(char, 0, 0);
      } else {
        ctx.fillText(char, 0, 0);
      }
      
      ctx.restore();
    }

    // 5. Draw overlay noise curves
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * height);
      ctx.lineTo(width, Math.random() * height);
      ctx.stroke();
    }
  };

  const handleRefresh = () => {
    const newText = generateCaptchaText();
    setCaptchaText(newText);
    setInputValue('');
    setIsVerified(false);
    setIsError(false);
    onVerify(false);
  };

  // Speak CAPTCHA out loud for accessibility using Speech Synthesis (Human-friendly)
  const speakCaptcha = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Speak letters separatedly for clear understanding
      const spokenText = captchaText.split('').map(char => {
        if (char === '-') return 'dash';
        return char;
      }).join(' ');
      
      const utterance = new SpeechSynthesisUtterance(`Security Code: ${spokenText}`);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const newText = generateCaptchaText();
    setCaptchaText(newText);
  }, []);

  useEffect(() => {
    if (captchaText) {
      // Delay drawing slightly to ensure canvas DOM is ready
      const timer = setTimeout(() => drawCaptcha(captchaText), 50);
      return () => clearTimeout(timer);
    }
  }, [captchaText, theme]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setInputValue(val);
    
    // Normalize both values (remove whitespace)
    const normalizedInput = val.replace(/\s+/g, '');
    const normalizedTarget = captchaText.replace(/\s+/g, '');

    if (normalizedInput === normalizedTarget) {
      setIsVerified(true);
      setIsError(false);
      onVerify(true);
    } else {
      setIsVerified(false);
      onVerify(false);
      if (normalizedInput.length >= normalizedTarget.length) {
        setIsError(true);
      } else {
        setIsError(false);
      }
    }
  };

  const containerBgClass = theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200';
  const labelColorClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const inputBgClass = theme === 'dark' ? 'bg-slate-950/80 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900';

  return (
    <div className={`p-4 border rounded-2xl ${containerBgClass} space-y-3 shadow-inner`}>
      <div className="flex items-center justify-between">
        <label className={`text-xs font-bold tracking-wider uppercase ${labelColorClass}`}>
          Captcha Verification
        </label>
        <span className="text-[10px] bg-slate-500/10 text-slate-500 px-2 py-0.5 rounded-full font-sans font-bold uppercase">
          Required
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* The Graphic Canvas */}
        <div className="relative border border-slate-300/30 rounded-xl overflow-hidden shrink-0 shadow-sm bg-slate-100">
          <canvas
            ref={canvasRef}
            width={170}
            height={52}
            className="block cursor-pointer select-none"
            onClick={handleRefresh}
            title="Click to Refresh Captcha"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-1.5 justify-center">
          <button
            type="button"
            onClick={speakCaptcha}
            title="Listen to verification code"
            className="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/10 transition-colors flex items-center justify-center"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={handleRefresh}
            title="Regenerate Security Captcha"
            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/10 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 animate-hover-spin" />
          </button>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Type letters & numbers in canvas..."
          value={inputValue}
          onChange={handleInputChange}
          maxLength={captchaText.length + 2}
          autoComplete="off"
          disabled={isVerified}
          className={`w-full h-11 px-4.5 text-center text-sm font-bold tracking-wider font-mono rounded-xl border focus:outline-none transition-all ${
            isVerified
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
              : isError
              ? 'border-red-500 ring-2 ring-red-500/10 focus:ring-red-500/20'
              : 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10'
          } ${inputBgClass}`}
        />
        
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
          {isVerified && (
            <CheckCircle className="w-5 h-5 text-emerald-500 animate-bounce" />
          )}
          {isError && !isVerified && (
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
          )}
        </div>
      </div>

      <p className="text-[10px] text-zinc-400 text-center select-none font-sans italic">
        {isVerified 
          ? 'Verification successful.' 
          : 'Letters and numbers are case insensitive. Click code to refresh.'}
      </p>
    </div>
  );
}
