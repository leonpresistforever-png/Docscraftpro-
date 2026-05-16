import React, { useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Link } from 'react-router-dom';

export function ContactPage() {
  useEffect(() => {
    // Initialize the AssistLoop widget when the page loads
    const scriptId = 'assistloop-script-dedicated';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://assistloop.ai/assistloop-widget.js';
      script.async = true;
      script.onload = () => {
        if ((window as any).AssistLoopWidget && (window as any).AssistLoopWidget.init) {
          (window as any).AssistLoopWidget.init({
            agentId: import.meta.env.VITE_ASSISTLOOP_AGENT_ID || 'dummy-agent-id',
          });
          // Auto-open on this dedicated page
          setTimeout(() => {
            if ((window as any).AssistLoopWidget.open) {
              (window as any).AssistLoopWidget.open();
            }
          }, 500);
        }
      };
      document.body.appendChild(script);
    } else {
      if ((window as any).AssistLoopWidget && (window as any).AssistLoopWidget.open) {
        (window as any).AssistLoopWidget.open();
      }
    }
    
    return () => {
      // Optional cleanup if navigating away, though might want to keep it
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#2D2D2D] selection:bg-[#D4AF37] selection:text-white flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-6">
          Support Center
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          We're here to help! Our dedicated Assistant should pop up shortly to assist you. 
          If you don't see it, you can click the chat icon in the corner.
        </p>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#EAE6DF] max-w-xl w-full">
          <h2 className="text-2xl font-semibold mb-4">Still not satisfied?</h2>
          <p className="text-gray-600 mb-6">
            If our AI agent wasn't able to fully resolve your issue, you can escalate it directly to our human support team.
          </p>
          <Link 
            to="/support-form" 
            className="inline-flex items-center justify-center bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Fill a Support Form
          </Link>
        </div>
      </div>
    </div>
  );
}
