import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Star, Search, Filter, PenTool, Image as ImageIcon, Download, Copy, Maximize, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { MANGA_FRAMES } from '../lib/mangaFrames';
import { extractPanelsFromImage } from '../lib/mangaExtractor';
import ClipperStudio from '../components/clipper/ClipperStudio';

export default function FrameLibrary() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [activeCategory, setActiveCategory] = useState('Manga Panels');
  const [activeStyle, setActiveStyle] = useState('Manga');
  const [activeLayout, setActiveLayout] = useState('');
  const [activeType, setActiveType] = useState('');
  const [activeSort, setActiveSort] = useState('Popular');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawingDivider, setIsDrawingDivider] = useState(false);

  const handleCustomDividerSave = async (dataUrl: string) => {
      alert("Extracting frames... this might take a moment.");
      setIsDrawingDivider(false);
      const layoutData = await extractPanelsFromImage(dataUrl);
      if (layoutData) {
          localStorage.setItem('pending_manga_frame', 'custom');
          localStorage.setItem('pending_manga_custom_layout', JSON.stringify(layoutData));
          navigate(`/doc/${id}`);
      } else {
          alert("Could not extract frames from the drawn layout. Please try again with thicker borders.");
      }
  };

  const categories = [
    { id: 'manga', label: 'Manga Panels' },
    { id: 'manhwa', label: 'Manhwa Webtoons' },
    { id: 'comic', label: 'Comic Strips' },
    { id: 'art', label: 'Art Frames' },
  ];

  const handleCustomImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        alert("Extracting frames... this might take a moment.");
        const layoutData = await extractPanelsFromImage(dataUrl);
        if (layoutData) {
            localStorage.setItem('pending_manga_frame', 'custom');
            localStorage.setItem('pending_manga_custom_layout', JSON.stringify(layoutData));
            navigate(`/doc/${id}`);
        } else {
            alert('Could not automatically determine layout from this image. Please try a cleaner image with clear borders.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const styles = ['Manga', 'Manhwa', 'Webtoon', 'Classic', 'Modern'];
  const layouts = ['Single Panel', 'Grid', 'Split', 'Vertical', 'Storyboard'];
  const types = ['B&W', 'Color', 'Hand-drawn', 'Minimalist', 'Ornate'];
  const sortOptions = ['Popular', 'Newest'];

  const filteredFrames = MANGA_FRAMES.filter(f => {
    if (activeLayout === 'Single Panel' && f.type !== 'single') return false;
    if (activeLayout === 'Grid' && f.type !== 'grid') return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-gray-800 flex flex-col relative overflow-hidden">
      
      {/* Background Decorative Sketches */}
      <div className="absolute top-10 left-[-5%] opacity-30 pointer-events-none rotate-[-15deg] mix-blend-multiply overflow-hidden rounded-lg shadow-lg">
        <img src="https://i.pinimg.com/736x/21/df/b2/21dfb25d194c77fcbcdba5fbd765be5d.jpg" alt="manga decor" className="w-64 h-auto object-cover grayscale contrast-125" />
      </div>
      <div className="absolute top-[30%] left-[-2%] opacity-30 pointer-events-none rotate-[8deg] mix-blend-multiply overflow-hidden rounded-lg shadow-lg">
        <img src="https://i.pinimg.com/736x/0a/6d/f4/0a6df405b0be1947b7fd4465b596e19f.jpg" alt="manga decor" className="w-56 h-auto object-cover grayscale contrast-125" />
      </div>
      <div className="absolute bottom-20 left-10 opacity-30 pointer-events-none rotate-[10deg] mix-blend-multiply overflow-hidden rounded-lg shadow-lg">
        <img src="https://i.pinimg.com/736x/8e/31/5d/8e315d0bfaccbd9443fa92759e0a0a55.jpg" alt="manga decor" className="w-48 h-auto object-cover grayscale contrast-125" />
      </div>
      
      <div className="absolute top-[20%] right-[-5%] opacity-20 pointer-events-none rotate-[20deg] mix-blend-multiply overflow-hidden rounded-lg shadow-xl">
        <img src="https://i.pinimg.com/736x/21/df/b2/21dfb25d194c77fcbcdba5fbd765be5d.jpg" alt="manga decor" className="w-48 h-auto object-cover grayscale contrast-125" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-[#FDFBF7] relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg">C</div>
          <span className="font-bold text-xl tracking-tight">Canvas Studio</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#" className="hover:text-gray-600 transition-colors">Browse Frames</a>
          <a href="#" className="hover:text-gray-600 transition-colors">Pricing</a>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center pt-16 pb-8 px-4 relative z-10 w-full max-w-6xl mx-auto">
        <button 
           onClick={() => navigate(`/doc/${id}`)}
           className="absolute left-4 top-0 p-2 text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-2 text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Editor
        </button>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-[#2C2420]">
          FRAME LIBRARY: Find Your Perfect Panel Layout
        </h1>
        <p className="text-gray-600 text-lg">
          Discover hundreds of beautiful frames for manga, manhwa, webtoons, and art. Curated for creators.
        </p>
      </section>

      {/* Filters Area */}
      <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
        <div className="bg-[#FAF8F2] border border-gray-200/60 shadow-sm rounded-xl p-4 mb-8">
          <div className="flex flex-wrap md:flex-nowrap gap-6 md:gap-4 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            
            {/* Style Group */}
            <div className="flex-1 pr-6 border-r border-gray-200 min-w-max">
              <h3 className="text-xs font-bold mb-2 ml-1">Style</h3>
              <div className="flex gap-2">
                {styles.map(s => (
                  <button 
                    key={s} 
                    onClick={() => setActiveStyle(s)}
                    className={`px-3 py-1.5 text-sm rounded-lg border border-transparent transition-all whitespace-nowrap ${activeStyle === s ? 'bg-[#3A2D28] text-white' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Group */}
            <div className="flex-1 pr-6 border-r border-gray-200 min-w-max">
              <h3 className="text-xs font-bold mb-2 ml-1">Layout</h3>
              <div className="flex gap-2">
                {layouts.map(l => (
                  <button 
                    key={l}
                    onClick={() => setActiveLayout(l)}
                    className={`px-3 py-1.5 text-sm rounded-lg border border-transparent transition-all whitespace-nowrap ${activeLayout === l ? 'bg-[#3A2D28] text-white' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Group */}
            <div className="flex-1 pr-6 border-r border-gray-200 min-w-max">
              <h3 className="text-xs font-bold mb-2 ml-1">Type</h3>
              <div className="flex gap-2">
                {types.map(t => (
                  <button 
                    key={t}
                    onClick={() => setActiveType(t)}
                    className={`px-3 py-1.5 text-sm rounded-lg border border-transparent transition-all whitespace-nowrap ${activeType === t ? 'bg-[#3A2D28] text-white' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Group */}
            <div className="min-w-max pl-2">
              <h3 className="text-xs font-bold mb-2 ml-1">Sort By</h3>
              <div className="flex gap-2">
                {sortOptions.map(so => (
                  <button 
                    key={so}
                    onClick={() => setActiveSort(so)}
                    className={`px-3 py-1.5 text-sm rounded-lg border border-transparent transition-all whitespace-nowrap ${activeSort === so ? 'bg-[#3A2D28] text-white' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    {so}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-6 pb-20 flex flex-col md:flex-row gap-8 flex-1 relative z-10">
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-60 shrink-0">
          <nav className="space-y-1 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.label)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-medium text-[15px] ${activeCategory === cat.label ? 'bg-[#F2EFE8] text-[#3A2D28]' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {cat.label}
              </button>
            ))}
          </nav>
          
          <button className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:bg-gray-100 w-full rounded-xl transition-colors font-medium text-[15px]">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Favorites
          </button>

          <div className="mt-8 space-y-3">
            <button 
              onClick={() => navigate(`/doc/${id}/clipper`)}
              className="flex items-center gap-3 px-4 py-3 text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 w-full rounded-xl transition-all font-bold text-[15px] shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <PenTool className="w-5 h-5" />
              Clipper Studio
            </button>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleCustomImport} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-3 px-4 py-3 text-[#3A2D28] bg-white border border-gray-300 hover:bg-gray-50 w-full rounded-xl transition-all font-bold text-[15px] shadow-sm"
            >
              <ImageIcon className="w-5 h-5" />
              Import Custom layout
            </button>
          </div>

        </aside>

        {/* Main Grid */}
        <main className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {filteredFrames.map((frame, idx) => (
              <FrameCard 
                key={frame.id} 
                frame={frame} 
                idx={idx} 
                onSelect={() => {
                  localStorage.setItem('pending_manga_frame', frame.id);
                  navigate(`/doc/${id}`);
                }}
                onEdit={() => {
                  navigate(`/doc/${id}/clipper?frameId=${frame.id}`);
                }}
              />
            ))}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#FDFBF7] py-8 px-8 border-t border-gray-200 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-gray-800">
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-500">About</a>
            <a href="#" className="hover:text-gray-500">Help</a>
            <a href="#" className="hover:text-gray-500">Contact</a>
            <a href="#" className="hover:text-gray-500">Blog</a>
            <a href="#" className="hover:text-gray-500">Newsletter</a>
          </div>
          <div className="flex gap-4 items-center text-gray-500">
             <span>© 2024 Canvas Studio</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FrameCard({ frame, idx, onSelect, onEdit }: { frame: any, idx: number, onSelect: () => void, onEdit: () => void }) {
  const isOrnate = frame.type.startsWith('ornate');
  const isScroll = frame.type === 'scroll';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: idx * 0.05 }}
      onClick={onSelect}
      className="bg-[#FAF8F3] rounded-2xl p-3 border border-gray-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all flex flex-col group cursor-pointer"
    >
      <div className="bg-[#F0EEEC] rounded-xl aspect-[3/4] mb-3 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Actual layout preview instead of placeholder placeholders */}
        <div 
          className="w-full h-full bg-black border border-gray-300"
          style={{
            display: 'grid',
            gridTemplateColumns: frame.layout?.gridTemplateColumns,
            gridTemplateRows: frame.layout?.gridTemplateRows,
            gap: '2px',
            padding: '2px',
            backgroundColor: '#000'
          }}
        >
          {frame.layout?.panels?.map((panel: any) => (
             <div key={panel.id} style={{ 
               gridArea: panel.gridArea, 
               clipPath: panel.clipPath, 
               backgroundColor: '#fff', 
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%239C92AC' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
               width: '100%', 
               height: '100%' 
             }}></div>
          ))}
        </div>
      </div>

      <div className="px-1 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-bold text-[13px] leading-tight text-gray-800 line-clamp-1">{frame.title}</h4>
          <span className="text-[10px] bg-[#E8E4D8] text-gray-700 px-1.5 py-0.5 rounded font-bold shrink-0 ml-2">
            {frame.badge}
          </span>
        </div>
        <p className="text-[11px] text-gray-500 mb-4">{frame.desc}</p>
        
        <div className="flex gap-2 mt-auto">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex-1 px-2 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit in Clipper
          </button>
          <button onClick={onSelect} className="flex-1 px-2 py-1.5 text-xs font-semibold text-white bg-[#308155] rounded-lg hover:bg-[#256843] transition-colors relative overflow-hidden group/btn shadow-sm">
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500"></div>
            Use Frame
          </button>
        </div>
      </div>
    </motion.div>
  );
}
