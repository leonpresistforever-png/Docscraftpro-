import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { Rnd } from 'react-rnd';
import { LayoutDashboard, Move, Trash2 } from 'lucide-react';

// For interactive resizing and positioning of images/SVGs
const EnhancedImageComponent = ({ node, updateAttributes, selected, deleteNode, editor, getPos }: any) => {
  const isFreestyle = node.attrs.isFreestyle;

  const content = (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%', height: '100%' }}>
      {node.attrs.href ? (
        <a href={node.attrs.href} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%', textDecoration: 'none' }}>
           <img 
            src={node.attrs.src} 
            alt={node.attrs.alt} 
            draggable={false}
            style={{
              width: node.attrs.width || '100%',
              height: node.attrs.height || 'auto',
              opacity: node.attrs.opacity,
              transform: `rotate(${node.attrs.rotate || 0}deg)`,
              display: 'block',
              maxWidth: '100%',
              objectFit: 'contain',
              transition: 'opacity 0.2s',
              pointerEvents: 'auto'
            }}
            className={selected ? 'ring-2 ring-dc-gold ring-offset-2' : ''}
          />
        </a>
      ) : (
        <img 
          src={node.attrs.src} 
          alt={node.attrs.alt} 
          draggable={false}
          style={{
            width: isFreestyle ? '100%' : (node.attrs.width || '100%'),
            height: isFreestyle ? '100%' : 'auto',
            opacity: node.attrs.opacity,
            transform: `rotate(${node.attrs.rotate || 0}deg)`,
            display: 'block',
            maxWidth: '100%',
            objectFit: 'fill',
            transition: 'opacity 0.2s',
            pointerEvents: 'auto'
          }}
          className={!isFreestyle ? `rounded-md ${selected ? 'ring-2 ring-dc-gold ring-offset-2' : 'shadow-sm'}` : selected ? 'outline-2 outline-dashed outline-dc-gold' : ''}
        />
      )}
      
      {/* Docscraftpro Stylish Watermark */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 opacity-40 mix-blend-overlay pointer-events-none select-none">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-800 drop-shadow-sm">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4" />
          <line x1="8" y1="16" x2="8" y2="16" strokeWidth="3" strokeLinecap="round" />
          <line x1="16" y1="16" x2="16" y2="16" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="text-[11px] font-bold tracking-tight text-gray-800 drop-shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Docscraftpro</span>
      </div>
      
      {selected && (
        <div 
           className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white border border-gray-200 shadow-xl rounded-lg p-2 flex gap-2 z-[60] whitespace-nowrap items-center touch-none"
           onMouseDown={e => e.stopPropagation()}
           onMouseUp={e => e.stopPropagation()}
           onClick={e => e.stopPropagation()}
           onPointerDown={e => e.stopPropagation()}
           onTouchStart={e => e.stopPropagation()}
           onKeyDown={e => e.stopPropagation()}
           contentEditable={false}
        >
           {!isFreestyle && (
             <div className="flex flex-col items-center justify-center cursor-grab text-gray-400 hover:text-gray-800 px-1 py-1 bg-gray-50 rounded" data-drag-handle title="Drag to move inline">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
             </div>
           )}
           
           <button 
             onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateAttributes({ isFreestyle: !node.attrs.isFreestyle }); }} 
             className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition-colors ${node.attrs.isFreestyle ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
             title="Toggle Freestyle Moving"
           >
             <Move className="w-3 h-3" />
             {node.attrs.isFreestyle ? 'Freestyle: ON' : 'Freestyle: OFF'}
           </button>
           
           <div className="w-px h-6 bg-gray-200 mx-1"></div>

           <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase">Size</label>
              <input 
                type="range" min="50" max="2000" step="10" 
                value={parseInt(node.attrs.width) || 200}
                onChange={(e) => updateAttributes({ width: `${e.target.value}px`, height: 'auto' })}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-20 accent-dc-gold"
              />
           </div>
           
           <div className="w-px h-6 bg-gray-200 mx-1"></div>

           <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase">Opacity</label>
              <input 
                type="range" min="0" max="100" step="1" 
                value={Math.round(node.attrs.opacity * 100) || 100}
                onChange={(e) => updateAttributes({ opacity: parseInt(e.target.value) / 100 })}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-20 accent-dc-gold"
              />
           </div>
           
           <div className="w-px h-6 bg-gray-200 mx-1"></div>

           <div className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 font-bold uppercase">Rotate</label>
              <input 
                type="range" min="0" max="360" step="1" 
                value={node.attrs.rotate || 0}
                onChange={(e) => updateAttributes({ rotate: parseInt(e.target.value) })}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-20 accent-dc-gold"
              />
           </div>
           
           {!isFreestyle && (
             <>
               <div className="w-px h-6 bg-gray-200 mx-1"></div>
               <div className="flex gap-1 items-center mt-3">
                 <button onClick={() => updateAttributes({ align: 'left' })} className="px-1 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded">Left</button>
                 <button onClick={() => updateAttributes({ align: 'center' })} className="px-1 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded">Center</button>
                 <button onClick={() => updateAttributes({ align: 'right' })} className="px-1 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded">Right</button>
               </div>
             </>
           )}
           <div className="w-px h-6 bg-gray-200 mx-1"></div>
           <button 
             onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('open-watermark', { detail: node.attrs.src })); }}
             onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('open-watermark', { detail: node.attrs.src })); }}
             className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition-colors bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
           >
             <LayoutDashboard className="w-3 h-3" />
             Studio
           </button>
           <div className="w-px h-6 bg-gray-200 mx-1"></div>
           <button 
             onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation();
                if(typeof getPos === 'function') {
                    editor.chain().deleteRange({ from: getPos(), to: getPos() + 1 }).run();
                } else {
                    deleteNode();
                }
             }}
             onPointerDown={(e) => {
                e.preventDefault(); 
                e.stopPropagation();
                if(typeof getPos === 'function') {
                    editor.chain().deleteRange({ from: getPos(), to: getPos() + 1 }).run();
                } else {
                    deleteNode();
                }
             }}
             className="flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition-colors bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer"
             title="Delete Image"
           >
             <Trash2 className="w-3 h-3 pointer-events-none" />
           </button>
        </div>
      )}
    </div>
  );

  if (isFreestyle) {
    return (
      <NodeViewWrapper 
        style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'visible', zIndex: selected ? 50 : 10 }}
        className="enhanced-image-wrapper freestyle-wrapper"
      >
        <Rnd
          size={{ width: node.attrs.width || 200, height: node.attrs.height || 'auto' }}
          position={{ x: node.attrs.x, y: node.attrs.y }}
          onDragStop={(e, d) => updateAttributes({ x: d.x, y: d.y })}
          onResizeStop={(e, direction, ref, delta, position) => {
            updateAttributes({ width: ref.style.width, height: ref.style.height, x: position.x, y: position.y });
          }}
          bounds="window"
          className={selected ? 'cursor-move' : ''}
          enableResizing={{ bottom: true, bottomRight: true, right: true, left: true, bottomLeft: true, top: true, topRight: true, topLeft: true }}
          disableDragging={!selected} /* Only drag when selected in editor to avoid unintentional grabs */
        >
          {content}
        </Rnd>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper 
      style={{ 
        display: 'inline-flex', 
        justifyContent: node.attrs.align || 'center',
        width: node.attrs.align === 'center' ? '100%' : 'auto',
        float: node.attrs.align === 'left' ? 'left' : node.attrs.align === 'right' ? 'right' : 'none',
        margin: '0.5rem',
        position: 'relative'
      }}
      className={`enhanced-image-wrapper ${selected ? 'ring-2 ring-dc-gold ring-offset-2 rounded-lg' : ''}`}
    >
      {content}
    </NodeViewWrapper>
  );
};


export const EnhancedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      href: { default: null },
      width: { default: '200px' },
      height: { default: 'auto' },
      opacity: { default: 1 },
      rotate: { default: 0 },
      align: { default: 'center' },
      isFreestyle: { default: false },
      x: { default: 50 },
      y: { default: 50 }
    };
  },
  
  draggable: true,

  addNodeView() {
    return ReactNodeViewRenderer(EnhancedImageComponent);
  }
});
