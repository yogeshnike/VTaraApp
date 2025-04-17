import { create } from 'zustand';
import { Node, Edge, Connection, applyNodeChanges, applyEdgeChanges, addEdge, XYPosition } from 'reactflow';
import { useEffect } from 'react';

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
  updateGroupDimensions: (groupId: string, width: number, height: number) => void;
  refreshNodeDraggableState: () => void;
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
      edges: addEdge({
        ...connection,
        type: 'step',
        style: { stroke: '#2563eb', strokeWidth: 2 },
        markerEnd: {
          type: 'arrowclosed',
          width: 20,
          height: 20,
          color: '#2563eb',
        },
      }, get().edges),
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
      draggable: true, // Explicitly set draggable
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
      // Add draggable property explicitly
      draggable: true,
      // Add selectable property explicitly
      selectable: true
    };
    set((state) => ({
      // Only add the node to the nodes array, NOT to the menuNodes array
      nodes: [...state.nodes, newGroupNode],
      // menuNodes remains unchanged
    }));
  },
  updateNode: (nodeId, { name, description, properties }) => {
    set((state) => {
      const node = state.nodes.find((node) => node.id === nodeId);
      const oldName = node?.data.label;
      const isGroup = node?.type === 'group';
      
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
      
      // Only update menuNodes if this is not a group node
      let updatedMenuNodes = state.menuNodes;
      if (!isGroup && oldName) {
        // Check if the old name was in menuNodes
        const oldNameIndex = state.menuNodes.indexOf(oldName);
        if (oldNameIndex !== -1) {
          // Replace the old name with the new name
          updatedMenuNodes = [...state.menuNodes];
          updatedMenuNodes[oldNameIndex] = name;
        }
      }
      
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
              extent: undefined,
              position: {
                x: node.position.x + nodeToDelete.position.x,
                y: node.position.y + nodeToDelete.position.y
              }
            };
          }
          return node;
        });
        
        const filteredNodes = updatedNodes.filter((node) => node.id !== nodeId);
        
        // Don't remove from menuNodes if it's a group node
        return {
          nodes: filteredNodes,
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
            
            // Only remove from menuNodes if it's not a group node
            const updatedMenuNodes = nodeToDelete.type !== 'group' 
              ? state.menuNodes.filter((name) => name !== nodeToDelete?.data.label)
              : state.menuNodes;
            
            return {
              nodes: nodesWithUpdatedParent,
              menuNodes: updatedMenuNodes,
              selectedNode: null,
            };
          }
        }
        
        // Regular deletion
        // Only remove from menuNodes if it's not a group node
        const updatedMenuNodes = nodeToDelete?.type !== 'group'
          ? state.menuNodes.filter((name) => name !== nodeToDelete?.data.label)
          : state.menuNodes;
        
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
      // Get the node and group
      const node = state.nodes.find(n => n.id === nodeId);
      const groupNode = state.nodes.find(n => n.id === groupId);
      
      if (!node || !groupNode) return state;
      
      // If the node is a group and we're trying to create a cycle, prevent it
      if (node.type === 'group') {
        // Check if the target group is a descendant of this group
        let currentNode = groupNode;
        while (currentNode.parentNode) {
          if (currentNode.parentNode === nodeId) {
            // Would create a cycle, abort
            return state;
          }
          const parentNode = state.nodes.find(n => n.id === currentNode.parentNode);
          if (!parentNode) break;
          currentNode = parentNode;
        }
      }
      
      // Calculate position relative to the group
      const relativePosition = {
        x: node.position.x - groupNode.position.x,
        y: node.position.y - groupNode.position.y
      };
      
      // Update the node to be a child of the group
      const updatedNodes = state.nodes.map(n => {
        if (n.id === nodeId) {
          return {
            ...n,
            position: relativePosition,
            parentNode: groupId,
            extent: 'parent',
            // Ensure draggable is true for all nodes, especially groups
            draggable: true,
            // Ensure selectable is true
            selectable: true,
            // For group nodes, ensure they have z-index to be above parent
            ...(n.type === 'group' ? { 
              zIndex: 10,
              style: {
                ...n.style,
                pointerEvents: 'all'
              }
            } : {})
          };
        }
        return n;
      });
      
      // Update the group to include this node in its childNodes array
      const finalNodes = updatedNodes.map(n => {
        if (n.id === groupId) {
          const childNodes = n.data.childNodes || [];
          if (!childNodes.includes(nodeId)) {
            return {
              ...n,
              data: {
                ...n.data,
                childNodes: [...childNodes, nodeId]
              },
              style: {
                ...n.style,
                pointerEvents: 'all'
              }
            };
          }
        }
        return n;
      });
      
      return { nodes: finalNodes };
    });
    
    // After moving a node to a group, refresh the draggable state
    setTimeout(() => {
      get().refreshNodeDraggableState();
    }, 50);
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
  },
  updateGroupDimensions: (groupId, width, height) => {
    set(state => {
      // Update the group node dimensions
      const updatedNodes = state.nodes.map(node => {
        if (node.id === groupId) {
          return {
            ...node,
            style: {
              ...node.style,
              width,
              height
            }
          };
        }
        return node;
      });
      
      // After updating group dimensions, we need to ensure all child nodes are still draggable
      // This is especially important for the first node-group relationship
      const groupNode = updatedNodes.find(node => node.id === groupId);
      if (groupNode && groupNode.data.childNodes && groupNode.data.childNodes.length > 0) {
        return {
          nodes: updatedNodes.map(node => {
            if (groupNode.data.childNodes.includes(node.id)) {
              // Ensure child nodes are explicitly marked as draggable
              return {
                ...node,
                draggable: true,
                // Refresh the parent-child relationship
                parentNode: groupId,
                extent: 'parent'
              };
            }
            return node;
          })
        };
      }
      
      return { nodes: updatedNodes };
    });
    
    // After updating dimensions, refresh all nodes' draggable state
    setTimeout(() => {
      get().refreshNodeDraggableState();
    }, 50);
  },
  
  // New function to refresh draggable state for all nodes
  refreshNodeDraggableState: () => {
    set(state => {
      // Create a new array with all nodes having their draggable property refreshed
      const refreshedNodes = state.nodes.map(node => {
        // For nodes that are children of groups, ensure they have the correct properties
        if (node.parentNode) {
          return {
            ...node,
            draggable: true,
            extent: 'parent',
            // For group nodes that are children of other groups
            ...(node.type === 'group' ? {
              zIndex: 10,
              style: {
                ...node.style,
                pointerEvents: 'all'
              }
            } : {})
          };
        }
        // For top-level nodes, just ensure draggable is true
        return {
          ...node,
          draggable: true
        };
      });
      
      return { nodes: refreshedNodes };
    });
  }
}));

// Custom hook to listen for group resize events
export function useGroupResizeListener() {
  const updateGroupDimensions = useStore(state => state.updateGroupDimensions);
  const refreshNodeDraggableState = useStore(state => state.refreshNodeDraggableState);
  
  useEffect(() => {
    const handleGroupResize = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        const { id, width, height } = customEvent.detail;
        updateGroupDimensions(id, width, height);
        
        // Add an additional refresh after a delay to ensure ReactFlow has updated
        setTimeout(() => {
          refreshNodeDraggableState();
        }, 100);
      }
    };
    
    document.addEventListener('group-resized', handleGroupResize);
    
    return () => {
      document.removeEventListener('group-resized', handleGroupResize);
    };
  }, [updateGroupDimensions, refreshNodeDraggableState]);
}
