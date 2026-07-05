import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { 
  ArrowLeft, Upload, Download, Type, RefreshCw, X, 
  Trash2, Move, Type as TypeIcon, Image as ImageIcon, Smile, Settings, Palette
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface TextBlock {
  id: string;
  text: string;
  x: number; // percentage of image width (0-100)
  y: number; // percentage of image height (0-100)
  fontSize: number; // in pixels (for image space)
  color: string;
  fontFamily: string;
  isBold: boolean;
  isItalic: boolean;
  backgroundColor: string; // empty means transparent
  bgOpacity: number;
}

export function ImageTextEmbedderPage() {
  const navigate = useNavigate();
  const { accentColor } = useTheme();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<TextBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'style'>('text');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const dragStartOffset = useRef({ x: 0, y: 0 });

  const fontFamilies = [
    { name: 'Inter (Sans)', value: 'Inter, sans-serif' },
    { name: 'Space Grotesk (Tech)', value: '"Space Grotesk", sans-serif' },
    { name: 'Playfair (Serif)', value: '"Playfair Display", serif' },
    { name: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
    { name: 'Cinzel (Decorative)', value: '"Cinzel Decorative", cursive' }
  ];

  const colorPresets = [
    accentColor,
    '#FFFFFF',
    '#000000',
    '#EF4444',
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#8B5CF6'
  ];

  // Load sample image
  const handleLoadSample = () => {
    setImageSrc('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80');
    setImageFile(null);
    setBlocks([
      {
        id: '1',
        text: 'ELEGANCE',
        x: 50,
        y: 40,
        fontSize: 72,
        color: accentColor,
        fontFamily: '"Space Grotesk", sans-serif',
        isBold: true,
        isItalic: false,
        backgroundColor: '#000000',
        bgOpacity: 0.4
      },
      {
        id: '2',
        text: 'EMBEDDED PIXEL TYPOGRAPHY',
        x: 50,
        y: 55,
        fontSize: 24,
        color: '#FFFFFF',
        fontFamily: '"JetBrains Mono", monospace',
        isBold: false,
        isItalic: true,
        backgroundColor: '',
        bgOpacity: 0
      }
    ]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file (JPG, PNG, WebP, etc).');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
        setBlocks([]);
        setSelectedBlockId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBlock = () => {
    const newBlock: TextBlock = {
      id: 'block_' + Date.now(),
      text: 'Double click to edit',
      x: 50,
      y: 50,
      fontSize: 32,
      color: '#FFFFFF',
      fontFamily: 'Inter, sans-serif',
      isBold: true,
      isItalic: false,
      backgroundColor: '',
      bgOpacity: 0.5
    };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const handleUpdateBlock = (id: string, updates: Partial<TextBlock>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const handleDeleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  // Dragging event handlers inside relative image area
  const handleDragStart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBlockId(id);
    setDraggingBlockId(id);

    const block = blocks.find(b => b.id === id);
    if (block && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Mouse coordinate inside image container
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Current block pixel estimate
      const blockXPixels = (block.x / 100) * rect.width;
      const blockYPixels = (block.y / 100) * rect.height;

      dragStartOffset.current = {
        x: mouseX - blockXPixels,
        y: mouseY - blockYPixels
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingBlockId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate new position relative to start offset
    const blockXPixels = mouseX - dragStartOffset.current.x;
    const blockYPixels = mouseY - dragStartOffset.current.y;

    // Convert back to percentages (capped inside 0-100)
    let pctX = (blockXPixels / rect.width) * 100;
    let pctY = (blockYPixels / rect.height) * 100;

    pctX = Math.max(0, Math.min(100, pctX));
    pctY = Math.max(0, Math.min(100, pctY));

    handleUpdateBlock(draggingBlockId, { x: pctX, y: pctY });
  };

  const handleMouseUp = () => {
    setDraggingBlockId(null);
  };

  const handleMouseLeave = () => {
    if (draggingBlockId) {
      setDraggingBlockId(null);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (draggingBlockId) return;

    // Click outside blocks deselects current block
    setSelectedBlockId(null);
  };

  // Composition and high resolution text embedding onto file
  const handleEmbedAndDownload = () => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw background image
      ctx.drawImage(img, 0, 0);

      // Render each block
      blocks.forEach(block => {
        ctx.save();

        // Calculate size proportionate to natural image dimensions
        const blockX = (block.x / 100) * canvas.width;
        const blockY = (block.y / 100) * canvas.height;

        // Set typography options
        const fontStyle = `${block.isItalic ? 'italic' : 'normal'} ${block.isBold ? 'bold' : 'normal'} ${block.fontSize}px ${block.fontFamily}`;
        ctx.font = fontStyle;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Measure text for background pill/card alignment
        const textMetrics = ctx.measureText(block.text);
        const textWidth = textMetrics.width;
        const textHeight = block.fontSize; // rough height estimate

        // Draw pill background highlights if specified
        if (block.backgroundColor) {
          ctx.beginPath();
          const paddingX = block.fontSize * 0.4;
          const paddingY = block.fontSize * 0.2;
          const bgW = textWidth + paddingX * 2;
          const bgH = textHeight + paddingY * 2;
          const bgX = blockX - bgW / 2;
          const bgY = blockY - bgH / 2;

          ctx.fillStyle = block.backgroundColor;
          ctx.globalAlpha = block.bgOpacity;
          
          // Render rounded rect
          const radius = Math.min(block.fontSize * 0.25, bgH / 2);
          ctx.beginPath();
          ctx.moveTo(bgX + radius, bgY);
          ctx.lineTo(bgX + bgW - radius, bgY);
          ctx.quadraticCurveTo(bgX + bgW, bgY, bgX + bgW, bgY + radius);
          ctx.lineTo(bgX + bgW, bgY + bgH - radius);
          ctx.quadraticCurveTo(bgX + bgW, bgY + bgH, bgX + bgW - radius, bgY + bgH);
          ctx.lineTo(bgX + radius, bgY + bgH - radius);
          ctx.quadraticCurveTo(bgX, bgY + bgH, bgX, bgY + bgH - radius);
          ctx.lineTo(bgX, bgY + radius);
          ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY);
          ctx.closePath();
          ctx.fill();
        }

        // Write text pixels perfectly
        ctx.restore();
        ctx.save();
        ctx.font = fontStyle;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw custom text shadow
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 2;

        ctx.fillStyle = block.color;
        ctx.fillText(block.text, blockX, blockY);

        ctx.restore();
      });

      try {
        // Export file
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `embedded_text_${imageFile?.name || 'document_image.png'}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Failed to export image", err);
        alert("Failed to export image. This may be due to cross-origin security restrictions on the loaded image.");
      }
    };
    img.src = imageSrc;
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="flex h-screen bg-[#FAFAFA] font-sans text-gray-950 w-full overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
        
        {/* Navigation & Toolbar Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              <TypeIcon className="w-5 h-5 text-indigo-500" />
              Image Typography Studio
            </h1>
          </div>
          
          {imageSrc && (
            <div className="flex items-center gap-3">
              <button 
                onClick={handleAddBlock}
                className="py-1.5 px-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <PlusIcon /> Add Text Layer
              </button>
              <button 
                onClick={handleEmbedAndDownload}
                className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Embed & Download (PNG)
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
          
          {/* Main workspace arena */}
          <div 
            className="flex-1 min-w-0 min-h-0 bg-[#EFEFEF] overflow-auto relative flex items-center justify-center p-8 select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {!imageSrc ? (
              <div className="w-full max-w-xl flex flex-col items-center">
                <div 
                  className="w-full border-2 border-dashed border-gray-300 rounded-3xl bg-white flex flex-col items-center justify-center p-12 text-center hover:border-indigo-400 transition-colors cursor-pointer shadow-sm"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      const file = e.dataTransfer.files[0];
                      setImageFile(file);
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setImageSrc(event.target?.result as string);
                        setBlocks([]);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                >
                  <div className="p-4 bg-indigo-50 text-indigo-500 rounded-full mb-4">
                    <ImageIcon className="w-10 h-10 animate-bounce" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Upload Photo or Design Layout</h3>
                  <p className="text-xs text-gray-500 max-w-xs leading-relaxed mb-6">
                    Supports PNG, JPG, JPEG, and WebP. We will merge your texts natively onto high resolution pixels.
                  </p>
                  
                  <button className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wider transition-transform hover:scale-[1.01]">
                    Select file from device
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload}
                  />
                </div>

                <div className="mt-6 flex items-center justify-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">Or explore formatting with our</span>
                  <button 
                    onClick={handleLoadSample}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Sample Mock Card
                  </button>
                </div>
              </div>
            ) : (
              /* Core interactive Canvas container */
              <div 
                ref={containerRef}
                onClick={handleImageClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                className="relative inline-block rounded-xl overflow-hidden shadow-2xl border border-gray-400/30"
                style={{ overflow: 'hidden', touchAction: 'none' }}
              >
                <img 
                  ref={imageRef}
                  src={imageSrc} 
                  alt="Workspace Canvas"
                  className="max-w-full max-h-[75vh] block pointer-events-none w-auto h-auto"
                  onLoad={() => {
                    // Force height calculation if needed
                  }}
                />

                {/* Render absolute floating overlay blocks */}
                {blocks.map(block => {
                  const isSelected = block.id === selectedBlockId;
                  return (
                    <div
                      key={block.id}
                      onMouseDown={(e) => handleDragStart(block.id, e)}
                      style={{
                        left: `${block.x}%`,
                        top: `${block.y}%`,
                        fontSize: `calc(${block.fontSize}px * 0.75)`, // Scaled display preview
                        color: block.color,
                        fontFamily: block.fontFamily,
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: block.backgroundColor ? `${block.backgroundColor}${Math.round(block.bgOpacity * 255).toString(16).padStart(2, '0')}` : 'transparent',
                        fontWeight: block.isBold ? 'bold' : 'normal',
                        fontStyle: block.isItalic ? 'italic' : 'normal',
                      }}
                      className={`absolute select-none px-3 py-1.5 rounded-lg border cursor-move transition-shadow text-center flex items-center justify-center whitespace-nowrap leading-none ${
                        isSelected 
                          ? 'border-[2px] border-indigo-500 shadow-xl scale-105 bg-black/10 ring-2 ring-indigo-500/20' 
                          : 'border-transparent hover:border-white/50 hover:bg-white/10'
                      }`}
                    >
                      {block.text}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Style & configuration sidebar */}
          {imageSrc && (
            <aside className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col shrink-0">
              
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-100 shrink-0">
                <button 
                  onClick={() => setActiveTab('text')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${activeTab === 'text' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-800'}`}
                >
                  Text Layers ({blocks.length})
                </button>
                <button 
                  onClick={() => setActiveTab('style')}
                  disabled={!selectedBlockId}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${activeTab === 'style' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-800'}`}
                >
                  Layer Styles
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === 'text' ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 font-mono">Layer Selection</span>
                      <button 
                        onClick={handleAddBlock}
                        className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider"
                      >
                        + Create Layer
                      </button>
                    </div>

                    <div className="space-y-2">
                      {blocks.map(block => (
                        <div 
                          key={block.id}
                          onClick={() => {
                            setSelectedBlockId(block.id);
                            setActiveTab('style');
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${selectedBlockId === block.id ? 'border-indigo-500 bg-indigo-50/20' : 'border-gray-200 hover:border-gray-300 bg-[#FAF9F5]/20'}`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden pr-3">
                            <Type className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-xs font-bold truncate max-w-full text-gray-800">{block.text}</span>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlock(block.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {blocks.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                          <Type className="w-8 h-8 mx-auto opacity-30 mb-2 animate-pulse" />
                          <p className="text-xs font-medium">No text blocks active.</p>
                          <p className="text-[10px] mt-1 text-gray-400">Click Add Text Layer above to create typography.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  selectedBlock && (
                    <div className="space-y-6">
                      
                      {/* Text Input Block */}
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400 font-mono">Edit Text Content</label>
                        <textarea
                          rows={3}
                          value={selectedBlock.text}
                          onChange={(e) => handleUpdateBlock(selectedBlock.id, { text: e.target.value })}
                          className="w-full p-3 border border-gray-200 bg-[#FAF9F5] rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans text-gray-800"
                        />
                      </div>

                      {/* Font Family selection */}
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400 font-mono">Font Selection</label>
                        <select
                          value={selectedBlock.fontFamily}
                          onChange={(e) => handleUpdateBlock(selectedBlock.id, { fontFamily: e.target.value })}
                          className="w-full p-2.5 border border-gray-200 bg-white rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          {fontFamilies.map(f => (
                            <option key={f.value} value={f.value}>{f.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Font size sliders */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-extrabold uppercase tracking-wider text-gray-400 font-mono">Font Size</label>
                          <span className="font-mono text-gray-500">{selectedBlock.fontSize}px</span>
                        </div>
                        <input 
                          type="range"
                          min={12}
                          max={160}
                          value={selectedBlock.fontSize}
                          onChange={(e) => handleUpdateBlock(selectedBlock.id, { fontSize: parseInt(e.target.value) })}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                      </div>

                      {/* Typography toggles */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleUpdateBlock(selectedBlock.id, { isBold: !selectedBlock.isBold })}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${selectedBlock.isBold ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          Bold Text
                        </button>
                        <button
                          onClick={() => handleUpdateBlock(selectedBlock.id, { isItalic: !selectedBlock.isItalic })}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${selectedBlock.isItalic ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          Italic Text
                        </button>
                      </div>

                      {/* Preset color swatches */}
                      <div className="space-y-3">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400 font-mono">Text Color</label>
                        <div className="flex flex-wrap gap-2.5">
                          {colorPresets.map(color => (
                            <button
                              key={color}
                              onClick={() => handleUpdateBlock(selectedBlock.id, { color })}
                              className={`w-7 h-7 rounded-full border-2 border-white shadow-sm ring-2 transition-all ${selectedBlock.color === color ? 'ring-indigo-500 scale-110' : 'ring-transparent hover:ring-gray-300'}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Pill Background configurations */}
                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-extrabold uppercase tracking-wider text-gray-400 font-mono">Block Background Highlight</label>
                          <button
                            onClick={() => handleUpdateBlock(selectedBlock.id, { backgroundColor: selectedBlock.backgroundColor ? '' : '#000000' })}
                            className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider"
                          >
                            {selectedBlock.backgroundColor ? 'Turn Off' : 'Turn On'}
                          </button>
                        </div>

                        {selectedBlock.backgroundColor && (
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              {['#000000', '#FFFFFF', '#3B82F6', '#EF4444'].map(color => (
                                <button
                                  key={color}
                                  onClick={() => handleUpdateBlock(selectedBlock.id, { backgroundColor: color })}
                                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${selectedBlock.backgroundColor === color ? 'bg-gray-100 border-gray-400 text-black' : 'border-gray-200'}`}
                                >
                                  {color === '#000000' ? 'Black' : color === '#FFFFFF' ? 'White' : color === '#3B82F6' ? 'Blue' : 'Red'}
                                </button>
                              ))}
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-extrabold text-[10px] text-gray-400 font-mono uppercase">Background Opacity</span>
                                <span className="font-mono text-gray-500">{Math.round(selectedBlock.bgOpacity * 100)}%</span>
                              </div>
                              <input 
                                type="range"
                                min={0.1}
                                max={1.0}
                                step={0.05}
                                value={selectedBlock.bgOpacity}
                                onChange={(e) => handleUpdateBlock(selectedBlock.id, { bgOpacity: parseFloat(e.target.value) })}
                                className="w-full accent-indigo-600 cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Deletion area */}
                      <div className="pt-4 border-t border-gray-100">
                        <button 
                          onClick={() => handleDeleteBlock(selectedBlock.id)}
                          className="w-full flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Remove Text Layer
                        </button>
                      </div>

                    </div>
                  )
                )}
              </div>
            </aside>
          )}

        </div>

      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
