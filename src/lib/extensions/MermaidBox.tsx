import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useEffect } from 'react';
import mermaid from 'mermaid';
import { Network } from 'lucide-react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

const MermaidComponent = ({ node, updateAttributes }: any) => {
  const [code, setCode] = useState(node.attrs.code || 'graph LR\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Do Something]\n    B -->|No| D[Do Nothing]');
  const [isEditing, setIsEditing] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    let isCancelled = false;
    const renderDiagram = async () => {
      try {
        if (!code) {
          setSvgContent('');
          return;
        }
        const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
        const { svg } = await mermaid.render(id, code);
        if (!isCancelled) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setSvgContent(`<div class="text-red-500 font-mono text-[10px] p-4 bg-red-50 rounded">Syntax Error: ${err.message || 'Invalid syntax'}</div>`);
        }
      }
    };
    renderDiagram();
    return () => { isCancelled = true; };
  }, [code, isEditing]);

  return (
    <NodeViewWrapper className="mermaid-wrapper my-6 relative select-none" contentEditable={false}>
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm font-sans mx-auto w-full transition-all duration-200 hover:shadow-md">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex justify-between items-center z-10 relative">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-gray-700">Mermaid Diagram</span>
          </div>
          <button
            onClick={() => {
              setIsEditing(!isEditing);
              updateAttributes({ code });
            }}
            className="text-xs font-bold text-gray-500 hover:text-purple-600 transition-colors bg-white border border-gray-200 px-3 py-1 rounded shadow-sm"
          >
            {isEditing ? 'View Diagram' : 'Edit Script'}
          </button>
        </div>
        {isEditing ? (
          <div className="p-3 bg-white">
            <textarea
              className="w-full text-sm font-mono border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-purple-200 resize-y bg-gray-50 text-gray-800"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                updateAttributes({ code: e.target.value });
              }}
              placeholder={"sequenceDiagram\n    Alice->>John: Hello John, how are you?\n    John-->>Alice: Great!"}
              style={{ minHeight: '180px' }}
            />
          </div>
        ) : (
          <div 
            className="min-h-[150px] flex items-center justify-center p-6 overflow-auto bg-white flowchart-display"
            dangerouslySetInnerHTML={{ __html: svgContent || '<span class="text-xs text-gray-400 font-bold">Empty Diagram</span>' }}
          />
        )}
      </div>
    </NodeViewWrapper>
  );
};

export const MermaidBox = Node.create({
  name: 'mermaidBox',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      code: {
        default: 'graph LR\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Do Something]\n    B -->|No| D[Do Nothing]',
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="mermaid-box"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'mermaid-box' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidComponent);
  },
});
