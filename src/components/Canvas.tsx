import { useEffect, useState,  useCallback } from 'react';
import { Save, Undo2, Redo2 } from 'lucide-react';
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
import { ReactFlowProvider } from 'reactflow';
import CustomEdge from './CustomEdge';
import DefaultNode from './nodes/DefaultNode';

import { Edge as ReactFlowEdge } from 'reactflow';

import { edgeApi,canvasApi } from '../services/api';
import { formatStrideProperties } from '../constants/stride';



// Define custom node types
const nodeTypes: NodeTypes = {
  group: GroupNode,
  default: DefaultNode, // Add the default node type
};

// Add to your existing edge types
const edgeTypes = {
  custom: CustomEdge,
  smoothstep: CustomEdge,
};

// Add these new types inside Canvas.tsx
type EdgePopupState = {
  edge: ReactFlowEdge | null;
  position: { x: number; y: number } | null;
};

// Define default edge options for zigzag (step) lines


export function Canvas() {

  // Add these new states
  const [edgePopup, setEdgePopup] = useState<EdgePopupState>({ edge: null, position: null });
  const [editingEdgeLabel, setEditingEdgeLabel] = useState<string>('');


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
    updateEdgeLabel
  } = useStore();
  
  const reactFlowInstance = useReactFlow();


  // Modify history state to include menuNodes
  const [history, setHistory] = useState<Array<{
    nodes: Node[];
    edges: Edge[];
    menuNodes: string[];
  }>>([{
    nodes: [],
    edges: [],
    menuNodes: []
  }]);

    const [currentStep, setCurrentStep] = useState(0);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);




    // Update history when nodes, edges, or menuNodes change
    useEffect(() => {
      const { menuNodes } = useStore.getState(); // Get current menuNodes from store
      const newState = {
        nodes: [...nodes],
        edges: [...edges],
        menuNodes: [...menuNodes]
      };
      
      setHistory(prev => {
        // Only add to history if the state is different from the last entry
        const lastState = prev[currentStep];
        if (JSON.stringify(lastState) !== JSON.stringify(newState)) {
          // Remove any future states if we're not at the end
          const newHistory = prev.slice(0, currentStep + 1);
          return [...newHistory, newState];
        }
        return prev;
      });
  
      // Update currentStep if we added a new state
      setHistory(prev => {
        if (JSON.stringify(prev[currentStep]) !== JSON.stringify(newState)) {
          setCurrentStep(prev.length - 1);
        }
        return prev;
      });
    }, [nodes, edges, currentStep]);

  // Update undo/redo availability
  useEffect(() => {
    setCanUndo(currentStep > 0);
    setCanRedo(currentStep < history.length - 1);
  }, [currentStep, history.length]);


 // Replace the existing onEdgeClick with this new version
 const onEdgeClick = (event: React.MouseEvent, edge: ReactFlowEdge) => {
  // Prevent event from bubbling up to prevent unwanted behavior
  event.preventDefault();
  event.stopPropagation();

  // Set the popup position to the click position
  setEdgePopup({
    edge,
    position: { x: event.clientX, y: event.clientY }
  });
  setEditingEdgeLabel(edge.label || '');
};

// Add these new handlers
const handleEdgeDelete = async (edge: ReactFlowEdge) => {
  if (window.confirm('Are you sure you want to delete this connection?')) {
    onEdgesChange([{ id: edge.id, type: 'remove' }]);
    const projectId = window.location.pathname.split('/project/')[1];
    if (projectId) {
      try {
        await edgeApi.deleteEdge(projectId, edge.id);
      } catch (error) {
        console.error('Failed to delete edge:', error);
        alert('Failed to delete edge. Please try again.');
      }
    }
  }
  setEdgePopup({ edge: null, position: null });
};

const handleEdgeLabelUpdate = async (edge: ReactFlowEdge, newLabel: string) => {
  const projectId = window.location.pathname.split('/project/')[1];
  if (!projectId) return;

  try {
    //await edgeApi.updateEdge(projectId, edge.id, { edge_label: newLabel });
    
    updateEdgeLabel(edge.id, newLabel);

  } catch (error) {
    console.error('Failed to update edge label:', error);
    alert('Failed to update edge label. Please try again.');
  }
  setEdgePopup({ edge: null, position: null });
};

