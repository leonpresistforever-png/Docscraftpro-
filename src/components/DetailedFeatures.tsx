import { ShieldAlert, HardDrive, RefreshCcw, DatabaseZap, Clock, WifiOff } from 'lucide-react';

export function DetailedFeatures() {
  return (
    <section className="py-24 bg-white relative z-10 border-b border-[#E4DBC5]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-20 max-w-4xl mx-auto">
          <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-xs mb-4 block">Core Platform Highlights</span>
          <h2 className="text-4xl md:text-5xl font-black mb-6 uppercase text-[#1a1a1a] tracking-tight">Built to keep your workflow simple and secure.</h2>
          <p className="text-gray-600 font-sans text-lg md:text-xl leading-relaxed">
            We understand how important your documents are. Many platforms rely on third-party integrations that read, collect, or store your private text to train their own systems. We do things differently. Here is how Docscraft Pro protects your privacy while delivering powerful writing, editing, and automation features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          <div className="flex flex-col gap-4 relative">
            <div className="bg-[#FAF9F6] p-4 rounded-2xl w-16 h-16 flex items-center justify-center border border-[#E4DBC5] shadow-sm mb-2">
              <ShieldAlert className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Private Local Built Models</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              We built local models to enhance safety and prevent data leakage. We found that many document websites or apps use language models that access your personal document data and use it for their benefits. To ensure full protection and preserve your user rights, we implemented local models. This means you can use our advanced text generation, editing, and formatting tools safely, entirely powered by local resources on your device. Please note that because they are running directly on your hardware, they might occasionally appear buggy or resource-intensive depending on your system, but they guarantee that your words never leave your screen.
            </p>
          </div>

          <div className="flex flex-col gap-4 relative">
            <div className="bg-[#FAF9F6] p-4 rounded-2xl w-16 h-16 flex items-center justify-center border border-[#E4DBC5] shadow-sm mb-2">
              <WifiOff className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Complete Offline Capability</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              You should be able to write wherever you are. Whether you are on a plane, commuting, or experiencing internet outages, our platform remains completely functional. Your documents are cached locally, allowing you to create new drafts, edit sections, apply fonts, and restructure pages without an active connection. Once you regain access to the internet, everything syncs smoothly and safely in the background to your account without losing a single character.
            </p>
          </div>

          <div className="flex flex-col gap-4 relative">
            <div className="bg-[#FAF9F6] p-4 rounded-2xl w-16 h-16 flex items-center justify-center border border-[#E4DBC5] shadow-sm mb-2">
              <RefreshCcw className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Continuous Automatic Saving</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              Accidentally closing your browser tab or experiencing a power loss shouldn't mean losing your important work. Docscraft Pro continuously saves every keystroke incrementally as you type. Instead of waiting for you to hit a button, our seamless editor engine keeps track of your changes. It builds out a detailed history so you can comfortably jump back in time to retrieve previous versions or review what you wrote earlier in the week.
            </p>
          </div>

          <div className="flex flex-col gap-4 relative">
            <div className="bg-[#FAF9F6] p-4 rounded-2xl w-16 h-16 flex items-center justify-center border border-[#E4DBC5] shadow-sm mb-2">
              <HardDrive className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Simple and Robust Document Handling</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              Importing and exporting your work should not be frustrating. Our platform supports the native handling of files directly into standard folders. Easily add images, craft complex multi-column tables, adjust custom font settings, and apply rich typography to your documents. When you are ready to share your work, generate high-quality PDFs or download zip files that maintain your precise formatting, colors, and layouts across all common devices.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
