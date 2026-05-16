import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Palette, Layers, Grid, Ruler, Image as ImageIcon, 
  Cloud, Zap, Users, PlaySquare, Library, Sliders, CheckCircle2,
  Brush, Heart, Share2, BoxSelect, Sparkles, Move, History, Video,
  MousePointer2, Wand2, Settings, Plus, Play, MoreHorizontal
} from 'lucide-react';
import ClipperStudio from '../components/clipper/ClipperStudio';

export default function ClipperPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const [customW, setCustomW] = useState(1000);
  const [customH, setCustomH] = useState(1000);
  const [dpi, setDpi] = useState(350);

  useEffect(() => {
    if (searchParams.get('frameId') || searchParams.get('project') === 'new') {
      setIsDrawingMode(true);
    }
  }, [searchParams]);

  const handleCloseDrawingMode = () => {
    setIsDrawingMode(false);
    searchParams.delete('frameId');
    searchParams.delete('project');
    searchParams.delete('width');
    searchParams.delete('height');
    searchParams.delete('dpi');
    setSearchParams(searchParams);
  };

  const createProject = (w: number, h: number, d: number) => {
    setShowCreateModal(false);
    navigate(`/doc/${id}/clipper?project=new&width=${w}&height=${h}&dpi=${d}`);
  };

  if (isDrawingMode) {
    return <ClipperStudio id={id} onClose={handleCloseDrawingMode} />;
  }

  // Gallery items matching the user request
  const galleryItems = [
    { title: "Blending Brush Test", type: "folder", icon: Layers, cover: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=400" },
    { title: "Untitled176", type: "canvas", cover: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400" },
    { title: "Untitled175", type: "canvas", cover: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=400" },
    { title: "Untitled174", type: "canvas", cover: "https://images.unsplash.com/photo-1620336655055-088d06e36bf0?auto=format&fit=crop&q=80&w=400" },
    { title: "Untitled173", type: "canvas", cover: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=400" },
    { title: "Untitled172", type: "canvas", cover: "https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&q=80&w=400" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-gray-900 font-sans overflow-x-hidden">
      
      {/* Gallery Header (Ibis style but modern) */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 bg-white shadow-sm border-b border-gray-200 sticky top-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/doc/${id}`)} className="text-blue-500 font-medium hover:text-blue-600 transition-colors flex items-center gap-1">
             <ArrowLeft className="w-5 h-5"/> Back
          </button>
        </div>
        
        <h1 className="font-bold text-lg text-gray-800">My Gallery (173)</h1>

        <div className="flex items-center gap-4">
          <button className="text-blue-500 font-medium hover:text-blue-600 transition-colors">Select</button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 flex flex-col items-center">
        
        {/* Sync Status Bar */}
        <div className="w-full text-center text-gray-500 text-sm font-medium mb-6 flex items-center justify-center gap-2">
           Sync Stopped: Connect to Wi-Fi to restart. <Settings className="w-4 h-4 cursor-pointer hover:text-gray-700"/>
        </div>

        {/* Gallery Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-24">
           {galleryItems.map((item, i) => (
              <div key={i} className="flex flex-col items-center group cursor-pointer" onClick={() => createProject(1000, 1000, 350)}>
                 <div className={`w-full aspect-square bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative ${item.type === 'folder' ? 'p-2' : ''} group-hover:shadow-md transition-shadow`}>
                    {item.type === 'folder' && (
                       <div className="absolute inset-0 bg-[#EFECE5] rounded-xl transform translate-x-3 translate-y-3 z-0 border border-gray-300"></div>
                    )}
                    <div className="relative z-10 w-full h-full bg-white rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                       <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                 </div>
                 <div className="mt-2 text-sm font-medium text-gray-700 flex items-center gap-1">
                    {item.type === 'canvas' && <span className="text-blue-500"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21v-5h5" /></svg></span>}
                    {item.title}
                 </div>
              </div>
           ))}
        </div>

        {/* Floating Add Button */}
        <button 
           onClick={() => setShowCreateModal(true)}
           className="fixed bottom-8 right-8 w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg shadow-blue-500/30 text-white flex items-center justify-center transition-transform hover:scale-105 z-20"
        >
           <Plus className="w-6 h-6" strokeWidth={3} />
        </button>

      </main>
      
      {/* Create Project Modal (Enhanced Ibis Style) */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pb-0">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-lg bg-[#EFECE5] sm:border border-gray-300 sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
               {/* Modal Header */}
               <div className="px-6 py-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10 sticky top-0">
                  <h3 className="text-xl font-bold text-gray-800">New Canvas</h3>
                  <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-700 font-bold text-2xl leading-none">&times;</button>
               </div>
               
               <div className="overflow-y-auto w-full bg-white">
                  
                  {/* Top Manual Dimension Settings */}
                  <div className="p-4 bg-gray-50 border-b border-gray-200 sticky top-0 z-10 flex flex-col gap-4">
                     <div className="flex items-center justify-center gap-2">
                        <input type="number" value={customW} onChange={e => setCustomW(Number(e.target.value))} className="w-24 text-center border border-gray-300 rounded px-2 py-1 text-lg font-bold text-gray-800 shadow-sm" />
                        <span className="text-xl font-bold text-gray-800">&times;</span>
                        <input type="number" value={customH} onChange={e => setCustomH(Number(e.target.value))} className="w-24 text-center border border-gray-300 rounded px-2 py-1 text-lg font-bold text-gray-800 shadow-sm" />
                     </div>
                     <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2 w-full max-w-[200px]">
                           <span className="font-bold text-gray-600">W</span>
                           <input type="range" min="100" max="4096" value={customW} onChange={e => setCustomW(Number(e.target.value))} className="w-full accent-blue-500" />
                        </div>
                     </div>
                     <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2 w-full max-w-[200px]">
                           <span className="font-bold text-gray-600">H</span>
                           <input type="range" min="100" max="4096" value={customH} onChange={e => setCustomH(Number(e.target.value))} className="w-full accent-blue-500" />
                        </div>
                        <button onClick={() => createProject(customW, customH, dpi)} className="ml-4 w-12 h-12 bg-black text-white rounded-full font-bold flex items-center justify-center hover:bg-gray-800 shadow-md transition-transform active:scale-95">OK</button>
                     </div>
                  </div>

                  {/* List of Presets */}
                  <div className="flex flex-col border-b border-gray-200">
                     <div className="bg-gray-500 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">Illustration</div>
                     <PresetRow name="UHD" size="1862 x 4096" onClick={() => createProject(1862, 4096, 350)} icon="📱" />
                     <PresetRow name="1 : 1 (4K)" size="4096 x 4096" onClick={() => createProject(4096, 4096, 350)} icon="⏹️" />
                     <PresetRow name="3 : 4 (2K)" size="1536 x 2048" onClick={() => createProject(1536, 2048, 350)} icon="📄" />
                     <PresetRow name="9 : 16 (2K)" size="1080 x 1920" onClick={() => createProject(1080, 1920, 350)} icon="📱" />
                     <PresetRow name="16 : 9 (HD)" size="1920 x 1080" onClick={() => createProject(1920, 1080, 350)} icon="🖥️" />
                     <PresetRow name="X Header" size="1500 x 500" onClick={() => createProject(1500, 500, 350)} icon="🌆" />
                     <PresetRow name="Chat Stamp" size="370 x 320" onClick={() => createProject(370, 320, 350)} icon="💬" />
                     <PresetRow name="Vertical" size="690 x 4096" onClick={() => createProject(690, 4096, 350)} icon="📜" />
                  </div>

                  <div className="flex flex-col border-b border-gray-200">
                     <div className="bg-gray-500 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">For Printing (DPI Configured)</div>
                     <PresetRow name="Manga Manuscript" size="210 x 297 mm" onClick={() => createProject(1240, 1754, 350)} icon="📘" />
                     <PresetRow name="Postcard (JP)" size="1181 x 1748" dpi="300 dpi" onClick={() => createProject(1181, 1748, 300)} icon="📮" />
                     <PresetRow name="A4" size="1240 x 1754" dpi="150 dpi" onClick={() => createProject(1240, 1754, 150)} icon="📄" />
                     <PresetRow name="A5" size="874 x 1240" dpi="150 dpi" onClick={() => createProject(874, 1240, 150)} icon="📄" />
                     <PresetRow name="B4" size="1476 x 2085" dpi="150 dpi" onClick={() => createProject(1476, 2085, 150)} icon="📄" />
                  </div>

                  <div className="flex flex-col pb-8">
                     <div className="bg-gray-500 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">Animation</div>
                     <PresetRow name="1 : 1 (LLD)" size="640 x 640" onClick={() => createProject(640, 640, 72)} icon={(<Play className="w-5 h-5 fill-black"/>)} />
                     <PresetRow name="3 : 4 (LD)" size="640 x 480" onClick={() => createProject(640, 480, 72)} icon={(<Play className="w-5 h-5 fill-black"/>)} />
                     <PresetRow name="9 : 16 (SD)" size="1280 x 720" onClick={() => createProject(1280, 720, 72)} icon={(<Play className="w-5 h-5 fill-black"/>)} />
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PresetRow({ name, size, icon, dpi, onClick }: { name: string, size: string, icon: any, dpi?: string, onClick: () => void }) {
   return (
      <div 
         onClick={onClick}
         className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors group"
      >
         <div className="flex items-center gap-3">
            <div className="text-xl flex items-center justify-center text-gray-800 border-2 border-gray-800 rounded px-1 min-w-[32px] h-8 bg-gray-50">
               {typeof icon === 'string' ? icon : icon}
            </div>
            <span className="text-lg font-medium text-gray-800">{name}</span>
         </div>
         <div className="flex items-center gap-2">
            {dpi && <span className="px-2 py-0.5 border border-gray-300 text-sm font-medium text-gray-600 rounded bg-gray-50">{dpi}</span>}
            <div className="border border-gray-300 rounded overflow-hidden flex">
               <span className="px-3 py-1 font-mono font-medium text-gray-800 text-lg bg-white bg-w-full text-right min-w-[120px]">{size}</span>
               <span className="bg-gray-200 px-2 flex items-center justify-center border-l border-gray-300 group-hover:bg-blue-200 transition-colors">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M5 0L10 8H0L5 0Z" fill="#666"/></svg>
               </span>
            </div>
         </div>
      </div>
   )
}
