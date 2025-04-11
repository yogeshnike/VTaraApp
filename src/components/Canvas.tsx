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
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
      >
        <Background />
        <Controls />
      </ReactFlow>
      {selectedNode && <NodeEditForm node={selectedNode} />}
    </div>
  );
}

export type { Node };
