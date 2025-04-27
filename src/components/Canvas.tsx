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

// Define custom node types
const nodeTypes: NodeTypes = {
  group: GroupNode,
};

// Add to your existing edge types
const edgeTypes = {
  custom: CustomEdge,
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const projectData = {
        nodes,
        edges,
        timestamp: new Date().toISOString(),
      };

      // Save to backend (you'll need to implement this API call)
      // await projectApi.saveProject(projectData);

      // Show success notification
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
          type: 'custom',
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
        //defaultEdgeOptions={defaultEdgeOptions}
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
    </ReactFlowProvider>
  );
}

export type { Node };
