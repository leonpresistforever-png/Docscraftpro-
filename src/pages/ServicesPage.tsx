import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CheckCircle2, ArrowRight, ShieldCheck, Mail, FileText, Zap } from 'lucide-react';

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

        {/* Social Proof */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 font-serif mb-4">Trusted by Industry Leaders</h2>
            <p className="text-gray-600">See what our clients have to say about their experience.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex gap-1 text-amber-400 mb-4">
                {"★★★★★"}
              </div>
              <p className="text-gray-700 italic mb-6">"Implementation was seamless. We cut our document processing time by 40% in the first quarter alone."</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Sarah Jenkins</h4>
                  <p className="text-xs text-gray-500">Director of Operations, FinTech Global</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex gap-1 text-amber-400 mb-4">
                {"★★★★★"}
              </div>
              <p className="text-gray-700 italic mb-6">"The only platform that successfully mapped our complex compliant workflows without writing custom code."</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Marcus Wright</h4>
                  <p className="text-xs text-gray-500">CTO, HealthSecure Partners</p>
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
