import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { DocsSidebar } from '../../components/docs/DocsSidebar';

export function DocsOverviewPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900">
      <Navbar />
      <div className="flex flex-1 pt-20">
        <div className="hidden lg:block border-r border-gray-200">
          <DocsSidebar />
        </div>
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-4xl mx-auto px-6 py-12 lg:px-12 lg:py-20">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-8">Docscraft Pro Documentation</h1>
            
            <p className="text-xl text-gray-700 leading-relaxed mb-6 font-medium">
              Learn how to use Docscraft Pro — the powerful, beautiful tool for creating documents, 
              managing tasks, and organizing your work and life.
            </p>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Welcome to Docscraft Pro! Whether you're new to the app or looking to master advanced features, 
              this documentation will help you get the most out of your experience.
            </p>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-16">
              Docscraft Pro is more than a note-taking app — it's a complete workspace for thinking, 
              creating, planning, and collaborating. From AI-powered assistance to powerful 
              organization tools, Docscraft Pro adapts to how you work.
            </p>
            
            <h2 className="text-3xl font-black mb-10">Getting started</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-10">
              New to Docscraft Pro? Start here to learn the fundamentals and set up your workspace.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
              <div className="border border-gray-200 rounded-3xl p-10 hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-2xl font-bold mb-4">Introduction</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Get started with Docscraft Pro and learn the basics of documents, navigation, and essential features.
                </p>
              </div>
              <div className="border border-gray-200 rounded-3xl p-10 hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-2xl font-bold mb-4">Move to Docscraft Pro</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Migrate your notes from Notion, Obsidian, Evernote, and other platforms. Connect external services like Google Keep.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-black mb-10">Video Tutorials</h2>
            <div className="bg-gray-50 rounded-3xl p-10 border border-gray-200 h-64 flex items-center justify-center text-gray-400">
               Video Placeholder
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
