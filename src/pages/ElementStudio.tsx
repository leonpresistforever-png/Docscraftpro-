import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, RegularPolygon, Text as KonvaText, Transformer } from 'react-konva';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, MousePointer2, Pencil, Square, Circle as CircleIcon, 
  Triangle, Type, Eraser, Undo, Redo, Trash2, Layers, 
  Copy, Check, PenTool, Menu, X, Paintbrush, Sparkles
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const ADVANCED_BRUSHES = [
  { id: 'b1', name: 'Basic Pen', width: 4, opacity: 1, tension: 0.5, lineCap: 'round', dash: [] },
  { id: 'b2', name: 'Thick Marker', width: 15, opacity: 0.8, tension: 0.3, lineCap: 'square', dash: [] },
  { id: 'b3', name: 'Highlighter', width: 25, opacity: 0.3, tension: 0.1, lineCap: 'square', dash: [] },
  { id: 'b4', name: 'Soft Airbrush', width: 40, opacity: 0.3, tension: 0.5, lineCap: 'round', shadowBlur: 15 },
  { id: 'b5', name: 'Calligraphy Pen', width: 6, opacity: 1, tension: 0.8, lineCap: 'square', dash: [] },
  { id: 'b6', name: 'Hard Airbrush', width: 50, opacity: 0.1, tension: 0.5, lineCap: 'round', shadowBlur: 20 },
  { id: 'b7', name: 'Fineliner 0.1', width: 2, opacity: 1, tension: 0.2, lineCap: 'round', dash: [] },
  { id: 'b8', name: 'Crayon', width: 12, opacity: 0.9, tension: 0.9, lineCap: 'round', dash: [] },
  { id: 'b9', name: 'Neon Glow', width: 8, opacity: 1, tension: 0.5, lineCap: 'round', shadowBlur: 15, isNeon: true },
  { id: 'b10', name: 'Magic Star', width: 15, opacity: 0.8, tension: 0.5, lineCap: 'round', shadowBlur: 30, isNeon: true },
  { id: 'b11', name: 'Watercolor Wash', width: 40, opacity: 0.2, tension: 0.8, lineCap: 'round', dash: [] },
  { id: 'b12', name: 'Oil Paint', width: 20, opacity: 1, tension: 0.1, lineCap: 'round', dash: [] },
  { id: 'b13', name: 'Chalk', width: 10, opacity: 0.8, tension: 0.9, lineCap: 'square', dash: [2, 6] },
  { id: 'b14', name: 'Soft Pastel', width: 18, opacity: 0.6, tension: 0.6, lineCap: 'round', shadowBlur: 5 },
  { id: 'b15', name: 'Technical Pen', width: 3, opacity: 1, tension: 0.1, lineCap: 'square', dash: [] },
  { id: 'b16', name: 'Dotted Line', width: 4, opacity: 1, tension: 0.5, lineCap: 'round', dash: [4, 12] },
  { id: 'b17', name: 'Dashed Line', width: 4, opacity: 1, tension: 0.5, lineCap: 'square', dash: [15, 10] },
  { id: 'b18', name: 'Ghost Brush', width: 20, opacity: 0.15, tension: 0.5, lineCap: 'round', shadowBlur: 10 },
  { id: 'b19', name: 'Ink Splatter', width: 5, opacity: 0.9, tension: 0, lineCap: 'round', dash: [1, 15] },
  { id: 'b20', name: 'Dry Brush', width: 14, opacity: 0.5, tension: 0.4, lineCap: 'square', dash: [4, 4] },
];

const THEME_COLORS = [
  { name: 'Transparent', value: 'transparent' },
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#111827' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Gold', value: '#D4AF37' }
];

