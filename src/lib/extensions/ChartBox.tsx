import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, 
  RadialBarChart, RadialBar, Legend 
} from 'recharts';
import { 
  Edit3, X, Plus, GripVertical, Trash2, Database, Table, HelpCircle, 
  RefreshCw, PlusCircle, LayoutDashboard, Layers, Sparkles 
} from 'lucide-react';

const defaultData = [
  { name: 'Jan Sales', value1: 420, value2: 240 },
  { name: 'Feb Sales', value1: 380, value2: 180 },
  { name: 'Mar Sales', value1: 510, value2: 390 },
  { name: 'Apr Sales', value1: 600, value2: 450 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#EF4444', '#06B6D4', '#6366F1'];

const ChartBoxComponent = ({ node, updateAttributes, deleteNode }: any) => {
  const chartType = node.attrs.chartType || 'none';
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [localWidth, setLocalWidth] = useState(node.attrs.width || '100%');
  const [isResizing, setIsResizing] = useState(false);
  const widthRef = useRef(node.attrs.width || '100%');
  const [localHeight, setLocalHeight] = useState(node.attrs.height || 340);
  const heightRef = useRef(node.attrs.height || 340);

  const safeData = Array.isArray(node.attrs.chartData) ? node.attrs.chartData : defaultData;

  useEffect(() => {
    setLocalWidth(node.attrs.width);
    widthRef.current = node.attrs.width;
  }, [node.attrs.width]);

  useEffect(() => {
    setLocalHeight(node.attrs.height || 340);
    heightRef.current = node.attrs.height || 340;
  }, [node.attrs.height]);

  const handleCellChange = (rowIndex: number, field: string, value: string) => {
    const nextData = safeData.map((row: any, i: number) => {
      if (i === rowIndex) {
        return {
          ...row,
          [field]: field.startsWith('value') ? (Number(value) || 0) : value
        };
      }
      return row;
    });
    updateAttributes({ chartData: nextData });
  };

  const handleAddRow = () => {
    const nextData = [...safeData, { name: `Item ${safeData.length + 1}`, value1: 150, value2: 50 }];
    updateAttributes({ chartData: nextData });
  };

  const handleRemoveRow = (rowIndex: number) => {
    if (safeData.length <= 1) {
      alert("At least one row of data is required for visualization.");
      return;
    }
    const nextData = safeData.filter((_: any, i: number) => i !== rowIndex);
    updateAttributes({ chartData: nextData });
  };

  const handleResetData = () => {
    updateAttributes({ chartData: defaultData });
  };

  const handleClearData = () => {
    updateAttributes({ chartData: [{ name: 'Category', value1: 0, value2: 0 }] });
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
            newWidthPercent = Math.max(30, Math.min(100, newWidthPercent));
            const finalW = `${Math.round(newWidthPercent)}%`;
            setLocalWidth(finalW);
            widthRef.current = finalW;
        }

        if (direction === 'y' || direction === 'both') {
            let newHeight = startHeight + deltaY;
            newHeight = Math.max(200, Math.min(1200, newHeight));
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
    
    if (isTouch) {
        window.addEventListener('touchmove', onMove, { capture: true, passive: false });
        window.addEventListener('touchend', onEnd, true);
    } else {
        window.addEventListener('mousemove', onMove, true);
        window.addEventListener('mouseup', onEnd, true);
    }
  }, [localHeight, updateAttributes]);

  // Dynamic aggregates for our Professional Spreadsheet view
  const sumVal1 = safeData.reduce((sum: number, r: any) => sum + (Number(r.value1) || 0), 0);
  const sumVal2 = safeData.reduce((sum: number, r: any) => sum + (Number(r.value2) || 0), 0);
  const avgVal1 = (sumVal1 / Math.max(1, safeData.length)).toFixed(1);
  const avgVal2 = (sumVal2 / Math.max(1, safeData.length)).toFixed(1);

  return (
    <NodeViewWrapper 
       className={`chart-box-wrapper relative transition-all duration-75 ${isResizing ? 'z-50' : 'z-10'}`} 
       style={{ margin: '2rem 0', display: 'flex', justifyContent: node.attrs.align || 'center' }}
       contentEditable={false}
    >
      <div 
        ref={containerRef}
        className="w-full relative select-none rounded-2xl border bg-white shadow-lg transition-shadow hover:shadow-xl"
        style={{ 
          width: localWidth, 
          borderColor: node.attrs.color || '#3B82F6',
          borderWidth: '2px',
          pointerEvents: 'auto' 
        }}
      >
        {/* Drag vertical resize Handle East */}
        <div 
           className="absolute top-1/2 -translate-y-1/2 -right-3.5 w-7 h-14 flex items-center justify-center cursor-ew-resize z-40 group touch-none"
           onMouseDown={(e) => handleResizeStart(e, 'x')}
           onTouchStart={(e) => handleResizeStart(e, 'x')}
           title="Resize Box Width"
        >
           <div className={`w-2.5 h-10 bg-white border shadow-sm rounded-full flex items-center justify-center transition-colors ${isResizing ? 'border-indigo-500 text-indigo-500' : 'border-gray-200 text-gray-400 group-hover:border-indigo-500 group-hover:text-indigo-500'}`}>
               <GripVertical className="w-3 h-3" />
           </div>
        </div>

        {/* Height Resizer Handle South */}
        <div 
           className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-14 h-6 flex items-center justify-center cursor-ns-resize z-40 group touch-none"
           onMouseDown={(e) => handleResizeStart(e, 'y')}
           onTouchStart={(e) => handleResizeStart(e, 'y')}
           title="Resize Box Height"
        >
           <div className={`w-10 h-2 bg-white border shadow-sm rounded-full transition-colors ${isResizing ? 'border-indigo-500' : 'border-gray-200 group-hover:border-indigo-500'}`}>
           </div>
        </div>

        {/* Block Header */}
        <div 
          className="px-5 py-3.5 text-white flex items-center justify-between font-sans relative z-30"
          style={{ 
            backgroundColor: node.attrs.color || '#3B82F6',
            borderTopLeftRadius: '14px',
            borderTopRightRadius: '14px'
          }}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div data-drag-handle className="cursor-grab hover:bg-black/10 p-1 rounded-md transition-colors text-white/60 hover:text-white shrink-0" title="Drag to move block">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" /></svg>
            </div>
            
            <input 
              value={node.attrs.title}
              onChange={e => updateAttributes({ title: e.target.value })}
              onKeyDown={e => e.stopPropagation()}
              onKeyDownCapture={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
              onMouseDownCapture={e => e.stopPropagation()}
              className="bg-transparent border-0 text-white font-bold text-base outline-none w-full placeholder:text-white/50 py-0.5 focus:border-b focus:border-white/40 font-sans tracking-tight"
              placeholder="Enter visual title..."
            />
          </div>
          
          <div className="flex gap-2.5 items-center shrink-0 ml-4">
            <select
              value={chartType}
              onChange={(e) => updateAttributes({ chartType: e.target.value })}
              className="text-xs font-bold uppercase py-1 px-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg outline-none border border-white/20 transition-colors cursor-pointer"
            >
              <option value="bar" className="text-gray-900 bg-white">Bar Chart</option>
              <option value="line" className="text-gray-900 bg-white">Line Chart</option>
              <option value="area" className="text-gray-900 bg-white">Area Chart</option>
              <option value="pie" className="text-gray-900 bg-white">Pie Chart</option>
              <option value="radar" className="text-gray-900 bg-white">Radar Chart</option>
              <option value="composed" className="text-gray-900 bg-white">Composed</option>
              <option value="radial" className="text-gray-900 bg-white">Radial Chart</option>
              <option value="kpi" className="text-gray-900 bg-white">KPI Cards</option>
            </select>
            
            <input 
              type="color" 
              value={node.attrs.color || '#3B82F6'} 
              onChange={e => updateAttributes({ color: e.target.value })}
              className="w-6 h-6 p-0 border-0 rounded-md cursor-pointer shrink-0 bg-transparent"
              title="Change Theme Accent Color"
            />
            
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteNode();
              }}
              className="p-1 rounded-md text-white/50 hover:text-red-200 hover:bg-white/10 transition-colors"
              title="Delete Visual Block"
            >
               <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dashboard Frame Grid */}
        <div className="p-6 font-sans">
          {chartType === 'none' ? (
            <div className="py-10 text-center flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
               <Database className="w-8 h-8 text-gray-300 mb-2" />
               <p className="text-sm font-semibold">Empty Metric Node</p>
               <p className="text-xs text-gray-400 mt-1">Select a visualization type from the syntax folder to render data.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
               
               {/* Viz Column - Chart display */}
               <div className="lg:col-span-7 flex flex-col justify-between" style={{ height: localHeight }}>
                 <div className="flex items-center justify-between mb-3 shrink-0">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                      <LayoutDashboard className="w-3.5 h-3.5" style={{ color: node.attrs.color }} />
                      Interactive Chart Preview
                    </span>
                 </div>
                 
                 <div className="w-full flex-1 min-h-0 bg-slate-50/30 rounded-2xl p-4 border border-slate-100 flex items-center justify-center">
                   <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'line' ? (
                        <LineChart data={safeData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                          <Legend wrapperStyle={{ fontSize: 11, marginTop: 10 }} />
                          <Line type="monotone" name="Value A" dataKey="value1" stroke={node.attrs.color || '#3B82F6'} strokeWidth={3.5} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                          <Line type="monotone" name="Value B" dataKey="value2" stroke="#94A3B8" strokeWidth={2.5} strokeDasharray="3 3" dot={{ r: 3 }} isAnimationActive={false} />
                        </LineChart>
                      ) : chartType === 'bar' ? (
                        <BarChart data={safeData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                          <Legend wrapperStyle={{ fontSize: 11, marginTop: 10 }} />
                          <Bar name="Value A" dataKey="value1" fill={node.attrs.color || '#3B82F6'} radius={[5, 5, 0, 0]} barSize={26} isAnimationActive={false} />
                          <Bar name="Value B" dataKey="value2" fill="#CBD5E1" radius={[3, 3, 0, 0]} barSize={16} isAnimationActive={false} />
                        </BarChart>
                      ) : chartType === 'area' ? (
                        <AreaChart data={safeData}>
                          <defs>
                            <linearGradient id="colorVal1" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={node.attrs.color || '#3B82F6'} stopOpacity={0.4}/>
                              <stop offset="95%" stopColor={node.attrs.color || '#3B82F6'} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                          <Area type="monotone" name="Value A" dataKey="value1" stroke={node.attrs.color || '#3B82F6'} strokeWidth={3} fillOpacity={1} fill="url(#colorVal1)" isAnimationActive={false} />
                        </AreaChart>
                      ) : chartType === 'pie' ? (
                        <PieChart>
                          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Pie data={safeData} dataKey="value1" nameKey="name" cx="50%" cy="50%" outerRadius="80%" innerRadius="40%" label={{ fontSize: 10, fill: '#475569' }} isAnimationActive={false}>
                             {safeData.map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                          </Pie>
                        </PieChart>
                      ) : chartType === 'radar' ? (
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={safeData}>
                          <PolarGrid stroke="#E2E8F0" />
                          <PolarAngleAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={{ fill: '#94A3B8', fontSize: 9 }} />
                          <Radar name="Value A" dataKey="value1" stroke={node.attrs.color || '#3B82F6'} fill={node.attrs.color || '#3B82F6'} fillOpacity={0.35} strokeWidth={2.5} isAnimationActive={false} />
                          <Tooltip />
                        </RadarChart>
                      ) : chartType === 'composed' ? (
                        <ComposedChart data={safeData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} stroke="#E2E8F0" />
                          <YAxis tick={{ fontSize: 10, fill: '#64748B' }} stroke="#E2E8F0" />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar name="Value A" dataKey="value1" barSize={26} fill={node.attrs.color || '#3B82F6'} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                          <Line type="monotone" name="Value B" dataKey="value2" stroke="#475569" strokeWidth={3} dot={{ r: 4 }} isAnimationActive={false} />
                        </ComposedChart>
                      ) : chartType === 'radial' ? (
                        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={14} data={safeData}>
                          <RadialBar
                            label={{ position: 'insideStart', fill: '#ffffff', fontWeight: 'bold', fontSize: 9 }}
                            background={{ fill: '#F1F5F9' }}
                            dataKey="value1"
                            fill={node.attrs.color || '#3B82F6'}
                            isAnimationActive={false}
                          />
                          <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0, fontSize: 10 }} />
                          <Tooltip />
                        </RadialBarChart>
                      ) : chartType === 'kpi' ? (
                        <div className="grid grid-cols-2 gap-4 w-full h-full p-2 items-center justify-center overflow-y-auto">
                          {safeData.slice(0, 4).map((item: any, i: number) => (
                            <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-center items-center text-center shadow-sm h-full w-full">
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5 truncate max-w-full">{item.name}</div>
                              <div className="text-3xl font-black tracking-tight" style={{ color: node.attrs.color || '#3B82F6' }}>{item.value1}</div>
                              {item.value2 !== undefined && item.value2 !== '' && item.value2 !== 0 && item.value2 !== "0" && (
                                <div className="text-[10px] text-slate-500 bg-white shadow-xs px-2 py-0.5 rounded-full border border-slate-100 mt-2 font-mono">Offset: {item.value2}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 text-xs">Unsupported Visualization Scheme</div>
                      )}
                   </ResponsiveContainer>
                 </div>
               </div>

               {/* Professional Excel-Like Data Sheet Column */}
               <div className="lg:col-span-5 flex flex-col bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden" style={{ height: localHeight }}>
                 
                 {/* Spreadsheet Toolbar Control */}
                 <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 font-sans">
                      <Table className="w-4 h-4 text-emerald-500" />
                      Live Data Editor Grid
                    </span>
                    
                    <div className="flex gap-1.5">
                      <button 
                        onClick={handleResetData}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded transition-colors"
                        title="Reset Sheet to Sample Data"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={handleClearData}
                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Clear Table Rows"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                 </div>

                 {/* Spreadsheet Header labels */}
                 <div className="grid grid-cols-12 bg-slate-150 border-b border-slate-250 text-[10px] font-bold uppercase tracking-wide text-slate-500 px-3 py-2 text-left shrink-0 bg-slate-100">
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-4 pl-1">Category Label</div>
                    <div className="col-span-3 text-right pr-2">Primary (A)</div>
                    <div className="col-span-3 text-right pr-2">Sec (B)</div>
                    <div className="col-span-1"></div>
                 </div>

                 {/* Interactive Grid Values */}
                 <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {safeData.map((row: any, i: number) => (
                      <div key={i} className="grid grid-cols-12 items-center px-3 py-1.5 hover:bg-slate-50/60 transition-colors bg-white">
                         
                         {/* Row ID label */}
                         <div className="col-span-1 text-center font-mono text-[10px] text-slate-400 font-bold">
                            {i + 1}
                         </div>

                         {/* category name column */}
                         <div className="col-span-4 px-1">
                            <input 
                              type="text"
                              value={row.name}
                              onChange={(e) => handleCellChange(i, 'name', e.target.value)}
                              onKeyDown={e => e.stopPropagation()}
                              onMouseDown={e => e.stopPropagation()}
                              className="w-full text-xs p-1 border border-transparent rounded bg-transparent hover:bg-slate-100/70 focus:bg-white focus:border-slate-350 outline-none font-medium text-slate-800 focus:shadow-xs focus:ring-1 focus:ring-indigo-300 font-sans"
                              placeholder="Row label"
                            />
                         </div>

                         {/* Value 1 Column */}
                         <div className="col-span-3 pr-2">
                            <input 
                              type="number"
                              value={row.value1}
                              onChange={(e) => handleCellChange(i, 'value1', e.target.value)}
                              onKeyDown={e => e.stopPropagation()}
                              onMouseDown={e => e.stopPropagation()}
                              className="w-full text-xs p-1 text-right border border-transparent rounded bg-transparent hover:bg-slate-100/70 focus:bg-white focus:border-slate-350 outline-none font-mono text-slate-900 font-semibold focus:ring-1 focus:ring-indigo-300"
                              placeholder="0"
                            />
                         </div>

                         {/* Value 2 Column */}
                         <div className="col-span-3 pr-2">
                            <input 
                              type="number"
                              value={row.value2}
                              onChange={(e) => handleCellChange(i, 'value2', e.target.value)}
                              onKeyDown={e => e.stopPropagation()}
                              onMouseDown={e => e.stopPropagation()}
                              className="w-full text-xs p-1 text-right border border-transparent rounded bg-transparent hover:bg-slate-100/70 focus:bg-white focus:border-slate-350 outline-none font-mono text-slate-500 focus:ring-1 focus:ring-indigo-300"
                              placeholder="0"
                            />
                          </div>

                         {/* Delete Row Column */}
                         <div className="col-span-1 text-center">
                            <button 
                              onClick={() => handleRemoveRow(i)}
                              className="p-1 text-slate-350 hover:text-red-500 hover:bg-red-50 rounded transition-all shrink-0"
                              title="Delete Row"
                            >
                               <Trash2 className="w-3.5 h-3.5" />
                            </button>
                         </div>

                      </div>
                    ))}
                    
                    {/* Append row sheet trigger */}
                    <button 
                       onClick={handleAddRow}
                       className="w-full py-2.5 text-xs font-bold border-t border-dashed border-slate-205 flex items-center justify-center gap-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                    >
                       <PlusCircle className="w-4 h-4 text-indigo-500" />
                       Add New Row Entry
                    </button>
                 </div>

                 {/* Professional Sheet Footer Aggregates */}
                 <div className="px-3 py-2 whitespace-nowrap bg-slate-50 border-t border-slate-200/80 font-mono text-[10px] font-bold text-slate-500 flex justify-between tracking-wide shrink-0 font-mono">
                    <span className="uppercase text-slate-400">Aggregates:</span>
                    <div className="flex gap-4">
                      <span>Σ A: <strong className="text-slate-700">{sumVal1}</strong> (μ: {avgVal1})</span>
                      {chartType !== 'area' && chartType !== 'pie' && chartType !== 'radar' && (
                        <span>Σ B: <strong className="text-slate-600">{sumVal2}</strong> (μ: {avgVal2})</span>
                      )}
                    </div>
                 </div>

               </div>

            </div>
          )}
          
          {/* NodeViewContent required for Tiptap structure nested elements */}
          <NodeViewContent className="chart-box-content mt-4" style={{ display: 'none' }} />
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
      height: { default: 340 },
      title: { default: 'Executive Metric Report' },
      align: { default: 'center' },
      chartType: { default: 'bar' }, 
      chartData: {  
        default: defaultData,
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
