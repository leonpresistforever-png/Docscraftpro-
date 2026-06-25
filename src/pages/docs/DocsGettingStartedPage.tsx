import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { DocsSidebar } from '../../components/docs/DocsSidebar';

export function DocsGettingStartedPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900">
      <Navbar />
      <div className="flex flex-1 pt-20">
        <div className="hidden lg:block border-r border-gray-200">
          <DocsSidebar />
        </div>
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-4xl mx-auto px-6 py-12 lg:px-12 lg:py-20">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-8">Getting Started</h1>
            
            <p className="text-xl text-gray-700 leading-relaxed mb-12">
              New to Docscraft Pro? Start here to understand the core concepts and set up your workspace.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
              <div className="border border-gray-200 rounded-3xl p-10 hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-2xl font-bold mb-4">Account Setup</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Create your account, set up spaces, and configure your profile.
                </p>
              </div>
              <div className="border border-gray-200 rounded-3xl p-10 hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="text-2xl font-bold mb-4">Documents, Pages, and Blocks</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Learn how Docscraft Pro's flexible document structure works.
                </p>
              </div>
              <div className="border border-gray-200 rounded-3xl p-10 hover:shadow-lg transition-shadow cursor-pointer col-span-1 md:col-span-2">
                <h3 className="text-2xl font-bold mb-4">Navigation</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Master essential navigation features to move between spaces and documents quickly.
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-black mb-8 border-t border-gray-200 pt-16">What is Docscraft Pro?</h2>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Docscraft Pro is a powerful tool for creating beautiful documents, organizing your work, and
              collaborating with others. It combines the flexibility of nested documents with intuitive
              features that help you think clearly and work efficiently.
            </p>
            
            <p className="text-lg text-gray-800 font-bold mb-6">
              Docscraft Pro is a document editor and note-taking app designed to help you:
            </p>
            
            <ul className="space-y-6 text-lg text-gray-600 font-medium">
              <li className="flex gap-4">
                <span className="text-xl shrink-0 mt-1">&bull;</span>
                <div>
                  <strong className="text-gray-900">Write and organize</strong> - Create structured documents with pages, blocks, and flexible nesting
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-xl shrink-0 mt-1">&bull;</span>
                <div>
                  <strong className="text-gray-900">Stay productive</strong> - Manage tasks, calendar events, and daily notes in one place
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-xl shrink-0 mt-1">&bull;</span>
                <div>
                  <strong className="text-gray-900">Collaborate seamlessly</strong> - Share documents and work together in real-time
                </div>
              </li>
              <li className="flex gap-4">
                <span className="text-xl shrink-0 mt-1">&bull;</span>
                <div>
                  <strong className="text-gray-900">Work anywhere</strong> - Available on macOS, iOS, Windows, Web app, and Android with automatic sync
                </div>
              </li>
            </ul>

          </div>
        </main>
      </div>
    </div>
  );
}
