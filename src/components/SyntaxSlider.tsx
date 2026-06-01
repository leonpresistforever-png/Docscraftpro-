import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// 50+ Syntaxes
const SYNTAXES = [
  { category: 'Symbols', title: 'Greater Than', content: '>' },
  { category: 'Symbols', title: 'Less Than', content: '<' },
  { category: 'Symbols', title: 'Open Bracket', content: '[' },
  { category: 'Symbols', title: 'Close Bracket', content: ']' },
  { category: 'Symbols', title: 'Open Brace', content: '{' },
  { category: 'Symbols', title: 'Close Brace', content: '}' },
  { category: 'Symbols', title: 'Equals', content: '=' },
  { category: 'Symbols', title: 'Backslash', content: '\\' },
  { category: 'Symbols', title: 'Degree', content: '°' },
  { category: 'Symbols', title: 'Euro', content: '€' },
  { category: 'Symbols', title: 'Square Root', content: '√' },
  { category: 'Symbols', title: 'Bullet', content: '•' },
  { category: 'Symbols', title: 'Tilde', content: '~' },
  { category: 'Symbols', title: 'Backtick', content: '`' },
  { category: 'Symbols', title: 'Pound', content: '£' },
  { category: 'Symbols', title: 'Cent', content: '¢' },
  { category: 'Symbols', title: 'Yen', content: '¥' },
  { category: 'Symbols', title: 'Section', content: '§' },
  { category: 'Symbols', title: 'Copyright', content: '©' },
  { category: 'Symbols', title: 'Registered', content: '®' },
  { category: 'Symbols', title: 'Not Equal', content: '≠' },
  { category: 'Symbols', title: 'Plus-Minus', content: '±' },
  { category: 'Symbols', title: 'Multiplication', content: '×' },
  { category: 'Symbols', title: 'Division', content: '÷' },
  { category: 'Symbols', title: 'Infinity', content: '∞' },
  { category: 'Symbols', title: 'Pi', content: 'π' },
  { category: 'Symbols', title: 'Mu', content: 'μ' },
  { category: 'Symbols', title: 'Alpha', content: 'α' },
  { category: 'Symbols', title: 'Beta', content: 'β' },
  { category: 'Symbols', title: 'Delta', content: 'Δ' },
  { category: 'Symbols', title: 'Sigma', content: 'Σ' },
  { category: 'Symbols', title: 'Omega', content: 'Ω' },
  { category: 'Symbols', title: 'Arrow Right', content: '→' },
  { category: 'Symbols', title: 'Arrow Left', content: '←' },
  { category: 'Symbols', title: 'Arrow Up', content: '↑' },
  { category: 'Symbols', title: 'Arrow Down', content: '↓' },
  { category: 'Symbols', title: 'Double Arrow', content: '↔' },
  { category: 'Symbols', title: 'Checkmark', content: '✓' },
  { category: 'Symbols', title: 'Crossmark', content: '✗' },
  { category: 'Symbols', title: 'Star Black', content: '★' },
  { category: 'Symbols', title: 'Star White', content: '☆' },
  { category: 'Symbols', title: 'Heart', content: '♥' },
  { category: 'Symbols', title: 'Spade', content: '♠' },
  { category: 'Symbols', title: 'Club', content: '♣' },
  { category: 'Symbols', title: 'Diamond', content: '♦' },
  { category: 'Symbols', title: 'Music Note', content: '♪' },
  { category: 'Symbols', title: 'Sun', content: '☀' },
  { category: 'Symbols', title: 'Moon', content: '☾' },
  { category: 'Symbols', title: 'Cloud', content: '☁' },
  { category: 'Symbols', title: 'Umbrella', content: '☂' },
  
  { category: 'Utility', title: 'Checked Box', content: '☑' },
  { category: 'Utility', title: 'Unchecked Box', content: '☐' },
  { category: 'Utility', title: 'Star Rating', content: '★★★★☆' },
  { category: 'Utility', title: 'Arrow Right', content: '→' },
  { category: 'Utility', title: 'Double Arrow', content: '⇒' },
  { category: 'Utility', title: 'Copyright', content: '©' },
  { category: 'Utility', title: 'Trademark', content: '™' },
  { category: 'Utility', title: 'Paragraph', content: '¶' },
  { category: 'Utility', title: 'Section', content: '§' },
  { category: 'Utility', title: 'Degree', content: '°' },
];

export function SyntaxSlider({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (content: string) => void }) {
  const [search, setSearch] = useState('');
  
  const filtered = SYNTAXES.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()));

  // Group by category
  const grouped = filtered.reduce((acc, curr) => {
    (acc[curr.category] = acc[curr.category] || []).push(curr);
    return acc;
  }, {} as Record<string, typeof SYNTAXES>);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 h-full w-[400px] bg-white border-l border-gray-200 shadow-2xl z-[150] flex flex-col"
        >
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="font-bold text-lg text-gray-900">Syntax Library</h2>
              <p className="text-xs text-gray-500">50+ snippets & symbols</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-500 hover:text-red-600" title="Cut (Close) Syntax Selector">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
            </button>
          </div>
          
          <div className="p-4 border-b border-gray-100">
             <div className="relative">
               <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
               <input 
                 autoFocus
                 type="text" 
                 placeholder="Search snippet (e.g. Matrix, Loop)" 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/30">
            {Object.keys(grouped).map(category => (
              <div key={category}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">{category}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {grouped[category].map(item => {
                    const isUtility = ['Utility', 'Symbols'].includes(item.category);
                    
                    return (
                    <button 
                      key={item.title}
                      onClick={() => onSelect(item.content)}
                      className="relative p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-500 hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-3 overflow-hidden group min-h-[100px]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Visual Preview */}
                      <div className="flex-1 flex items-center justify-center">
                        {isUtility ? (
                          <div className="text-2xl md:text-3xl text-gray-800 pointer-events-none scale-105 group-hover:scale-110 transition-transform">
                             {item.content}
                          </div>
                        ) : (
                          <div className="text-[10px] font-mono text-gray-400 bg-gray-50 p-2 rounded-lg text-left line-clamp-2 w-full leading-tight pointer-events-none border border-gray-100 group-hover:border-gray-300 transition-colors">
                             {item.content.replace(/<[^>]+>/g, '').substring(0, 40)}...
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest group-hover:text-blue-600 transition-colors z-10">
                         {item.title}
                      </span>
                    </button>
                  )})}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-500 text-sm">
                No syntaxes found matching "{search}"
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
