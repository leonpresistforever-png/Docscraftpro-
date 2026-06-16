import React, { useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Brain, Cpu, Wand2, RefreshCw, BarChart3, Binary, LockKeyhole } from 'lucide-react';

export function AiDocumentAutomationPage() {
  useEffect(() => {
    document.title = "AI Document Automation - Docscraft Pro";
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1a1a1a] pt-24">
      <Navbar />
      
      <main className="w-full max-w-[1200px] mx-auto px-6 py-20">
        <div className="mb-16">
           <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-8">AI Document Automation</h1>
           <p className="text-xl text-gray-600 mb-8 max-w-3xl leading-relaxed">
             Transform your static knowledge repositories into dynamic, intelligent agents. Docscraft Pro’s AI Document Automation suite employs state-of-the-art Large Language Models (LLMs) to streamline content creation, extraction, and synthesis natively within your workspace.
           </p>
        </div>

        <section className="mb-20">
            <h2 className="text-3xl font-bold uppercase mb-6 border-b border-gray-200 pb-4">The Next Paradigm of Content Engineering</h2>
            <div className="prose max-w-none text-gray-700 leading-loose space-y-6">
               <p>
                 Traditional document editors are passive tools—they require constant manual input and maintenance. Docscraft Pro shifts this paradigm by integrating AI directly into the document structure. Our platform does not simply add a chat sidebar; it weaves intelligence into the very fabric of your editing experience. The underlying engine utilizes sophisticated Retrieval-Augmented Generation (RAG) pipelines, converting your entire workspace into a high-dimensional vector space.
               </p>
               <p>
                 When you initiate an automated drafting sequence, the AI does not hallucinate from public data. Instead, it queries the secure vector index of your proprietary documents, synthesizing contextually accurate drafts that adhere to your internal style guides and technical specificities. Whether you are generating comprehensive project proposals, summarizing dense legal rulings, or translating engineering requirements into customer-facing documentation, the automation suite significantly reduces time-to-market.
               </p>
               <p>
                 Crucially, all AI processing within Docscraft Pro operates under strict data sovereignty rules. We deploy tenant-isolated models. This means your data is processed dynamically but never stored by external models, never utilized for public training, and always protected by our zero-trust architecture. You maintain full ownership and control over both your inputs and the generated intellect.
               </p>
            </div>
        </section>

        <section className="mb-20 bg-[#1a1a1a] text-white p-12 rounded-3xl shadow-xl">
           <h2 className="text-3xl font-bold uppercase mb-8">Automation Features</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-gray-800 p-6 rounded-2xl bg-[#222]">
                 <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Wand2 className="text-[#D4AF37]" /> Semantic Autocomplete</h3>
                 <p className="text-gray-400 leading-relaxed">
                   As you type, our models predict not just the next word, but the next logical paragraph based on the overarching document context and historical data patterns within your workspace.
                 </p>
              </div>
              <div className="border border-gray-800 p-6 rounded-2xl bg-[#222]">
                 <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><Binary className="text-[#D4AF37]" /> Structured Data Extraction</h3>
                 <p className="text-gray-400 leading-relaxed">
                   Upload complex unstructured files, and our AI will automatically parse, classify, and extract key variables—such as names, dates, and financial figures—into structured, exportable datasets.
                 </p>
              </div>
              <div className="border border-gray-800 p-6 rounded-2xl bg-[#222]">
                 <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><RefreshCw className="text-[#D4AF37]" /> Dynamic Templating</h3>
                 <p className="text-gray-400 leading-relaxed">
                   Build templates that ask intelligent questions. Based on user inputs, the AI automatically drafts custom sections, applies relevant clauses, and formats the output professionally.
                 </p>
              </div>
              <div className="border border-gray-800 p-6 rounded-2xl bg-[#222]">
                 <h3 className="text-xl font-bold mb-3 flex items-center gap-2"><LockKeyhole className="text-[#D4AF37]" /> Content Moderation & Compliance</h3>
                 <p className="text-gray-400 leading-relaxed">
                   Configure automated background checks that scan outbound documents for sensitive information (PII, financial data), ensuring real-time compliance with internal policies and external regulations.
                 </p>
              </div>
           </div>
        </section>

        <section className="mb-20">
           <h2 className="text-3xl font-bold uppercase mb-6 border-b border-gray-200 pb-4">Implementing AI Strategies at Scale</h2>
           <div className="prose max-w-none text-gray-700 leading-loose space-y-6">
              <p>
                Successfully adopting AI requires more than just access to powerful models; it requires a strategic framework. Docscraft Pro provides extensive command-line interfaces, REST APIs, and webhook triggers to embed our document automation capabilities directly into your CI/CD pipelines or CRM platforms. Imagine a scenario where a closed sales opportunity automatically triggers the generation of a personalized Welcome Package and standardized onboarding documentation, completely devoid of manual intervention.
              </p>
              <p>
                Our comprehensive analytics dashboard offers deep visibility into how AI is being utilized across your organization. Monitor token usage, track the acceptance rate of automated suggestions, and identify bottlenecks in your documentation workflows. Armed with these insights, administrative teams can iteratively refine their templates, update the prompt libraries, and optimize overall operational efficiency. 
              </p>
              <p>
                Embrace the future of work by integrating Docscraft Pro’s AI Document Automation. We continuously evaluate and incorporate the latest advancements in natural language processing and multimodal AI, ensuring that your organization remains at the technological forefront. Let the machine handle the repetitive drafting, so your human talent can focus on deep critical thinking and creative problem-solving.
              </p>
           </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
