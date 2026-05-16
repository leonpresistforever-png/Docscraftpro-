import React, { useRef, useState, useEffect } from 'react';
import { X, Upload, Type, PenTool, Link as LinkIcon, Image as ImageIcon, Eraser } from 'lucide-react';
import { Editor } from '@tiptap/react';

interface WatermarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
  initialImageSrc?: string;
}

const FONTS = [
  { name: 'Dancing Script', css: "'Dancing Script', cursive" },
  { name: 'Pacifico', css: "'Pacifico', cursive" },
  { name: 'Caveat', css: "'Caveat', cursive" },
  { name: 'Satisfy', css: "'Satisfy', cursive" },
  { name: 'Great Vibes', css: "'Great Vibes', cursive" },
  { name: 'Sacramento', css: "'Sacramento', cursive" },
  { name: 'Allura', css: "'Allura', cursive" },
  { name: 'Inter', css: "'Inter', sans-serif" },
  { name: 'Playfair Display', css: "'Playfair Display', serif" },
];

export function WatermarkModal({ isOpen, onClose, editor, initialImageSrc }: WatermarkModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [stampText, setStampText] = useState('');
  const [stampFont, setStampFont] = useState(FONTS[0].css);
  const [stampColor, setStampColor] = useState('#000000');
  const [stampSize, setStampSize] = useState(48);
  const [stampUrl, setStampUrl] = useState('');

  const [mode, setMode] = useState<'text' | 'draw'>('text');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPath, setDrawPath] = useState<{x: number, y: number}[]>([]);
  const [drawColor, setDrawColor] = useState('#000000');
  const [drawWidth, setDrawWidth] = useState(3);

  // For drawing on canvas directly without clearing other stuff
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Add Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat&family=Dancing+Script&family=Pacifico&family=Satisfy&family=Great+Vibes&family=Sacramento&family=Allura&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const [canvasDimensions, setCanvasDimensions] = useState({ width: 500, height: 281 });

  useEffect(() => {
     if (initialImageSrc) {
        setBgImage(null); // resets quickly
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Important for CORS
        img.onload = () => {
           setBgImage(img);
           setCanvasDimensions({ width: img.width, height: img.height });
        };
        img.src = initialImageSrc;
     } else {
        setBgImage(null);
        setCanvasDimensions({ width: 500, height: 281 });
     }
  }, [initialImageSrc, isOpen]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setBgImage(img);
          setCanvasDimensions({ width: img.width, height: img.height });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const drawComposition = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Background Image
    if (bgImage) {
      // Scale image to fit canvas
      const scale = Math.min(canvas.width / bgImage.width, canvas.height / bgImage.height);
      const x = (canvas.width / 2) - (bgImage.width / 2) * scale;
      const y = (canvas.height / 2) - (bgImage.height / 2) * scale;
      ctx.globalAlpha = 0.5; // Watermark effect
      ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);
      ctx.globalAlpha = 1.0;
    }

    // Draw Text
    if (mode === 'text' && stampText) {
      ctx.font = `${stampSize}px ${stampFont}`;
      ctx.fillStyle = stampColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stampText, canvas.width / 2, canvas.height / 2);
    }

    // Overlay the drawing canvas
    if (drawingCanvasRef.current) {
        ctx.drawImage(drawingCanvasRef.current, 0, 0);
    }
  };

  useEffect(() => {
    drawComposition();
  }, [bgImage, stampText, stampFont, stampColor, stampSize, mode]);

  // Drawing Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (mode !== 'draw') return;
    setIsDrawing(true);
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    const { x, y } = getCanvasCoords(e, canvas);
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode !== 'draw') return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e, canvas);
    ctx.lineTo(x, y);
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = drawWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // Also redraw the main composition to show the new drawing layer
    drawComposition();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const clearDrawing = () => {
     const canvas = drawingCanvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext('2d');
     if (!ctx) return;
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     drawComposition();
  };

  const clearImage = () => {
      setBgImage(null);
  };

  const handleInsert = () => {
    if (!editor) return;
    
    // Merge drawing and background into a single image
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = canvasRef.current?.width || 500;
    finalCanvas.height = canvasRef.current?.height || 300;
    const ctx = finalCanvas.getContext('2d');
    if (ctx) {
        if (canvasRef.current) ctx.drawImage(canvasRef.current, 0, 0);
    }
    
    const dataUrl = finalCanvas.toDataURL('image/png');
    
    // Insert with drag functionality using the EnhancedImage features
    const attrs: any = {
        src: dataUrl,
        width: '400px',
        isFreestyle: true, // Auto float and drag
        x: 100, // starting position
        y: 100,
        alt: 'Watermark'
    };

    if (stampUrl) {
       attrs.href = stampUrl;
    }

    editor.chain().insertContent({ type: 'image', attrs }).run();
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Controls */}
        <div className="w-full md:w-80 bg-gray-50 border-r border-gray-100 p-6 overflow-y-auto flex-shrink-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold font-serif">Watermark Maker</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full md:hidden"><X className="w-5 h-5"/></button>
          </div>

          <div className="space-y-6">
            {/* Background Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Background Image</label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer bg-white border border-gray-200 rounded-lg p-2 text-center text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleImageUpload} />
                  Choose File
                </label>
                {bgImage && (
                   <button onClick={clearImage} className="p-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50" title="Remove Image"><Eraser className="w-4 h-4"/></button>
                )}
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex p-1 bg-gray-200 rounded-lg">
              <button 
                onClick={() => setMode('text')}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 ${mode === 'text' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Type className="w-4 h-4"/> Text / Stamp
              </button>
              <button 
                onClick={() => setMode('draw')}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 ${mode === 'draw' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <PenTool className="w-4 h-4"/> Draw Sign
              </button>
            </div>

            {/* Mode Specific Controls */}
            {mode === 'text' && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Stamp Text</label>
                  <input 
                    type="text" 
                    value={stampText} 
                    onChange={e => setStampText(e.target.value)} 
                    placeholder="E.g., Approved, John Doe..."
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Font Style</label>
                  <select 
                    value={stampFont} 
                    onChange={e => setStampFont(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    style={{ fontFamily: stampFont }}
                  >
                    {FONTS.map(f => <option key={f.name} value={f.css} style={{ fontFamily: f.css }}>{f.name}</option>)}
                  </select>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Color</label>
                    <input type="color" value={stampColor} onChange={e => setStampColor(e.target.value)} className="w-full h-8 rounded cursor-pointer border border-gray-200 p-0" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Size</label>
                    <input type="number" value={stampSize} onChange={e => setStampSize(parseInt(e.target.value))} className="w-full border border-gray-200 rounded-lg p-1.5 text-sm" />
                  </div>
                </div>
              </div>
            )}

            {mode === 'draw' && (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                 <p className="text-xs text-gray-500 block">Draw your signature directly on the canvas preview to the right.</p>
                 <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Pen Color</label>
                    <input type="color" value={drawColor} onChange={e => setDrawColor(e.target.value)} className="w-full h-8 rounded cursor-pointer border border-gray-200 p-0" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Pen Width</label>
                    <input type="range" min="1" max="10" value={drawWidth} onChange={e => setDrawWidth(parseInt(e.target.value))} className="w-full accent-blue-600 mt-2" />
                  </div>
                </div>
                <button onClick={clearDrawing} className="w-full py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 flex items-center justify-center gap-2 text-sm"><Eraser className="w-4 h-4"/> Clear Signature</button>
              </div>
            )}

            {/* Clickable URL */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Attached Link (Optional)</label>
              <input 
                 type="text" 
                 value={stampUrl} 
                 onChange={e => setStampUrl(e.target.value)} 
                 placeholder="https://..."
                 className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-[10px] text-gray-400">Makes the entire watermark a clickable reference.</p>
            </div>

            <button onClick={handleInsert} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]">
               Insert Watermark
            </button>
          </div>
        </div>

        {/* Right Side: Preview Canvas */}
        <div className="flex-1 p-6 relative bg-gray-300 flex flex-col items-center justify-center overflow-hidden min-h-[400px]">
           <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow hover:bg-gray-100 hidden md:flex"><X className="w-5 h-5"/></button>
           <h3 className="absolute top-4 left-4 text-gray-500 font-bold tracking-wider text-sm">PREVIEW</h3>
           
           <div 
             className="relative shadow-2xl rounded bg-white w-full max-w-[500px]"
             style={{ aspectRatio: `${canvasDimensions.width} / ${canvasDimensions.height}` }}
           >
              {/* Backing Pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(black 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
              
              {/* Main composition canvas */}
              <canvas 
                 ref={canvasRef}
                 width={canvasDimensions.width}
                 height={canvasDimensions.height} // dynamic
                 className="w-full h-full block relative z-10"
              />

              {/* Drawing canvas (overlay to catch events) */}
              <canvas 
                 ref={drawingCanvasRef}
                 width={canvasDimensions.width}
                 height={canvasDimensions.height}
                 onMouseDown={startDrawing}
                 onMouseMove={draw}
                 onMouseUp={stopDrawing}
                 onMouseOut={stopDrawing}
                 onTouchStart={startDrawing}
                 onTouchMove={draw}
                 onTouchEnd={stopDrawing}
                 className={`w-full h-full block absolute inset-0 z-20 ${mode === 'draw' ? 'cursor-crosshair' : 'cursor-default pointer-events-none'}`}
              />
           </div>
        </div>

      </div>
    </div>
  );
}
