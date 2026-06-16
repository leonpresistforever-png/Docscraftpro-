import React, { useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ShieldAlert, Server, Network, Database, Lock, Fingerprint, Eye } from 'lucide-react';

export function SecurityAndInfrastructurePage() {
  useEffect(() => {
    document.title = "Security & Infrastructure - Docscraft Pro";
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1a1a1a] pt-24">
      <Navbar />
      
      <main className="w-full max-w-[1200px] mx-auto px-6 py-20">
        <div className="mb-16">
           <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-8">Security & Infrastructure</h1>
           <p className="text-xl text-gray-600 mb-8 max-w-3xl leading-relaxed">
             At Docscraft Pro, we view security as the foundational layer upon which collaboration is built. Our platform is engineered from the ground up with a zero-trust architecture, robust encryption protocols, and a globally distributed high-availability infrastructure.
           </p>
        </div>

        <section className="mb-20">
            <h2 className="text-3xl font-bold uppercase mb-6 border-b border-gray-200 pb-4">Zero-Trust Architecture & Data Sovereignty</h2>
            <div className="prose max-w-none text-gray-700 leading-loose space-y-6">
               <p>
                 In today's threat landscape, perimeter-based security is insufficient. Docscraft Pro operates on a strict zero-trust model: every request, whether internal or external, must be authenticated, authorized, and continuously validated. Our infrastructure assumes no implicit trust based solely on network location. We utilize multi-factor authentication (MFA), strict session management, and granular Role-Based Access Controls (RBAC) to ensure that only the right individuals possess access to the right data at the right time.
               </p>
               <p>
                 Data sovereignty and isolation are paramount. Every enterprise client operates within a logically segregated architecture, utilizing namespace isolation and robust identity management. We utilize AES-256 encryption at rest across all our primary databases and backup systems, and TLS 1.3 encryption for all data in transit. Key management is handled via dedicated Hardware Security Modules (HSMs), ensuring that cryptographic keys are never exposed in plaintext and are rotated in accordance with strict compliance protocols.
               </p>
               <p>
                 Furthermore, our infrastructure is compliant with the highest global security standards, holding active certifications for SOC 2 Type II, ISO 27001, and HIPAA compliance. We undergo continuous vulnerability scanning, automated dynamic application security testing (DAST), and regular manual penetration testing by elite, independent third-party cybersecurity firms firm to validate our defenses against emerging attack vectors.
               </p>
            </div>
        </section>

        <section className="mb-20 bg-gray-50 border border-gray-200 p-12 rounded-3xl">
           <h2 className="text-3xl font-bold uppercase mb-8">Infrastructure Components</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Server className="text-[#D4AF37]" /> High-Availability Compute Nodes</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Our application logic runs on a globally distributed mesh of stateless compute nodes. Orchestrated via Kubernetes, infrastructure auto-scales dynamically in response to load spikes, guaranteeing 99.99% uptime and zero-disruption deployments.
                 </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Database className="text-[#D4AF37]" /> Resilient Data Persistence</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Mission-critical document data is persisted in a distributed NoSQL datastore with multi-region replication. Point-in-time recovery and continuous immutable snapshotting protect against accidental deletions and ransomware threats.
                 </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Network className="text-[#D4AF37]" /> Global Edge Network (CDN)</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Static assets and read-heavy queries are cached across a vast Content Delivery Network with hundreds of Points of Presence (PoPs) worldwide, minimizing latency to milliseconds regardless of user location.
                 </p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Eye className="text-[#D4AF37]" /> Real-time Audit & Telemetry</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Every system interaction—from user logins to administrative configuration changes—is logged immutably. Detailed audit trails can be exported securely to internal SIEM platforms for real-time monitoring and forensic analysis.
                 </p>
              </div>
           </div>
        </section>

        <section className="mb-20">
           <h2 className="text-3xl font-bold uppercase mb-6 border-b border-gray-200 pb-4">Continuous Monitoring and Incident Response</h2>
           <div className="prose max-w-none text-gray-700 leading-loose space-y-6">
              <p>
                A secure infrastructure requires relentless vigilance. Our dedicated 24/7/365 Security Operations Center (SOC) constantly monitors our network traffic, system endpoints, and application logs for anomalous behavior using advanced AI-driven heuristics. In the event of a detected threat, automated incident response playbooks isolate affected components instantly, preventing lateral movement and ensuring containment before impact.
              </p>
              <p>
                Transparency is a core value in our security philosophy. We operate a public vulnerability disclosure program (Bug Bounty) that invites ethical hackers and security researchers to scrutinize our systems continuously. When an issue is discovered, we commit to rapid triage and remediation, alongside transparent communication with our enterprise clients regarding potential impact and resolution steps. 
              </p>
              <p>
                Choosing Docscraft Pro means partnering with an organization that respects the critical nature of your data. We invest heavily in our defensive posture so that you can focus entirely on growth, innovation, and collaboration. Review our detailed security whitepapers or connect with our specialized compliance engineers to learn how integrating Docscraft Pro can elevate your enterprise's overall security paradigm.
              </p>
           </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
