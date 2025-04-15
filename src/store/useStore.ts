import { create } from 'zustand';
import { Node, Edge, Connection, applyNodeChanges, applyEdgeChanges, addEdge, XYPosition } from 'reactflow';

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  menuNodes: string[];
  selectedNode: Node | null;
  showConfirmation: boolean;
  nodeToGroup: { nodeId: string; groupId: string } | null;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: { name: string; description: string; properties: string[] }) => void;
  addGroupNode: () => void;
  updateNode: (nodeId: string, data: { name: string; description: string; properties: string[] }) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (node: Node | null) => void;
  checkNodeIntersection: (nodeId: string, position: XYPosition) => void;
  confirmNodeInclusion: () => void;
  cancelNodeInclusion: () => void;
  isNodeInGroup: (nodeId: string) => string | null;
  moveNodeToGroup: (nodeId: string, groupId: string) => void;
  removeNodeFromGroup: (nodeId: string) => void;
}

export const useStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  menuNodes: [],
  selectedNode: null,
  showConfirmation: false,
  nodeToGroup: null,
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
  addGroupNode: () => {
    const newGroupNode: Node = {
      id: `group-${Date.now()}`,
      type: 'group',
      position: { x: Math.random() * 400 + 50, y: Math.random() * 200 + 50 },
      style: { width: 300, height: 200 },
      data: {
        label: 'New Group',
        childNodes: [],
      },
    };
    set((state) => ({
      nodes: [...state.nodes, newGroupNode],
      menuNodes: [...state.menuNodes, 'New Group'],
    }));
  },
  updateNode: (nodeId, { name, description, properties }) => {
    set((state) => {
      const updatedNodes = state.nodes.map((node) =>
        node.id === nodeId
          ? { 
              ...node, 
              data: { 
                ...node.data, 
                label: name, 
                description, 
                properties 
              } 
            }
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
      // First check if this is a group node and has child nodes
      const nodeToDelete = state.nodes.find((node) => node.id === nodeId);
      
      if (nodeToDelete?.type === 'group' && nodeToDelete.data.childNodes?.length > 0) {
        // Update all child nodes to remove them from this group
        const updatedNodes = state.nodes.map(node => {
          if (nodeToDelete.data.childNodes?.includes(node.id)) {
            return {
              ...node,
              parentNode: undefined,
              extent: undefined
            };
          }
          return node;
        });
        
        const filteredNodes = updatedNodes.filter((node) => node.id !== nodeId);
        const updatedMenuNodes = state.menuNodes.filter(
          (name) => name !== nodeToDelete?.data.label
        );
        
        return {
          nodes: filteredNodes,
          menuNodes: updatedMenuNodes,
          selectedNode: null,
        };
      } else {
        // Regular node or empty group
        const filteredNodes = state.nodes.filter((node) => node.id !== nodeId);
        
        // If this node belongs to a group, update the group's childNodes array
        if (nodeToDelete?.parentNode) {
          const parentGroup = state.nodes.find(node => node.id === nodeToDelete.parentNode);
          if (parentGroup) {
            const updatedParentGroup = {
              ...parentGroup,
              data: {
                ...parentGroup.data,
                childNodes: parentGroup.data.childNodes.filter(id => id !== nodeId)
              }
            };
            
            // Replace the parent group with the updated one
            const nodesWithUpdatedParent = filteredNodes.map(node => 
              node.id === parentGroup.id ? updatedParentGroup : node
            );
            
            const updatedMenuNodes = state.menuNodes.filter(
              (name) => name !== nodeToDelete?.data.label
            );
            
            return {
              nodes: nodesWithUpdatedParent,
              menuNodes: updatedMenuNodes,
              selectedNode: null,
            };
          }
        }
        
        // Regular deletion
        const updatedMenuNodes = state.menuNodes.filter(
          (name) => name !== nodeToDelete?.data.label
        );
        
        return {
          nodes: filteredNodes,
          menuNodes: updatedMenuNodes,
          selectedNode: null,
        };
      }
    });
  },
  setSelectedNode: (node) => {
    set({ selectedNode: node });
  },
  checkNodeIntersection: (nodeId, position) => {
    const { nodes } = get();
    const movingNode = nodes.find(node => node.id === nodeId);
    
    // Skip if the node is already in a group
    if (movingNode?.parentNode) return;
    
    // Find all group nodes
    const groupNodes = nodes.filter(node => node.type === 'group');
    
    for (const groupNode of groupNodes) {
      // Skip if trying to add to itself (shouldn't happen, but just in case)
      if (groupNode.id === nodeId) continue;
      
      // Check if the node's position is within the group's boundaries
      const groupWidth = groupNode.style?.width || 300;
      const groupHeight = groupNode.style?.height || 200;
      
      if (
        position.x > groupNode.position.x &&
        position.x < groupNode.position.x + groupWidth &&
        position.y > groupNode.position.y &&
        position.y < groupNode.position.y + groupHeight
      ) {
        // Node is inside a group, show confirmation
        set({
          showConfirmation: true,
          nodeToGroup: { nodeId, groupId: groupNode.id }
        });
        return;
      }
    }
    
    // If we get here, the node is not inside any group
    // If the node was previously in a group but now isn't, remove it from the group
    if (movingNode?.parentNode) {
      get().removeNodeFromGroup(nodeId);
    }
  },
  confirmNodeInclusion: () => {
    const { nodeToGroup } = get();
    if (nodeToGroup) {
      get().moveNodeToGroup(nodeToGroup.nodeId, nodeToGroup.groupId);
    }
    set({
      showConfirmation: false,
      nodeToGroup: null
    });
  },
  cancelNodeInclusion: () => {
    set({
      showConfirmation: false,
      nodeToGroup: null
    });
  },
  isNodeInGroup: (nodeId) => {
    const node = get().nodes.find(n => n.id === nodeId);
    return node?.parentNode || null;
  },
  moveNodeToGroup: (nodeId, groupId) => {
    set(state => {
      // Update the node to be a child of the group
      const updatedNodes = state.nodes.map(node => {
        if (node.id === nodeId) {
          // Get the group node to calculate relative position
          const groupNode = state.nodes.find(n => n.id === groupId);
          if (!groupNode) return node;
          
          // Calculate position relative to the group
          const relativePosition = {
            x: node.position.x - groupNode.position.x,
            y: node.position.y - groupNode.position.y
          };
          
          return {
            ...node,
            position: relativePosition,
            parentNode: groupId,
            extent: 'parent'
          };
        }
        return node;
      });
      
      // Update the group to include this node in its childNodes array
      const finalNodes = updatedNodes.map(node => {
        if (node.id === groupId) {
          const childNodes = node.data.childNodes || [];
          if (!childNodes.includes(nodeId)) {
            return {
              ...node,
              data: {
                ...node.data,
                childNodes: [...childNodes, nodeId]
              }
            };
          }
        }
        return node;
      });
      
      return { nodes: finalNodes };
    });
  },
  removeNodeFromGroup: (nodeId) => {
    set(state => {
      const node = state.nodes.find(n => n.id === nodeId);
      if (!node || !node.parentNode) return state;
      
      const groupId = node.parentNode;
      
      // Get the group node
      const groupNode = state.nodes.find(n => n.id === groupId);
      if (!groupNode) return state;
      
      // Calculate absolute position
      const absolutePosition = {
        x: node.position.x + groupNode.position.x,
        y: node.position.y + groupNode.position.y
      };
      
      // Update the node to remove it from the group
      const updatedNodes = state.nodes.map(n => {
        if (n.id === nodeId) {
          return {
            ...n,
            position: absolutePosition,
            parentNode: undefined,
            extent: undefined
          };
        }
        return n;
      });
      
      // Update the group to remove this node from its childNodes array
      const finalNodes = updatedNodes.map(n => {
        if (n.id === groupId) {
          return {
            ...n,
            data: {
              ...n.data,
              childNodes: (n.data.childNodes || []).filter(id => id !== nodeId)
            }
          };
        }
        return n;
      });
      
      return { nodes: finalNodes };
    });
  }
}));
