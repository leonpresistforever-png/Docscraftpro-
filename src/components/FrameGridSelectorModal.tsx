import React, { useState } from 'react';
import { X, Grid, Image as ImageIcon, Check, RefreshCw, Layout, Layers, Sliders, HelpCircle } from 'lucide-react';

interface FrameGridSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (htmlContent: string) => void;
}

const RESOLUTIONS = [
  { label: 'Square (1:1)', width: 1024, height: 1024, desc: 'Ideal for social cards & balanced layouts' },
  { label: 'Landscape (16:9)', width: 1920, height: 1080, desc: 'Cinematic widescreen layout' },
  { label: 'Portrait (4:5)', width: 1080, height: 1350, desc: 'Vertical focal frame' },
  { label: 'Banner (3:1)', width: 1200, height: 400, desc: 'Top margin heading sheets' },
  { label: 'Standard (4:3)', width: 1024, height: 768, desc: 'Classic photographic scale' }
];

const GRIDS = [
  { id: '1x1', name: 'Single Frame (1x1)', cols: 1, rows: 1, cells: [ { area: '1 / 1 / 2 / 2' } ] },
  { id: '2x1', name: 'Duplex Horizontal (2x1)', cols: 2, rows: 1, cells: [ { area: '1 / 1 / 2 / 2' }, { area: '1 / 2 / 2 / 3' } ] },
  { id: '1x2', name: 'Duplex Vertical (1x2)', cols: 1, rows: 2, cells: [ { area: '1 / 1 / 2 / 2' }, { area: '2 / 1 / 3 / 2' } ] },
  { id: '2x2', name: 'Quad Grid (2x2)', cols: 2, rows: 2, cells: [ { area: '1 / 1 / 2 / 2' }, { area: '1 / 2 / 2 / 3' }, { area: '2 / 1 / 3 / 2' }, { area: '2 / 2 / 3 / 3' } ] },
  { id: 'triptych', name: 'Triptych Split (3 Cell)', cols: 3, rows: 2, cells: [ { area: '1 / 1 / 3 / 2' }, { area: '1 / 2 / 2 / 4' }, { area: '2 / 2 / 3 / 4' } ] },
  { id: 'mosaic', name: 'Aesthetic Mosaic (4 Cell)', cols: 3, rows: 3, cells: [ { area: '1 / 1 / 3 / 3' }, { area: '1 / 3 / 2 / 4' }, { area: '2 / 3 / 4 / 4' }, { area: '3 / 1 / 4 / 3' } ] }
];

const THEMES = [
  { name: 'Minimal Architecture', query: 'architecture,minimal' },
  { name: 'Scenic Nature & Mist', query: 'nature,mist' },
  { name: 'Cyberpunk Concept Art', query: 'cyberpunk,neon' },
  { name: 'Editorial Flatlay', query: 'flatlay,desk' },
  { name: 'Warm Textures & Grain', query: 'texture,warm' },
  { name: 'Ethereal Space & Nebula', query: 'nebula,galaxy' }
];

// Unsplash IDs to provide high-quality curated images reliably
const SHUFFLED_IMAGE_POOL: Record<string, string[]> = {
  'architecture,minimal': [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'
  ],
  'nature,mist': [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05'
  ],
  'cyberpunk,neon': [
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5',
    'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd',
    'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071'
  ],
  'flatlay,desk': [
    'https://images.unsplash.com/photo-1517842645767-c639042777db',
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
    'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e',
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12'
  ],
  'texture,warm': [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc'
  ],
  'nebula,galaxy': [
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
    'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0',
    'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3'
  ]
};

