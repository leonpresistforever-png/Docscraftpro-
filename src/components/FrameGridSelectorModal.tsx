import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Grid, Image as ImageIcon, Check, RefreshCw, Layout, 
  Layers, Sliders, HelpCircle, Upload, Type, Trash2, Move, Plus 
} from 'lucide-react';
import html2canvas from 'html2canvas';

interface FrameGridSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (htmlContent: string) => void;
}

interface GridTextBlock {
  id: string;
  text: string;
  x: number; // percentage of grid width (0-100)
  y: number; // percentage of grid height (0-100)
  fontSize: number; // in pixels
  color: string;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  rotate: number; // in degrees
  opacity: number; // 0-1
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

const FONT_FAMILIES = [
  { name: 'Inter (Sans)', value: 'Inter, sans-serif' },
  { name: 'Space Grotesk (Tech)', value: '"Space Grotesk", sans-serif' },
  { name: 'Playfair Display (Serif)', value: '"Playfair Display", serif' },
  { name: 'JetBrains Mono', value: '"JetBrains Mono", monospace' }
];

const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#D4AF37', '#EF4444', '#3B82F6', '#10B981', '#F59E0B'
];

export default function FrameGridSelectorModal({ isOpen, onClose, onApply }: FrameGridSelectorModalProps) {
  const [selectedRes, setSelectedRes] = useState(RESOLUTIONS[0]);
  const [selectedGrid, setSelectedGrid] = useState(GRIDS[0]);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  
  // Custom Styles
  const [gapSize, setGapSize] = useState('8px');
  const [borderRadius, setBorderRadius] = useState('12px');
  const [borderStyle] = useState('solid');
  const [borderColor, setBorderColor] = useState('#D4AF37'); // Classic gold
  const [borderWidth, setBorderWidth] = useState('1px');
  
  const [seed, setSeed] = useState(1);
  const [activeSubTab, setActiveSubTab] = useState<'options' | 'gallery' | 'typography'>('options');

  // Custom cell images (gallery upload) & texts
  const [customCellImages, setCustomCellImages] = useState<Record<number, string>>({});
  const [cellTexts, setCellTexts] = useState<Record<number, string>>({});
  const [showWatermarks, setShowWatermarks] = useState(true);

  // Floating draggable text blocks
  const [floatingTexts, setFloatingTexts] = useState<GridTextBlock[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  
  // Draggable variables
  const [draggingTextId, setDraggingTextId] = useState<string | null>(null);
  const dragStartPoint = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputsRef = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    // Reset selections on grid change to avoid out of bounds
    setCustomCellImages({});
    setCellTexts({});
    setFloatingTexts([]);
    setSelectedTextId(null);
  }, [selectedGrid]);

  if (!isOpen) return null;

  const handleShuffle = () => {
    setSeed(prev => prev + 1);
  };

  const getCellImageUrl = (index: number) => {
    if (customCellImages[index]) {
      return customCellImages[index];
    }
    const urls = SHUFFLED_IMAGE_POOL[selectedTheme.query] || SHUFFLED_IMAGE_POOL['architecture,minimal'];
    const url = urls[(index + seed) % urls.length];
    return `${url}?auto=format&fit=crop&w=600&q=80`;
  };

  const handleCellImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setCustomCellImages(prev => ({
          ...prev,
          [index]: url
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddFloatingText = () => {
    const newTextBlock: GridTextBlock = {
      id: 'txt_' + Date.now(),
      text: 'Floating Caption Text',
      x: 50,
      y: 50,
      fontSize: 24,
      color: '#FFFFFF',
      fontFamily: 'Inter, sans-serif',
      isBold: true,
      isItalic: false,
      rotate: 0,
      opacity: 1
    };
    setFloatingTexts(prev => [...prev, newTextBlock]);
    setSelectedTextId(newTextBlock.id);
    setActiveSubTab('typography');
  };

  const handleUpdateText = (id: string, updates: Partial<GridTextBlock>) => {
    setFloatingTexts(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDeleteText = (id: string) => {
    setFloatingTexts(prev => prev.filter(t => t.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  // Draggable logic for floating texts over preview
  const startDragText = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedTextId(id);
    setDraggingTextId(id);

    const target = floatingTexts.find(t => t.id === id);
    if (target && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const currentXPixels = (target.x / 100) * rect.width;
      const currentYPixels = (target.y / 100) * rect.height;

      dragStartPoint.current = {
        x: mouseX - currentXPixels,
        y: mouseY - currentYPixels
      };
    }
  };

  const updateDragText = (e: React.MouseEvent) => {
    if (!draggingTextId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newXPixels = mouseX - dragStartPoint.current.x;
    const newYPixels = mouseY - dragStartPoint.current.y;

    let pctX = (newXPixels / rect.width) * 100;
    let pctY = (newYPixels / rect.height) * 100;

    pctX = Math.max(0, Math.min(100, pctX));
    pctY = Math.max(0, Math.min(100, pctY));

    handleUpdateText(draggingTextId, { x: pctX, y: pctY });
  };

  const endDragText = () => {
    setDraggingTextId(null);
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
      margin: 12px auto;
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

      const customTitle = cellTexts[idx] !== undefined ? cellTexts[idx] : `Cell #${idx + 1}`;
      const textOverlayHtml = (showWatermarks && customTitle.trim() !== '') ? `
        <div style="position: absolute; bottom: 8px; right: 8px; font-family: monospace; font-size: 10px; color: rgba(255,255,255,0.9); background: rgba(0,0,0,0.6); padding: 3px 8px; border-radius: 4px; z-index: 5; pointer-events: none; letter-spacing: 0.5px; transition: opacity 0.2s;">
          ${customTitle}
        </div>
      `.trim() : '';

      return `
        <div style="${innerStyle}">
          <img src="${src}" alt="Frame layout section ${idx + 1}" style="${imgStyle}" />
          ${textOverlayHtml}
        </div>
      `.trim();
    }).join('\n');

    const floatingTextsHtml = floatingTexts.map(txt => {
      const txtStyle = `
        position: absolute;
        left: ${txt.x}%;
        top: ${txt.y}%;
        font-family: ${txt.fontFamily};
        font-size: ${txt.fontSize}px;
        color: ${txt.color};
        transform: translate(-50%, -50%) rotate(${txt.rotate}deg);
        opacity: ${txt.opacity};
        font-weight: ${txt.isBold ? 'bold' : 'normal'};
        font-style: ${txt.isItalic ? 'italic' : 'normal'};
        text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
        z-index: 10;
        pointer-events: none;
        white-space: nowrap;
        user-select: none;
      `.replace(/\s+/g, ' ').trim();

      return `<div class="floating-layout-caption" style="${txtStyle}">${txt.text}</div>`;
    }).join('\n');

    return `
      <div class="manga-frame-grid-wrapper" style="position: relative; width: 100%; max-width: 800px; margin: 0 auto; padding: 10px; box-sizing: border-box;">
        <div style="${gridStyle}">
          ${cellsHtml}
        </div>
        ${floatingTextsHtml}
        <p style="text-align: center; font-size: 11px; color: #888; font-family: sans-serif; margin-top: 8px; margin-bottom: 24px;">
          📷 Photo Studio Frame Layout: <strong>${selectedRes.width}x${selectedRes.height} px</strong> (${selectedRes.label}) &bull; Grid: ${selectedGrid.name}
        </p>
      </div>
    `.trim();
  };

  const handleApplySnippet = async () => {
    if (!containerRef.current) return;
    
    setSelectedTextId(null); // Clear selection before capture
    
    // Slight delay to allow React to render the cleared selection state
    await new Promise(r => setTimeout(r, 50));
    
    try {
      // Find the actual grid element inside the container
      const gridElement = containerRef.current.querySelector(':scope > div:first-child') as HTMLElement;
      if (!gridElement) return;
      
      const canvas = await html2canvas(gridElement, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#FAF9F6',
        scale: 2 // Higher resolution output
      });
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      onApply(`<div style="width: 100%; max-width: 800px; margin: 16px auto;"><img src="${dataUrl}" alt="Photo Grid Frame" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" /></div>`);
    } catch (e) {
      console.error("Failed to generate image from frame", e);
      // Fallback
      onApply(buildHtmlSnippet());
    }
  };

  const activeText = floatingTexts.find(t => t.id === selectedTextId);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 text-gray-800">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-105 max-w-6xl w-full flex flex-col md:flex-row overflow-hidden max-h-[92vh]">
        
        {/* Left side settings column */}
        <div className="w-full md:w-5/12 bg-gray-50/50 p-6 border-r border-gray-100 overflow-y-auto max-h-[40vh] md:max-h-[92vh] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-950">Resolution & Grid Studio</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Configure high-res embedded grids & typography</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 px-2 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors md:hidden">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Studio Navigation Tabs */}
            <div className="flex gap-2 border-b border-gray-200 mb-6 pb-px shrink-0">
              <button 
                type="button"
                onClick={() => setActiveSubTab('options')}
                className={`pb-2 px-1 text-xs font-bold border-b-2 transition-all ${
                  activeSubTab === 'options' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-800'
                }`}
              >
                1. Resolutions & Border
              </button>
              <button 
                type="button"
                onClick={() => setActiveSubTab('gallery')}
                className={`pb-2 px-1 text-xs font-bold border-b-2 transition-all ${
                  activeSubTab === 'gallery' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-800'
                }`}
              >
                2. Gallery & Titles
              </button>
              <button 
                type="button"
                onClick={() => setActiveSubTab('typography')}
                className={`pb-2 px-1 text-xs font-bold border-b-2 transition-all ${
                  activeSubTab === 'typography' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-800'
                }`}
              >
                3. Floating Typography Studio
              </button>
            </div>

            {/* TAB 1: Core setup options */}
            {activeSubTab === 'options' && (
              <div className="space-y-6">
                {/* 1. Ratio */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    A. Aspect Ratio Resolutions
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {RESOLUTIONS.map((res) => {
                      const isSelected = selectedRes.label === res.label;
                      return (
                        <button
                          key={res.label}
                          type="button"
                          onClick={() => setSelectedRes(res)}
                          className={`text-left p-3 rounded-2xl border text-xs transition-all flex items-center justify-between ${
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
                          <span className="font-mono text-[10px] bg-gray-100 font-bold text-gray-550 px-2 py-1 rounded">
                            {res.width} x {res.height} px
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Grid split */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    B. Grid Configuration & Panels
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {GRIDS.map((g) => {
                      const isSelected = selectedGrid.id === g.id;
                      return (
                        <button
                          key={g.id}
                          type="button"
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

                {/* 3. Style variables */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    C. Frame Borders & Gap Style
                  </label>
                  <div className="space-y-3.5 bg-white border border-gray-100 rounded-2xl p-4">
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-1">
                        <span>Cell Interval (Gap)</span>
                        <span className="font-mono">{gapSize}</span>
                      </div>
                      <div className="flex gap-1.5">
                        {['0px', '4px', '8px', '16px'].map(gap => (
                          <button
                            key={gap}
                            type="button"
                            onClick={() => setGapSize(gap)}
                            className={`flex-1 py-1 text-[10px] rounded border font-semibold ${gapSize === gap ? 'bg-emerald-50 border-emerald-250 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                          >
                            {gap}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-1">
                        <span>Rounded Corners (Radius)</span>
                        <span className="font-mono">{borderRadius}</span>
                      </div>
                      <div className="flex gap-1.5">
                        {['0px', '8px', '12px', '24px', '9999px'].map(b => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setBorderRadius(b)}
                            className={`flex-1 py-1 text-[10px] rounded border font-semibold ${borderRadius === b ? 'bg-emerald-50 border-emerald-250 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                          >
                            {b === '0px' ? 'Sharp' : b === '9999px' ? 'Circle' : b}
                          </button>
                        ))}
                      </div>
                    </div>

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
                            type="button"
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
            )}

            {/* TAB 2: Custom Gallery uploads, Titles label */}
            {activeSubTab === 'gallery' && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Cell Graphic Assets & Gallery
                    </label>
                    <button 
                      type="button"
                      onClick={() => setCustomCellImages({})}
                      className="text-[10px] text-red-500 hover:underline font-bold"
                    >
                      Reset All to Unsplash
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500 mb-3">
                    Upload image files natively from your camera, gallery, or local storage to replace individual grid cell pixels!
                  </p>

                  <div className="space-y-3.5 bg-white border border-gray-100 rounded-2xl p-4">
                    {selectedGrid.cells.map((_, idx) => (
                      <div key={idx} className="flex flex-col gap-2 p-2 border-b border-gray-150/50 last:border-0 pb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-800">Panel Cell #{idx + 1}</span>
                          {customCellImages[idx] ? (
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold font-mono">My Gallery Image</span>
                          ) : (
                            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold font-mono">Stock Category</span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputsRef.current[idx]?.click()}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
                          >
                            <Upload className="w-3.5 h-3.5" /> Upload File
                          </button>
                          <input 
                            type="file"
                            ref={el => { fileInputsRef.current[idx] = el; }}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleCellImageUpload(e, idx)}
                          />

                          {customCellImages[idx] && (
                            <button
                              type="button"
                              onClick={() => {
                                setCustomCellImages(prev => {
                                  const c = { ...prev };
                                  delete c[idx];
                                  return c;
                                });
                              }}
                              className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 text-[11px] font-bold py-2 rounded-lg transition-colors"
                            >
                              Reset Stock
                            </button>
                          )}
                        </div>

                        {/* Title text label */}
                        <div className="mt-1">
                          <label className="block text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">Custom Display Title override</label>
                          <input 
                            type="text"
                            placeholder={`e.g. Card Header label (Default: Cell #${idx+1})`}
                            value={cellTexts[idx] || ''}
                            onChange={(e) => setCellTexts(prev => ({ ...prev, [idx]: e.target.value }))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 text-xs py-1.5 focus:border-emerald-600 focus:bg-white outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-gray-901">Show Watermark Labels</h5>
                    <p className="text-[10px] text-gray-400">Controls if the corner labels of cells are written</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={showWatermarks}
                    onChange={(e) => setShowWatermarks(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {/* 3. Category selector fallback */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                    Stock category lookup fallback
                  </label>
                  <div className="bg-white border border-gray-200 rounded-2xl p-1.5 relative z-10">
                    {THEMES.map((th) => {
                      const isSelected = selectedTheme.name === th.name;
                      return (
                        <button
                          key={th.name}
                          type="button"
                          onClick={() => setSelectedTheme(th)}
                          className={`w-full text-left px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                            isSelected ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{th.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Draggable typography elements */}
            {activeSubTab === 'typography' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Captions Floating Stream ({floatingTexts.length})</span>
                  <button
                    type="button"
                    onClick={handleAddFloatingText}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase"
                  >
                    <Plus className="w-4 h-4" /> Add Text Block
                  </button>
                </div>

                <div className="space-y-2">
                  {floatingTexts.map(txt => (
                    <div 
                      key={txt.id}
                      onClick={() => setSelectedTextId(txt.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedTextId === txt.id ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden pr-2">
                        <Type className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-xs font-bold truncate max-w-full text-gray-800">{txt.text}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteText(txt.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {floatingTexts.length === 0 && (
                    <div className="text-center py-8 text-gray-400 bg-white border border-dashed border-gray-200 rounded-2xl">
                      <Type className="w-8 h-8 mx-auto opacity-30 mb-2" />
                      <p className="text-xs font-medium">No floating layout texts active.</p>
                      <p className="text-[10px] mt-1">Generate captions overlays and drag them anywhere in full visual.</p>
                    </div>
                  )}
                </div>

                {/* Properties editor for selected floating text */}
                {activeText && (
                  <div className="bg-white border border-gray-250/50 p-4 rounded-2xl space-y-4.5 mt-4">
                    <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Configure Caption Block</h5>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Text string</label>
                      <input 
                        type="text"
                        value={activeText.text}
                        onChange={(e) => handleUpdateText(activeText.id, { text: e.target.value })}
                        className="w-full bg-[#FAF9F6] border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-medium outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Font family</label>
                      <select
                        value={activeText.fontFamily}
                        onChange={(e) => handleUpdateText(activeText.id, { fontFamily: e.target.value })}
                        className="w-full bg-[#FAF9F6] border border-gray-200 rounded-lg p-2 text-xs"
                      >
                        {FONT_FAMILIES.map(item => (
                          <option key={item.value} value={item.value}>{item.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Size range slider - stopPropagation added natively */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-[#808080]">
                        <span>Font Size</span>
                        <span>{activeText.fontSize}px</span>
                      </div>
                      <input 
                        type="range"
                        min={12}
                        max={72}
                        value={activeText.fontSize}
                        onChange={(e) => handleUpdateText(activeText.id, { fontSize: parseInt(e.target.value) })}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>

                    {/* Rotation range slider - stopPropagation added natively */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-[#808080]">
                        <span>Rotation</span>
                        <span>{activeText.rotate}°</span>
                      </div>
                      <input 
                        type="range"
                        min={0}
                        max={360}
                        value={activeText.rotate}
                        onChange={(e) => handleUpdateText(activeText.id, { rotate: parseInt(e.target.value) })}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>

                    {/* Opacity range slider - stopPropagation added natively */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-[#808080]">
                        <span>Opacity</span>
                        <span>{Math.round(activeText.opacity * 100)}%</span>
                      </div>
                      <input 
                        type="range"
                        min={0.1}
                        max={1.0}
                        step={0.05}
                        value={activeText.opacity}
                        onChange={(e) => handleUpdateText(activeText.id, { opacity: parseFloat(e.target.value) })}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>

                    {/* Font stylings */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateText(activeText.id, { isBold: !activeText.isBold })}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                          activeText.isBold ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Bold
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateText(activeText.id, { isItalic: !activeText.isItalic })}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                          activeText.isItalic ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Italic
                      </button>
                    </div>

                    {/* Swatches */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Text Swatches Color</label>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_COLORS.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => handleUpdateText(activeText.id, { color })}
                            className={`w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center scale-100 transition-transform ${
                              activeText.color === color ? 'ring-2 ring-emerald-500 scale-110' : ''
                            }`}
                            style={{ backgroundColor: color }}
                          >
                            {activeText.color === color && <span className="w-1.5 h-1.5 rounded-full bg-stone-900 mix-blend-difference"></span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-2 md:pt-4 border-t border-gray-100 shrink-0">
            <div className="flex items-start gap-1 bg-amber-50/50 border border-amber-100 p-2.5 rounded-xl text-[10px] text-amber-900/80 mb-2">
              <HelpCircle className="w-3.5 h-3.5 shrink-0 text-amber-500 mt-0.5" />
              <p>
                <strong>Drag and layout overlay:</strong> You can write consistent text blocks and drag them anywhere in image workspace dynamically!
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-300 hover:bg-gray-50 rounded-xl font-bold text-xs text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplySnippet}
                className="flex-[1.5] py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <Layers className="w-3.5 h-3.5" /> Apply inside Documents
              </button>
            </div>
          </div>
        </div>

        {/* Right side live visualizer */}
        <div 
          className="flex-1 p-6 bg-gray-100/30 flex flex-col justify-between max-h-[50vh] md:max-h-[92vh] overflow-y-auto relative select-none"
          onMouseMove={updateDragText}
          onMouseUp={endDragText}
          onMouseLeave={endDragText}
        >
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div>
              <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" />
                Live Canvas Grid Preview
              </h4>
              <p className="text-[10px] text-gray-400">Click individual cell to upload gallery image, drag floating subtitles over layout</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={handleShuffle}
                className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-white border border-gray-200 text-xs font-semibold hover:bg-gray-50 text-gray-600 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Shuffle Images
              </button>
              <button onClick={onClose} className="p-1.5 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-gray-600 transition-colors hidden md:block">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive display area */}
          <div className="flex-1 flex items-center justify-center py-4 relative">
            <div 
              ref={containerRef}
              className="bg-white p-3 rounded-2xl border border-gray-250/20 shadow-md w-full max-w-md transition-all duration-300 relative"
            >
              
              {/* Actual compiled grid preview with absolute children */}
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${selectedGrid.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${selectedGrid.rows}, 1fr)`,
                  gap: gapSize,
                  width: '100%',
                  aspectRatio: `${selectedRes.width} / ${selectedRes.height}`,
                  backgroundColor: '#FAF9F6',
                  border: `${borderWidth} solid ${borderColor}`,
                  borderRadius: borderRadius,
                  padding: gapSize,
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {selectedGrid.cells.map((cell, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setSelectedTextId(null);
                      fileInputsRef.current[idx]?.click();
                    }}
                    className="group relative cursor-pointer overflow-hidden transition-all duration-200 hover:brightness-95"
                    style={{
                      gridArea: cell.area,
                      borderRadius: `calc(${borderRadius} - 2px)`,
                      backgroundColor: '#EAE6DF',
                      border: '1px solid rgba(0,0,0,0.03)'
                    }}
                  >
                    <img 
                      src={getCellImageUrl(idx)} 
                      alt="Mock cell" 
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover select-none pointer-events-none" 
                    />
                    
                    {/* Hover upload trigger decoration */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="bg-white/90 text-stone-800 text-[10px] font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 shadow">
                        <Upload className="w-3 h-3" /> Change Photo
                      </div>
                    </div>

                    {/* Watermark Label corner */}
                    {showWatermarks && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-mono px-1.5 py-0.5 rounded backdrop-blur-xs font-bold leading-none select-none z-10 font-sans">
                        {cellTexts[idx] !== undefined ? (cellTexts[idx] || 'Cleared') : `Cell ${idx + 1}`}
                      </div>
                    )}
                  </div>
                ))}

                {/* Floating caption text elements render over the grid visually inside preview */}
                {floatingTexts.map(txt => {
                  const isSelected = txt.id === selectedTextId;
                  return (
                    <div
                      key={txt.id}
                      onMouseDown={(e) => startDragText(txt.id, e)}
                      className={`absolute px-2.5 py-1.5 rounded cursor-move transition-all select-none leading-none z-20 ${
                        isSelected 
                          ? 'border border-[#996A00] bg-[#FAF9F6]/90 text-stone-900 shadow-lg ring-2 ring-[#996A00]/20 scale-105' 
                          : 'border border-transparent bg-black/30 hover:bg-black/50 hover:border-white/50 text-white'
                      }`}
                      style={{
                        left: `${txt.x}%`,
                        top: `${txt.y}%`,
                        fontFamily: txt.fontFamily,
                        fontSize: `calc(${txt.fontSize}px * 0.75)`, // Preview display scale
                        color: txt.color,
                        transform: `translate(-50%, -50%) rotate(${txt.rotate}deg)`,
                        fontWeight: txt.isBold ? 'bold' : 'normal',
                        fontStyle: txt.isItalic ? 'italic' : 'normal',
                        opacity: txt.opacity
                      }}
                    >
                      {txt.text}
                    </div>
                  );
                })}
              </div>

              {/* Scale tags below */}
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono mt-3 px-1 select-none pointer-events-none">
                <span>Ratios: {selectedRes.width} x {selectedRes.height} px</span>
                <span>Active Captions: {floatingTexts.length}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
