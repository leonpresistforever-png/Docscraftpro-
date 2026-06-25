import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { DocsSidebar } from '../../components/docs/DocsSidebar';

export function DocsBlocksPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900">
      <Navbar />
      <div className="flex flex-1 pt-20">
        <div className="hidden lg:block border-r border-gray-200">
          <DocsSidebar />
        </div>
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-4xl mx-auto px-6 py-12 lg:px-12 lg:py-20">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-8">Pages and Blocks</h1>
            
            <p className="text-xl text-gray-700 leading-relaxed mb-12">
              Everything in Docscraft Pro is built from blocks. Blocks can be text, images, pages, or entire documents. This flexibility allows you to structure your thoughts precisely as you want.
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mb-16">
              <h3 className="font-bold text-2xl mb-4">What is a Block?</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                A block is simply a distinct piece of content. When you press <kbd className="bg-white border rounded px-1.5 py-0.5 text-sm mx-1">Enter</kbd>, you create a new block. 
                Blocks can be rearranged, styled, and grouped independently of one another.
              </p>
              <div className="space-y-4 font-medium text-gray-800">
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                  <div className="w-4 h-4 rounded-sm bg-gray-200" />
                  <span>This is a text block.</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                  <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" disabled />
                  <span>This is a todo block.</span>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border-l-4 border-l-purple-500">
                  <span className="text-purple-700 font-bold">This is a highly styled callout block.</span>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-black mb-6">Pages vs subpages</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Pages are just blocks that contain other blocks. This means you can infinitely nest pages within pages, creating a deep hierarchy of information.
            </p>

            <h2 className="text-3xl font-black mb-6 border-t border-gray-100 pt-12">Block Operations</h2>
            <ul className="space-y-6 text-lg text-gray-800 font-medium list-disc pl-6">
              <li>
                <strong className="text-gray-900 block">Move Blocks</strong>
                <span className="text-gray-600 text-base font-normal">Grab the handle on the left of any block to drag and drop it wherever you like.</span>
              </li>
              <li>
                <strong className="text-gray-900 block">Select Multiple Blocks</strong>
                <span className="text-gray-600 text-base font-normal">Click and drag or hold <kbd className="bg-gray-100 border rounded px-1.5 py-0.5 text-xs">Shift</kbd> and use arrow keys to select multiple blocks at once.</span>
              </li>
              <li>
                <strong className="text-gray-900 block">Group Blocks</strong>
                <span className="text-gray-600 text-base font-normal">Select multiple blocks and use the Group action to convert them into a Page or a Card.</span>
              </li>
            </ul>

          </div>
        </main>
      </div>
    </div>
  );
}
