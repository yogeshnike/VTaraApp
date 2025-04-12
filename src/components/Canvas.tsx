import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  Connection,
  NodeMouseHandler,
} from 'reactflow';
import { useStore } from '../store/useStore';
import { NodeEditForm } from './NodeEditForm';
import 'reactflow/dist/style.css';

export function Canvas() {
  const {
    nodes,
    edges,
    selectedNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
  } = useStore();

  const onNodeClick: NodeMouseHandler = (_, node) => {
    setSelectedNode(node);
  };

  return (
    <div className="h-full w-full relative" style={{ height: 'calc(100vh - var(--top-nav-height) - var(--ribbon-height) - var(--footer-height))' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      {selectedNode && (
        <div className="absolute top-2 right-2 bg-white p-4 rounded shadow-md border max-w-md w-full md:w-1/3 z-10">
          <NodeEditForm node={selectedNode} />
        </div>
      )}
    </div>
  );
}

export type { Node };
