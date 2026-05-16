import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useCallback, useRef } from 'react';
import { ReactFlow, addEdge, Background, Controls, MiniMap, applyNodeChanges, applyEdgeChanges, Node as FlowNode, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Edit3, Plus, Trash2, Maximize } from 'lucide-react';

const initialNodes: FlowNode[] = [
  { id: '1', position: { x: 50, y: 50 }, data: { label: 'Start' } },
  { id: '2', position: { x: 250, y: 50 }, data: { label: 'Step 1' } }
];

const initialEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];

const FlowchartBoxComponent = ({ node, updateAttributes, deleteNode }: any) => {
  const [nodes, setNodes] = useState<FlowNode[]>(node.attrs.nodes || initialNodes);
  const [edges, setEdges] = useState<Edge[]>(node.attrs.edges || initialEdges);
  const [isEditing, setIsEditing] = useState(false);

  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => {
      const newNds = applyNodeChanges(changes, nds);
      updateAttributes({ nodes: newNds });
      return newNds as FlowNode[];
    });
  }, [updateAttributes]);

  const onEdgesChange = useCallback((changes: any) => {
    setEdges((eds) => {
      const newEds = applyEdgeChanges(changes, eds);
      updateAttributes({ edges: newEds });
      return newEds as Edge[];
    });
  }, [updateAttributes]);

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => {
      const newEds = addEdge(params, eds);
      updateAttributes({ edges: newEds });
      return newEds;
    });
  }, [updateAttributes]);

  const addNode = () => {
    const newNode: FlowNode = {
      id: Date.now().toString(),
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      data: { label: `New Node` }
    };
    const newNds = [...nodes, newNode];
    setNodes(newNds);
    updateAttributes({ nodes: newNds });
  };

  return (
    <NodeViewWrapper className="flowchart-wrapper relative my-4 border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white" contentEditable={false}>
      <div className="absolute top-2 right-2 flex gap-2 z-10" contentEditable={false}>
          {!isEditing ? (
             <button onClick={() => setIsEditing(true)} className="p-1.5 bg-white rounded-md shadow-sm border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300">
               <Edit3 className="w-4 h-4" />
             </button>
          ) : (
             <button onClick={() => setIsEditing(false)} className="p-1.5 bg-blue-600 rounded-md shadow-sm border border-blue-700 text-white hover:bg-blue-700 font-bold px-3 text-xs flex items-center">
               Save Flowchart
             </button>
          )}
          <button onClick={deleteNode} className="p-1.5 bg-white rounded-md shadow-sm border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-300">
             <Trash2 className="w-4 h-4" />
          </button>
      </div>

      {isEditing && (
         <div className="absolute top-2 left-2 flex gap-2 z-10" contentEditable={false}>
            <button onClick={addNode} className="p-1 bg-white rounded-lg border border-gray-200 shadow-sm text-gray-700 text-xs font-bold flex items-center gap-1 hover:bg-gray-50 pr-2">
               <span className="p-1 bg-green-100 text-green-700 rounded"><Plus className="w-3 h-3"/></span> Add Node
            </button>
         </div>
      )}

      <div style={{ height: isEditing ? 500 : 350, width: '100%', touchAction: 'none' }} className="node-drag-prevent touch-none">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={isEditing ? onNodesChange : undefined}
          onEdgesChange={isEditing ? onEdgesChange : undefined}
          onConnect={isEditing ? onConnect : undefined}
          fitView
          panOnDrag={isEditing}
          zoomOnScroll={isEditing}
          elementsSelectable={isEditing}
          nodesDraggable={isEditing}
          nodesConnectable={isEditing}
        >
          <Background color="#ccc" gap={16} />
          {isEditing && <Controls />}
          {isEditing && <MiniMap nodeColor="#e2e8f0" maskColor="rgba(240, 240, 240, 0.4)" />}
        </ReactFlow>
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