export function ElementStudio() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [elements, setElements] = useState<any[]>([]);
  const elementsRef = useRef<any[]>([]);
  
  const [history, setHistory] = useState<any[][]>([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  const historyStepRef = useRef(0);
  
  useEffect(() => {
    historyStepRef.current = historyStep;
  }, [historyStep]);
  
  const [mode, setMode] = useState('select'); 
  
  // HSL Spectrum Color State
  const [h, setH] = useState(215); // Hue
  const [s, setS] = useState(90);  // Saturation
  const [l, setL] = useState(15);  // Lightness / Contrast
  const computedStrokeColor = `hsl(${h}, ${s}%, ${l}%)`;

  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [opacity, setOpacity] = useState(1);
  const [fontSize, setFontSize] = useState(32);
  
  const [activeBrushParams, setActiveBrushParams] = useState({
    tension: 0.5, lineCap: 'round', dash: [] as number[], shadowBlur: 0, isNeon: false
  });
  const [showBrushPanel, setShowBrushPanel] = useState(false);
  const [activeBrushId, setActiveBrushId] = useState('b1');
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageRef = useRef<any>(null);
  const isDrawing = useRef(false);
  const activeToolId = useRef<string | null>(null);

  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  const handleSelectBrush = (b: any) => {
    setActiveBrushId(b.id);
    setStrokeWidth(b.width);
    setOpacity(b.opacity);
    setActiveBrushParams({
      tension: b.tension,
      lineCap: b.lineCap as any,
      dash: b.dash || [],
      shadowBlur: b.shadowBlur || 0,
      isNeon: !!b.isNeon
    });
    setMode('pencil');
    if(window.innerWidth < 1024) setShowBrushPanel(false);
  };

  const saveHistory = (newElements: any[]) => {
    setHistory(prevHistory => {
      const nextHistory = prevHistory.slice(0, historyStepRef.current + 1);
      nextHistory.push(newElements);
      setHistoryStep(nextHistory.length - 1);
      return nextHistory;
    });
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      setElements(history[historyStep - 1]);
      setHistoryStep(historyStep - 1);
      setSelectedId(null);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      setElements(history[historyStep + 1]);
      setHistoryStep(historyStep + 1);
      setSelectedId(null);
    }
  };

  const clearAll = () => {
    isDrawing.current = false;
    activeToolId.current = null;
    setElements([]);
    saveHistory([]);
    setSelectedId(null);
  };

  const getPointerPos = (e: any) => {
    const stage = e.target.getStage();
    return stage ? stage.getPointerPosition() : null;
  }

  const handleMouseDown = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty && mode === 'select') setSelectedId(null);
    if (mode === 'select') return;

    const pos = getPointerPos(e);
    if (!pos) return;

    if (mode === 'vector') {
      if (!isDrawing.current) {
        // Start new point-to-point path
        isDrawing.current = true;
        const newId = uuidv4();
        activeToolId.current = newId;
        const newEl = { id: newId, type: 'vector', points: [pos.x, pos.y, pos.x, pos.y], stroke: computedStrokeColor, strokeWidth, tension: 0, lineCap: 'round', lineJoin: 'round', fill: fillColor === 'transparent' ? null : fillColor, closed: false, opacity };
        setElements(prev => [...prev, newEl]);
      } else {
        // Double-click to finish vector
        if (e.evt.detail >= 2) {
           isDrawing.current = false;
           activeToolId.current = null;
           setMode('select');
           setElements(prev => {
             saveHistory(prev);
             return prev;
           });
           return;
        }
        // Add new point
        setElements(prev => {
           const idx = prev.findIndex(el => el.id === activeToolId.current);
           if (idx === -1) return prev;
           const newElements = [...prev];
           const lastEl = { ...newElements[idx] };
           lastEl.points = [...lastEl.points.slice(0, -2), pos.x, pos.y, pos.x, pos.y]; 
           newElements[idx] = lastEl;
           return newElements;
        });
      }
      return;
    }

    isDrawing.current = true;
    const newId = uuidv4();
    activeToolId.current = newId;

    let newEl: any = { id: newId, opacity };

    // Fill cannot be entirely null/empty otherwise the user can't select shapes!
    const activeFill = fillColor === 'transparent' ? 'transparent' : fillColor;

    if (mode === 'pencil' || mode === 'eraser') {
      newEl = { 
        ...newEl, 
        type: 'line', 
        points: [pos.x, pos.y], 
        stroke: mode === 'eraser' ? '#ffffff' : computedStrokeColor, 
        strokeWidth: mode === 'eraser' ? 20 : strokeWidth, 
        tension: mode === 'eraser' ? 0.5 : activeBrushParams.tension, 
        lineCap: mode === 'eraser' ? 'round' : activeBrushParams.lineCap, 
        lineJoin: 'round', 
        dash: mode === 'eraser' ? [] : activeBrushParams.dash,
        shadowBlur: mode === 'eraser' ? 0 : activeBrushParams.shadowBlur,
        shadowColor: activeBrushParams.isNeon && mode !== 'eraser' ? computedStrokeColor : 'transparent',
        globalCompositeOperation: mode === 'eraser' ? 'destination-out' : 'source-over' 
      };
    } else if (mode === 'rect') {
      newEl = { ...newEl, type: 'rect', x: pos.x, y: pos.y, width: 0, height: 0, stroke: computedStrokeColor, fill: activeFill, strokeWidth };
    } else if (mode === 'circle') {
      newEl = { ...newEl, type: 'circle', x: pos.x, y: pos.y, radius: 0, stroke: computedStrokeColor, fill: activeFill, strokeWidth };
    } else if (mode === 'triangle') {
      newEl = { ...newEl, type: 'triangle', x: pos.x, y: pos.y, radius: 0, sides: 3, stroke: computedStrokeColor, fill: activeFill, strokeWidth };
    } else if (mode === 'text') {
      const textStr = prompt("Enter text:");
      if (textStr) {
        newEl = { ...newEl, type: 'text', x: pos.x, y: pos.y, text: textStr, fontSize, fill: computedStrokeColor, fontFamily: 'sans-serif' };
        const newArr = [...elementsRef.current, newEl];
        setElements(newArr);
        saveHistory(newArr);
      }
      isDrawing.current = false;
      activeToolId.current = null;
      setMode('select');
      return;
    }

    setElements(prev => [...prev, newEl]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current || !activeToolId.current) return;
    
    const point = getPointerPos(e);
    if (!point) return;
    
    setElements(prev => {
      const idx = prev.findIndex(el => el.id === activeToolId.current);
      if (idx === -1) return prev; 

      const newElements = [...prev];
      const lastEl = { ...newElements[idx] };

      if (mode === 'vector') {
        lastEl.points = [...lastEl.points.slice(0, -2), point.x, point.y];
      } else if (mode === 'pencil' || mode === 'eraser') {
        lastEl.points = lastEl.points.concat([point.x, point.y]);
      } else if (mode === 'rect') {
        lastEl.width = point.x - lastEl.x;
        lastEl.height = point.y - lastEl.y;
      } else if (mode === 'circle' || mode === 'triangle') {
        const dx = point.x - lastEl.x;
        const dy = point.y - lastEl.y;
        lastEl.radius = Math.max(0.1, Math.sqrt(dx * dx + dy * dy)); 
      }
      newElements[idx] = lastEl;
      return newElements;
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing.current || mode === 'vector') return;
    isDrawing.current = false;
    activeToolId.current = null;
    
    // Auto-fix sizes for users who clicked instead of dragging for vectors
    if (mode === 'rect' || mode === 'circle' || mode === 'triangle') {
       setElements(prev => {
         const newEls = prev.map(el => {
            if (el.type === 'rect' && el.width === 0 && el.height === 0) return { ...el, width: 80, height: 80 };
            if ((el.type === 'circle' || el.type === 'triangle') && el.radius < 2) return { ...el, radius: 50 };
            return el;
         });
         saveHistory(newEls);
         return newEls;
       });
    } else if (mode !== 'text') {
       setElements(prev => {
          saveHistory(prev);
          return prev;
       });
    }
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const newElements = elementsRef.current.filter(el => el.id !== selectedId);
    isDrawing.current = false;
    activeToolId.current = null;
    setElements(newElements);
    setSelectedId(null);
    saveHistory(newElements);
  };

  const handleDuplicate = () => {
    if (!selectedId) return;
    const el = elementsRef.current.find(e => e.id === selectedId);
    if (el) {
      const newEl = { ...el, id: uuidv4(), x: (el.x || 0) + 20, y: (el.y || 0) + 20 };
      const newElements = [...elementsRef.current, newEl];
      setElements(newElements);
      saveHistory(newElements);
      setSelectedId(newEl.id);
    }
  };

  const handleBringForward = () => {
    if (!selectedId) return;
    const idx = elementsRef.current.findIndex(e => e.id === selectedId);
    if (idx < elementsRef.current.length - 1) {
      const newElements = [...elementsRef.current];
      [newElements[idx], newElements[idx+1]] = [newElements[idx+1], newElements[idx]];
      setElements(newElements);
      saveHistory(newElements);
    }
  };

  const handleDeploy = () => {
    setSelectedId(null);
    setMode('select');
    
    setTimeout(() => {
      if (!stageRef.current) return;
      
      const layer = stageRef.current.getLayers()[0];
      const box = layer.getClientRect({ skipTransform: false });
      
      if (box.width === 0 || box.height === 0 || elementsRef.current.length === 0) {
         alert("Canvas is empty! Draw an amazing element first.");
         return;
      }

      const padding = 20; 
      const dataURL = stageRef.current.toDataURL({ 
        x: box.x - padding,
        y: box.y - padding,
        width: box.width + padding * 2,
        height: box.height + padding * 2,
        pixelRatio: 3 
      });
      
      localStorage.setItem('pending_studio_element', dataURL);
      
      if (id && id !== 'new') navigate(`/doc/${id}`);
      else navigate(`/dashboard`);
    }, 150);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F3F4F6] overflow-hidden relative">
      <style>{`
        .hsl-slider {
          -webkit-appearance: none;
          appearance: none;
          outline: none;
        }
        .hsl-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          border: 2px solid #6B7280;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .hsl-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          border: 2px solid #6B7280;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
      `}</style>
      
      <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 z-30 shadow-sm relative">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate(id ? `/doc/${id}` : '/dashboard')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
             <ArrowLeft className="w-5 h-5" />
           </button>
           <div className="flex flex-col">
             <h1 className="font-serif text-xl font-bold tracking-tight text-gray-900 leading-none">Vector Studio</h1>
             <p className="text-[11px] font-medium text-gray-400 mt-1 uppercase tracking-wider">Aesthetic Generation Engine</p>
           </div>
        </div>

        <button onClick={handleDeploy} className="flex items-center gap-2 bg-gradient-to-r from-dc-gold to-yellow-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:scale-105 transition-all">
          <Check className="w-4 h-4" />
          Deploy to Document
        </button>
      </div>

      {/* Advanced Brush UI Drawer */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur-xl border-r border-gray-200 shadow-2xl z-50 transition-transform duration-300 ease-out flex flex-col ${showBrushPanel ? 'translate-x-0' : '-translate-x-full'}`}
      >
         <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-2 text-purple-600">
               <Sparkles className="w-5 h-5" />
               <h2 className="font-bold tracking-tight text-gray-900">Brush Engine</h2>
            </div>
            <button onClick={() => setShowBrushPanel(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
         </div>
         
         <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
           {ADVANCED_BRUSHES.map(brush => (
              <button 
                key={brush.id}
                onClick={() => handleSelectBrush(brush)}
                className={`flex flex-col text-left p-3 rounded-xl border transition-all ${activeBrushId === brush.id && mode === 'pencil' ? 'border-purple-400 bg-purple-50 shadow-sm ring-1 ring-purple-400 ring-offset-1' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
              >
                 <div className="flex justify-between items-center w-full mb-2">
                    <span className="text-sm font-bold text-gray-800">{brush.name}</span>
                    {brush.isNeon && <span className="text-[9px] uppercase tracking-wider font-bold bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded">Neon</span>}
                 </div>
                 
                 <div className="w-full relative h-[24px] bg-white rounded border border-gray-100 flex items-center overflow-hidden px-2 shadow-inner">
                    <svg width="100%" height="100%" preserveAspectRatio="none" className="min-w-0 flex-1 overflow-visible">
                       <line 
                         x1="0" y1="50%" x2="100%" y2="50%"
                         stroke={activeBrushId === brush.id && mode === 'pencil' ? computedStrokeColor : '#9CA3AF'}
                         strokeWidth={Math.max(1, Math.min(10, brush.width / 3))}
                         strokeOpacity={Math.max(0.2, brush.opacity)}
                         strokeLinecap={brush.lineCap as any}
                         strokeLinejoin="round"
                         strokeDasharray={brush.dash ? brush.dash.join(',') : 'none'}
                         style={brush.isNeon ? { filter: 'drop-shadow(0px 0px 4px rgba(236,72,153,0.5))' } : {}}
                       />
                    </svg>
                 </div>
                 
                 <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] text-gray-400 font-medium">Size: {brush.width}px</span>
                    <span className="text-[10px] text-gray-400 font-medium">Opacity: {brush.opacity * 100}%</span>
                 </div>
              </button>
           ))}
         </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-20 flex flex-wrap gap-8 items-start shrink-0 relative w-full hide-scrollbar overflow-x-auto">
         
         <div className="flex flex-col gap-1.5 shrink-0">
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">History</span>
           <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
             <button onClick={handleUndo} disabled={historyStep === 0} className="p-2 rounded hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all" title="Undo"><Undo className="w-4 h-4 text-gray-700"/></button>
             <button onClick={handleRedo} disabled={historyStep === history.length - 1} className="p-2 rounded hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all" title="Redo"><Redo className="w-4 h-4 text-gray-700"/></button>
             <div className="w-px h-6 bg-gray-200 mx-1 my-auto"></div>
             <button onClick={clearAll} className="p-2 rounded text-red-500 hover:bg-red-50 transition-all" title="Clear Grid"><Trash2 className="w-4 h-4"/></button>
           </div>
         </div>

         <div className="flex flex-col gap-1.5 shrink-0">
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tools</span>
           <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
             <button onClick={() => setShowBrushPanel(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded font-bold text-xs bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-purple-700 border border-purple-200 transition-colors mr-1 shadow-sm"><Paintbrush className="w-3.5 h-3.5" /> Brushes</button>
             <ToolBtn active={mode==='select'} icon={<MousePointer2/>} onClick={()=>setMode('select')} title="Select/Move" />
             <div className="w-px h-6 bg-gray-200 mx-1 my-auto"></div>
             <ToolBtn active={mode==='vector'} icon={<PenTool/>} onClick={()=>setMode('vector')} title="Vector Pen" />
             <ToolBtn active={mode==='pencil'} icon={<Pencil/>} onClick={()=>setMode('pencil')} title="Freestyle Pen" />
             <ToolBtn active={mode==='text'} icon={<Type/>} onClick={()=>setMode('text')} title="Text Block" />
             <ToolBtn active={mode==='eraser'} icon={<Eraser/>} onClick={()=>setMode('eraser')} title="Eraser" />
           </div>
         </div>

         <div className="flex flex-col gap-1.5 shrink-0">
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Geometry</span>
           <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
             <ToolBtn active={mode==='rect'} icon={<Square/>} onClick={()=>setMode('rect')} title="Rectangle" />
             <ToolBtn active={mode==='circle'} icon={<CircleIcon/>} onClick={()=>setMode('circle')} title="Circle" />
             <ToolBtn active={mode==='triangle'} icon={<Triangle/>} onClick={()=>setMode('triangle')} title="Triangle" />
           </div>
         </div>

         {/* COLOR SPECTRUM & CONTRAST ENGINE */}
         <div className="flex items-start gap-4 p-1 shrink-0">
             <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
               <div className="flex flex-col gap-[7px] w-[140px]">
                 <div className="flex justify-between items-center mb-0.5">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Color Tuning</span>
                 </div>
                 
                 {/* Hue Slider (Full Spectrum) */}
                 <input type="range" min="0" max="360" value={h} onChange={e=>setH(parseInt(e.target.value))} 
                    style={{ background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'}} 
                    className="hsl-slider w-full h-2 rounded-full" title="Hue" />
                 
                 {/* Saturation Slider */}
                 <input type="range" min="0" max="100" value={s} onChange={e=>setS(parseInt(e.target.value))} 
                    style={{ background: `linear-gradient(to right, hsl(${h}, 0%, ${l}%), hsl(${h}, 100%, ${l}%))`}} 
                    className="hsl-slider w-full h-2 rounded-full" title="Saturation" />
                 
                 {/* Contrast / Lightness Slider */}
                 <input type="range" min="0" max="100" value={l} onChange={e=>setL(parseInt(e.target.value))} 
                    style={{ background: `linear-gradient(to right, #000, hsl(${h}, ${s}%, 50%), #fff)`}} 
                    className="hsl-slider w-full h-2 rounded-full" title="Contrast / Lightness" />
               </div>
               
               <div className="flex items-center justify-center pt-2">
                  <div className="w-10 h-10 rounded-full border-2 border-white shadow-md ring-1 ring-gray-200 shrink-0 transition-colors" style={{ backgroundColor: computedStrokeColor }} title="Active Output Color" />
               </div>
             </div>

             <div className="flex flex-col gap-1.5 min-w-[200px]">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fill Palette</span>
               <div className="flex flex-wrap gap-1.5 p-1 bg-gray-50 border border-gray-200 rounded shadow-inner justify-between items-center px-2 py-[5px]">
                 {THEME_COLORS.map(c => (
                   <button 
                     key={c.value}
                     onClick={() => setFillColor(c.value)}
                     className={`w-6 h-6 rounded-full border border-gray-300 ${fillColor === c.value ? 'ring-2 ring-dc-gold ring-offset-1 scale-110 shadow-sm' : 'hover:scale-105 hover:shadow-sm'} transition-all relative overflow-hidden`}
                     style={
                       c.value === 'transparent' 
                         ? { backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/ENi0gG4AI4MQHwxgMIzAAKpgAwCQJwgXl8Z03AAAAABJRU5ErkJggg==")', backgroundSize: '8px 8px' }
                         : { backgroundColor: c.value }
                     }
                     title={c.name}
                   />
                 ))}
               </div>
             </div>
         </div>

         <div className="flex flex-col gap-3 ml-2 pt-1 w-48 shrink-0">
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-12 text-right">Width</span>
               <input type="range" min="1" max="50" value={strokeWidth} onChange={e=>setStrokeWidth(parseInt(e.target.value))} className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-dc-gold" />
               <span className="text-[10px] text-gray-500 font-mono w-4">{strokeWidth}</span>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-12 text-right">Opacity</span>
               <input type="range" min="10" max="100" step="1" value={Math.round(opacity * 100)} onChange={e=>setOpacity(parseInt(e.target.value) / 100)} className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-dc-gold" />
               <span className="text-[10px] text-gray-500 font-mono w-6">{Math.round(opacity * 100)}%</span>
            </div>
         </div>

         {selectedId && (
           <div className="flex flex-col gap-1.5 ml-auto animate-in fade-in zoom-in duration-200 shrink-0">
             <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Active Element Selection</span>
             <div className="flex bg-blue-50/50 p-1 rounded-lg border border-blue-200 shadow-sm relative">
                <ActionBtn icon={<Copy/>} onClick={handleDuplicate} label="Duplicate"  color="text-blue-700" />
                <div className="w-px h-6 bg-blue-200 mx-1 my-auto"></div>
                <ActionBtn icon={<Layers/>} onClick={handleBringForward} label="Forward" color="text-blue-700" />
                <div className="w-px h-6 bg-blue-200 mx-1 my-auto"></div>
                <ActionBtn icon={<Trash2/>} onClick={handleDelete} label="Delete" color="text-red-600" />
             </div>
           </div>
         )}
      </div>

      <div 
        className="flex-1 overflow-auto relative flex items-center justify-center p-8 bg-[#E5E7EB]"
        style={{
          backgroundImage: 'radial-gradient(#9CA3AF 1px, transparent 1px), radial-gradient(#9CA3AF 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
        onPointerDown={(e) => { 
          if(e.target === e.currentTarget) setSelectedId(null); 
        }}
        onMouseLeave={handleMouseUp}
        onTouchCancel={handleMouseUp}
      >
         <div className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-gray-300 relative shrink-0 transition-transform" style={{ width: 850, height: 1100, touchAction: 'none' }}>
           <Stage 
             width={850} 
             height={1100} 
             onMouseDown={handleMouseDown} 
             onMouseMove={handleMouseMove} 
             onMouseUp={handleMouseUp}
             onTouchStart={handleMouseDown}
             onTouchMove={handleMouseMove}
             onTouchEnd={handleMouseUp}
             ref={stageRef}
           >
             <Layer>
               {elements.map((el, i) => {
                 const isSelected = el.id === selectedId;
                 const onSelect = (e: any) => { 
                   if(mode === 'select') {
                     e.cancelBubble = true;
                     setSelectedId(el.id);
                   }
                 };

                 const commonProps = {
                   key: el.id,
                   ...el,
                   draggable: mode === 'select',
                   onClick: onSelect,
                   onTap: onSelect,
                   onDragStart: onSelect,
                   onDragEnd: (e: any) => {
                     const newElements = [...elementsRef.current];
                     const idx = newElements.findIndex(e => e.id === el.id);
                     if (idx !== -1) {
                       newElements[idx] = { ...el, x: e.target.x(), y: e.target.y() };
                       setElements(newElements);
                       saveHistory(newElements);
                     }
                   }
                 };

                 if (el.type === 'line') return <Line {...commonProps} />;
                 if (el.type === 'vector') {
                   return (
                     <React.Fragment key={el.id}>
                       <Line {...commonProps} closed={el.closed} />
                       {isSelected && mode === 'select' && el.points.map((p: any, idx: number) => {
                         if (idx % 2 !== 0) return null; // Only take x coordinates (even indices)
                         const x = p;
                         const y = el.points[idx + 1];
                         return (
                           <Circle
                             key={`${el.id}-anchor-${idx}`}
                             x={el.x ? x + el.x : x} // Apply group/node transform offsets
                             y={el.y ? y + el.y : y}
                             radius={4}
                             fill="#3B82F6"
                             stroke="#FFFFFF"
                             strokeWidth={2}
                             draggable
                             onDragMove={(e) => {
                               const newElements = [...elementsRef.current];
                               const elIdx = newElements.findIndex(e => e.id === el.id);
                               if (elIdx !== -1) {
                                 const updated = { ...newElements[elIdx] };
                                 const newPoints = [...updated.points];
                                 
                                 // Reverse translate from transform offsets to get raw internal coords
                                 newPoints[idx] = e.target.x() - (updated.x || 0);
                                 newPoints[idx + 1] = e.target.y() - (updated.y || 0);
                                 
                                 updated.points = newPoints;
                                 newElements[elIdx] = updated;
                                 setElements(newElements);
                               }
                             }}
                             onDragEnd={() => saveHistory(elementsRef.current)}
                           />
                         );
                       })}
                     </React.Fragment>
                   );
                 }
                 if (el.type === 'rect') return <Rect {...commonProps} />;
                 if (el.type === 'circle') return <Circle {...commonProps} />;
                 if (el.type === 'triangle') return <RegularPolygon {...commonProps} />;
                 if (el.type === 'text') return <KonvaText {...commonProps} />;
                 return null;
               })}
               
               <TransformerComponent selectedId={selectedId} mode={mode} elements={elements} setElements={setElements} saveHistory={saveHistory} elementsRef={elementsRef} />
             </Layer>
           </Stage>
         </div>
      </div>
    </div>
  );
}

const ToolBtn = ({ active, icon, onClick, title }: any) => (
  <button 
    onClick={onClick} 
    className={`p-2 rounded transition-all flex items-center justify-center ${active ? 'bg-dc-gold text-white shadow-md scale-105' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`} 
    title={title}
  >
    {React.cloneElement(icon, { className: 'w-4 h-4' })}
  </button>
);

const ActionBtn = ({ icon, onClick, label, color }: any) => (
  <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-white transition-colors ${color}`} title={label}>
    {React.cloneElement(icon, { className: 'w-3.5 h-3.5' })}
    <span className="text-[11px] font-bold">{label}</span>
  </button>
);

const TransformerComponent = ({ selectedId, mode, elements, setElements, saveHistory, elementsRef }: any) => {
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (selectedId && mode === 'select') {
      const stage = trRef.current.getStage();
      const selectedNode = stage.findOne(`.${selectedId}`) || stage.children[0].children.find((n:any) => n.attrs.id === selectedId);
      if (selectedNode) {
        trRef.current.nodes([selectedNode]);
        trRef.current.getLayer().batchDraw();
      }
    } else if (trRef.current) {
      trRef.current.nodes([]);
    }
  }, [selectedId, mode, elements]);

  if (mode !== 'select') return null;

  return (
    <Transformer 
      ref={trRef} 
      boundBoxFunc={(oldBox, newBox) => {
        if (newBox.width < 5 || newBox.height < 5) return oldBox;
        return newBox;
      }}
      onTransformEnd={(e) => {
         const node = trRef.current.nodes()[0];
         if (!node) return;
         
         const scaleX = node.scaleX();
         const scaleY = node.scaleY();
         
         node.scaleX(1);
         node.scaleY(1);
         
         const newElements = [...elementsRef.current];
         const idx = newElements.findIndex((el:any) => el.id === selectedId);
         if (idx !== -1) {
            const el = newElements[idx];
            
            const updated = { ...el, x: node.x(), y: node.y(), rotation: node.rotation() };

            if (el.type === 'rect') {
               updated.width = Math.abs(node.width() * scaleX);
               updated.height = Math.abs(node.height() * scaleY);
            } else if (el.type === 'circle' || el.type === 'triangle') {
               updated.radius = Math.max(el.radius * Math.abs(scaleX), el.radius * Math.abs(scaleY));
            } else if (el.type === 'text') {
               updated.fontSize = el.fontSize * Math.abs(scaleX);
            } else {
               updated.scaleX = scaleX;
               updated.scaleY = scaleY;
            }
            
            newElements[idx] = updated;
            setElements(newElements);
            saveHistory(newElements);
         }
      }}
    />
  );
}
