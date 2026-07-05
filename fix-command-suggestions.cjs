const fs = require('fs');
let code = fs.readFileSync('src/pages/RepositoriesPage.tsx', 'utf-8');

const newTextarea = `<div className="relative flex-1">
                        <textarea 
                        required
                        rows={1}
                        disabled={isLlmGenerating}
                        value={promptInput}
                        onChange={e => setPromptInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendPromptMessage();
                          }
                        }}
                        placeholder="E.g., /question How does this work? or Initialize a new Express server..."
                        className="w-full bg-transparent border-none outline-none resize-none px-4 py-3 text-xs md:text-sm text-slate-800 placeholder-slate-400 max-h-24 scrollbar-thin font-medium"
                      />
                      <AnimatePresence>
                        {promptInput.startsWith('/') && promptInput.length < 5 && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-slate-200 shadow-xl rounded-xl p-2 z-[100]"
                          >
                             <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Commands</div>
                             <button type="button" onClick={() => setPromptInput('/fix ')} className="flex flex-col w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-lg">
                               <span className="text-xs font-bold text-slate-700">/fix</span>
                               <span className="text-[10px] text-slate-500">Fix code or errors</span>
                             </button>
                             <button type="button" onClick={() => setPromptInput('/explain ')} className="flex flex-col w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-lg">
                               <span className="text-xs font-bold text-slate-700">/explain</span>
                               <span className="text-[10px] text-slate-500">Explain how code works</span>
                             </button>
                             <button type="button" onClick={() => setPromptInput('/refactor ')} className="flex flex-col w-full text-left px-3 py-1.5 hover:bg-slate-50 rounded-lg">
                               <span className="text-xs font-bold text-slate-700">/refactor</span>
                               <span className="text-[10px] text-slate-500">Clean up and optimize</span>
                             </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      </div>`;

code = code.replace(/<textarea[\s\S]*?className="flex-1 bg-transparent border-none outline-none resize-none px-4 py-3 text-xs md:text-sm text-slate-800 placeholder-slate-400 max-h-24 scrollbar-thin font-medium"\n\s*\/>/, newTextarea);

fs.writeFileSync('src/pages/RepositoriesPage.tsx', code);
