import { create } from 'zustand';
import { Node, Edge, Connection, applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  menuNodes: string[];
  selectedNode: Node | null;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: { name: string; description: string; properties: string[] }) => void;
  updateNode: (nodeId: string, data: { name: string; description: string; properties: string[] }) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (node: Node | null) => void;
}

export const useStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  menuNodes: [],
  selectedNode: null,
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  addNode: ({ name, description, properties }) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 500, y: Math.random() * 300 },
      data: {
        label: name,
        description,
        properties,
      },
    };
    set((state) => ({
      nodes: [...state.nodes, newNode],
      menuNodes: [...state.menuNodes, name],
    }));
  },
  updateNode: (nodeId, { name, description, properties }) => {
    set((state) => {
      const updatedNodes = state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: name, description, properties } }
          : node
      );
      const oldName = state.nodes.find((node) => node.id === nodeId)?.data.label;
      const updatedMenuNodes = state.menuNodes.map((menuNode) =>
        menuNode === oldName ? name : menuNode
      );
      return {
        nodes: updatedNodes,
        menuNodes: updatedMenuNodes,
        selectedNode: null,
      };
    });
  },
  deleteNode: (nodeId) => {
    set((state) => {
      const nodeToDelete = state.nodes.find((node) => node.id === nodeId);
      const updatedNodes = state.nodes.filter((node) => node.id !== nodeId);
      const updatedMenuNodes = state.menuNodes.filter(
        (name) => name !== nodeToDelete?.data.label
      );
      return {
        nodes: updatedNodes,
        menuNodes: updatedMenuNodes,
        selectedNode: null,
      };
    });
  },
  setSelectedNode: (node) => {
    set({ selectedNode: node });
  },
}));
