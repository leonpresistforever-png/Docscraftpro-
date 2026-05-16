import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  Panel,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Sidebar } from '../components/layout/Sidebar';
import { Network, Plus } from 'lucide-react';

function EditableNode({ id, data, isConnectable }: any) {
  const { updateNodeData } = useReactFlow();
  const [isEditing, setIsEditing] = useState(data.isNew || false);
  const [text, setText] = useState(data.label as string);

  useEffect(() => {
    setText(data.label as string);
  }, [data.label]);

  useEffect(() => {
    if (data.isNew) {
      updateNodeData(id, { isNew: undefined });
    }
  }, [data.isNew, id, updateNodeData]);

  const onBlur = () => {
    setIsEditing(false);
    updateNodeData(id, { label: text });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      onBlur();
    }
  };

  return (
    <>
      <Handle 
        type="target" 
        position={Position.Top} 
        isConnectable={isConnectable !== false}
        style={{ width: '12px', height: '12px', backgroundColor: '#818cf8', border: '2px solid white', cursor: 'crosshair' }} 
      />
      <div 
        className="w-full h-full flex items-center justify-center cursor-pointer"
        onDoubleClick={() => setIsEditing(true)}
      >
        {isEditing ? (
          <input
            autoFocus
            className="nodrag nopan nowheel w-full bg-transparent outline-none text-center"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            style={{ fontWeight: data.fontWeight || 'normal' }}
          />
        ) : (
          <div style={{ fontWeight: data.fontWeight || 'normal' }} className="px-1 text-center select-none w-full h-full flex items-center justify-center">
            {data.label}
          </div>
        )}
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        isConnectable={isConnectable !== false}
        style={{ width: '12px', height: '12px', backgroundColor: '#818cf8', border: '2px solid white', cursor: 'crosshair' }} 
      />
    </>
  );
}

const nodeTypes = {
  editable: EditableNode
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'editable',
    data: { label: 'Main Architecture', fontWeight: 'bold' },
    position: { x: 250, y: 50 },
    style: { background: '#FAF9F6', border: '1px solid #EAE6DF', borderRadius: '8px', padding: '16px', minWidth: '150px' }
  },
  {
    id: '2',
    type: 'editable',
    data: { label: 'Database' },
    position: { x: 100, y: 150 },
    style: { background: '#E0F2FE', border: '1px solid #BAE6FD', borderRadius: '8px', padding: '16px', minWidth: '150px' }
  },
  {
    id: '3',
    type: 'editable',
    data: { label: 'Client UI' },
    position: { x: 400, y: 150 },
    style: { background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', padding: '16px', minWidth: '150px' }
  },
];

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    animated: true,
    style: { stroke: '#818cf8', strokeWidth: 2 }
  },
  { 
    id: 'e1-3', 
    source: '1', 
    target: '3', 
    animated: true,
    style: { stroke: '#818cf8', strokeWidth: 2 }
  },
];

function LogicMapperContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
      ...params, 
      animated: true,
      style: { stroke: '#818cf8', strokeWidth: 2 } 
    } as any, eds)),
    [setEdges]
  );

  const handleAddNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'editable',
      position: { x: 250, y: 250 },
      data: { label: 'New Node', isNew: true },
      style: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', minWidth: '150px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  return (
    <div className="flex h-screen w-full bg-[#FAF9F6] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-6 py-4 border-b border-[#EAE6DF] bg-white shadow-sm shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <Network size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">Logic Mapper</h1>
              <p className="text-sm text-gray-500">Interactive 2D Architecture Canvas</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-hidden">
          <div className="h-full w-full bg-white rounded-xl shadow-sm border border-[#EAE6DF] overflow-hidden relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={{ 
                type: 'default',
                markerEnd: { type: MarkerType.ArrowClosed, color: '#818cf8' }
              }}
              fitView
              attributionPosition="bottom-right"
            >
              <Background gap={16} size={1} color="#e5e7eb" />
              <Controls className="bg-white border border-[#EAE6DF] shadow-sm rounded-lg" />
              <MiniMap 
                nodeStrokeColor="#EAE6DF"
                nodeColor={(n) => {
                  if (n.id === '1') return '#FAF9F6';
                  if (n.id === '2') return '#E0F2FE';
                  if (n.id === '3') return '#FEF3C7';
                  return '#fff';
                }}
                nodeBorderRadius={8}
                className="border border-[#EAE6DF] rounded-lg shadow-sm"
              />
              <Panel position="top-left" className="bg-white/80 backdrop-blur-md p-2 rounded-lg border border-[#EAE6DF] shadow-sm">
                <button 
                  onClick={handleAddNode}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  Add Node
                </button>
              </Panel>
            </ReactFlow>
          </div>
        </main>
      </div>
    </div>
  );
}

export function LogicMapper() {
  return (
    <ReactFlowProvider>
      <LogicMapperContent />
    </ReactFlowProvider>
  );
}
