import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, TerminalSquare } from 'lucide-react';
import { Sandpack } from "@codesandbox/sandpack-react";

export function CodeSandboxPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#151515] flex flex-col font-sans relative overflow-hidden">
      <div className="bg-[#151515]/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-20 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/doc/${id}/summarize`)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <TerminalSquare className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-bold text-gray-100 tracking-tight">Live Code Sandbox</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 z-10 relative flex flex-col">
        <div className="flex-1 text-base overflow-hidden rounded-2xl shadow-2xl border border-gray-800">
          <Sandpack 
            theme={{
              colors: {
                surface1: '#1e1e1e',
                surface2: '#252526',
                surface3: '#333333',
                clickable: '#a8a8a8',
                base: '#a8a8a8',
                disabled: '#4d4d4d',
                hover: '#e8e8e8',
                accent: '#007fd4',
                error: '#f88070',
                errorSurface: '#8c2d2d',
              },
              syntax: {
                plain: '#d4d4d4',
                comment: '#6a9955',
                keyword: '#569cd6',
                tag: '#569cd6',
                punctuation: '#d4d4d4',
                definition: '#dcdcaa',
                property: '#9cdcfe',
                static: '#b5cea8',
                string: '#ce9178',
              },
              font: {
                body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                mono: '"Fira Mono", "DejaVu Sans Mono", Menlo, Consolas, "Liberation Mono", Monaco, "Lucida Console", monospace',
                size: '16px',
                lineHeight: '24px',
              },
            }}
            template="react" 
            options={{
              showNavigator: true, 
              editorHeight: "calc(100vh - 120px)",
              showTabs: true,
              closableTabs: true,
            }}
          />
        </div>
      </div>
    </div>
  );
}
