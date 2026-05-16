import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { GripVertical, Trash2, Image as ImageIcon, Upload, PenTool, X, Save, Sparkles, Maximize } from 'lucide-react';
import { MANGA_FRAMES } from '../mangaFrames';
import ClipperStudio from '../../components/clipper/ClipperStudio';

const MangaPanelComponent = ({ node, updateAttributes, deleteNode }: any) => {
  const { frameId, width: nodeWidth, height: nodeHeight, panelData } = node.attrs;
  
  const frameSchema = MANGA_FRAMES.find(f => f.id === frameId) || MANGA_FRAMES[0];
  const customLayout = node.attrs.customLayout;
  const layout = customLayout || (frameSchema ? frameSchema.layout : null);

  const containerRef = useRef<HTMLDivElement>(null);
  
  const [localWidth, setLocalWidth] = useState(nodeWidth || '100%');
  const [isResizing, setIsResizing] = useState(false);
  const widthRef = useRef(nodeWidth || '100%');
  const [localHeight, setLocalHeight] = useState(nodeHeight || 400);
  const heightRef = useRef(nodeHeight || 400);

  const [drawPanelId, setDrawPanelId] = useState<string | null>(null);

  useEffect(() => {
    setLocalWidth(node.attrs.width || '100%');
    widthRef.current = node.attrs.width || '100%';
  }, [node.attrs.width]);

  useEffect(() => {
    setLocalHeight(node.attrs.height || 400);
    heightRef.current = node.attrs.height || 400;
  }, [node.attrs.height]);

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
            newHeight = Math.max(150, Math.min(3000, newHeight));
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

  const handleImageUpload = (panelId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newData = { ...panelData, [panelId]: { ...(panelData[panelId] || {}), image: dataUrl } };
        updateAttributes({ panelData: newData });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEffectUpload = (panelId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newData = { ...panelData, [panelId]: { ...(panelData[panelId] || {}), effect: dataUrl } };
        updateAttributes({ panelData: newData });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (panelId: string) => {
    const newData = { ...panelData };
    if (newData[panelId]) {
      delete newData[panelId].image;
      delete newData[panelId].effect;
    }
    updateAttributes({ panelData: newData });
  };

  const getPanelDimensions = (pId: string) => {
     if (!containerRef.current) return { w: 1000, h: 1000 };
     let width = 800;
     let height = 1000;
     const el = containerRef.current.querySelector(`#panel-${pId}`) as HTMLElement;
     if (el && el.offsetWidth > 0 && el.offsetHeight > 0) {
        width = el.offsetWidth;
        height = el.offsetHeight;
     }

     const factor = Math.max(1, 1500 / Math.max(width, height));
     return { 
        w: Math.round(width * factor), 
        h: Math.round(height * factor) 
     };
  }

  return (
    <NodeViewWrapper 
       className={`manga-panel-wrapper relative transition-all duration-75 ${isResizing ? 'z-50' : 'z-10'}`} 
       style={{ margin: '1.5rem 0', display: 'flex', justifyContent: 'center' }}
       contentEditable={false}
    >
      <div 
        ref={containerRef}
        className="relative group/container"
        style={{ width: localWidth, pointerEvents: 'auto' }}
      >
        {/* Resize Handles */}
        <div 
           className="absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-16 flex items-center justify-center cursor-ew-resize z-40 touch-none group-hover/container:opacity-100 opacity-0 transition-opacity"
           onMouseDown={(e) => handleResizeStart(e, 'x')}
           onTouchStart={(e) => handleResizeStart(e, 'x')}
        >
           <div className="w-3 h-12 bg-white border border-gray-300 shadow-sm rounded-full flex items-center justify-center text-gray-400 hover:border-black hover:text-black">
               <GripVertical className="w-4 h-4" />
           </div>
        </div>

        <div 
           className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-8 flex items-center justify-center cursor-ns-resize z-40 touch-none group-hover/container:opacity-100 opacity-0 transition-opacity"
           onMouseDown={(e) => handleResizeStart(e, 'y')}
           onTouchStart={(e) => handleResizeStart(e, 'y')}
        >
           <div className="w-12 h-3 bg-white border border-gray-300 shadow-sm rounded-full hover:border-black"></div>
        </div>

        <div 
           className="absolute -bottom-4 -right-4 w-8 h-8 flex items-center justify-center cursor-nwse-resize z-40 touch-none group-hover/container:opacity-100 opacity-0 transition-opacity"
           onMouseDown={(e) => handleResizeStart(e, 'both')}
           onTouchStart={(e) => handleResizeStart(e, 'both')}
        >
           <div className="w-4 h-4 bg-white border border-gray-300 shadow-sm rounded-full hover:border-black hover:bg-gray-100"></div>
        </div>

        {/* Toolbar */}
        <div className="absolute -top-10 left-0 bg-white border border-gray-200 shadow-sm rounded-lg p-1 flex items-center gap-1 opacity-0 group-hover/container:opacity-100 transition-opacity z-50">
          <div data-drag-handle className="cursor-grab hover:bg-gray-100 p-1.5 rounded transition-colors text-gray-500" title="Move">
             <GripVertical className="w-4 h-4" />
          </div>
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          <span className="text-xs font-bold text-gray-600 px-2">{frameSchema.title}</span>
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateAttributes({ attached: !node.attrs.attached });
            }}
            className={`p-1.5 rounded transition-colors text-xs font-bold ${node.attrs.attached ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Attach / Expand Panels"
          >
             Attached
          </button>
          <div className="w-px h-4 bg-gray-200 mx-1"></div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              deleteNode();
            }}
            className="p-1.5 rounded text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete Frame"
          >
             <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* The Frame Canvas */}
        <div 
          className="w-full relative"
          style={{ 
             height: localHeight, 
             boxShadow: isResizing ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
             backgroundColor: 'transparent',
          }}
        >
           <div 
             className="w-full h-full"
             style={
               layout?.type === 'custom_absolute' 
               ? { position: 'relative' } 
               : {
                 display: 'grid',
                 gridTemplateColumns: layout?.gridTemplateColumns,
                 gridTemplateRows: layout?.gridTemplateRows,
                 gap: node.attrs.attached ? '0px' : (layout?.gap || '4px'),
                 padding: node.attrs.attached ? '0px' : '4px',
                 backgroundColor: '#222'
               }
             }
           >
             {(layout?.panels || []).map((panel: any) => {
               const pData = panelData[panel.id] || {};
               return (
                 <div 
                   key={panel.id}
                   id={`panel-${panel.id}`}
                   style={
                     layout?.type === 'custom_absolute'
                     ? {
                         position: 'absolute',
                         left: `${panel.x}%`,
                         top: `${panel.y}%`,
                         width: `${panel.w}%`,
                         height: `${panel.h}%`,
                         backgroundColor: '#f8f8f8',
                         overflow: 'hidden'
                       }
                     : {
                         gridArea: panel.gridArea,
                         clipPath: panel.clipPath,
                         position: 'relative',
                         backgroundColor: '#f8f8f8',
                         overflow: 'hidden'
                       }
                   }
                   className="group/panel w-full h-full cursor-pointer hover:opacity-90 transition-opacity flex" onDoubleClick={() => setDrawPanelId(panel.id)}
                 >
                   {pData.image ? (
                     <>
                        <img 
                           src={pData.image} 
                           alt="" 
                           className={`absolute inset-0 w-full h-full block scale-[1.02] origin-center ${(!pData.fitMode || pData.fitMode === 'cover') ? 'object-cover' : pData.fitMode === 'contain' ? 'object-contain' : 'object-fill'}`} 
                        />
                        {pData.effect && <img src={pData.effect} alt="" className="absolute inset-0 w-full h-full block scale-[1.02] origin-center object-cover pointer-events-none mix-blend-multiply opacity-80" />}
                        <div className="absolute inset-0 bg-transparent pointer-events-none opacity-0 group-hover/panel:pointer-events-auto group-hover/panel:opacity-100 flex flex-col items-center justify-center z-10 transition-opacity gap-2 p-4">
                           <div className="flex gap-2 w-full max-w-[200px]">
                               <button 
                                  onClick={() => setDrawPanelId(panel.id)}
                                  className="bg-white border flex-1 border-gray-300 shadow-sm rounded-lg px-2 py-1.5 flex flex-col items-center justify-center gap-1 hover:bg-gray-50 transition-colors text-xs font-medium text-gray-700"
                               >
                                  <PenTool className="w-4 h-4" /> Draw / Edit
                               </button>
                               <label className="cursor-pointer bg-white flex-1 border border-gray-300 shadow-sm rounded-lg px-2 py-1.5 flex flex-col items-center justify-center gap-1 hover:bg-gray-50 transition-colors text-xs font-medium text-gray-700">
                                  <Upload className="w-4 h-4" /> Import Image
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(panel.id, e)} />
                               </label>
                           </div>
                           <div className="flex gap-2 w-full max-w-[200px]">
                               <button 
                                  onClick={() => {
                                      const newFit = (!pData.fitMode || pData.fitMode === 'fill') ? 'contain' : (pData.fitMode === 'contain' ? 'cover' : 'fill');
                                      updateAttributes({ panelData: { ...panelData, [panel.id]: { ...(panelData[panel.id] || {}), fitMode: newFit } } });
                                  }}
                                  className="bg-white border flex-1 border-gray-300 shadow-sm rounded-lg px-2 py-1.5 flex flex-col items-center justify-center gap-1 hover:bg-gray-50 transition-colors text-xs font-medium text-gray-700"
                               >
                                  <Maximize className="w-4 h-4" /> {(!pData.fitMode || pData.fitMode === 'fill') ? 'Stretch Fill' : pData.fitMode === 'contain' ? 'Fit Inside' : 'Crop Cover'}
                               </button>
                               <button 
                                  onClick={() => removeImage(panel.id)}
                                  className="bg-red-50 text-red-600 flex-1 border border-red-200 shadow-sm rounded-lg px-2 py-1.5 flex flex-col items-center justify-center gap-1 hover:bg-red-100 transition-colors text-xs font-medium text-center"
                               >
                                  <Trash2 className="w-4 h-4" /> Clear Frame
                               </button>
                           </div>
                           <div className="flex gap-2 w-full max-w-[200px]">
                               <label className="cursor-pointer bg-white border flex-1 border-purple-200 shadow-sm rounded-lg px-2 py-1.5 flex flex-col items-center justify-center gap-1 hover:bg-purple-50 transition-colors text-xs font-medium text-purple-700">
                                  <Sparkles className="w-4 h-4" /> Import Overlay
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleEffectUpload(panel.id, e)} />
                               </label>
                           </div>
                        </div>
                     </>
                   ) : (
                     <div className="absolute inset-0 flex flex-col items-center justify-center transition-colors gap-2 z-10"
                          style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%239C92AC' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`
                          }}>
                        <div className="opacity-0 group-hover/panel:opacity-100 transition-opacity flex flex-col gap-2 items-center">
                           <div className="flex gap-2">
                              <label className="cursor-pointer bg-white border border-gray-300 shadow-sm rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                                 <Upload className="w-4 h-4" /> Upload
                                 <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(panel.id, e)} />
                              </label>
                              <button 
                                 onClick={() => setDrawPanelId(panel.id)}
                                 className="bg-white border border-gray-300 shadow-sm rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                              >
                                 <PenTool className="w-4 h-4" /> Draw / Clip
                              </button>
                           </div>
                           <button 
                              onClick={() => {
                                 const rnd = Math.floor(Math.random() * 1000);
                                 const newData = { ...panelData, [panel.id]: { ...(panelData[panel.id] || {}), image: `https://picsum.photos/seed/${rnd}/600/800` } };
                                 updateAttributes({ panelData: newData });
                              }}
                              className="bg-white border border-gray-300 shadow-sm rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                           >
                              <ImageIcon className="w-4 h-4 text-purple-600" /> Auto-Fill Random
                           </button>
                        </div>
                     </div>
                   )}
                 </div>
               );
             })}
           </div>
        </div>

        {/* Draw Overlay Portal within the Component space */}
        {drawPanelId && createPortal(
          <div className="fixed inset-0 z-[99999] bg-black">
             <ClipperStudio 
               id={undefined}
               targetWidth={getPanelDimensions(drawPanelId).w}
               targetHeight={getPanelDimensions(drawPanelId).h}
               clipPath={layout?.panels?.find((p: any) => p.id === drawPanelId)?.clipPath}
               initialImage={panelData[drawPanelId]?.image}
               onSaveToManga={(dataUrl) => {
                  const newData = { ...panelData, [drawPanelId]: { ...(panelData[drawPanelId] || {}), image: dataUrl } };
                  updateAttributes({ panelData: newData });
                  setDrawPanelId(null);
               }}
               onClose={() => setDrawPanelId(null)}
             />
          </div>,
          document.body
        )}

      </div>
    </NodeViewWrapper>
  );
};

export const MangaPanel = Node.create({
  name: 'mangaPanel',
  group: 'block',
  content: '',
  draggable: true,

  addAttributes() {
    return {
      frameId: { default: 'single-1' },
      customLayout: { default: null },
      attached: { default: false },
      width: { default: '100%' },
      height: { default: 400 },
      panelData: {  
        default: {},
        parseHTML: element => {
          const dataAttr = element.getAttribute('data-manga-panel');
          if (dataAttr) {
            try { return JSON.parse(dataAttr); } catch (e) { return {}; }
          }
          return {};
        },
        renderHTML: attributes => {
          if (!attributes.panelData) return {};
          return { 'data-manga-panel': JSON.stringify(attributes.panelData) };
        }
      }
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="manga-panel"]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'manga-panel' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MangaPanelComponent);
  },
});
