import React from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, Image as ImageIcon, Search, ScanSearch, Wand2 } from 'lucide-react';

export function LandingAICapabilities() {
  return (
    <div className="relative w-full overflow-hidden bg-white py-32 border-t border-gray-100">
       <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-bl from-purple-100 to-transparent blur-3xl opacity-50 rounded-full mix-blend-multiply pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
       <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-gradient-to-tr from-amber-100 to-transparent blur-3xl opacity-50 rounded-full mix-blend-multiply pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

       <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
         
         <div className="text-center max-w-3xl mb-24">
            <h2 className="text-5xl font-black font-serif text-gray-900 mb-6 tracking-tight">Intelligence at your fingertips.</h2>
            <p className="text-xl text-gray-500">Docscraft isn't just an editor. It brings bleeding-edge AI models directly into your workflow.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full mb-32">
            
            {/* Feature 1 */}
            <motion.div 
               whileHover={{ y: -10 }}
               className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl shadow-gray-200/50 flex flex-col items-start group"
            >
               <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 border border-purple-100 group-hover:bg-purple-600 transition-colors duration-300">
                  <BrainCircuit className="w-7 h-7 text-purple-600 group-hover:text-white transition-colors" />
               </div>
               <h3 className="text-2xl font-bold text-gray-900 mb-3">High Thinking Mode</h3>
               <p className="text-gray-500 flex-1 leading-relaxed">
                 Tackle your most complex queries with gemini-3.1-pro-preview. Enable High Thinking Mode to reason through intricate logic, system design, or deep strategic planning.
               </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
               whileHover={{ y: -10 }}
               className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl shadow-gray-200/50 flex flex-col items-start group relative overflow-hidden"
            >
               <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600" className="absolute top-0 right-0 w-32 h-32 object-cover opacity-20 filter blur-[2px] transition-all group-hover:scale-110 group-hover:blur-none rounded-bl-3xl z-0" />
               <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 border border-amber-100 group-hover:bg-amber-600 transition-colors duration-300 relative z-10">
                  <ImageIcon className="w-7 h-7 text-amber-600 group-hover:text-white transition-colors" />
               </div>
               <h3 className="text-2xl font-bold text-gray-900 mb-3 relative z-10">Unreal Image Gen</h3>
               <p className="text-gray-500 flex-1 leading-relaxed relative z-10">
                 Describe it. See it. Use gemini-3-pro-image-preview for studio-quality assets, specifying any aspect ratio up to 4K resolution.
               </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
               whileHover={{ y: -10 }}
               className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl shadow-gray-200/50 flex flex-col items-start group"
            >
               <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 group-hover:bg-blue-600 transition-colors duration-300">
                  <Search className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
               </div>
               <h3 className="text-2xl font-bold text-gray-900 mb-3">Live Search Grounding</h3>
               <p className="text-gray-500 flex-1 leading-relaxed">
                 Don't guess. Pull real-time data from Google Search using gemini-3.5-flash. Automatically verify facts, source news, and embed citations directly into your docs.
               </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
               whileHover={{ y: -10 }}
               className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl shadow-gray-200/50 flex flex-col items-start group lg:col-span-1"
            >
               <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 border border-rose-100 group-hover:bg-rose-600 transition-colors duration-300">
                  <ScanSearch className="w-7 h-7 text-rose-600 group-hover:text-white transition-colors" />
               </div>
               <h3 className="text-2xl font-bold text-gray-900 mb-3">Image Understanding</h3>
               <p className="text-gray-500 flex-1 leading-relaxed">
                 Upload a photo, wireframe, or whiteboard drawing. We'll analyze it instantly and convert your scribbles into working code or structured data.
               </p>
            </motion.div>

            {/* Feature 5 (Wide) */}
            <motion.div 
               whileHover={{ y: -10 }}
               className="bg-gradient-to-r from-gray-900 to-black rounded-3xl p-10 border border-gray-800 shadow-2xl flex flex-col md:flex-row items-center gap-10 group lg:col-span-2 overflow-hidden relative"
            >
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
               
               <div className="flex-1 relative z-10">
                  <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 border border-gray-700">
                     <Wand2 className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Edit Images with Text</h3>
                  <p className="text-gray-400 leading-relaxed text-lg mb-6">
                    Don't like the background? Tell Docscraft to "make it a sunset". Our AI seamlessly edits your existing photos using state-of-the-art vision models.
                  </p>
                  <button className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform">
                     Try Magic Edit
                  </button>
               </div>

               <div className="md:w-1/3 w-full h-full min-h-[200px] relative z-10 rounded-2xl overflow-hidden border border-gray-700/50 group-hover:scale-105 transition-transform duration-500">
                  <img src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                     <div className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded border border-white/10 text-white text-xs font-mono">
                        "Change atmosphere to neon cyberpunk"
                     </div>
                  </div>
               </div>
            </motion.div>

         </div>
       </div>
    </div>
  );
}
