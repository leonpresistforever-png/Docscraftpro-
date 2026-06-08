import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { 
  Network, Plus, Trash2, Edit3, ArrowRight, Table, Layout, 
  HelpCircle, Check, ChevronDown, Move, Circle, Layers, Activity, Maximize2, Sparkles, Download, RefreshCw
} from 'lucide-react';

interface FlowNode {
  id: string;
  label: string;
  shape: 'oval' | 'rectangle' | 'diamond' | 'parallelogram' | 'cylinder' | 'document';
  color: string;
  textColor: string;
  x: number;
  y: number;
  width: number;
  height: number;
  borderStyle: 'solid' | 'dashed';
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  color?: string;
}

const PRESET_COLORS = [
  { name: 'Slate Gray', bg: '#f1f5f9', border: '#cbd5e1', text: '#334155', accent: '#64748b' },
  { name: 'Sleek Indigo', bg: '#e0e7ff', border: '#c7d2fe', text: '#3730a3', accent: '#4f46e5' },
  { name: 'Emerald Process', bg: '#d1fae5', border: '#a7f3d0', text: '#065f46', accent: '#059669' },
  { name: 'Amber Decision', bg: '#fef3c7', border: '#fde68a', text: '#92400e', accent: '#d97706' },
  { name: 'Cyan Database', bg: '#ecfeff', border: '#cffafe', text: '#155e75', accent: '#0891b2' },
  { name: 'Rose Terminal', bg: '#ffe4e6', border: '#fecdd3', text: '#9f1239', accent: '#e11d48' },
];

const INITIAL_NODES: FlowNode[] = [
  {
    id: 'start',
    label: 'Start Initiative',
    shape: 'oval',
    color: '#e0e7ff',
    textColor: '#3730a3',
    x: 100,
    y: 120,
    width: 140,
    height: 70,
    borderStyle: 'solid'
  },
  {
    id: 'process1',
    label: 'Analyze & Draft Docs',
    shape: 'rectangle',
    color: '#f1f5f9',
    textColor: '#334155',
    x: 320,
    y: 120,
    width: 160,
    height: 70,
    borderStyle: 'solid'
  },
  {
    id: 'decision1',
    label: 'Review Meets Standard?',
    shape: 'diamond',
    color: '#fef3c7',
    textColor: '#92400e',
    x: 560,
    y: 90,
    width: 160,
    height: 120,
    borderStyle: 'solid'
  },
  {
    id: 'end',
    label: 'Publish Documentation',
    shape: 'document',
    color: '#d1fae5',
    textColor: '#065f46',
    x: 800,
    y: 120,
    width: 160,
    height: 80,
    borderStyle: 'solid'
  }
];

const INITIAL_EDGES: FlowEdge[] = [
  { id: 'e1', source: 'start', target: 'process1', animated: true, color: '#4f46e5' },
  { id: 'e2', source: 'process1', target: 'decision1', animated: false, color: '#64748b' },
  { id: 'e3', source: 'decision1', target: 'end', label: 'Yes', animated: true, color: '#059669' }
];

