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
            <h2 className="text-3xl font-bold uppercase mb-6 border-b border-gray-200 pb-4">Architected for Scale and Security</h2>
            <div className="prose max-w-none text-gray-700 leading-loose space-y-6">
               <p>
                 In the modern digital workspace, organizations are burdened with fragmented knowledge silos, slow collaboration cycles, and disconnected tools. Docscraft Pro’s Enterprise Platform bridges these gaps by offering a unified ecosystem that integrates seamlessly with your existing infrastructure. By leveraging cutting-edge Conflict-free Replicated Data Types (CRDTs), we ensure that thousands of simultaneous users can collaborate on a single document without collision, latency, or data loss. Every keystroke is synchronized globally through our distributed edge network, ensuring sub-millisecond latency regardless of geographic location.
               </p>
               <p>
                 Security is not an afterthought; it is foundational to our architecture. Our platform employs End-to-End Encryption (E2EE) at rest and in transit, utilizing AES-256 standards. Each enterprise tenant is isolated within a dedicated Virtual Private Cloud (VPC), ensuring that your proprietary data—whether legal contracts, system architecture blueprints, or financial reports—never bleeds across boundaries. We are fully compliant with GDPR, SOC 2 Type II, and HIPAA regulations, undergoing regular penetration testing and third-party audits to maintain our robust defensive posture.
               </p>
               <p>
                 Furthermore, our intelligent AI augmentation is designed to empower, not replace, human expertise. Our private language models are trained exclusively on your organization's internal knowledge base, operating within a secure sandbox that guarantees your data is never used to train public instances. This allows teams to automate repetitive drafting tasks, extract actionable insights from vast document repositories, and maintain brand voice consistency across all outbound communications. The AI assistant acts as a tireless co-pilot, surfacing relevant information exactly when it is needed, thereby drastically reducing the time spent searching for legacy data.
               </p>
            </div>
        </section>

        <section className="mb-20 bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
           <h2 className="text-3xl font-bold uppercase mb-8">Core Enterprise Capabilities</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                 <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Blocks className="text-[#D4AF37]" /> Modular Document Architecture</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Documents in Docscraft Pro are built from independent blocks—paragraphs, lists, charts, and diagrams. Each block is a discrete node in a graph, allowing for programmatic manipulation, dynamic updates, and complex nested structures that adapt to your workflow.
                 </p>
              </div>
              <div>
                 <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Globe className="text-[#D4AF37]" /> Global Edge Synchronization</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Collaborate in real-time with teams across the globe. Our edge computing network distributes document states to servers nearest to the user, minimizing latency and providing a 'local-first' feel even on unstable internet connections.
                 </p>
              </div>
              <div>
                 <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Shield className="text-[#D4AF37]" /> Advanced Rights Management</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Implement granular Access Control Lists (ACLs) and Role-Based Access Control (RBAC). Restrict editing, viewing, or printing at the document, folder, or even block level. Establish secure, read-only auditor views for compliance reviews.
                 </p>
              </div>
              <div>
                 <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Building2 className="text-[#D4AF37]" /> Seamless Active Directory Integration</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Integrate seamlessly with your existing Identity Providers (IdP) via SAML 2.0 or OIDC. Support for Okta, Azure AD, and Google Workspace ensures standardized identity management and streamlined onboarding/offboarding processes.
                 </p>
              </div>
           </div>
        </section>

        <section className="mb-20">
           <h2 className="text-3xl font-bold uppercase mb-6 border-b border-gray-200 pb-4">A Commitment to Uncompromising Quality</h2>
           <div className="prose max-w-none text-gray-700 leading-loose space-y-6">
              <p>
                We recognize that for enterprises, a document is more than just text—it is a binding agreement, a technical specification, or a critical business plan. Therefore, our rendering engine guarantees pixel-perfect fidelity across screen and print mediums. Our PDF export pipeline resolves complex typography, SVGs, and embedded content natively, ensuring that the final output matches exactly what you see in the editor.
              </p>
              <p>
                Transitioning to Docscraft Pro is a meticulously managed process. Our dedicated Customer Success Engineers work alongside your IT department to orchestrate zero-downtime migrations, importing legacy document formats (DOCX, PDF, Markdown) with high fidelity while preserving metadata and historical context. We offer custom SLA agreements guaranteeing 99.99% uptime, 24/7 dedicated support channels, and rapid incident response protocols.
              </p>
              <p>
                As your organization evolves, Docscraft Pro evolves with it. Our extensible API surface allows your internal engineering teams to build custom integrations, automate document lifecycles, and connect Docscraft Pro to ERP, CRM, and bespoke internal systems. The platform is not just a tool; it is a foundational layer for your organization's digital nervous system. By eliminating friction in knowledge creation and sharing, we empower your teams to focus on high-impact strategic initiatives rather than administrative overhead. Start your enterprise transformation today with Docscraft Pro.
              </p>
           </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
