import { useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Node,
  Edge,
  Connection,
  NodeMouseHandler,
  NodeTypes,
  NodeDragHandler,
  useReactFlow,
  Panel,
  EdgeTypes,
} from 'reactflow';
import { useStore, useGroupResizeListener } from '../store/useStore';
import { NodeEditForm } from './NodeEditForm';
import GroupNode from './nodes/GroupNode';
import ConfirmationDialog from './ConfirmationDialog';
import 'reactflow/dist/style.css';

// Define custom node types
const nodeTypes: NodeTypes = {
  group: GroupNode,
};

// Define default edge options for zigzag (step) lines
const defaultEdgeOptions = {
  type: 'step',
  style: { stroke: '#2563eb', strokeWidth: 2 },
  animated: false,
  markerEnd: {
    type: 'arrowclosed',
    width: 20,
    height: 20,
    color: '#2563eb',
  },
};

export function Canvas() {
  // Use the custom hook to listen for group resize events
  useGroupResizeListener();
  
  const {
    nodes,
    edges,
    selectedNode,
    showConfirmation,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    checkNodeIntersection,
    confirmNodeInclusion,
    cancelNodeInclusion,
    refreshNodeDraggableState,
  } = useStore();
  
  const reactFlowInstance = useReactFlow();

  // Force a re-render of the flow when nodes change
  useEffect(() => {
    if (nodes.length > 0) {
      // Small delay to ensure the DOM has updated
      const timer = setTimeout(() => {
        reactFlowInstance.fitView();
        // Refresh draggable state after ReactFlow updates
        refreshNodeDraggableState();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [nodes.length, reactFlowInstance, refreshNodeDraggableState]);

  // Replace single-click with double-click handler
  const onNodeDoubleClick: NodeMouseHandler = (_, node) => {
    if (node.type !== 'group') {
      setSelectedNode(node);
    }
  };

  // Keep single-click for selection but don't show edit form
  const onNodeClick: NodeMouseHandler = (_, node) => {
    // Only handle selection, don't show edit form
  };

  // Handle node drag to check for intersection with group nodes
  const onNodeDragStop: NodeDragHandler = (_, node) => {
    checkNodeIntersection(node.id, node.position);
    // Refresh draggable state after drag operations
    setTimeout(() => {
      refreshNodeDraggableState();
    }, 50);
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
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        elementsSelectable={true}
        selectNodesOnDrag={true}
        zoomOnScroll={false}
        panOnScroll={true}
        nodesDraggable={true}
        nodesConnectable={true}
        snapToGrid={true}
        snapGrid={[15, 15]}
        // Add these properties to improve nested node handling
        proOptions={{ 
          hideAttribution: true,
          account: 'paid-pro' // This enables all pro features
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        // Ensure proper event handling
        onPaneClick={() => setSelectedNode(null)}
      >
        <Background />
        <Controls />
        
        <Panel position="top-right">
          {selectedNode && selectedNode.type !== 'group' && (
            <div className="bg-white p-4 rounded shadow-md border max-w-md w-full">
              <NodeEditForm node={selectedNode} />
            </div>
          )}
        </Panel>
      </ReactFlow>
      
      {showConfirmation && (
        <ConfirmationDialog
          message="Do you want to include this node in the group?"
          onConfirm={confirmNodeInclusion}
          onCancel={cancelNodeInclusion}
        />
      )}
    </div>
  );
}

export type { Node };
