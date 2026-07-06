import React from 'react';
import { motion } from 'motion/react';
import { FileText, Database, Box, Search } from 'lucide-react';

export function LandingImportExport() {
  return (
    <div className="w-full py-32 bg-[#FDFCF9] relative z-20 overflow-hidden">
      {/* Subtle grid background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20h20v20H20V20zM0 20h20v20H0V20z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="max-w-[1000px] mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl lg:text-7xl font-sans font-black tracking-tight text-[#1A1A1A] mb-6"
          >
            Import & Export
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Move your content in and out of Docscraft Pro with support for multiple formats and platforms.
          </motion.p>
        </div>

        {/* Vertical Timeline */}
        <div className="relative max-w-3xl mx-auto mb-40">
          {/* Central Line */}
          <div className="absolute left-[50%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-gray-200 to-transparent -translate-x-1/2" />

          {/* Item: Google Docs */}
          <div className="flex items-center justify-between mb-24 relative">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="w-[40%] text-right pr-8"
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Google Docs</h3>
              <p className="text-gray-500 font-medium">Import your Google Docs directly with rich formatting preserved.</p>
            </motion.div>
            
            {/* Center Node */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-white" />
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="w-[40%] pl-8"
            >
              <div className="w-24 h-24 rounded-full bg-blue-50/50 flex items-center justify-center border border-blue-100/50 shadow-sm">
                <FileText className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
              </div>
            </motion.div>
          </div>

          {/* Item: Obsidian */}
          <div className="flex items-center justify-between mb-24 relative flex-row-reverse">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="w-[40%] pl-8 text-left"
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Obsidian</h3>
              <p className="text-gray-500 font-medium">Preserve your markdown links, tags, and structure flawlessly.</p>
            </motion.div>
            
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-3 h-3 rounded-full border-2 border-purple-500 bg-white" />
            </div>

            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="w-[40%] pr-8 flex justify-end"
            >
              <div className="w-24 h-24 rounded-full bg-purple-50/50 flex items-center justify-center border border-purple-100/50 shadow-sm">
                <Box className="w-10 h-10 text-purple-600" strokeWidth={1.5} />
              </div>
            </motion.div>
          </div>

          {/* Item: Notion */}
          <div className="flex items-center justify-between mb-24 relative">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="w-[40%] text-right pr-8"
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Notion</h3>
              <p className="text-gray-500 font-medium">Bring your Notion databases to life in a faster environment.</p>
            </motion.div>
            
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-3 h-3 rounded-full border-2 border-red-500 bg-white" />
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="w-[40%] pl-8"
            >
              <div className="w-24 h-24 rounded-full bg-red-50/50 flex items-center justify-center border border-red-100/50 shadow-sm">
                <Database className="w-10 h-10 text-red-600" strokeWidth={1.5} />
              </div>
            </motion.div>
          </div>

          {/* Item: Evernote */}
          <div className="flex items-center justify-between relative flex-row-reverse">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="w-[40%] pl-8 text-left"
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Evernote</h3>
              <p className="text-gray-500 font-medium">Migrate all your Evernote notebooks with a single click.</p>
            </motion.div>
            
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-3 h-3 rounded-full border-2 border-emerald-500 bg-white" />
            </div>

            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="w-[40%] pr-8 flex justify-end"
            >
              <div className="w-24 h-24 rounded-full bg-emerald-50/50 flex items-center justify-center border border-emerald-100/50 shadow-sm">
                <Search className="w-10 h-10 text-emerald-600" strokeWidth={1.5} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
