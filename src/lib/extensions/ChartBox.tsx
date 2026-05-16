import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, RadialBarChart, RadialBar, Legend } from 'recharts';
import { Edit3, X, Plus, GripVertical, Trash2 } from 'lucide-react';

const defaultData = [
  { name: 'A', value1: 400, value2: 240 },
  { name: 'B', value1: 300, value2: 139 },
  { name: 'C', value1: 200, value2: 980 },
  { name: 'D', value1: 278, value2: 390 },
];

const COLORS = ['#D4AF37', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

const ChartBoxComponent = ({ node, updateAttributes, deleteNode }: any) => {
  const chartType = node.attrs.chartType;
  const [isEditingData, setIsEditingData] = useState(false);
  
  const safeData = Array.isArray(node.attrs.chartData) ? node.attrs.chartData : defaultData;
  const [tempData, setTempData] = useState(safeData);
  const safeTempData = Array.isArray(tempData) ? tempData : defaultData;
  const containerRef = useRef<HTMLDivElement>(null);
  const modalBoxRef = useRef<HTMLDivElement>(null);
  
  const [localWidth, setLocalWidth] = useState(node.attrs.width || '100%');
  const [isResizing, setIsResizing] = useState(false);
  const widthRef = useRef(node.attrs.width || '100%');
  const [localHeight, setLocalHeight] = useState(node.attrs.height || 300);
  const heightRef = useRef(node.attrs.height || 300);

  // Hardcore Event Blocking for the Modal
  useEffect(() => {
    if (!modalBoxRef.current) return;
    const el = modalBoxRef.current;
    
    // Completely native DOM listener to stop Tiptap from stealing input focus
    const stopPropagation = (e: Event) => {
      e.stopPropagation();
      // Only stop immediate propagation if it's not a change event we need
      if (e.type === 'keydown' || e.type === 'mousedown') {
        // let the input handle it, but prevent ProseMirror
      }
    };
    
    // We bind to the capture phase to intercept before ProseMirror (which binds to document/root)
    el.addEventListener('keydown', stopPropagation, { capture: true });
    el.addEventListener('keypress', stopPropagation, { capture: true });
    el.addEventListener('keyup', stopPropagation, { capture: true });
    el.addEventListener('mousedown', stopPropagation, { capture: true });
    
    return () => {
      el.removeEventListener('keydown', stopPropagation, { capture: true });
      el.removeEventListener('keypress', stopPropagation, { capture: true });
      el.removeEventListener('keyup', stopPropagation, { capture: true });
      el.removeEventListener('mousedown', stopPropagation, { capture: true });
    };
  }, [isEditingData]);

  useEffect(() => {
    setLocalWidth(node.attrs.width);
    widthRef.current = node.attrs.width;
  }, [node.attrs.width]);

  useEffect(() => {
    setLocalHeight(node.attrs.height || 300);
    heightRef.current = node.attrs.height || 300;
  }, [node.attrs.height]);

  useEffect(() => {
    setTempData(Array.isArray(node.attrs.chartData) ? node.attrs.chartData : defaultData);
  }, [node.attrs.chartData]);

  const handleSaveData = () => {
    const cleanData = safeTempData.map((row: any) => ({
      ...row,
      value1: Number(row.value1) || 0,
      value2: Number(row.value2) || 0
    }));
    updateAttributes({ chartData: cleanData });
    setIsEditingData(false);
  };

  const updateField = (index: number, field: string, value: string) => {
    setTempData((prev: any) => {
       const mapped = Array.isArray(prev) ? prev : defaultData;
       const next = [...mapped];
       next[index] = { ...next[index], [field]: value };
       return next;
    });
  };

  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent, direction: 'x' | 'y' | 'both') => {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current) return;

    const isTouch = 'touches' in e;
    const startX = isTouch ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const startY = isTouch ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const startWidth = containerRef.current.getBoundingClientRect().width;
    const startHeight = localHeight;
    
    // Traverse up directly to ProseMirror constraint or fall back
    const editorEl = containerRef.current.closest('.ProseMirror') || containerRef.current.parentElement;
    if (!editorEl) return;
    
    const maxConstraint = editorEl.getBoundingClientRect().width;

    setIsResizing(true);
    document.body.style.cursor = direction === 'x' ? 'ew-resize' : direction === 'y' ? 'ns-resize' : 'nwse-resize';

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
        const isTouchMove = 'touches' in moveEvent;
        const currentX = isTouchMove ? (moveEvent as TouchEvent).touches[0].clientX : (moveEvent as MouseEvent).clientX;
        const currentY = isTouchMove ? (moveEvent as TouchEvent).touches[0].clientY : (moveEvent as MouseEvent).clientY;
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        
        if (direction === 'x' || direction === 'both') {
            let newWidthPercent = ((startWidth + deltaX) / maxConstraint) * 100;
            newWidthPercent = Math.max(20, Math.min(130, newWidthPercent));
            const finalW = `${Math.round(newWidthPercent)}%`;
            setLocalWidth(finalW);
            widthRef.current = finalW;
        }

        if (direction === 'y' || direction === 'both') {
            let newHeight = startHeight + deltaY;
            newHeight = Math.max(150, Math.min(1200, newHeight));
            setLocalHeight(newHeight);
            heightRef.current = newHeight;
        }
    };
    
    const onEnd = () => {
        setIsResizing(false);
        window.removeEventListener('mousemove', onMove, true);
        window.removeEventListener('mouseup', onEnd, true);
        window.removeEventListener('touchmove', onMove, { capture: true });
        window.removeEventListener('touchend', onEnd, true);
        document.body.style.cursor = '';
        updateAttributes({ width: widthRef.current, height: heightRef.current });
    };
    
    // Bind to window using capture to prevent Tiptap from interrupting the drag
    if (isTouch) {
        window.addEventListener('touchmove', onMove, { capture: true, passive: false });
        window.addEventListener('touchend', onEnd, true);
    } else {
        window.addEventListener('mousemove', onMove, true);
        window.addEventListener('mouseup', onEnd, true);
    }
  }, [localHeight, updateAttributes]);

  return (
    <NodeViewWrapper 
       className={`chart-box-wrapper relative transition-all duration-75 ${isResizing ? 'z-50' : 'z-10'}`} 
       style={{ margin: '1.5rem 0', display: 'flex', justifyContent: node.attrs.align || 'center' }}
       contentEditable={false} // Ensure Tiptap leaves the entire wrapper alone generally
    >
      <div 
        ref={containerRef}
        className="relative"
        style={{ width: localWidth, pointerEvents: 'auto' }} // force pointer events manually
      >
        {/* Resize Handle East */}
        <div 
           className={`absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-16 flex items-center justify-center cursor-ew-resize z-40 group touch-none`}
           onMouseDown={(e) => handleResizeStart(e, 'x')}
           onTouchStart={(e) => handleResizeStart(e, 'x')}
           title="Drag to Resize Width"
        >
           <div className={`w-3 h-12 bg-white border shadow-sm rounded-full flex items-center justify-center transition-colors ${isResizing ? 'border-dc-gold text-dc-gold shadow-md scale-110' : 'border-gray-200 text-gray-400 group-hover:border-dc-gold group-hover:text-dc-gold group-hover:scale-105'}`}>
               <GripVertical className="w-4 h-4" />
           </div>
        </div>

        {/* Resize Handle South */}
        <div 
           className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-8 flex items-center justify-center cursor-ns-resize z-40 group touch-none`}
           onMouseDown={(e) => handleResizeStart(e, 'y')}
           onTouchStart={(e) => handleResizeStart(e, 'y')}
           title="Drag to Resize Height"
        >
           <div className={`w-12 h-3 bg-white border shadow-sm rounded-full transition-colors ${isResizing ? 'border-dc-gold shadow-md scale-110' : 'border-gray-200 hover:border-dc-gold hover:scale-105'}`}>
           </div>
        </div>

        {/* Resize Handle South-East */}
        <div 
           className={`absolute -bottom-4 -right-4 w-8 h-8 flex items-center justify-center cursor-nwse-resize z-40 group touch-none`}
           onMouseDown={(e) => handleResizeStart(e, 'both')}
           onTouchStart={(e) => handleResizeStart(e, 'both')}
           title="Drag to Resize Both"
        >
           <div className={`w-4 h-4 bg-white border border-gray-200 shadow-sm rounded-full transition-colors hidden group-hover:block ${isResizing ? 'border-dc-gold bg-dc-gold shadow-md scale-110 block' : 'hover:border-dc-gold hover:bg-yellow-50 hover:scale-105'}`}>
           </div>
        </div>

        <div 
          style={{ 
            border: `3px solid ${node.attrs.color}`, 
            borderRadius: '12px', 
            /* overflow: 'hidden' removed so internal popups are not cut off */
            backgroundColor: '#ffffff',
            boxShadow: isResizing ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            transition: isResizing ? 'none' : 'box-shadow 0.2s',
          }}
        >
          <div 
            style={{ 
              backgroundColor: node.attrs.color, 
              color: '#ffffff', 
              padding: '12px 16px', 
              fontWeight: '900', 
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingRight: '24px', // make room for resizer
              borderTopLeftRadius: '8px', /* To keep corners round since overflow hidden is gone */
              borderTopRightRadius: '8px'
            }}
          >
            <div className="flex items-center gap-2 w-full">
              <div data-drag-handle className="cursor-grab hover:bg-black/10 p-1 rounded transition-colors text-white/50 hover:text-white" title="Drag to move box">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
              </div>
              <input 
                value={node.attrs.title}
                onChange={e => updateAttributes({ title: e.target.value })}
                onKeyDown={e => e.stopPropagation()}
                onKeyDownCapture={e => e.stopPropagation()}
                onMouseDown={e => e.stopPropagation()}
                onMouseDownCapture={e => e.stopPropagation()}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'inherit', 
                  fontWeight: 'inherit', 
                  fontSize: 'inherit', 
                  width: '100%', 
                  outline: 'none' 
                }}
                placeholder="Heading..."
              />
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteNode();
                }}
                className="p-1 rounded text-white/50 hover:text-red-300 hover:bg-black/10 transition-colors ml-2"
                title="Delete Chart"
              >
                 <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex gap-2 items-center shrink-0">
              {chartType !== 'none' && (
                <button 
                  onClick={() => setIsEditingData(!isEditingData)}
                  className={`text-xs px-2 py-1 rounded flex items-center gap-1 font-bold ${isEditingData ? 'bg-white text-black' : 'bg-black/20 hover:bg-black/30 text-white'} transition-colors`}
                >
                  <Edit3 className="w-3 h-3" /> Edit Data
                </button>
              )}
              <input 
                type="color" 
                value={node.attrs.color} 
                onChange={e => updateAttributes({ color: e.target.value })}
                className="w-6 h-6 p-0 border-0 rounded cursor-pointer shrink-0"
                title="Change Box Color"
              />
            </div>
          </div>
          <div style={{ padding: '16px', position: 'relative' }}>
            {chartType !== 'none' && isEditingData && (
               <div 
                 ref={modalBoxRef}
                 className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm p-4 overflow-y-auto" 
               >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-sm flex items-center gap-2"><Edit3 className="w-4 h-4 text-dc-gold" /> Customize Data</h3>
                    <div className="flex gap-2">
                       <button onClick={() => setIsEditingData(false)} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
                       <button onClick={handleSaveData} className="px-3 py-1.5 text-xs font-bold bg-dc-gold text-white shadow-sm rounded hover:bg-yellow-600">Save Data</button>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                    {safeTempData.map((row: any, i: number) => (
                      <div key={i} className="flex border-b border-gray-100 last:border-0 bg-white items-center p-1 gap-1">
                        <div className="w-8 text-center text-xs text-gray-400 font-bold">{i+1}</div>
                        <input 
                          type="text"
                          className="flex-1 min-w-0 p-2 text-xs border border-transparent hover:border-gray-200 focus:border-dc-gold outline-none rounded bg-gray-50 focus:bg-white" 
                          value={row.name} 
                          onChange={(e) => updateField(i, 'name', e.target.value)} 
                          placeholder="Label" 
                        />
                        <input 
                          type="text"
                          inputMode="numeric"
                          className="flex-1 min-w-0 p-2 text-xs border border-transparent hover:border-gray-200 focus:border-dc-gold outline-none rounded bg-gray-50 focus:bg-white font-mono" 
                          value={row.value1} 
                          onChange={(e) => updateField(i, 'value1', e.target.value)} 
                          placeholder="Primary Value" 
                        />
                        <input 
                          type="text"
                          inputMode="numeric"
                          className="flex-1 min-w-0 p-2 text-xs border border-transparent hover:border-gray-200 focus:border-dc-gold outline-none rounded bg-gray-50 focus:bg-white font-mono" 
                          value={row.value2} 
                          onChange={(e) => updateField(i, 'value2', e.target.value)} 
                          placeholder="Secondary (Opt)" 
                        />
                        <button 
                          onClick={() => setTempData((prev: any) => prev.filter((_:any, idx:number) => idx !== i))}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded mx-1"
                          title="Remove row"
                        >
                           <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button 
                       onClick={() => setTempData([...safeTempData, { name: 'Item', value1: 0, value2: 0 }])}
                       className="p-3 text-xs font-bold text-dc-gold bg-yellow-50/50 hover:bg-yellow-50 flex items-center justify-center gap-2"
                    >
                       <Plus className="w-4 h-4" /> Add Row
                    </button>
                  </div>
               </div>
            )}

            {chartType !== 'none' && (
              <div contentEditable={false} style={{ width: '100%', height: localHeight, marginBottom: '1rem', opacity: isEditingData ? 0.3 : 1, transition: 'opacity 0.2s', pointerEvents: isEditingData ? 'none' : 'auto' }}>
                <ResponsiveContainer width="100%" height="100%">
                   {chartType === 'line' ? (
                     <LineChart data={safeData}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis dataKey="name" />
                       <YAxis />
                       <Tooltip />
                       <Line type="monotone" dataKey="value1" stroke={node.attrs.color} strokeWidth={3} />
                       <Line type="monotone" dataKey="value2" stroke="#9CA3AF" strokeWidth={2} />
                     </LineChart>
                   ) : chartType === 'bar' ? (
                     <BarChart data={safeData}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis dataKey="name" />
                       <YAxis />
                       <Tooltip />
                       <Bar dataKey="value1" fill={node.attrs.color} radius={[4, 4, 0, 0]} />
                       <Bar dataKey="value2" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                     </BarChart>
                   ) : chartType === 'area' ? (
                     <AreaChart data={safeData}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis dataKey="name" />
                       <YAxis />
                       <Tooltip />
                       <Area type="monotone" dataKey="value1" stroke={node.attrs.color} fill={node.attrs.color} fillOpacity={0.3} />
                     </AreaChart>
                   ) : chartType === 'pie' ? (
                     <PieChart>
                       <Tooltip />
                       <Pie data={safeData} dataKey="value1" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                          {safeData.map((_:any, index:number) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                       </Pie>
                     </PieChart>
                   ) : chartType === 'radar' ? (
                     <RadarChart cx="50%" cy="50%" outerRadius="80%" data={safeData}>
                       <PolarGrid stroke="#e5e7eb" />
                       <PolarAngleAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                       <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#9ca3af' }} />
                       <Radar name="Primary" dataKey="value1" stroke={node.attrs.color} fill={node.attrs.color} fillOpacity={0.5} strokeWidth={2} />
                       <Tooltip />
                     </RadarChart>
                   ) : chartType === 'composed' ? (
                     <ComposedChart data={safeData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} />
                       <YAxis axisLine={false} tickLine={false} />
                       <Tooltip />
                       <Legend />
                       <Bar dataKey="value1" barSize={32} fill={node.attrs.color} radius={[4, 4, 0, 0]} />
                       <Line type="monotone" dataKey="value2" stroke="#4B5563" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                     </ComposedChart>
                   ) : chartType === 'radial' ? (
                     <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="90%" barSize={16} data={safeData}>
                       <RadialBar
                         label={{ position: 'insideStart', fill: '#ffffff', fontWeight: 'bold' }}
                         background={{ fill: '#f3f4f6' }}
                         dataKey="value1"
                         fill={node.attrs.color}
                       />
                       <Legend iconSize={12} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0 }} />
                       <Tooltip />
                     </RadialBarChart>
                   ) : chartType === 'table' ? (
                     <div className="w-full h-full overflow-auto bg-white rounded-xl border border-gray-200">
                        <table className="w-full text-left border-collapse min-w-[400px]">
                           <thead>
                              <tr style={{ backgroundColor: `${node.attrs.color}10` }}>
                                <th className="p-4 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">Category Label</th>
                                <th className="p-4 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500 text-right whitespace-nowrap">Primary Metric</th>
                                <th className="p-4 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500 text-right whitespace-nowrap">Secondary Indicator</th>
                              </tr>
                           </thead>
                           <tbody className="text-gray-800 text-sm">
                              {safeData.map((item: any, i:number) => (
                                 <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-semibold text-gray-800 flex items-center gap-3">
                                       <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: node.attrs.color, opacity: 1 - (i * 0.15) }}></div>
                                       {item.name}
                                    </td>
                                    <td className="p-4 font-mono font-medium text-right text-base text-gray-900">{item.value1}</td>
                                    <td className="p-4 font-mono text-right text-gray-500">
                                       {item.value2 ? (
                                         <span className="bg-white border border-gray-200 px-2 py-1 rounded-md text-xs font-bold">{item.value2}</span>
                                       ) : '-'}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                   ) : chartType === 'kpi' ? (
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 items-center justify-center h-full w-full overflow-y-auto">
                       {safeData.map((item: any, i: number) => (
                         <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col justify-center items-center text-center shadow-sm h-full w-full">
                           <div className="text-xs lg:text-sm text-gray-500 font-bold mb-2 uppercase tracking-wide">{item.name}</div>
                           <div className="text-2xl lg:text-4xl font-black mb-1 truncate w-full" style={{ color: node.attrs.color }}>{item.value1}</div>
                           {item.value2 !== undefined && item.value2 !== '' && item.value2 !== 0 && item.value2 !== "0" && (
                             <div className="text-[10px] lg:text-xs text-gray-400 bg-white px-2 py-1 rounded-full border border-gray-200 mt-2">{item.value2}</div>
                           )}
                         </div>
                       ))}
                     </div>
                   ) : <div />}
                </ResponsiveContainer>
              </div>
            )}
            <NodeViewContent className="chart-box-content" />
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const ChartBox = Node.create({
  name: 'chartBox',
  group: 'block',
  content: 'block*',
  draggable: true,

  addAttributes() {
    return {
      color: { default: '#3B82F6' },
      width: { default: '100%' },
      height: { default: 300 },
      title: { default: 'Box Heading' },
      align: { default: 'center' },
      chartType: { default: 'none' }, // 'none', 'line', 'bar', 'area', 'pie', 'kpi'
      chartData: {  
        default: null,
        parseHTML: element => {
          const dataAttr = element.getAttribute('data-chart-data');
          if (dataAttr) {
            try { return JSON.parse(dataAttr); } catch (e) { return null; }
          }
          return null;
        },
        renderHTML: attributes => {
          if (!attributes.chartData) return {};
          return { 'data-chart-data': JSON.stringify(attributes.chartData) };
        }
      }
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="chart-box"]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'chart-box' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChartBoxComponent);
  },
});
