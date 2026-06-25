import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { DocsSidebar } from '../../components/docs/DocsSidebar';
import { FileText, Database, Share2, Shield, Settings, Import } from 'lucide-react';

export function DocsDocumentsAndSearchPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900">
      <Navbar />
      <div className="flex flex-1 pt-20">
        <div className="hidden lg:block border-r border-gray-200">
          <DocsSidebar />
        </div>
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-4xl mx-auto px-6 py-12 lg:px-12 lg:py-20">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-8">Documents and Search</h1>
            
            <p className="text-xl text-gray-700 leading-relaxed mb-12">
              Learn how to manage your documents, organize them into spaces, and find exactly what you need with powerful search.
            </p>

            <h2 className="text-3xl font-black mb-6">Creating Documents</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Documents are the core of Docscraft Pro. They can be simple notes, complex projects, or anything in between.
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-12">
              <h3 className="font-bold text-lg mb-3">Quick Actions</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3"><FileText className="w-5 h-5 text-gray-400" /> <span>Press <kbd className="bg-white border rounded px-1.5 py-0.5 text-sm mx-1">Cmd + N</kbd> to create a new document from anywhere.</span></li>
                <li className="flex items-center gap-3"><FileText className="w-5 h-5 text-gray-400" /> <span>Press <kbd className="bg-white border rounded px-1.5 py-0.5 text-sm mx-1">Cmd + Option + N</kbd> for a Quick Note.</span></li>
              </ul>
            </div>

            <h2 className="text-3xl font-black mb-6 border-t border-gray-100 pt-12">Supported Formats & Integrations</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Docscraft Pro natively supports a wide range of import and export formats and seamless integrations.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="border border-gray-200 rounded-xl p-6">
                <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-500" /> Formats
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Markdown (.md)</li>
                  <li>• TextBundle</li>
                  <li>• PDF Exports</li>
                  <li>• CSV / Spreadsheets</li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-xl p-6">
                <h4 className="font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
                  <Import className="w-5 h-5 text-blue-500" /> Platform Sync
                </h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Google Keep & Google Docs</li>
                  <li>• Microsoft Word (.docx)</li>
                  <li>• Notion & Obsidian Importer</li>
                  <li>• Evernote Migration API</li>
                </ul>
              </div>
            </div>

            <h2 className="text-3xl font-black mb-6 border-t border-gray-100 pt-12">Search</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Docscraft Pro features a lightning-fast universal search that helps you find documents, blocks, and content across all your spaces.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-12">
              Use <kbd className="bg-gray-100 border rounded px-1.5 py-0.5 text-sm mx-1 font-mono">Cmd + F</kbd> or <kbd className="bg-gray-100 border rounded px-1.5 py-0.5 text-sm mx-1 font-mono">Cmd + O</kbd> to open the Quick Open panel. Type your query to instantly see results updating as you type.
            </p>

            <h2 className="text-3xl font-black mb-6 border-t border-gray-100 pt-12">Advanced Search Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="border border-gray-200 rounded-xl p-6">
                <h4 className="font-bold text-lg mb-2 text-blue-600">Exact Match</h4>
                <p className="text-gray-600">Use quotes <code className="bg-gray-100 rounded px-1">"like this"</code> to search for an exact phrase.</p>
              </div>
              <div className="border border-gray-200 rounded-xl p-6">
                <h4 className="font-bold text-lg mb-2 text-emerald-600">Filters</h4>
                <p className="text-gray-600">Filter results by document type, date created, or specific spaces.</p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
