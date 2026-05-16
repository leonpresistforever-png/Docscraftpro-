import { useEffect } from 'react';

declare global {
  interface Window {
    AssistLoopWidget?: any;
  }
}

export function AssistLoopScript() {
  useEffect(() => {
    // Only load if not already loaded
    if (document.getElementById('assistloop-script')) return;

    const script = document.createElement('script');
    script.id = 'assistloop-script';
    script.src = 'https://assistloop.ai/assistloop-widget.js';
    script.async = true;
    script.onload = () => {
      if (window.AssistLoopWidget && window.AssistLoopWidget.init) {
        window.AssistLoopWidget.init({
          agentId: import.meta.env.VITE_ASSISTLOOP_AGENT_ID || import.meta.env.NEXT_PUBLIC_ASSISTLOOP_AGENT_ID || 'dummy-agent-id',
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      // Optional cleanup if necessary
    };
  }, []);

  return null;
}
