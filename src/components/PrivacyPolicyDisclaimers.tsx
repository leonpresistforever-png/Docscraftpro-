import React, { useState } from 'react';
import { Scale, ShieldAlert, AlertCircle, FileSpreadsheet, ChevronDown, ChevronUp, Landmark, HelpCircle } from 'lucide-react';

export default function PrivacyPolicyDisclaimers() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div id="legal-disclaimers-root" className="bg-stone-950 text-stone-100 rounded-3xl border border-stone-800 p-6 md:p-8 shadow-2xl relative overflow-hidden my-8 font-sans">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#D4AF37] via-amber-600 to-[#D4AF37]"></div>
      
      {/* Header section with status badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">
            <Scale className="w-3 h-3" /> Core Legal Declarations
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white font-serif">
            Corporate Liability & Jurisdictional Disclosures
          </h2>
          <p className="text-xs text-stone-400 mt-1 font-medium">
            Section 11, 12, & Statutory Clauses &amp; Legally Binding Integration
          </p>
        </div>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-850 rounded-xl border border-stone-800 text-xs font-bold text-stone-300 hover:text-stone-100 flex items-center gap-2 transition-colors self-start md:self-center select-none"
        >
          {isExpanded ? (
            <>Collapse Sections <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>Expand Sections <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      </div>

      {isExpandableContent(isExpanded)}
    </div>
  );
}

function isExpandableContent(isExpanded: boolean) {
  if (!isExpanded) {
    return (
      <div className="text-center py-4 bg-stone-900/50 rounded-2xl border border-stone-800/60 p-4">
        <p className="text-xs text-stone-400">
          Core disclosures collapsed. Click the toggle button to inspect Section 11, 12, and statutory binding clauses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in text-stone-300 text-sm leading-relaxed">
      
      {/* Section 11: Limitation of Liability */}
      <section className="bg-stone-900/60 rounded-2xl border border-stone-850 p-5 md:p-6 transition-all duration-300">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-950/40 text-red-400 flex items-center justify-center border border-red-900/30 shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <span className="text-amber-500 font-mono text-xs">11.</span> Limitation of Liability for Data Incidents
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              While we implement industry-standard security measures and native browser memory isolation, we cannot guarantee absolute protection against all conceivable security threats. To the maximum extent permitted by applicable law, Docscraft's liability for any data incidents, unauthorized leakage, cached coordinate exposure, or security events is strictly limited to direct, actual damages proven in the competent court. 
            </p>
            <p className="text-xs text-stone-300 leading-relaxed font-semibold italic border-l-2 border-red-500 pl-4 py-1">
              "Under no circumstances shall Docscraft, its developers, parent affiliates, or infrastructure partners be liable for indirect, incidental, consequential, special, punitive, or exemplary damages, including but not limited to loss of profits, data downtime, client-side registry failures, or goodwill loss, even if advised beforehand of their potential occurrence."
            </p>
            <p className="text-xs text-stone-400">
              This limitation explicitly does not apply where prohibited by law, including in cases of gross negligence, conscious bad faith, or willful misconduct by our direct software architects.
            </p>
          </div>
        </div>
      </section>

      {/* Section 12: Governing Law */}
      <section className="bg-stone-900/60 rounded-2xl border border-stone-850 p-5 md:p-6 transition-all">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-950/40 text-amber-500 flex items-center justify-center border border-amber-900/30 shrink-0 mt-0.5">
            <Landmark className="w-4 h-4" />
          </div>
          <div className="space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white">
              <span className="text-amber-500 font-mono text-xs">12.</span> Governing Law and Forum Selection
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              These policy declarations, service agreements, and all companion digital rights shall be governed by, construed, and enforced in complete accordance with the laws of the main sovereign jurisdiction of operation, without giving effect to any principles of conflicts of law. 
            </p>
            <p className="text-xs text-stone-400">
              Any dispute, controversy, or litigation arising directly from or related into these terms or your use of local WebGPU structures shall be submitted exclusively to the competent municipal courts within this region. You hereby consent and submit to the personal jurisdiction and venue of such courts for the purposes of litigating any such action.
            </p>
          </div>
        </div>
      </section>

      {/* Section 13: Cross-Border Transfers */}
      <section className="bg-stone-900/60 rounded-2xl border border-stone-850 p-5 md:p-6 transition-all">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-950/40 text-zinc-400 flex items-center justify-center border border-zinc-800/30 shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4 text-stone-400" />
          </div>
          <div className="space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white">
              <span className="text-amber-500 font-mono text-xs">13.</span> Sovereignty and Cross-Border Transfers
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              For users operating inside specific regulatory regions (including the EU, UK, and East Asian treaty states), we route core account authorizations through standard regional nodes. However, because our platforms are built on client-centered systems, your raw draft computations (including mathematical code evaluations and frame layouts) remain entirely localized within your immediate system storage cache. No raw physical transfers of file databases take place, enforcing complete digital sovereignty.
            </p>
          </div>
        </div>
      </section>

      {/* Section 14: Force Majeure */}
      <section className="bg-stone-900/60 rounded-2xl border border-stone-850 p-5 md:p-6 transition-all">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-950/40 text-stone-400 flex items-center justify-center border border-zinc-800/30 shrink-0 mt-0.5">
            <FileSpreadsheet className="w-4 h-4 text-stone-400" />
          </div>
          <div className="space-y-3">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white">
              <span className="text-amber-500 font-mono text-xs">14.</span> Force Majeure and Hosting Disruptions
            </h3>
            <p className="text-xs text-stone-300 leading-relaxed">
              We shall not be liable or deemed in default for any delay, browser freeze, server downtime, package resolver timeout, or database sync failure resulting from acts or causes beyond our reasonable control. This includes hardware grid failures, cloud ingress router drops, extreme latency anomalies, cosmic radiation flip bit disruptions, or any state-wide web outages.
            </p>
          </div>
        </div>
      </section>

      {/* Callout box on compliance */}
      <div className="bg-amber-50/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-stone-300 text-xs items-start">
        <HelpCircle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white mb-0.5 block uppercase tracking-wider">Consent Binding Acknowledgment</span>
          By executing calculations, registering database models, or building document grids inside Docscraft, you explicitly consent to the liability bounds and forum exclusions defined under these provisions.
        </div>
      </div>

    </div>
  );
}
