import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export function DocsSidebar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 bg-white border-r border-gray-200 min-h-screen p-6 overflow-y-auto">
      <div className="mb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Introduction</h3>
        <nav className="space-y-1">
          <Link 
            to="/docs/overview" 
            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${isActive('/docs/overview') ? 'bg-gray-100 font-bold text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Docscraft Pro Docs
          </Link>
          <Link 
            to="/docs/getting-started" 
            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${isActive('/docs/getting-started') ? 'bg-gray-100 font-bold text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Getting Started
          </Link>
          <Link 
            to="/docs/keyboard-shortcuts" 
            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${isActive('/docs/keyboard-shortcuts') ? 'bg-gray-100 font-bold text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Keyboard Shortcuts
          </Link>
        </nav>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Core</h3>
        <nav className="space-y-1">
          <Link 
            to="/docs/documents-and-search" 
            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${isActive('/docs/documents-and-search') ? 'bg-gray-100 font-bold text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Documents and Search
          </Link>
          <Link 
            to="/docs/blocks" 
            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${isActive('/docs/blocks') ? 'bg-gray-100 font-bold text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Pages and Blocks
          </Link>
        </nav>
      </div>
    </aside>
  );
}