export default function FrameGridSelectorModal({ isOpen, onClose, onApply }: FrameGridSelectorModalProps) {
  const [selectedRes, setSelectedRes] = useState(RESOLUTIONS[0]);
  const [selectedGrid, setSelectedGrid] = useState(GRIDS[0]);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  
  // Custom Styles
  const [gapSize, setGapSize] = useState('8px');
  const [borderRadius, setBorderRadius] = useState('12px');
  const [borderStyle, setBorderStyle] = useState('solid');
  const [borderColor, setBorderColor] = useState('#D4AF37'); // Classic gold
  const [borderWidth, setBorderWidth] = useState('1px');
  
  const [seed, setSeed] = useState(1);

  if (!isOpen) return null;

  const handleShuffle = () => {
    setSeed(prev => prev + 1);
  };

  const getCellImageUrl = (index: number) => {
    const urls = SHUFFLED_IMAGE_POOL[selectedTheme.query] || SHUFFLED_IMAGE_POOL['architecture,minimal'];
    const url = urls[(index + seed) % urls.length];
    return `${url}?auto=format&fit=crop&w=600&q=80`;
  };

  const buildHtmlSnippet = () => {
    const gridStyle = `
      display: grid;
      grid-template-columns: repeat(${selectedGrid.cols}, 1fr);
      grid-template-rows: repeat(${selectedGrid.rows}, 1fr);
      gap: ${gapSize};
      width: 100%;
      aspect-ratio: ${selectedRes.width} / ${selectedRes.height};
      max-width: 100%;
      margin: 24px auto;
      padding: ${gapSize};
      background-color: #FAF9F6;
      border: ${borderWidth} ${borderStyle} ${borderColor};
      border-radius: ${borderRadius};
      box-sizing: border-box;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    `.replace(/\s+/g, ' ').trim();

    const cellBaseStyle = `
      position: relative;
      overflow: hidden;
      border-radius: calc(${borderRadius} - 2px);
      background-color: #EAE6DF;
    `.replace(/\s+/g, ' ').trim();

    const cellsHtml = selectedGrid.cells.map((cell, idx) => {
      const src = getCellImageUrl(idx);
      const innerStyle = `
        grid-area: ${cell.area};
        ${cellBaseStyle}
      `.replace(/\s+/g, ' ').trim();

      const imgStyle = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.3s ease;
      `.replace(/\s+/g, ' ').trim();

      return `
        <div style="${innerStyle}">
          <img src="${src}" alt="Frame layout section ${idx + 1}" style="${imgStyle}" />
          <div style="position: absolute; bottom: 8px; right: 8px; font-family: monospace; font-size: 9px; color: rgba(255,255,255,0.75); background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 4px;">
            Cell #${idx + 1}
          </div>
        </div>
      `.trim();
    }).join('\n');

    return `
      <div class="manga-frame-grid-wrapper" style="width: 100%; max-width: 800px; margin: 0 auto; padding: 10px;">
        <div style="${gridStyle}">
          ${cellsHtml}
        </div>
        <p style="text-align: center; font-size: 11px; color: #888; font-family: sans-serif; margin-top: 8px; margin-bottom: 24px;">
          📷 Photo Studio Frame Layout: <strong>${selectedRes.width}x${selectedRes.height} px</strong> (${selectedRes.label}) &bull; Grid: ${selectedGrid.name}
        </p>
      </div>
    `.trim();
  };

  const handleApplySnippet = () => {
    const html = buildHtmlSnippet();
    onApply(html);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 text-gray-800">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-5xl w-full flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        
        {/* Left side settings column */}
        <div className="w-full md:w-5/12 bg-gray-50/50 p-6 border-r border-gray-100 overflow-y-auto max-h-[80vh] md:max-h-none">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Grid className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-950">Resolution & Grid Studio</h3>
                <p className="text-[10px] text-gray-400 font-medium">Configure document picture frames</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 px-2 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors md:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Setup 1: Aspect Ratio Resolutions */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              1. Target Frame Resolution 
            </label>
            <div className="space-y-2">
              {RESOLUTIONS.map((res) => {
                const isSelected = selectedRes.label === res.label;
                return (
                  <button
                    key={res.label}
                    onClick={() => setSelectedRes(res)}
                    className={`w-full text-left p-3 rounded-2xl border text-xs transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950 shadow-sm' 
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-1">
                        {res.label} 
                        {isSelected && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{res.desc}</div>
                    </div>
                    <span className="font-mono text-[10px] bg-gray-100 font-bold text-gray-505 px-2 py-1 rounded">
                      {res.width} x {res.height} px
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Setup 2: Grid Splits */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              2. Grid Configuration & Panels
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GRIDS.map((g) => {
                const isSelected = selectedGrid.id === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGrid(g)}
                    className={`p-3 rounded-2xl border text-left transition-all text-xs flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                        : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <Layout className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-emerald-500' : 'text-gray-400'}`} />
                    <div>
                      <div className="font-semibold">{g.name.split(' (')[0]}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{g.cells.length} Pix Frame Cells</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Setup 3: Image Theme Select */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              3. Image Category & Curation
            </label>
            <div className="bg-white border border-gray-200 rounded-2xl p-1.5 relative z-10">
              {THEMES.map((th) => {
                const isSelected = selectedTheme.name === th.name;
                return (
                  <button
                    key={th.name}
                    onClick={() => setSelectedTheme(th)}
                    className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                      isSelected ? 'bg-emerald-550 bg-emerald-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{th.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Setup 4: Style Variables */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              4. Layout Styles
            </label>
            <div className="space-y-3.5 bg-white border border-gray-100 rounded-2xl p-4">
              
              {/* Gap controls */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-1">
                  <span>Cell Interval (Gap)</span>
                  <span className="font-mono">{gapSize}</span>
                </div>
                <div className="flex gap-1.5">
                  {['0px', '4px', '8px', '16px'].map(gap => (
                    <button
                      key={gap}
                      onClick={() => setGapSize(gap)}
                      className={`flex-1 py-1 text-[10px] rounded border font-semibold ${gapSize === gap ? 'bg-emerald-50 border-emerald-250 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                    >
                      {gap}
                    </button>
                  ))}
                </div>
              </div>

              {/* BorderRadius controls */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-1">
                  <span>Rounded Corners (Radius)</span>
                  <span className="font-mono">{borderRadius}</span>
                </div>
                <div className="flex gap-1.5">
                  {['0px', '8px', '12px', '24px', '9999px'].map(b => (
                    <button
                      key={b}
                      onClick={() => setBorderRadius(b)}
                      className={`flex-1 py-1 text-[10px] rounded border font-semibold ${borderRadius === b ? 'bg-emerald-50 border-emerald-250 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                    >
                      {b === '0px' ? 'Sharp' : b === '9999px' ? 'Circle' : b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Color */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-1">
                  <span>Frame Border Accent</span>
                </div>
                <div className="flex gap-2">
                  {[
                    { hex: '#D4AF37', label: 'Classic Gold' },
                    { hex: '#1a1a1a', label: 'Dark Carbon' },
                    { hex: '#10B981', label: 'Emerald' },
                    { hex: '#3B82F6', label: 'Deep Blue' }
                  ].map(color => (
                    <button
                      key={color.hex}
                      title={color.label}
                      onClick={() => setBorderColor(color.hex)}
                      className="w-6 h-6 rounded-full border-2 transition-transform flex items-center justify-center scale-100 hover:scale-110 shrink-0"
                      style={{ 
                        backgroundColor: color.hex,
                        borderColor: borderColor === color.hex ? '#9e7911' : '#e5e7eb'
                      }}
                    >
                      {borderColor === color.hex && <Check className="w-3 h-3 text-white mix-blend-difference" />}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right side live visualizer */}
        <div className="flex-1 p-6 bg-gray-100/30 flex flex-col justify-between max-h-[82vh] md:max-h-none overflow-y-auto">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-550 text-emerald-600" />
                Live Canvas Grid Preview
              </h4>
              <p className="text-[10px] text-gray-400">Dynamic mockup compiled directly from your spec parameters</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShuffle}
                className="flex items-center gap-2 p-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold hover:bg-gray-50 text-gray-600 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Shuffle Images
              </button>
              <button onClick={onClose} className="p-1.5 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors hidden md:block">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive display area */}
          <div className="flex-1 flex items-center justify-center py-6">
            <div className="bg-white p-4 rounded-3xl border border-gray-250/20 shadow-md w-full max-w-lg transition-all duration-300">
              
              {/* Actual compiled grid preview */}
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${selectedGrid.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${selectedGrid.rows}, 1fr)`,
                  gap: gapSize,
                  width: '100%',
                  aspectRatio: `${selectedRes.width} / ${selectedRes.height}`,
                  backgroundColor: '#FAF9F6',
                  border: `${borderWidth} ${borderStyle} ${borderColor}`,
                  borderRadius: borderRadius,
                  padding: gapSize,
                  boxSizing: 'border-box',
                  overflow: 'hidden'
                }}
              >
                {selectedGrid.cells.map((cell, idx) => (
                  <div 
                    key={idx}
                    style={{
                      gridArea: cell.area,
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: `calc(${borderRadius} - 2px)`,
                      backgroundColor: '#EAE6DF',
                      border: '1px solid rgba(0,0,0,0.03)'
                    }}
                  >
                    <img 
                      src={getCellImageUrl(idx)} 
                      alt="Mock cell" 
                      className="w-full h-full object-cover select-none pointer-events-none" 
                    />
                    <div className="absolute inset-0 bg-transparent flex items-start justify-start p-2">
                      <span className="text-[9px] font-mono bg-black/60 text-white px-1.5 py-0.5 rounded backdrop-blur-xs font-bold leading-none select-none">
                        Cell {idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scale tags below */}
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono mt-3 px-1">
                <span>Ratios: {selectedRes.width} x {selectedRes.height} px</span>
                <span>Seed: dch-{seed}-{selectedTheme.query.slice(0, 4)}</span>
              </div>
            </div>
          </div>

          {/* Instruction & Call Action Footer */}
          <div className="pt-4 border-t border-gray-100 shrink-0">
            <div className="flex items-start gap-2 bg-amber-50/50 border border-amber-100 p-2.5 rounded-2xl text-[11px] text-amber-850/80 mb-4">
              <HelpCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <p>
                <strong>Workspace Sync Mode:</strong> Clicking "Apply in Workspace" will inject this compiled grid layout into your document at the current catalog selector index, with real, responsive Unsplash pixel bindings.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-gray-300 hover:bg-gray-50 rounded-2xl font-bold text-xs text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplySnippet}
                className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Layers className="w-4 h-4" /> Apply in Workspace Docs
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
