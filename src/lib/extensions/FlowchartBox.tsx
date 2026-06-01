import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Edit3, Plus, Trash2, GripVertical, Check, ArrowRight, Activity, Layout } from 'lucide-react';

interface CustomFlowNode {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  bg: string;
  color: string;
  shape: 'oval' | 'rectangle' | 'diamond';
}

interface CustomFlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

const initialNodes: CustomFlowNode[] = [
  { id: '1', label: 'Start Business Process', x: 20, y: 30, width: 140, height: 60, bg: '#e0e7ff', color: '#3730a3', shape: 'oval' },
  { id: '2', label: 'Analyze Reports', x: 200, y: 30, width: 140, height: 60, bg: '#f1f5f9', color: '#334155', shape: 'rectangle' },
  { id: '3', label: 'Deploy & Complete', x: 380, y: 30, width: 150, height: 60, bg: '#d1fae5', color: '#065f46', shape: 'rectangle' }
];

const initialEdges: CustomFlowEdge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' }
];

const FlowchartBoxComponent = ({ node, updateAttributes, deleteNode }: any) => {
  const [nodes, setNodes] = useState<CustomFlowNode[]>(node.attrs.nodes || initialNodes);
  const [edges, setEdges] = useState<CustomFlowEdge[]>(node.attrs.edges || initialEdges);
  const [isEditing, setIsEditing] = useState(false);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [linkSourceId, setLinkSourceId] = useState<string | null>(null);

  const [localWidth, setLocalWidth] = useState(node.attrs.width || '100%');
  const [isResizing, setIsResizing] = useState(false);
  const widthRef = useRef(node.attrs.width || '100%');
  const [localHeight, setLocalHeight] = useState(node.attrs.height || 260);
  const heightRef = useRef(node.attrs.height || 260);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dragNodeIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Node Dragging Logic inside Rich Text Editor block
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (!isEditing) return;
    const target = e.target as HTMLElement;
    if (target.closest('.no-drag-area')) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedNodeId(nodeId);
    
    if (linkSourceId) {
      if (linkSourceId !== nodeId) {
        const edgeId = `e-${Date.now()}`;
        const newEdges = [...edges, { id: edgeId, source: linkSourceId, target: nodeId }];
        setEdges(newEdges);
        updateAttributes({ edges: newEdges });
      }
      setLinkSourceId(null);
      return;
    }

    dragNodeIdRef.current = nodeId;
    const nodeObj = nodes.find(n => n.id === nodeId);
    if (nodeObj && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      dragOffsetRef.current = {
        x: e.clientX - rect.left - nodeObj.x,
        y: e.clientY - rect.top - nodeObj.y
      };
    }

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!dragNodeIdRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = moveEvent.clientX - rect.left - dragOffsetRef.current.x;
      const currentY = moveEvent.clientY - rect.top - dragOffsetRef.current.y;
      
      const boundX = Math.max(10, Math.min(rect.width - 180, currentX));
      const boundY = Math.max(10, Math.min(localHeight - 80, currentY));

      const updatedNodes = nodes.map(n => n.id === dragNodeIdRef.current ? { ...n, x: Math.round(boundX), y: Math.round(boundY) } : n);
      setNodes(updatedNodes as any);
    };

    const onMouseUp = () => {
      dragNodeIdRef.current = null;
      window.removeEventListener('mousemove', onMouseMove, true);
      window.removeEventListener('mouseup', onMouseUp, true);
      updateAttributes({ nodes });
    };

    window.addEventListener('mousemove', onMouseMove, true);
    window.addEventListener('mouseup', onMouseUp, true);
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
            newWidthPercent = Math.max(20, Math.min(130, newWidthPercent));
            const finalW = `${Math.round(newWidthPercent)}%`;
            setLocalWidth(finalW);
            widthRef.current = finalW;
        }

        if (direction === 'y' || direction === 'both') {
            let newHeight = startHeight + deltaY;
            newHeight = Math.max(150, Math.min(800, newHeight));
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

  const addNode = () => {
    const newNode: CustomFlowNode = {
      id: `nod-${Date.now()}`,
      label: `Process Step`,
      x: 50 + Math.random() * 100,
      y: 50 + Math.random() * 50,
      width: 140,
      height: 60,
      bg: '#f1f5f9',
      color: '#334155',
      shape: 'rectangle'
    };
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    updateAttributes({ nodes: newNodes });
    setSelectedNodeId(newNode.id);
  };

  const deleteSelectedNode = () => {
    if (!selectedNodeId) return;
    const newNodes = nodes.filter(n => n.id !== selectedNodeId);
    const newEdges = edges.filter(e => e.source !== selectedNodeId && e.target !== selectedNodeId);
    setNodes(newNodes);
    setEdges(newEdges);
    updateAttributes({ nodes: newNodes, edges: newEdges });
    setSelectedNodeId(null);
  };

  const updateSelectedNodeField = (fields: Partial<CustomFlowNode>) => {
    if (!selectedNodeId) return;
    const newNodes = nodes.map(n => n.id === selectedNodeId ? { ...n, ...fields } : n);
    setNodes(newNodes);
    updateAttributes({ nodes: newNodes });
  };

  const activeNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <NodeViewWrapper className="flowchart-wrapper relative my-6" style={{ display: 'flex', justifyContent: 'center' }} contentEditable={false}>
      <div 
        ref={containerRef}
        className="relative border border-gray-200 rounded-2xl shadow-sm bg-[#FAF9F6] p-1 flex flex-col overflow-hidden"
        style={{ width: localWidth, transition: isResizing ? 'none' : 'width 0.1s' }}
      >
        {/* East Handle resize */}
        <div 
           className="absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-16 flex items-center justify-center cursor-ew-resize z-40 group touch-none select-none"
           onMouseDown={(e) => handleResizeStart(e, 'x')}
           title="Drag Width"
        >
           <div className={`w-2.5 h-10 bg-white border shadow-sm rounded-full flex items-center justify-center ${isResizing ? 'border-indigo-600' : 'border-gray-200'}`}>
               <GripVertical className="w-3.5 h-3.5 text-gray-400" />
           </div>
        </div>

        {/* Dynamic header tool belt */}
        <div className="flex justify-between items-center bg-white px-4 py-2 bg-white/70 backdrop-blur border-b border-gray-100 z-30">
          <div className="flex items-center gap-1.5 font-sans">
            <Layout className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-gray-700">Embedded Flowchart Box</span>
          </div>

          <div className="flex gap-2">
            {!isEditing ? (
               <button onClick={() => setIsEditing(true)} className="p-1.5 px-3.5 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all">
                 <Edit3 className="w-3.5 h-3.5" /> Edit Flowchart
               </button>
            ) : (
               <button onClick={() => { setIsEditing(false); setSelectedNodeId(null); }} className="p-1.5 px-3.5 bg-indigo-600 rounded-lg shadow-sm border border-indigo-700 text-white hover:bg-indigo-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all">
                 <Check className="w-3.5 h-3.5" /> Save Diagram
               </button>
            )}
            <button onClick={deleteNode} className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-300 cursor-pointer transition-all">
               <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Edit sub panel belt */}
        {isEditing && (
          <div className="bg-slate-50 px-4 py-2 border-b border-gray-100 flex gap-2 flex-wrap items-center z-30">
            <button onClick={addNode} className="p-1 px-3 bg-white border border-gray-200 text-[11px] font-bold text-slate-800 hover:bg-slate-100 rounded-lg shadow-sm flex items-center gap-1">
              <Plus className="w-3 h-3 text-emerald-600" /> Add Step Card
            </button>
            
            {activeNode && (
               <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                 <input 
                   type="text" 
                   value={activeNode.label} 
                   onChange={e => updateSelectedNodeField({ label: e.target.value })} 
                   className="p-1 px-2 border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-indigo-300 bg-white" 
                   placeholder="Edit title..."
                 />
                 
                 <select 
                   value={activeNode.bg} 
                   onChange={e => {
                     const bg = e.target.value;
                     const color = bg === '#e0e7ff' ? '#3730a3' : bg === '#d1fae5' ? '#065f46' : '#334155';
                     updateSelectedNodeField({ bg, color });
                   }}
                   className="p-1 border border-gray-200 rounded-md text-xs bg-white"
                 >
                   <option value="#f1f5f9">Gray (Process)</option>
                   <option value="#e0e7ff">Indigo (Start)</option>
                   <option value="#d1fae5">Emerald (End)</option>
                 </select>
                 
                 {/* Shape */}
                 <select 
                   value={activeNode.shape} 
                   onChange={e => updateSelectedNodeField({ shape: e.target.value as any })}
                   className="p-1 border border-gray-200 rounded-md text-xs bg-white"
                 >
                   <option value="rectangle">Box</option>
                   <option value="oval">Terminal Oval</option>
                   <option value="diamond">Decision</option>
                 </select>

                 {/* Custom Width Slider ("adjust expand") for embedded view */}
                 <div className="flex items-center gap-1.5 ml-2">
                   <span className="text-[10px] text-gray-500 font-bold">Size:</span>
                   <input 
                     type="range" 
                     min={100} 
                     max={220} 
                     value={activeNode.width} 
                     onChange={e => updateSelectedNodeField({ width: parseInt(e.target.value) })}
                     className="w-16 accent-indigo-600"
                   />
                 </div>

                 <button onClick={deleteSelectedNode} className="p-1 hover:bg-red-50 text-red-500 rounded border border-transparent hover:border-red-200">
                   <Trash2 className="w-3.5 h-3.5" />
                 </button>
               </div>
            )}
          </div>
        )}

        {/* Visual Drawing Stage Canvas wrapper */}
        <div 
          style={{ height: localHeight, width: '100%' }} 
          className="relative rounded-b-2xl overflow-hidden cursor-default select-none bg-white"
          onClick={() => { setSelectedNodeId(null); setLinkSourceId(null); }}
        >
          {/* Connector SVGs */}
          <svg className="absolute inset-0 pointer-events-none w-full h-full z-10 overflow-visible">
            <defs>
              <marker id="arrow-embed" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#818cf8" />
              </marker>
            </defs>
            {edges.map(edge => {
              const src = nodes.find(n => n.id === edge.source);
              const dst = nodes.find(n => n.id === edge.target);
              if (!src || !dst) return null;

              // Center coordinates
              let sx = src.x + src.width / 2;
              let sy = src.y + src.height / 2;
              let ex = dst.x + dst.width / 2;
              let ey = dst.y + dst.height / 2;

              // Boundary adjustment
              const dx = dst.x - src.x;
              const dy = dst.y - src.y;
              if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) {
                  sx = src.x + src.width;
                  ex = dst.x;
                } else {
                  sx = src.x;
                  ex = dst.x + dst.width;
                }
              } else {
                if (dy > 0) {
                  sy = src.y + src.height;
                  ey = dst.y;
                } else {
                  sy = src.y;
                  ey = dst.y + dst.height;
                }
              }

              const pathD = `M ${sx} ${sy} C ${(sx + ex) / 2} ${sy}, ${(sx + ex) / 2} ${ey}, ${ex} ${ey}`;

              return (
                <path 
                  key={edge.id}
                  d={pathD} 
                  stroke="#818cf8" 
                  strokeWidth="2" 
                  fill="none" 
                  markerEnd="url(#arrow-embed)"
                  className="transition-all"
                />
              );
            })}
          </svg>

          {/* Prompt Mode bar */}
          {linkSourceId && (
            <div className="absolute top-2 left-2 z-30 bg-indigo-600 text-white font-bold p-1 px-2 rounded text-[10px] animate-pulse">
              Click another step card to connect link arrow...
            </div>
          )}

          {/* Node Cards on the Canvas Stage */}
          {nodes.map(node => {
            const isSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                className={`absolute p-2.5 rounded-xl border flex flex-col justify-between font-sans shadow-xs transition-shadow ${isSelected ? 'ring-3 ring-indigo-500/20 border-indigo-400 z-30' : 'border-gray-200 hover:border-gray-300 z-20'}`}
                style={{
                  left: node.x,
                  top: node.y,
                  width: node.width,
                  height: node.height,
                  backgroundColor: node.bg,
                  borderRadius: node.shape === 'oval' ? '12px' : '8px',
                }}
              >
                <div className="flex-1 flex items-center justify-center text-center pointer-events-none text-[10px] font-bold tracking-tight text-gray-700" style={{ color: node.color }}>
                  {node.label}
                </div>

                {isEditing && (
                  <div className="no-drag-area mt-1.5 flex justify-between items-center z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setLinkSourceId(node.id); }}
                      className="text-[8px] font-bold p-0.5 bg-white hover:bg-slate-50 border border-slate-200 text-indigo-600 rounded"
                    >
                      Connect
                    </button>
                    <span className="text-[7px] font-mono tracking-wider text-slate-400 font-bold uppercase">{node.shape}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const FlowchartBox = Node.create({
  name: 'flowchartBox',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      nodes: { default: null },
      edges: { default: null },
      width: { default: '100%' },
      height: { default: 260 },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="flowchart-box"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'flowchart-box' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FlowchartBoxComponent);
  },
});
