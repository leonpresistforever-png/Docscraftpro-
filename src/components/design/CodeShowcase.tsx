import React from 'react';

/** Soft, modern code preview — not a harsh terminal window. */
export function CodeShowcase() {
  return (
    <div className="rounded-2xl border border-[#E8DFC8] bg-gradient-to-br from-[#FDFBF7] to-white shadow-[0_20px_50px_-20px_rgba(26,26,26,0.12)] overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[#F0E9DA] bg-white/80">
        <div className="w-2.5 h-2.5 rounded-full bg-rose-300" />
        <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
        <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">API Example</span>
      </div>
      <pre className="p-6 text-[13px] leading-relaxed overflow-x-auto text-stone-700 font-mono bg-[#FDFBF7]">
        <code>
          <span className="text-violet-600">const</span> doc = <span className="text-violet-600">await</span> Nexus.<span className="text-sky-600">createDocument</span>({'{'}{'\n'}
          {'  '}title: <span className="text-emerald-600">'Project Orion Requirements'</span>,{'\n'}
          {'  '}workspaceId: <span className="text-emerald-600">'wksp_09xjf'</span>,{'\n'}
          {'  '}blocks: [{'\n'}
          {'    '}{'{'}{' '}type: <span className="text-emerald-600">'h1'</span>, content: <span className="text-emerald-600">'Overview'</span> {'}'}{'\n'}
          {'  '}]{'\n'}
          {'}'});{'\n\n'}
          <span className="text-stone-400">// Real-time sync handles collaboration</span>{'\n'}
          <span className="text-violet-600">await</span> doc.<span className="text-sky-600">publish</span>();
        </code>
      </pre>
    </div>
  );
}

/** Inline snippet for feature cards — warm tinted, not black terminal. */
export function InlineCodeSnippet() {
  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-4 mt-auto shadow-inner">
      <div className="text-[11px] leading-relaxed text-stone-700 font-mono">
        <div><span className="text-violet-600">const</span> <span className="text-sky-700">generate</span> = () =&gt; {'{'}</div>
        <div className="pl-3">return <span className="text-emerald-600">&quot;Perfection&quot;</span>;</div>
        <div>{'}'}</div>
      </div>
    </div>
  );
}
