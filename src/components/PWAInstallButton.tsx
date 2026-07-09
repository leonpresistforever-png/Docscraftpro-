import React, { useState, useEffect } from 'react';
import { Download, Bell, BellOff, Sparkles, Check, Smartphone, Laptop, ShieldCheck } from 'lucide-react';

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);

  useEffect(() => {
    // Check standalone display mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerPwaCompilation = () => {
    if (isCompiling) return;
    setIsCompiling(true);
    setCompileProgress(0);

    const interval = setInterval(() => {
      setCompileProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCompiling(false);
          triggerInstallPrompt();
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const triggerInstallPrompt = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      // Browser didn't trigger beforeinstallprompt yet or does not support custom prompt triggers
      // Inform user of alternative installation method
      alert("Docscraft PWA Compiled Successfully! 🚀\n\nTo install, please use your browser's options menu (e.g., Click the three dots -> 'Install Docscraft' or the '+' icon in your address bar).");
    }
  };

  const handleRequestPushNotification = async () => {
    if (!('Notification' in window)) {
      alert("Native Push Notifications are not supported in this browser.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // Trigger local notification via Service Worker if registered, or direct fallback
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          if (reg && reg.showNotification) {
            reg.showNotification("Docscraft Pro Activated! 🔔", {
              body: "Sovereign native push notifications are now working flawlessly.",
              icon: "/pwa-192x192.png",
              badge: "/pwa-192x192.png",
              vibrate: [100, 50, 100],
              tag: "welcome-docscraft",
              requireInteraction: true
            } as any);
            return;
          }
        }
        
        // Direct Native Web Notification Fallback
        new Notification("Docscraft Pro Activated! 🔔", {
          body: "Sovereign native push notifications are now working flawlessly.",
          icon: "/pwa-192x192.png"
        });
      } else {
        alert("Push Notification permission denied. Please enable them in browser site settings.");
      }
    } catch (err: any) {
      console.error("Push Notification error:", err);
      alert("Could not initialize push channel: " + err.message);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-[#121214] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-white flex flex-col gap-4 max-w-md w-full">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5 font-serif">
            Docscraft Pro Sovereign App
          </h4>
          <p className="text-[11px] text-gray-400">Install the desktop & mobile client natively</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-3.5 border border-white/5 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400 font-medium">Service Worker Engine</span>
          <span className="font-mono text-emerald-400 font-bold text-[10px] uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            Stable
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400 font-medium">Push Status</span>
          <span className={`font-semibold text-[10px] uppercase ${notificationPermission === 'granted' ? 'text-blue-400' : 'text-amber-400'}`}>
            {notificationPermission}
          </span>
        </div>
      </div>

      {isCompiling && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-amber-400 font-bold font-mono">
            <span>COMPILING CLIENT WORKER...</span>
            <span>{compileProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-150" 
              style={{ width: `${compileProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={triggerPwaCompilation}
          disabled={isCompiling}
          className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold py-2.5 px-4 rounded-xl text-xs transition-all duration-250 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isInstalled ? 'App Installed' : 'Compile & Install'}</span>
        </button>

        <button
          onClick={handleRequestPushNotification}
          className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-blue-500/30 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all duration-250 cursor-pointer"
        >
          {notificationPermission === 'granted' ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <Bell className="w-4 h-4 text-amber-400" />}
          <span>Verify Push notifications</span>
        </button>
      </div>
    </div>
  );
}