export function LogicMapper() {
  const [nodes, setNodes] = useState<FlowNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<FlowEdge[]>(INITIAL_EDGES);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Link mode state
  const [linkSourceId, setLinkSourceId] = useState<string | null>(null);
  
  // Drag states
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Auto layout template creator
  const applyPresetTemplate = (type: 'linear' | 'loop' | 'database') => {
    if (type === 'linear') {
      setNodes([
        { id: 'n1', label: 'Initiate Request', shape: 'oval', color: '#e0e7ff', textColor: '#3730a3', x: 80, y: 150, width: 140, height: 75, borderStyle: 'solid' },
        { id: 'n2', label: 'Assess Feasibility', shape: 'rectangle', color: '#f1f5f9', textColor: '#334155', x: 280, y: 150, width: 150, height: 75, borderStyle: 'solid' },
        { id: 'n3', label: 'Process Complete', shape: 'document', color: '#d1fae5', textColor: '#065f46', x: 490, y: 150, width: 150, height: 75, borderStyle: 'solid' }
      ]);
      setEdges([
        { id: 'e1-2', source: 'n1', target: 'n2', animated: true, color: '#4f46e5' },
        { id: 'e2-3', source: 'n2', target: 'n3', animated: false, color: '#059669' }
      ]);
    } else if (type === 'loop') {
      setNodes([
        { id: 'n1', label: 'Develop Code', shape: 'rectangle', color: '#f1f5f9', textColor: '#334155', x: 100, y: 120, width: 140, height: 75, borderStyle: 'solid' },
        { id: 'n2', label: 'Continuous Test', shape: 'diamond', color: '#fef3c7', textColor: '#92400e', x: 300, y: 90, width: 150, height: 120, borderStyle: 'solid' },
        { id: 'n3', label: 'Deploy Release', shape: 'document', color: '#d1fae5', textColor: '#065f46', x: 520, y: 120, width: 140, height: 75, borderStyle: 'solid' },
        { id: 'n4', label: 'Fix Bugs', shape: 'rectangle', color: '#ffe4e6', textColor: '#9f1239', x: 300, y: 280, width: 140, height: 70, borderStyle: 'solid' }
      ]);
      setEdges([
        { id: 'e1', source: 'n1', target: 'n2', animated: true, color: '#64748b' },
        { id: 'e2', source: 'n2', target: 'n3', label: 'Pass', animated: true, color: '#059669' },
        { id: 'e3', source: 'n2', target: 'n4', label: 'Fail', animated: false, color: '#e11d48' },
        { id: 'e4', source: 'n4', target: 'n1', animated: true, color: '#4f46e5' }
      ]);
    } else if (type === 'database') {
      setNodes([
        { id: 'n1', label: 'Client UI Web App', shape: 'parallelogram', color: '#e0e7ff', textColor: '#3730a3', x: 80, y: 140, width: 160, height: 80, borderStyle: 'solid' },
        { id: 'n2', label: 'API Gateway Router', shape: 'rectangle', color: '#f1f5f9', textColor: '#334155', x: 320, y: 140, width: 150, height: 80, borderStyle: 'solid' },
        { id: 'n3', label: 'Persistent Database Store', shape: 'cylinder', color: '#ecfeff', textColor: '#155e75', x: 550, y: 120, width: 150, height: 110, borderStyle: 'solid' }
      ]);
      setEdges([
        { id: 'e1', source: 'n1', target: 'n2', animated: true, color: '#4f46e5' },
        { id: 'e2', source: 'n2', target: 'n3', animated: true, color: '#0891b2' }
      ]);
    }
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };

  const handleCreateNode = (shape: FlowNode['shape'] = 'rectangle') => {
    const parentContainer = canvasRef.current;
    let x = 150;
    let y = 150;
    if (parentContainer) {
      const rect = parentContainer.getBoundingClientRect();
      x = Math.max(50, Math.min(rect.width - 200, rect.width / 2 + (Math.random() * 60 - 30)));
      y = Math.max(50, Math.min(rect.height - 150, rect.height / 2 + (Math.random() * 60 - 30)));
    }
    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      label: `New ${shape.charAt(0).toUpperCase() + shape.slice(1)}`,
      shape,
      color: '#f1f5f9',
      textColor: '#334155',
      x,
      y,
      width: shape === 'diamond' ? 140 : 140,
      height: shape === 'diamond' ? 110 : 75,
      borderStyle: 'solid'
    };
    setNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const handleDeleteSelected = () => {
    if (selectedNodeId) {
      setNodes(nodes.filter(n => n.id !== selectedNodeId));
      setEdges(edges.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId));
      setSelectedNodeId(null);
    } else if (selectedEdgeId) {
      setEdges(edges.filter(e => e.id !== selectedEdgeId));
      setSelectedEdgeId(null);
    }
  };

  // Drag and Drop Logic with dynamically bound window pointer listeners for responsive Mobile Touch + Mouse drag!
  const handleNodePointerDown = (e: React.PointerEvent, nodeId: string) => {
    const target = e.target as HTMLElement;
    // If clicking an active control, button or form input inside card, ignore dragging action
    if (target.closest('.no-drag-area') || target.closest('button') || target.closest('input') || target.closest('select') || target.closest('textarea')) return;
    
    e.preventDefault();
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
    
    if (linkSourceId) {
      // Connect option
      if (linkSourceId !== nodeId) {
        const edgeId = `edge-${Date.now()}`;
        setEdges(prev => [...prev, { id: edgeId, source: linkSourceId, target: nodeId, animated: true, color: '#4f46e5' }]);
      }
      setLinkSourceId(null);
      return;
    }

    setDragNodeId(nodeId);
    if (!canvasRef.current) return;
    
    // Find initial node measurements dynamically to stay fully isolated inside the closure helper
    const nodeObj = nodes.find(n => n.id === nodeId);
    if (!nodeObj) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const startDragOffset = {
      x: e.clientX - canvasRect.left - nodeObj.x,
      y: e.clientY - canvasRect.top - nodeObj.y
    };
    dragOffset.current = startDragOffset;

    const handleWindowPointerMove = (moveEvent: PointerEvent) => {
      if (!canvasRef.current) return;
      const cRect = canvasRef.current.getBoundingClientRect();
      const desiredX = moveEvent.clientX - cRect.left - startDragOffset.x;
      const desiredY = moveEvent.clientY - cRect.top - startDragOffset.y;
      
      const finalX = Math.max(10, Math.min(cRect.width - nodeObj.width - 10, desiredX));
      const finalY = Math.max(10, Math.min(cRect.height - nodeObj.height - 10, desiredY));

      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, x: Math.round(finalX), y: Math.round(finalY) } : n));
    };

    const handleWindowPointerUp = () => {
      setDragNodeId(null);
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
    };

    window.addEventListener('pointermove', handleWindowPointerMove, { passive: true });
    window.addEventListener('pointerup', handleWindowPointerUp, { passive: true });
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    // Handled dynamically on window level to avoid boundary escapement bugs
  };

  const handleCanvasPointerUp = () => {
    setDragNodeId(null);
  };

  // Node editing actions
  const updateSelectedNode = (fields: Partial<FlowNode>) => {
    if (!selectedNodeId) return;
    setNodes(prev => prev.map(n => n.id === selectedNodeId ? { ...n, ...fields } : n));
  };

  const updateSelectedEdge = (fields: Partial<FlowEdge>) => {
    if (!selectedEdgeId) return;
    setEdges(prev => prev.map(e => e.id === selectedEdgeId ? { ...e, ...fields } : e));
  };

  // Link / connection tool
  const triggerLinkSequence = (sourceId: string) => {
    setLinkSourceId(sourceId);
  };

  // SVGAngles connecting calculations
  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    return {
      x: node.x + node.width / 2,
      y: node.y + node.height / 2
    };
  };

  // Render connections beautifully in SVG overlay
  const renderSVGConnections = () => {
    return (
      <svg className="absolute inset-0 pointer-events-none w-full h-full z-10 overflow-visible">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="currentColor" />
          </marker>
        </defs>

        {edges.map(edge => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;

          // Connect from appropriate sides based on coordinates
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;

          let startX = sourceNode.x + sourceNode.width / 2;
          let startY = sourceNode.y + sourceNode.height / 2;
          let endX = targetNode.x + targetNode.width / 2;
          let endY = targetNode.y + targetNode.height / 2;

          // Simple dynamic edge point layout
          if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal connection
            if (dx > 0) {
              startX = sourceNode.x + sourceNode.width;
              endX = targetNode.x;
            } else {
              startX = sourceNode.x;
              endX = targetNode.x + targetNode.width;
            }
          } else {
            // Vertical connection
            if (dy > 0) {
              startY = sourceNode.y + sourceNode.height;
              endY = targetNode.y;
            } else {
              startY = sourceNode.y;
              endY = targetNode.y + targetNode.height;
            }
          }

          const isSelected = selectedEdgeId === edge.id;
          const strokeColor = isSelected ? '#3b82f6' : edge.color || '#64748b';
          const strokeWidth = isSelected ? 3.5 : 2;

          // Draw orthogonal clean pathway layout
          const mx = (startX + endX) / 2;
          const pathD = `M ${startX} ${startY} L ${mx} ${startY} L ${mx} ${endY} L ${endX} ${endY}`;

          return (
            <g key={edge.id} className="pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedEdgeId(edge.id); setSelectedNodeId(null); }}>
              {/* Invisible clickable thick trace path */}
              <path d={pathD} stroke="transparent" strokeWidth="12" fill="none" className="hover:stroke-indigo-100 hover:opacity-40 transition-colors" />
              
              {/* Visual Stroke */}
              <path 
                d={pathD} 
                stroke={strokeColor} 
                strokeWidth={strokeWidth} 
                fill="none" 
                markerEnd="url(#arrow)"
                strokeDasharray={edge.animated ? '5,5' : 'none'}
                className="transition-all text-gray-500"
                style={{
                  color: strokeColor,
                  animation: edge.animated ? 'dash 20s linear infinite' : 'none'
                }}
              />

              {/* Edge Label Banner overlay if any */}
              {edge.label && (
                <text 
                  x={mx} 
                  y={(startY + endY) / 2 - 4} 
                  textAnchor="middle" 
                  className="text-[9px] font-bold font-mono px-1 select-none pointer-events-none fill-slate-700 font-bold bg-white"
                  style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 3 }}
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  const activeNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex h-screen w-full bg-[#FAF9F6] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="px-10 py-5 border-b border-[#EAE6DF] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-700 shadow-sm">
              <Network size={22} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif text-gray-900 leading-tight">Flowchart Creator & Studio</h1>
              <p className="text-xs text-dc-text-muted mt-0.5">Visually chart structure logic. Drag cards, connect nodes, select preset blueprints.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => applyPresetTemplate('linear')}
              className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Layout className="w-3.5 h-3.5" /> Static Process
            </button>
            <button 
              onClick={() => applyPresetTemplate('loop')}
              className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Loop Cycle
            </button>
            <button 
              onClick={() => applyPresetTemplate('database')}
              className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Table className="w-3.5 h-3.5" /> Data Flow Pipeline
            </button>
          </div>
        </header>

        {/* Workspace Frame */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main Diagram Area */}
          <div className="flex-1 p-8 overflow-hidden flex flex-col relative min-w-0">
            
            {/* Shapes Palette Trigger Rail */}
            <div className="mb-5 flex items-center gap-2 bg-white/70 backdrop-blur-md p-2 rounded-2xl border border-[#EAE6DF] shadow-sm w-fit self-center z-20">
              <span className="text-[10px] tracking-wider uppercase font-bold text-slate-400 px-2">Inject Shapes:</span>
              <button onClick={() => handleCreateNode('rectangle')} className="flex items-center gap-1 text-[11px] font-bold bg-white hover:bg-gray-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-all">
                <span className="w-3.5 h-2.5 border-2 border-slate-500 rounded bg-slate-100"></span> Process Box
              </button>
              <button onClick={() => handleCreateNode('diamond')} className="flex items-center gap-1 text-[11px] font-bold bg-white hover:bg-gray-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-all">
                <span className="w-3 h-3 border-2 border-slate-500 rotate-45 bg-slate-100 flex-shrink-0"></span> Decision Diamond
              </button>
              <button onClick={() => handleCreateNode('oval')} className="flex items-center gap-1 text-[11px] font-bold bg-white hover:bg-gray-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-all">
                <span className="w-3.5 h-2.5 border-2 border-slate-500 rounded-full bg-slate-100"></span> Oval Terminus
              </button>
              <button onClick={() => handleCreateNode('parallelogram')} className="flex items-center gap-1 text-[11px] font-bold bg-white hover:bg-gray-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-all">
                <span className="w-3.5 h-2.5 border-2 border-slate-500 rounded bg-slate-100 skew-x-12"></span> Input/Output
              </button>
              <button onClick={() => handleCreateNode('cylinder')} className="flex items-center gap-1 text-[11px] font-bold bg-white hover:bg-gray-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-all">
                <span className="w-3 h-3.5 border-2 border-slate-500 rounded-t-full rounded-b-full bg-slate-100"></span> Cylinder Storage
              </button>
              <button onClick={() => handleCreateNode('document')} className="flex items-center gap-1 text-[11px] font-bold bg-white hover:bg-gray-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-all">
                <span className="w-3 h-3.5 border-2 border-slate-500 rounded-t bg-slate-100 border-b-dotted"></span> Doc Sheet
              </button>
            </div>

            {/* Canvas Area Container with touch containment and unified pointers */}
            <div 
              ref={canvasRef}
              className="flex-1 bg-white rounded-3xl border border-[#EAE6DF] relative overflow-hidden select-none cursor-default shadow-sm touch-none"
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerLeave={handleCanvasPointerUp}
              onClick={() => { setSelectedNodeId(null); setSelectedEdgeId(null); setLinkSourceId(null); }}
              style={{
                backgroundImage: 'radial-gradient(#e2e8f0 1.2px, transparent 1.2px)',
                backgroundSize: '20px 20px',
              }}
            >
              {/* Connections SVG Overlay panel */}
              {renderSVGConnections()}

              {/* Linking mode indicator overlay bar */}
              {linkSourceId && (
                <div className="absolute top-4 left-4 z-30 bg-indigo-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-xs font-bold animate-pulse flex items-center gap-2 shadow-md">
                  <Activity size={14} className="animate-spin" />
                  <span>Choose Target Card on the canvas to link arrow...</span>
                  <button onClick={(e) => { e.stopPropagation(); setLinkSourceId(null); }} className="p-1 hover:bg-white/20 rounded-full text-[10px] font-bold underline ml-2">Cancel Link</button>
                </div>
              )}

              {/* Rendering Interactive Flow Nodes with unified pointers */}
              {nodes.map(node => {
                const isSelected = selectedNodeId === node.id;
                const isPossibleTarget = linkSourceId && linkSourceId !== node.id;

                return (
                  <div
                    key={node.id}
                    onPointerDown={(e) => handleNodePointerDown(e, node.id)}
                    className={`absolute flex flex-col justify-between p-4 rounded-xl border select-none transition-shadow ${isSelected ? 'ring-4 ring-indigo-500/20 border-indigo-500 shadow-lg z-30 scale-[1.01]' : 'shadow-sm z-20 hover:shadow-md border-[#EAE6DF]'} ${isPossibleTarget ? 'cursor-alias ring-4 ring-emerald-500/30 border-emerald-500 scale-[1.03] animate-pulse duration-700' : ''}`}
                    style={{
                      left: node.x,
                      top: node.y,
                      width: node.width,
                      height: node.height,
                      backgroundColor: node.color,
                      borderStyle: node.borderStyle,
                      borderWidth: '2px',
                    }}
                  >
                    {/* Node Shape Decoration Render Details */}
                    {node.shape === 'oval' && <div className="absolute inset-0.5 border border-dashed rounded-full pointer-events-none opacity-20"></div>}
                    {node.shape === 'diamond' && (
                      <div className="absolute inset-x-2 inset-y-2 border border-dotted pointer-events-none opacity-25" style={{ transform: 'rotate(45deg)' }}></div>
                    )}
                    
                    {/* Inner Content Text Grid */}
                    <div className="flex-1 flex items-center justify-center text-center p-1 overflow-hidden pointer-events-none">
                      <span 
                        className="text-xs font-bold tracking-tight line-clamp-3 select-none text-slate-800"
                        style={{ color: node.textColor }}
                      >
                        {node.label}
                      </span>
                    </div>

                    {/* Multi-Tool Actions inside node box */}
                    <div className="no-drag-area mt-2 flex justify-between items-center z-10 opacity-0 hover:opacity-100 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      {/* Left tool: Link To launcher */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); triggerLinkSequence(node.id); }}
                        title="Link connector arrow to other card"
                        className="p-1 bg-white hover:bg-slate-100 text-indigo-700 rounded-md border border-slate-200 text-[10px] flex items-center gap-0.5 font-bold transition-all shadow-sm shrink-0"
                      >
                        <ArrowRight className="w-3 h-3" /> Connect
                      </button>

                      {/* Right indicator details */}
                      <span className="text-[9px] font-mono text-slate-400 font-bold tracking-widest uppercase">
                        {node.shape}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Style Customizer Sidebar Panel */}
          <div className="w-[380px] border-l border-[#EAE6DF] bg-white p-6 shrink-0 flex flex-col gap-6 overflow-y-auto no-scrollbar z-20 shadow-2xl relative">
            
            {/* Context title block */}
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xs tracking-[0.25em] font-sans uppercase font-extrabold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600 animate-pulse" /> Element Inspector
              </h2>
              <span className="text-[9px] font-mono font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {activeNode ? 'Card Active' : selectedEdgeId ? 'Arrow Active' : 'Idle'}
              </span>
            </div>

            {/* If a Node is selected */}
            {activeNode && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-200">
                
                {/* Visual Section: Header Label */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-xs">
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2 font-mono flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" /> Card Headline
                  </h3>
                  <textarea
                    value={activeNode.label}
                    placeholder="Enter process step text..."
                    onChange={(e) => updateSelectedNode({ label: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-xs font-medium transition-all shadow-sm"
                    rows={2}
                  />
                </div>

                {/* Visual Section: Geometric Slider */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-xs">
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-3 font-mono flex justify-between items-center">
                    <span>Card Dimensions</span>
                    <span className="text-[10px] text-indigo-600 font-mono font-bold font-sans">"Adjust Expand"</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Width:</span>
                        <span className="font-mono text-[11px] text-indigo-600 font-bold">{activeNode.width}px</span>
                      </div>
                      <input 
                        type="range" 
                        min={100} 
                        max={300} 
                        value={activeNode.width} 
                        onChange={e => updateSelectedNode({ width: parseInt(e.target.value) })}
                        className="w-full accent-indigo-600 cursor-ew-resize py-1" 
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Height:</span>
                        <span className="font-mono text-[11px] text-indigo-600 font-bold">{activeNode.height}px</span>
                      </div>
                      <input 
                        type="range" 
                        min={60} 
                        max={200} 
                        value={activeNode.height} 
                        onChange={e => updateSelectedNode({ height: parseInt(e.target.value) })}
                        className="w-full accent-indigo-600 cursor-ew-resize py-1" 
                      />
                    </div>
                  </div>
                </div>

                {/* Visual Section: Shape presets */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-xs">
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2.5 font-mono">Shape Archetype</h3>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'rectangle', label: 'Process', glyph: '▭' },
                      { id: 'diamond', label: 'Decision', glyph: '◇' },
                      { id: 'oval', label: 'Terminus', glyph: '⬭' },
                      { id: 'parallelogram', label: 'In / Out', glyph: '▱' },
                      { id: 'cylinder', label: 'Database', glyph: '⛃' },
                      { id: 'document', label: 'Document', glyph: '🗎' },
                    ].map(shape => (
                      <button
                        key={shape.id}
                        onClick={() => updateSelectedNode({ shape: shape.id as any })}
                        className={`p-2 rounded-lg text-xs font-bold border transition-all text-left flex items-center justify-between ${activeNode.shape === shape.id ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}
                      >
                        <span className="truncate">{shape.label}</span>
                        <span className="text-[10px] font-bold opacity-80 font-serif leading-none ml-1">{shape.glyph}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visual Section: Colors */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-xs">
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2.5 font-mono">Visual Palette Theme</h3>
                  <div className="space-y-1.5 max-h-[170px] overflow-y-auto no-scrollbar border rounded-lg p-1 bg-white">
                    {PRESET_COLORS.map((col, index) => (
                      <div
                        key={index}
                        onClick={() => updateSelectedNode({ color: col.bg, textColor: col.text })}
                        className="p-2 rounded-lg border border-slate-100 hover:border-indigo-400 transition-colors cursor-pointer flex items-center justify-between"
                        style={{ backgroundColor: col.bg + '20' }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded border border-slate-300" style={{ backgroundColor: col.bg }}></div>
                          <span className="text-xs font-bold text-slate-750" style={{ color: col.text }}>{col.name}</span>
                        </div>
                        {activeNode.color === col.bg && <Check className="w-3.5 h-3.5 text-slate-700 font-extrabold" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Border types */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-xs">
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2 font-mono">Contour Dashes</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateSelectedNode({ borderStyle: 'solid' })}
                      className={`p-2 rounded-lg text-xs font-bold border transition-all ${activeNode.borderStyle === 'solid' ? 'bg-slate-800 text-white border-slate-900 shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}
                    >
                      Solid Line
                    </button>
                    <button
                      onClick={() => updateSelectedNode({ borderStyle: 'dashed' })}
                      className={`p-2 rounded-lg text-xs font-bold border transition-all ${activeNode.borderStyle === 'dashed' ? 'bg-slate-800 text-white border-slate-900 shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}
                    >
                      Dashed Stroke
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDeleteSelected}
                    className="w-full py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Purge Selected Card
                  </button>
                </div>
              </div>
            )}

            {/* If an Edge is selected */}
            {selectedEdgeId && !selectedNodeId && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-200">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-xs">
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2 font-mono">Arrow Label</h3>
                  <input
                    type="text"
                    value={edges.find(e => e.id === selectedEdgeId)?.label || ''}
                    onChange={(e) => updateSelectedEdge({ label: e.target.value })}
                    placeholder="e.g. Yes, No, Sync"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:border-indigo-400 text-xs font-bold transition-all shadow-sm"
                  />
                </div>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-xs">
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2 font-mono">Arrow Animation</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateSelectedEdge({ animated: true })}
                      className={`p-2 rounded-lg text-xs font-bold border transition-all ${edges.find(e => e.id === selectedEdgeId)?.animated ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}
                    >
                      Flowing Pulse
                    </button>
                    <button
                      onClick={() => updateSelectedEdge({ animated: false })}
                      className={`p-2 rounded-lg text-xs font-bold border transition-all ${!edges.find(e => e.id === selectedEdgeId)?.animated ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}
                    >
                      Static Path
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-xs">
                  <h3 className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2 font-mono">Arrow Stroke Tint</h3>
                  <div className="flex gap-2.5 bg-white p-2.5 rounded-lg border border-slate-150">
                    {['#64748b', '#4f46e5', '#059669', '#d97706', '#e11d48'].map(col => (
                      <button
                        key={col}
                        onClick={() => updateSelectedEdge({ color: col })}
                        className="w-7 h-7 rounded-full border border-slate-300 relative transition-transform hover:scale-110 shadow-xs shrink-0 flex items-center justify-center cursor-pointer"
                        style={{ backgroundColor: col }}
                      >
                        {edges.find(e => e.id === selectedEdgeId)?.color === col && (
                          <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDeleteSelected}
                    className="w-full py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Purge Selected Arrow
                  </button>
                </div>
              </div>
            )}

            {/* If nothing is selected */}
            {!selectedNodeId && !selectedEdgeId && (
              <div className="text-center py-24 bg-slate-50/50 rounded-2xl border border-[#EAE6DF] border-dashed p-6 my-auto select-none">
                <Layout className="w-10 h-10 mx-auto text-slate-300 mb-3 animate-bounce" />
                <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">No Card Inspected</h4>
                <p className="text-[11px] text-slate-400 mt-2 max-w-[200px] mx-auto leading-relaxed">Click any card node or connecting line directly on the canvas to configure parameters live.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