// Add this handler to close the popup when clicking outside
const handlePaneClick = () => {
  setEdgePopup({ edge: null, position: null });
  setSelectedNode(null);
};

  const handleUndo = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      const prevState = history[prevStep];
      
      // Update the store with the previous state including menuNodes
      useStore.setState({
        nodes: prevState.nodes.map(node => ({
          ...node,
          // Preserve all node data including STRIDE properties
          data: {
            ...node.data,
            label: node.data.label,
            description: node.data.description,
            properties: node.data.properties
          }
        })),
        edges: prevState.edges,
        menuNodes: prevState.menuNodes // Update menuNodes in store
      });
      
      setCurrentStep(prevStep);
    }
  }, [currentStep, history]);

  const handleRedo = useCallback(() => {
    if (currentStep < history.length - 1) {
      const nextStep = currentStep + 1;
      const nextState = history[nextStep];
      
      // Update the store with the next state including menuNodes
      useStore.setState({
        nodes: nextState.nodes.map(node => ({
          ...node,
          // Preserve all node data including STRIDE properties
          data: {
            ...node.data,
            label: node.data.label,
            description: node.data.description,
            properties: node.data.properties
          }
        })),
        edges: nextState.edges,
        menuNodes: nextState.menuNodes // Update menuNodes in store
      });
      
      setCurrentStep(nextStep);
    }
  }, [currentStep, history]);


  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        if (event.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        event.preventDefault();
      } else if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
        handleRedo();
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleUndo, handleRedo]);

  // Update undo/redo availability
  useEffect(() => {
    setCanUndo(currentStep > 0);
    setCanRedo(currentStep < history.length - 1);
  }, [currentStep, history.length]);

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

  const [isSaving, setIsSaving] = useState(false);

   //Save Projects
   const handleSave = async () => {
    setIsSaving(true);
    try {
      const projectId = window.location.pathname.split('/project/')[1];
  
      // --- Normal Nodes ---
      const normalNodes = nodes
        .filter(node => node.type !== 'group')
        .map(node => {
          // Always ensure stride_properties is in JSONB format
          let strideProps = node.data.stride_properties;
          if (!strideProps && Array.isArray(node.data?.properties)) {
            strideProps = formatStrideProperties(node.data.properties);
          }
          // If neither exists, create an empty JSONB
          if (!strideProps) {
            strideProps = formatStrideProperties([]);
          }
          return {
            node_name: node.data.label,
            node_description: node.data.description,
            x_pos: node.position.x,
            y_pos: node.position.y,
            stride_properties: strideProps,
            group_id: node.parentNode || null,
            id: node.id,
            style: node.style
          };
        });
  
      // --- Group Nodes ---
      const groupNodes = nodes
        .filter(node => node.type === 'group')
        .map(node => {
          // Always ensure stride_properties is in JSONB format for groups too
          let strideProps = node.data.stride_properties;
          if (!strideProps && Array.isArray(node.data?.properties)) {
            strideProps = formatStrideProperties(node.data.properties);
          }
          if (!strideProps) {
            strideProps = formatStrideProperties([]);
          }
          const width = node.style?.width ?? 300;
          const height = node.style?.height ?? 200;
          return {
            group_name: node.data.label,
            x_pos: node.position.x,
            y_pos: node.position.y,
            parent_group_id: node.parentNode || null,
            id: node.id,
            width,
            height,
            //stride_properties: strideProps,
            style: node.style
          };
        });
  
      // --- Edges ---
      const formattedEdges = edges.map(edge => ({
        source_node_id: edge.source,
        target_node_id: edge.target,
        edge_label: edge.data?.label || '',
        id: edge.id,
        style:edge.style
      }));
  
      const canvasData = {
        nodes: normalNodes,
        groups: groupNodes,
        edges: formattedEdges,
        timestamp: new Date().toISOString(),
      };
      console.log(canvasData)
      await canvasApi.addCanvas(projectId, canvasData);
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ReactFlowProvider>
    <div className="h-full w-full relative" style={{ height: 'calc(100vh - var(--top-nav-height) - var(--ribbon-height) - var(--footer-height))' }}>
       {/* Action Bar */}
      {/* Action Bar */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        {/* Undo Button */}
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`
            flex items-center justify-center w-10 h-10 rounded-md
            shadow-md border
            ${!canUndo
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-blue-600 hover:bg-blue-50 border-blue-200'}
          `}
        >
          <Undo2 size={20} />
        </button>
        {/* Redo Button */}
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
          className={`
            flex items-center justify-center w-10 h-10 rounded-md
            shadow-md border
            ${!canRedo
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-blue-600 hover:bg-blue-50 border-blue-200'}
          `}
        >
          <Redo2 size={20} />
        </button>

        {/* Existing Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md
            shadow-md border
            ${isSaving 
              ? 'bg-gray-100 text-gray-500' 
              : 'bg-white text-blue-600 hover:bg-blue-50 border-blue-200'}
          `}
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Project'}
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#2563eb', strokeWidth: 2 },
          markerEnd: {
            type: 'arrowclosed',
            width: 20,
            height: 20,
            color: '#2563eb',
          },
        }}

        
        // Allow connections in any direction
        connectOnClick={false}
        connectionMode="loose"
  // Enable connections in all directions
  connectionRadius={50}
   defaultMarkerColor="#2563eb"
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        onEdgeClick={onEdgeClick}
        onPaneClick={handlePaneClick}
       // defaultEdgeOptions={defaultEdgeOptions}
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

        {/* Add the edge popup */}
        {edgePopup.edge && edgePopup.position && (
            <div
              className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200"
              style={{
                left: edgePopup.position.x,
                top: edgePopup.position.y,
                transform: 'translate(-50%, -100%)',
                marginTop: '-10px'
              }}
            >
              <div className="p-2 space-y-2">
                <div className="flex flex-col space-y-2">
                  <input
                    type="text"
                    value={editingEdgeLabel}
                    onChange={(e) => setEditingEdgeLabel(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                    placeholder="Edge label"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdgeLabelUpdate(edgePopup.edge!, editingEdgeLabel)}
                      className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleEdgeDelete(edgePopup.edge!)}
                      className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setEdgePopup({ edge: null, position: null })}
                      className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    </div>
                </div>
              </div>
            </div>
          )}
      </ReactFlow>
      
      {showConfirmation && (
        <ConfirmationDialog
          message="Do you want to include this node in the group?"
          onConfirm={confirmNodeInclusion}
          onCancel={cancelNodeInclusion}
        />
      )}
    </div>
    </ReactFlowProvider>
  );
}

export type { Node };
