import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Sparkles, CheckCircle2, ShieldCheck, Bug, Laptop, PlusCircle, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

export function ChangelogPage() {
  const releases = [
    {
      version: 'v2.4.0 (Current Run)',
      date: 'June 2026',
      title: 'Google Workspace Sync & Unified Cloud Importer',
      description: 'An advanced cloud engineering release introducing real-time secure connections to Google Drive and dynamic Google Web Picker imports.',
      badges: ['Google Drive', 'Picker API', 'Import/Export'],
      changes: [
        { type: 'feature', desc: 'Google Workspace Cloud Storage component: Mount custom target backup directories (e.g., "Docscraft-Backups") and instantly transfer secure drafts.' },
        { type: 'feature', desc: 'Google Picker API client: Interactive files browser overlay enabling on-the-fly imports of external PDF, markdown, and doc streams into sandboxed local databases.' },
        { type: 'enhancement', desc: 'Upgraded Google OAuth Provider to declare unified picker, drive.file, and drive.readonly scope profiles safely side-by-side.' },
        { type: 'ux', desc: 'Added a direct dropdown selector within the Integrations control deck showing all matching local offline drafts available for transit.' }
      ]
    },
    {
      version: 'v2.3.8',
      date: 'June 2026',
      title: 'Digital Consent anchoring & Secure Policy Registry',
      description: 'Strengthened system compliance in alignment with GDPR and Google Limited Use safety guidelines.',
      badges: ['GDPR', 'Compliance', 'Security'],
      changes: [
        { type: 'security', desc: 'Added a fully interactive Accept and Consent Checklist directly on the Privacy policies page to record legal approvals of Workspace guidelines.' },
        { type: 'feature', desc: 'Consent Anchor and Signature Receipts: Input legal names or initials to print stamped digital compliance receipts with cryptographic UUID values stored locally.' },
        { type: 'ux', desc: 'Designed custom responsive toggle inputs allowing subscribers to revoke previous local consent profiles at will.' }
      ]
    },
    {
      version: 'v2.3.6',
      date: 'May 2026',
      title: 'Dynamic Ticket Attachment gateway',
      description: 'Replaced plain email mailto links with a secure internal file-broker and drag-and-drop support form queues.',
      badges: ['Ticketing', 'File Uploads', 'UX'],
      changes: [
        { type: 'feature', desc: 'Dynamic drag-and-drop files container in Support Tickets: Easily drop pictures, PDFs, and .docx files directly onto custom dashed dropzones.' },
        { type: 'enhancement', desc: 'Firestore Attachment Serializer: Compiles dropped files as encoded Base64 Data URL packages inside persistent backup logs.' },
        { type: 'ux', desc: 'Created an attachments queue interface displaying file size badges (up to 2.5MB target thresholds) and prompt deletion handles.' },
        { type: 'fix', desc: 'Removed public docscraftpro direct support emails from the Contact grid, eliminating spam while driving traffic to the structured portal.' }
      ]
    },
    {
      version: 'v2.3.2',
      date: 'May 2026',
      title: 'Routing Alignment & Navigation Correction',
      description: 'Resolved a routing error in the offline archives page to restore document restoration utilities.',
      badges: ['Hotfix', 'Performance'],
      changes: [
        { type: 'fix', desc: 'Mapped SavedArchive list-item clicks to point to `/doc/:id` instead of the legacy `/editor/:id` route, eliminating 404 loading exceptions.' },
        { type: 'enhancement', desc: 'Integrated encryption fallbacks in our IndexedDB loader to support loading decrypted text without corrupting secure client caches.' }
      ]
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item: any = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 pt-24 flex flex-col justify-between">
      <Navbar />
      
      <main className="w-full max-w-[900px] mx-auto px-6 py-12 flex-1">
        <motion.div initial="hidden" animate="show" variants={container} className="space-y-8">
          
          <motion.div variants={item} className="border-b border-gray-200 pb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black tracking-wider uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Release Center
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900 font-sans">
              System Logs & Changelog
            </h1>
            <p className="text-sm text-gray-500 mt-2 max-w-[650px] leading-relaxed">
              Durable audit trails tracking all core performance updates, compliance additions, secure Workspace connections, and bug resolutions rolled out inside Docscraft Pro.
            </p>
          </motion.div>

          <div className="space-y-12">
            {releases.map((release, rIdx) => (
              <motion.div key={rIdx} variants={item} className="relative pl-8 border-l-2 border-stone-200 space-y-4">
                {/* Visual anchor point */}
                <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-[#D4AF37] border-2 border-white shadow-sm"></div>
                
                {/* Release Header */}
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-mono font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      {release.version}
                    </span>
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {release.date}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                    {release.title}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {release.description}
                  </p>
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap gap-1.5">
                  {release.badges.map((b, bIdx) => (
                    <span key={bIdx} className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-600">
                      {b}
                    </span>
                  ))}
                </div>

                {/* Sub-changes listing */}
                <div className="bg-white border border-stone-200 rounded-2xl p-4 md:p-5 space-y-3">
                  {release.changes.map((change, cIdx) => (
                    <div key={cIdx} className="flex items-start gap-2.5 text-xs">
                      {change.type === 'feature' && (
                        <span className="shrink-0 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 border border-blue-150 text-blue-700 mt-0.5">
                          add
                        </span>
                      )}
                      {change.type === 'security' && (
                        <span className="shrink-0 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 border border-amber-150 text-amber-700 mt-0.5">
                          safe
                        </span>
                      )}
                      {change.type === 'fix' && (
                        <span className="shrink-0 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-50 border border-red-150 text-red-700 mt-0.5">
                          fix
                        </span>
                      )}
                      {change.type === 'enhancement' && (
                        <span className="shrink-0 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-150 text-indigo-700 mt-0.5">
                          tune
                        </span>
                      )}
                      {change.type === 'ux' && (
                        <span className="shrink-0 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-150 text-emerald-700 mt-0.5">
                          ease
                        </span>
                      )}
                      <p className="text-gray-650 leading-relaxed font-sans">{change.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
