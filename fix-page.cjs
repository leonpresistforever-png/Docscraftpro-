const fs = require('fs');
let code = fs.readFileSync('src/pages/RepositoriesPage.tsx', 'utf-8');

const regex = /<label className="font-semibold text-slate-600 block text-\[10px\]">Instructions \/ Persona<\/label>[\s\S]*?<div className="relative flex-1">/;

const replacement = `<label className="font-semibold text-slate-600 block text-[10px]">Instructions / Persona</label>
                      <textarea
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-[10px] text-slate-600 h-24"
                        placeholder="System instructions..."
                      />
                      <button onClick={handleSaveKeys} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg mt-2 shadow-sm">
                        {isKeysSaved ? 'Saved to LocalStorage' : 'Save Keys'}
                      </button>
                    </div>
                  </div>
                </div>
            )}
          </div>
        </AnimatePresence>

        {/* MAIN WORKSPACE CONTENT */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FDFBF7] relative">
          
          <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-4 shrink-0">
             <div className="flex items-center gap-4">
                <input
                   value={projectName}
                   onChange={e => setProjectName(e.target.value)}
                   className="bg-transparent border-none outline-none font-bold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1"
                />
             </div>
             <div className="flex items-center gap-4">
                <ModelSelector selectedModel={selectedModel} setSelectedModel={setSelectedModel} />
             </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col bg-white">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                       <Bot className="w-12 h-12 mb-4 text-indigo-300" />
                       <h2 className="text-xl font-bold">Start a conversation</h2>
                    </div>
                  )}
                  {chatMessages.map(msg => (
                      <div key={msg.id} className={\`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
                         <div className={\`max-w-2xl p-4 rounded-2xl text-sm whitespace-pre-wrap break-words \${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}\`}>
                           {msg.content}
                         </div>
                      </div>
                  ))}
                  {isLlmGenerating && (
                    <div className="flex justify-start">
                       <div className="p-4 bg-slate-100/70 border border-slate-200/50 rounded-2xl rounded-tl-none flex items-center gap-1.5 w-24 h-[52px]">
                         <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0 }} className="w-2 h-2 bg-indigo-500 rounded-full" />
                         <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.2 }} className="w-2 h-2 bg-purple-500 rounded-full" />
                         <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.4 }} className="w-2 h-2 bg-indigo-400 rounded-full" />
                       </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                  <form onSubmit={handleSendPromptMessage} className="flex bg-slate-50 border border-slate-200 rounded-2xl p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                      <div className="relative flex-1">`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/RepositoriesPage.tsx', code);
