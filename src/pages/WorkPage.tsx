import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { motion } from 'motion/react';
import { Bot, Code2, Server, Cpu, Database, Network } from 'lucide-react';

export function WorkPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-indigo-600 selection:text-white">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-16 text-center">
            <span className="bg-amber-100 text-amber-800 text-sm font-bold px-4 py-1.5 rounded-full inline-block mb-4 border border-amber-200 uppercase tracking-wider">
              Currently In Development
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">How Our Agent Works</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              A transparent look at the architecture, requirements, and processing capabilities of the Docscraft Pro Agent Studio. 
            </p>
          </div>

          <div className="space-y-12 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200">
            
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Agentic Architecture (In Progress)</h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-lg">
                The Agent Studio is currently undergoing active development. The primary architecture relies on an intelligent orchestration layer designed to interpret natural language, synthesize multi-step development plans, and execute code within secure sandbox environments. Our agent utilizes specialized instruction sets—such as coding guidelines, researcher schemas, and step-by-step planning protocols—to ensure its behavior aligns strictly with the user's intent. 
              </p>
              <p className="text-slate-600 leading-relaxed text-lg mt-4">
                Before the agent writes a single line of code, it enters a dedicated "planning phase." During this phase, it analyzes the requirements, explores the existing project structure, and outlines the precise architectural changes needed. Only upon approval or completion of this plan does it begin editing files.
              </p>
            </section>

            <hr className="border-slate-100" />

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Server className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">E2B Enterprise Cloud Sandbox</h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-lg">
                When you ask the agent to build a module, website, or API, it doesn't just generate text. It provisions a dedicated, ephemeral E2B Cloud Sandbox. This sandbox provides a secure, isolated Linux environment where the agent can run terminal commands, manage Node.js dependencies, compile TypeScript, and spin up live development servers. 
              </p>
              <p className="text-slate-600 leading-relaxed text-lg mt-4">
                We use this infrastructure so that the code you receive is genuinely functional. If a package is missing, the agent installs it. If a build fails, the agent reads the error logs and iterates on its solution. The entire process is sandboxed to ensure your core browser environment remains completely secure and untouched.
              </p>
            </section>

            <hr className="border-slate-100" />

            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Firebase & Database Integration</h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-lg">
                For persistent data, we rely on Google Firebase (Firestore and Authentication). The agent is equipped to scaffold complete database schemas and security rules automatically. When a user requests backend features—such as chat session history, user profiles, or document storage—the agent interfaces with Firebase.
              </p>
              <p className="text-slate-600 leading-relaxed text-lg mt-4">
                Please note that this integration requires specific environment configurations. Currently, we manage the global Firebase instance, but the agent is programmed to handle complex schema queries, ensuring real-time data synchronization between the frontend and the cloud.
              </p>
            </section>

            <hr className="border-slate-100" />

             <section className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Network className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Dynamic Researcher & Custom Skills</h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-lg">
                We are building "custom skills" into the agent's core memory. For example, the agent can invoke a "Researcher Schema" to search the web or consult official documentation before attempting to use an unfamiliar API. By utilizing dynamic skills rather than relying solely on pre-trained knowledge, the agent ensures that the code it produces uses the latest library versions and syntax.
              </p>
            </section>

          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
