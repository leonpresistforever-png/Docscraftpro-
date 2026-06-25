import React from 'react';
import { motion } from 'motion/react';
import { MousePointer2, Settings, Layers, Code, Zap } from 'lucide-react';

export function LandingInteractiveImage() {
  return (
    <div className="relative w-full min-h-[100vh] flex flex-col items-center justify-center overflow-hidden bg-white py-24 border-t border-gray-100">
       
       <div className="text-center max-w-3xl mb-16 relative z-30">
          <h2 className="text-4xl md:text-5xl font-black font-serif text-gray-900 mb-4 tracking-tight">Interactive Canvas</h2>
          <p className="text-xl text-gray-500 bg-white/50 inline-block px-4 py-1 rounded-full backdrop-blur-sm">Collaborate with your team instantly. The screen updates live for everyone.</p>
       </div>

       {/* Real Background Image with Two Persons Sitting */}
       <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10"></div>
          <motion.img 
             initial={{ scale: 1.1, opacity: 0 }}
             whileInView={{ scale: 1, opacity: 1 }}
             transition={{ duration: 1.5 }}
             viewport={{ once: true }}
             src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000" 
             className="w-full h-full object-cover object-center translate-y-10"
          />
       </div>

       {/* The "iMac" Screen Container */}
       <motion.div 
         initial={{ opacity: 0, y: 50, rotateX: 5 }}
         whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
         transition={{ duration: 1, delay: 0.1 }}
         viewport={{ once: true }}
         className="relative z-20 w-[95%] max-w-4xl aspect-[16/10] md:aspect-video rounded-t-3xl border-[16px] md:border-[24px] border-[#1a1a1a] shadow-[0_30px_60px_rgba(0,0,0,0.4)] bg-[#2a2b4b] overflow-hidden flex flex-col group/imac mt-10 md:mt-24"
       >
         {/* Webcam dot */}
         <div className="absolute top-[-10px] md:top-[-14px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-black border border-gray-800"></div>

         {/* Screen UI - Top Navigation (Simulated Web Design interface) */}
         <div className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#1b1c3c] to-[#2a2b4b]">
            <div className="text-white font-bold text-sm tracking-wider">LOGO</div>
            <div className="flex gap-6 text-[10px] text-gray-300 uppercase tracking-widest font-semibold hidden md:flex">
               <span className="text-white pb-1 border-b-2 border-white">Home</span>
               <span className="hover:text-white cursor-pointer transition-colors">About</span>
               <span className="hover:text-white cursor-pointer transition-colors">Services</span>
               <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer">
              <span className="w-3 h-[2px] bg-white rounded shadow-[0_-4px_0_white,0_4px_0_white]"></span>
            </div>
         </div>

         {/* Screen UI - Main Web Design Content area */}
         <div className="flex-1 relative overflow-hidden group border-b border-gray-800">
            {/* Background gradient block from user image */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#2a2b4b] via-[#4d3159] to-[#c76572] opacity-90"></div>
            
            <div className="absolute inset-0 flex flex-col md:flex-row items-center justify-between p-8 md:p-16 gap-10">
               
               <div className="flex-1 w-full relative z-10 flex flex-col justify-center">
                  <motion.h1 
                    whileHover={{ scale: 1.05, originX: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-5xl md:text-7xl font-sans font-extrabold text-white mb-6 uppercase tracking-tight cursor-default drop-shadow-lg"
                  >
                     Web Design
                  </motion.h1>
                  
                  {/* Search Bar matching image */}
                  <div className="w-full max-w-sm flex bg-white/90 backdrop-blur rounded p-1 shadow-lg hover:bg-white transition-colors cursor-text">
                     <input type="text" disabled placeholder="Search..." className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-gray-800 font-medium" />
                     <button className="bg-[#e43e49] text-white px-4 py-2 text-xs font-bold uppercase rounded cursor-pointer hover:bg-red-600 transition-colors">Search</button>
                  </div>
               </div>

               {/* Video Player Placeholder matching image */}
               <motion.div 
                 whileHover={{ scale: 1.02 }}
                 className="w-full md:w-[400px] aspect-video bg-[#0d0d0d] rounded-lg shadow-2xl relative flex items-center justify-center cursor-pointer ring-1 ring-white/10 group/video"
               >
                   <div className="absolute bottom-[-15px] inset-x-12 h-4 bg-black/40 blur-xl"></div>
                   
                   {/* Play button */}
                   <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md group-hover/video:bg-white group-hover/video:text-black transition-all">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="ml-1"><path d="M5 3l14 9-14 9V3z"/></svg>
                   </div>

                   {/* Video controls bottom styling */}
                   <div className="absolute bottom-0 inset-x-0 h-2 bg-red-600/80"></div>
               </motion.div>
            </div>
         </div>

         {/* Screen UI - Bottom Toolbar matching image */}
         <div className="w-full bg-white h-[80px] p-4 flex gap-4 md:gap-8 items-center bg-[#f4f7f6]">
            
            <div className="w-48 hidden lg:flex flex-col bg-[#2f3244] text-white p-3 rounded-md text-[10px] gap-2 absolute bottom-full left-4 shadow-xl">
               <div className="flex justify-between items-center bg-[#1d1f2b] p-1.5 rounded"><span className="text-blue-400">HOME</span></div>
               <div className="flex justify-between items-center hover:bg-white/10 p-1.5 rounded cursor-pointer"><span>ABOUT</span></div>
               <div className="flex justify-between items-center hover:bg-white/10 p-1.5 rounded cursor-pointer"><span>SERVICES</span></div>
            </div>

            {/* Simulated Icon Buttons */}
            <div className="flex-1 flex justify-center gap-4 md:gap-6">
               <motion.div whileHover={{ y: -5 }} className="w-10 h-10 rounded-full bg-cyan-400 text-white flex items-center justify-center shadow-md cursor-pointer"><Settings className="w-5 h-5"/></motion.div>
               <motion.div whileHover={{ y: -5 }} className="w-10 h-10 rounded-full bg-cyan-400 text-white flex items-center justify-center shadow-md cursor-pointer"><Layers className="w-5 h-5"/></motion.div>
               <motion.div whileHover={{ y: -5 }} className="w-10 h-10 rounded-full bg-cyan-400 text-white flex items-center justify-center shadow-md cursor-pointer"><Code className="w-5 h-5"/></motion.div>
            </div>
            
            {/* Action buttons right side */}
            <div className="flex gap-2">
               <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-400"><span className="w-4 h-3 bg-white border border-gray-400 rounded-sm"></span></div>
               <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-400"><span className="w-4 h-3 bg-white border border-gray-400 rounded-sm"></span></div>
               <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-400 relative overflow-hidden">
                  <div className="w-5 h-[2px] bg-white absolute top-1/2 -translate-y-1/2"></div>
                  <div className="h-5 w-[2px] bg-white absolute left-1/2 -translate-x-1/2"></div>
               </div>
            </div>
         </div>
       </motion.div>

       {/* iMac Stand */}
       <div className="w-32 h-20 bg-gradient-to-b from-[#b3b3b3] to-[#e6e6e6] shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)] z-10 relative perspective-[500px]">
          <div className="absolute bottom-0 w-[200px] h-4 bg-gradient-to-r from-gray-300 via-white to-gray-300 left-1/2 -translate-x-1/2 shadow-xl rounded-t-sm"></div>
       </div>

    </div>
  );
}
