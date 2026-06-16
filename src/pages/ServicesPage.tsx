import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CheckCircle2, ArrowRight, ShieldCheck, Mail, FileText, Zap, Database } from 'lucide-react';

export function ServicesPage() {
  const services = [
    {
      title: "Real-time AI Document Processing",
      description: "Convert, edit, and analyze unstructured documents in seconds.",
      icon: <FileText className="w-6 h-6 text-[#D4AF37]" />,
      benefits: [
        "Eliminate manual data entry",
        "Extract critical information accurately",
        "Export to multiple formats seamlessly"
      ]
    },
    {
      title: "Enterprise Data Governance",
      description: "Secure workspace environments with HIPAA & SOC2 compliance standards.",
      icon: <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />,
      benefits: [
        "End-to-end encryption",
        "Role-based access controls",
        "Automated compliance reporting"
      ]
    },
    {
      title: "Automated Workflow Logic",
      description: "Build custom logic mappers to route your documents to the right teams.",
      icon: <Zap className="w-6 h-6 text-[#D4AF37]" />,
      benefits: [
        "Reduce operational bottlenecks",
        "Visual drag-and-drop builder",
        "Real-time notifications & alerts"
      ]
    }
  ];

  const processSteps = [
    { step: "1", title: "Consultation", desc: "We evaluate your current document workflows and bottlenecks." },
    { step: "2", title: "Strategy", desc: "We design a custom implementation plan integrating our AI tools." },
    { step: "3", title: "Execution", desc: "Seamless deployment with full team onboarding and support." },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 pt-24 flex flex-col selection:bg-[#D4AF37] selection:text-white">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-20">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 font-serif tracking-tight mb-6">
            Intelligent Solutions for Modern Teams
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            Transform how your organization handles documents. Our suite of AI-powered services streamlines editing, validation, and analytics so you can focus on what matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/contact" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#333] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm">
              Get a Quote
            </Link>
            <Link to="/features" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-400 text-gray-800 px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm">
              View Products
            </Link>
          </div>
        </motion.div>

        {/* Problem/Solution Breakdown */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {services.map((service, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-start"
            >
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">
                {service.description}
              </p>
              <ul className="space-y-3 w-full border-t border-gray-100 pt-6">
                {service.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-tight">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Process Overview */}
        <div className="mb-24 bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 font-serif mb-4">How It Works</h2>
            <p className="text-gray-600">A transparent, three-step journey to operational excellence.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-px border-t-2 border-dashed border-gray-300 z-0" />
            
            {processSteps.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-full border-4 border-gray-50 shadow-md flex items-center justify-center text-2xl font-black text-[#D4AF37] mb-6">
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Infrastructure Breakdown */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 font-serif mb-4">Under The Hood: Document Reliability</h2>
            <p className="text-gray-600">Built securely and thoughtfully to make your writing process safe and reliable.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-8 h-8 text-emerald-600" />
                <h3 className="text-xl font-bold text-gray-900">Safe Document Storage</h3>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">Your work is incredibly important. That’s why we securely encrypt your files when they are stored in the cloud. We make sure that your content is locked away from prying eyes so only you, and who you authorize, can read it.</p>
              <ul className="space-y-3">
                 <li className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Strong data encryption techniques</li>
                 <li className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Automatic routine backups</li>
                 <li className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Safe document processing</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-8 h-8 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">Easy Account Access</h3>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">We ensure you stay in complete control of your account. Access your workspace quickly and securely using standard sign-in providers you already trust, preventing unauthorized changes.</p>
               <ul className="space-y-3">
                 <li className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Easy sign-in with Google or Microsoft</li>
                 <li className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Extra security for important actions</li>
                 <li className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Team member management features</li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm md:col-span-2 flex flex-col md:flex-row gap-8 items-center border-t-4 border-t-[#D4AF37]">
              <div className="flex-1">
                 <h3 className="text-xl font-bold text-gray-900 mb-2">Steady Offline Connections</h3>
                 <p className="text-gray-600 text-sm leading-relaxed">If your internet connection drops suddenly or runs extremely slow, you won't lose your work. Your writing is caught immediately and saved to your device. Once your internet returns, your pages quietly sync with our secure cloud automatically.</p>
              </div>
              <div className="shrink-0 flex items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex gap-4">
                      <div className="w-16 h-16 rounded shadow flex flex-col items-center justify-center bg-white border border-gray-200">
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DEVICE</span>
                         <span className="text-emerald-500 font-bold mt-1 text-sm">SAVED</span>
                      </div>
                      <ArrowRight className="w-6 h-6 text-gray-300 self-center" />
                      <div className="w-16 h-16 rounded shadow flex flex-col items-center justify-center bg-white border border-gray-200">
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CLOUD</span>
                         <span className="text-blue-500 font-bold mt-1 text-sm">SYNCED</span>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-24 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 font-serif mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Common questions about our services and process.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">How long does implementation take?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Typical deployment ranges from 2-4 weeks depending on your current infrastructure and custom logic requirements. We prioritize zero downtime during transition.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Is pricing custom per enterprise?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Yes. After our initial consultation, we provide a customized pricing model based on seat count, storage requirements, and requested integrations.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">Do you provide ongoing support?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Absolutely. Every enterprise plan includes a dedicated technical account manager and 24/7 priority support desk to ensure smooth operations.</p>
            </div>
          </div>
        </div>

        {/* Clean ending for Services Page */}
        <div className="max-w-3xl mx-auto mb-20 text-center">
            <h2 className="text-3xl font-black text-gray-900 font-serif mb-6">Ready to upgrade your workflow?</h2>
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#C5A038] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm">
              Contact our Sales Team <ArrowRight className="w-4 h-4" />
            </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
