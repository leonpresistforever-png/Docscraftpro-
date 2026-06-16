import React, { useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CheckCircle, Shield, Zap, Globe, FileText, Blocks, Building2 } from 'lucide-react';
import { motion } from 'motion/react';

export function EnterprisePlatformPage() {
  useEffect(() => {
    document.title = "Enterprise Platform - Docscraft Pro";
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1a1a1a] pt-24">
      <Navbar />
      
      <main className="w-full max-w-[1200px] mx-auto px-6 py-20">
        <div className="mb-16">
           <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-8">Enterprise Platform</h1>
           <p className="text-xl text-gray-600 mb-8 max-w-3xl leading-relaxed">
             Docscraft Pro provides an enterprise-grade document engineering platform designed to scale across complex organizational structures. Our systems offer reliable document creation, secure vault storage, and intelligent AI augmentation for teams that require compliance, velocity, and uncompromising quality.
           </p>
        </div>

        <section className="mb-20">
            <h2 className="text-3xl font-bold uppercase mb-6 border-b border-gray-200 pb-4">Built for Collaboration and Security</h2>
            <div className="prose max-w-none text-gray-700 leading-loose space-y-6">
               <p>
                 In the modern digital workspace, organizations are burdened with fragmented knowledge silos, slow collaboration cycles, and disconnected tools. Docscraft Pro’s Enterprise Platform bridges these gaps by offering a unified ecosystem that integrates seamlessly with your team's workflow. We ensure that your team can collaborate on a single document smoothly, without interrupting each other or losing work. Every keystroke is saved immediately and synchronized globally, ensuring smooth editing regardless of geographic location.
               </p>
               <p>
                 Security is not an afterthought; it is foundational to our approach. Our platform encrypts your documents completely to keep your work safe. Each enterprise account is securely isolated so your proprietary data—whether legal contracts, system architecture blueprints, or financial reports—remains entirely yours. We comply with major data protection standards ensuring that your private information is handled responsibly and securely at all times.
               </p>
               <p>
                 Furthermore, our intelligent AI features are designed to empower, not replace, human expertise. Our writing tools work privately for your organization, helping your teams draft documents faster and maintain consistency across all communications. The AI assistant acts as a tireless co-pilot, surfacing relevant information exactly when it is needed, thereby drastically reducing the time spent searching for past documents.
               </p>
            </div>
        </section>

        <section className="mb-20 bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
           <h2 className="text-3xl font-bold uppercase mb-8">Core Enterprise Capabilities</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                 <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Blocks className="text-[#D4AF37]" /> Flexible Document Blocks</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Documents in Docscraft Pro are built from independent pieces—paragraphs, lists, charts, and diagrams. Simply drag and drop to organize your writing exactly how you want it, making complex formatting easy.
                 </p>
              </div>
              <div>
                 <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Globe className="text-[#D4AF37]" /> Smooth Team Collaboration</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Work together in real-time with teams across the globe. Our platform feels fast and responsive even on slow internet connections, ensuring you always see exactly what your colleagues are typing.
                 </p>
              </div>
              <div>
                 <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Shield className="text-[#D4AF37]" /> Advanced Rights Management</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Keep strict control over who can see or edit your work. Easily manage permissions for your team so that sensitive documents remain safe while public files can be shared widely.
                 </p>
              </div>
              <div>
                 <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Building2 className="text-[#D4AF37]" /> Seamless Team Login</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Let your team log in securely using the accounts they already have. We support standard login methods, taking the headache out of managing passwords and getting new hires started.
                 </p>
              </div>
           </div>
        </section>

        <section className="mb-20">
           <h2 className="text-3xl font-bold uppercase mb-6 border-b border-gray-200 pb-4">A Commitment to Uncompromising Quality</h2>
           <div className="prose max-w-none text-gray-700 leading-loose space-y-6">
              <p>
                We recognize that for enterprises, a document is more than just text—it is a binding agreement, a technical specification, or a critical business plan. Therefore, our rendering engine guarantees that what you see on the screen is exactly what you get when printed. Our PDF export respects your formatting perfectly to create highly professional final copies.
              </p>
              <p>
                Transitioning to Docscraft Pro is a smooth and guided experience. Our team works alongside you to bring over your existing documents with high fidelity while keeping everything organized. We provide dedicated support channels to ensure your team has everything they need to start producing incredible work on day one.
              </p>
              <p>
                As your organization evolves, Docscraft Pro evolves with it. Our platform isn't just a tool; it's a new standard for how your team creates and shares knowledge. By removing the frustrating hurdles of typical document software, we free up your time to focus on doing your best, most creative work.
              </p>
           </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
