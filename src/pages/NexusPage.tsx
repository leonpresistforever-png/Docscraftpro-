import React from 'react';
import { LandingNexus } from '../components/LandingNexus';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function NexusPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#FDFBF7] w-full relative">
      <div className="absolute top-6 left-6 z-50">
        <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] font-medium text-sm border border-gray-200 transition-all text-gray-700 flex items-center gap-2 hover:-translate-x-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Home
        </button>
      </div>
      
      {/* Hero Section */}
      <LandingNexus />
      
      {/* Expanded Content Section */}
      <div className="w-full bg-white py-32 relative z-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Expand Your Digital Horizon</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">We push the boundaries of what's possible on the web with immersive, high-performance experiences.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Immersive 3D", desc: "WebGL and Three.js experiences that captivate users.", color: "from-blue-500 to-cyan-400" },
              { title: "Fluid Animation", desc: "Silky smooth physics-based UI transitions.", color: "from-indigo-500 to-purple-400" },
              { title: "Modern Stack", desc: "Built on React, Vite, and modern web standards.", color: "from-emerald-400 to-teal-500" },
              { title: "Optimized", desc: "High performance with zero layout shifts.", color: "from-orange-400 to-rose-400" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} mb-6 shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}></div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
