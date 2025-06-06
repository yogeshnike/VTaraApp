import { create } from 'zustand';
import { Node, Edge, Connection, applyNodeChanges, applyEdgeChanges, addEdge, XYPosition } from 'reactflow';
import { useEffect } from 'react';
import { groupApi, nodeApi, edgeApi } from '../services/api';
import { useParams } from 'react-router-dom';
import { STRIDE_MAPPING } from '../utils/strideUtils'; // Add this import

import CustomEdge from '../components/CustomEdge';

// Add to your existing edge types
const edgeTypes = {
  custom: CustomEdge,
};

interface MenuItem {
  id: string;
  label: string;
  type: 'node' | 'group';
  children?: MenuItem[];
}


interface FlowState {
  nodes: Node[];
  edges: Edge[];
  menuNodes: MenuItem[];
  selectedNode: Node | null;
  showConfirmation: boolean;
  nodeToGroup: { nodeId: string; groupId: string } | null;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  updateEdgeLabel: (edgeId: string, label: string) => Promise<void>;
  onConnect: (connection: Connection) => void;
  threatScenarios: ThreatScenario[];
  setThreatScenarios: (scenarios: ThreatScenario[]) => void;
  //addNode: (node: { name: string; description: string; properties: string[] }) => void;
  addNode: (node: {
    id: string;
    name: string;
    description: string;
    properties: string[];
    position: { x: number; y: number };
    group_id: string | null;
  }) => void;
  getNodeGroupName: (nodeId: string) => string;
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
  threatScenarios: [],
  setThreatScenarios: (scenarios) => set({ threatScenarios: scenarios }),
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  getNodeGroupName: (nodeId: string) => {
    const node = get().nodes.find(n => n.id === nodeId);
    if (!node?.parentNode) return 'N/A';
    
    const groupNode = get().nodes.find(n => n.id === node.parentNode);
    return groupNode?.data.label || 'N/A';
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: async (connection: Connection) => {
    const projectId = window.location.pathname.split('/project/')[1];
    if (!projectId) return;

    // The source and target should be exactly as the user drew them
    const newEdge = {
      ...connection,
      id: `edge-${Date.now()}`,
      type: 'smoothstep',  // Change this from 'custom' to 'smoothstep'
      data: { label: 'Click to add label' },
      style: { stroke: '#2563eb', strokeWidth: 2 },
      markerEnd: {
        type: 'arrowclosed',
        width: 20,
        height: 20,
        color: '#2563eb',
      },
    };

    try {
      // Create edge in backend first with the original source and target
      const edgeResponse = await edgeApi.createEdge(projectId, {
        source_node_id: connection.source,
        target_node_id: connection.target,
        edge_label: '',
        source_handle: connection.sourceHandle, // Add this
        target_handle: connection.targetHandle, // Add this
        style: { stroke: '#2563eb', strokeWidth: 2 } // or whatever style you use
      });

      // Update UI with the edge from backend
      set({
        edges: addEdge({
          ...newEdge,
          id: edgeResponse.id,
          sourceHandle: edgeResponse.source_handle, // Add this
          targetHandle: edgeResponse.target_handle, // Add this
        }, get().edges),
      });
    } catch (error) {
      console.error('Failed to create edge:', error);
      alert('Failed to create connection. Please try again.');
    }
  },
  updateEdgeLabel: async (edgeId: string, label: string) => {
    const projectId = window.location.pathname.split('/project/')[1];
    if (!projectId) return;

    try {
      // Update in backend first
      await edgeApi.updateEdge(projectId, edgeId, { edge_label: label });

      // Then update UI
      set((state) => ({
        edges: state.edges.map((edge) =>
          edge.id === edgeId
            ? { ...edge, data: { ...edge.data, label } }
            : edge
        ),
      }));
    } catch (error) {
      console.error('Failed to update edge label:', error);
      alert('Failed to update connection label. Please try again.');
    }
  },
  // Update the addNode implementation
  addNode: ({ id, name, description, properties, stride_properties, position, group_id }) => {
    const newNode: Node = {
      id,
      type: 'default',
      position: {
        x: position.x,
        y: position.y
      },
      data: {
        label: name,
        description,
        properties,
        stride_properties, // Add this line to include the JSONB format
      },
      draggable: true,
      parentNode: group_id
    };
    set((state) => {
      const menuItem: MenuItem = {
        id,
        label: name,
        type: 'node'
      };

      let updatedMenuNodes = [...state.menuNodes];
      
      if (group_id) {
        // If node has a group, add it as a child of the group menu item
        updatedMenuNodes = state.menuNodes.map(item => {
          if (item.id === group_id) {
            return {
              ...item,
              children: [...(item.children || []), menuItem]
            };
          }
          return item;
        });
      } else {
        // If no group, add at root level
        updatedMenuNodes.push(menuItem);
      }

      return {
        nodes: [...state.nodes, newNode],
        menuNodes: updatedMenuNodes,
      };
    });
  },
  addGroupNode: async () => {
    const projectId = window.location.pathname.split('/project/')[1];
    const { nodes } = get();

    if (!projectId) {
      console.error('Project ID not found');
      return;
    }

    try {
      // Check if there's a selected group that will be the parent
      const selectedParentGroup = nodes.find(
        node => node.selected && node.type === 'group'
      );

      // Set default or random position and size
      const x_pos = selectedParentGroup ? Math.random() * 100 + 50 : Math.random() * 400 + 50;
      const y_pos = selectedParentGroup ? Math.random() * 100 + 50 : Math.random() * 200 + 50;
      const width = 300;
      const height = 200;

      // First create the group in backend to get the ID
      const groupResponse = await groupApi.createGroup(projectId, {
        group_name: 'Untitled Group',
        project_id: projectId,
        parent_group_id: selectedParentGroup?.id || null,
        x_pos,
        y_pos,
        width,
        height,
      });

      // Use the ID from backend response to create the node in UI
      const newGroupNode: Node = {
        id: groupResponse.id, // Use backend-generated ID
        type: 'group',
        position: { x: x_pos, y: y_pos },
        style: { width, height },
        data: {
          label: groupResponse.group_name,
          childNodes: [],
        },
        draggable: true,
        selectable: true,
        ...(selectedParentGroup && {
          parentNode: selectedParentGroup.id,
          extent: 'parent',
          position: {
            x: x_pos,
            y: y_pos
          }
        })
      };
      // Add group to menu items
      set((state) => ({
        nodes: [...state.nodes, newGroupNode],
        menuNodes: [...state.menuNodes, {
          id: groupResponse.id,
          label: groupResponse.group_name,
          type: 'group',
          children: []
        }]
      }));

    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Failed to create group. Please try again.');
    }
  },
  updateNode: async (nodeId, { name, description, properties,stride_properties }) => {
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
              properties,
              stride_properties: stride_properties || node.data.stride_properties // Preserve or update STRIDE properties
            }
          }
          : node
      );

     // Generate new threat scenarios immediately after node update
     const newThreatScenarios: ThreatScenario[] = [];
     let snoCounter = 1;

     updatedNodes.forEach(node => {
      if (node.type === 'default' && node.data.stride_properties) {
        Object.entries(node.data.stride_properties).forEach(([strideName, strideData]) => {
          if (strideData.selected) {
            const strideInfo = STRIDE_MAPPING[strideName];
            
            if (strideInfo) {
              const scenario: ThreatScenario = {
                id: `${node.id}-${strideName}-${snoCounter}`,
                sno: snoCounter++,
                name: strideInfo.defaultScenario(node.data.label),
                type: strideName.charAt(0),
                component: get().getNodeGroupName(node.id),
                asset: node.data.label,
                damageScenario: 'N/A',
                impact: 'Medium',
                feasibility: 'Medium',
                currentRisk: 'N/A',
                initialRisk: 'N/A',
                cybersecurityGoals: strideInfo.defaultGoals,
                attackTrees: strideInfo.defaultAttackTrees,
                attackPath: strideInfo.defaultAttackPath,
                nodeId: node.id
              };
              newThreatScenarios.push(scenario);
            }
          }
        });
      }
    });


      // Update menu structure
    const updatedMenuNodes = state.menuNodes.map(menuItem => {
      // If this is the node/group being updated
      if (menuItem.id === nodeId) {
        return {
          ...menuItem,
          label: name,
          children: menuItem.children // Preserve children if any
        };
      }
      // If this is a group, check its children
      if (menuItem.type === 'group' && menuItem.children) {
        return {
          ...menuItem,
          children: menuItem.children.map(child => 
            child.id === nodeId 
              ? { ...child, label: name }
              : child
          )
        };
      }
      return menuItem;
    });

      return {
        nodes: updatedNodes,
        menuNodes: updatedMenuNodes,
        selectedNode: null,
        threatScenarios: newThreatScenarios 
      };
    });
    // After updating nodes, trigger a recalculation of threat scenarios in the ThreatScenariosTable component
    // This way we keep the STRIDE_MAPPING logic in one place
    const updatedNodes = get().nodes;
    // You can dispatch a custom event to notify that nodes were updated
    window.dispatchEvent(new CustomEvent('nodesUpdated'));
  },
  /*deleteNode: (nodeId) => {
    set((state) => {
      // First check if this is a group node and has child nodes
      const nodeToDelete = state.nodes.find((node) => node.id === nodeId);

      // Find all edges connected to this node
      const edgesToDelete = state.edges.filter(
        (edge) => edge.source === nodeId || edge.target === nodeId
      );

      // Delete edges from backend
      const projectId = window.location.pathname.split('/project/')[1];
      if (projectId) {
        edgesToDelete.forEach((edge) => {
          edgeApi.deleteEdge(projectId, edge.id).catch((error) => {
            console.error('Failed to delete edge:', error);
          });
        });
      }

      // Filter out the edges connected to the deleted node
      const remainingEdges = state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      );

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
          edges: remainingEdges,  // Add this line
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
              edges: remainingEdges,  // Add this line
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
          edges: remainingEdges,  // Add this line
          menuNodes: updatedMenuNodes,
          selectedNode: null,
        };
      }
    });
  },*/
  deleteNode: async (nodeId) => {
    const projectId = window.location.pathname.split('/project/')[1];
    if (!projectId) return;

    try {
      // Get current state
      const state = get();
      const nodeToDelete = state.nodes.find((node) => node.id === nodeId);
      
      if (!nodeToDelete) return;

      // Find all edges connected to this node
      const edgesToDelete = state.edges.filter(
        (edge) => edge.source === nodeId || edge.target === nodeId
      );

      if (nodeToDelete.type === 'group') {
        // Get all child nodes of the group
        const childNodes = state.nodes.filter(node => node.parentNode === nodeId);
        
        // First, update all child nodes in the backend to remove their group association
        await Promise.all(childNodes.map(node => 
          nodeApi.updateNodeGroup(projectId, node.id, null)
        ));

        // Then delete the group from the backend
        await groupApi.deleteGroup(projectId, nodeId);

        // Delete all connected edges from backend
        await Promise.all(edgesToDelete.map(edge => 
          edgeApi.deleteEdge(projectId, edge.id)
        ));
         // After all backend operations are complete, update the UI state
         set(state => {
          // Update the nodes in the UI
          const updatedNodes = state.nodes.map(node => {
            if (node.parentNode === nodeId) {
              // Calculate absolute position for the node
              return {
                ...node,
                parentNode: undefined,
                extent: undefined,
                position: {
                  x: node.position.x + (nodeToDelete?.position.x || 0),
                  y: node.position.y + (nodeToDelete?.position.y || 0)
                }
              };
            }
            return node;
          });

          // Remove the group node itself
          const filteredNodes = updatedNodes.filter((node) => node.id !== nodeId);

          // Filter out the deleted edges
          const remainingEdges = state.edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          );

          // Update menuNodes hierarchy
          const updateMenuNodesHierarchy = (menuNodes) => {
            // Find the group being deleted
            const groupIndex = menuNodes.findIndex(item => item.id === nodeId);
            
            if (groupIndex !== -1) {
              const deletedGroup = menuNodes[groupIndex];
              const remainingMenuNodes = menuNodes.filter(item => item.id !== nodeId);
              
              // If the group had children, move them to the root level
              if (deletedGroup.children && deletedGroup.children.length > 0) {
                return [...remainingMenuNodes, ...deletedGroup.children];
              }
              
              return remainingMenuNodes;
            }
            // If not found at root level, recursively check in other groups
            return menuNodes.map(item => {
              if (item.type === 'group' && item.children) {
                return {
                  ...item,
                  children: updateMenuNodesHierarchy(item.children)
                };
              }
              return item;
            });
          };

          return {
            nodes: filteredNodes,
            edges: remainingEdges,
            menuNodes: updateMenuNodesHierarchy(state.menuNodes),
            selectedNode: null,
          };
        });
      } else {
        // Regular node deletion
        // Delete all connected edges from backend
        await Promise.all(edgesToDelete.map(edge => 
          edgeApi.deleteEdge(projectId, edge.id)
        ));

        // Update the UI state for regular node deletion
        set(state => {
          const filteredNodes = state.nodes.filter((node) => node.id !== nodeId);
          const remainingEdges = state.edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          );
          
          // Update menuNodes for regular nodes
          const updateMenuNodesHierarchy = (menuNodes) => {
            return menuNodes.map(item => {
              if (item.type === 'group' && item.children) {
                return {
                  ...item,
                  children: updateMenuNodesHierarchy(item.children).filter(child => child.id !== nodeId)
                };
              }
              return item;
            }).filter(item => item.id !== nodeId);
          };

          return {
            nodes: filteredNodes,
            edges: remainingEdges,
            menuNodes: updateMenuNodesHierarchy(state.menuNodes),
            selectedNode: null,
          };
        });
      }
    } catch (error) {
      console.error('Failed to delete node/group:', error);
      alert('Failed to delete. Please try again.');
    }
  },

  setSelectedNode: (node) => {
    set({ selectedNode: node });
  },
  checkNodeIntersection: (nodeId, position) => {
    const { nodes } = get();
    const movingNode = nodes.find(node => node.id === nodeId);

    // If the node is already in a group but is being dragged,
    // we should allow the drag to continue but not trigger confirmation
    if (movingNode?.parentNode) {
      // Don't show confirmation, but make sure the node stays draggable
      // Refresh the draggable state to ensure it stays movable within the group
      setTimeout(() => {
        get().refreshNodeDraggableState();
      }, 10);
      return;
    }

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
  confirmNodeInclusion: async () => {
    const { nodeToGroup } = get();
    const projectId = window.location.pathname.split('/project/')[1];

    if (!nodeToGroup || !projectId) {
      return;
    }

    try {
      // First update in backend
      await nodeApi.updateNodeGroup(
        projectId,
        nodeToGroup.nodeId,
        nodeToGroup.groupId
      );

      // Then update UI if backend update was successful
      get().moveNodeToGroup(nodeToGroup.nodeId, nodeToGroup.groupId);

      // Clear the confirmation state
      set({
        showConfirmation: false,
        nodeToGroup: null
      });
    } catch (error) {
      console.error('Failed to update node group:', error);
      alert('Failed to move node to group. Please try again.');

      // Clear the confirmation state but don't update UI
      set({
        showConfirmation: false,
        nodeToGroup: null
      });
    }
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

       // Update menu structure
       const nodeMenuItem = state.menuNodes.find(item => item.id === nodeId);
       const updatedMenuNodes = state.menuNodes
         .filter(item => item.id !== nodeId) // Remove from root level
         .map(item => {
           if (item.id === groupId) {
             return {
               ...item,
               children: [...(item.children || []), nodeMenuItem!]
             };
           }
           return item;
         });

      return { nodes: finalNodes,menuNodes: updatedMenuNodes };
    });

    // After moving a node to a group, refresh the draggable state
    setTimeout(() => {
      get().refreshNodeDraggableState();
    }, 50);
  },
  removeNodeFromGroup: async (nodeId: string) => {
    const projectId = window.location.pathname.split('/project/')[1];
    if (!projectId) return;

    try {
      // First update in backend
      await nodeApi.updateNodeGroup(projectId, nodeId, null);

      // Then update UI if backend update was successful
      set(state => {
        const node = state.nodes.find(n => n.id === nodeId);
        if (!node || !node.parentNode) return state;

        const groupId = node.parentNode;
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

        
      // NEW CODE: Update menu structure
      // Find the node's menu item in the group's children
      const nodeMenuItem = state.menuNodes.find(item => 
        item.type === 'group' && 
        item.id === groupId
      )?.children?.find(child => child.id === nodeId);

      // Remove node from group's children in menu
      const updatedMenuNodes = state.menuNodes.map(item => {
        if (item.id === groupId) {
          return {
            ...item,
            children: (item.children || []).filter(child => child.id !== nodeId)
          };
        }
        return item;
      });

      // Add the node back to root level in menu
      if (nodeMenuItem) {
        updatedMenuNodes.push({
          id: nodeId,
          label: node.data.label,
          type: 'node'
        });
      }

      return { 
        nodes: finalNodes,
        menuNodes: updatedMenuNodes
      };
      });
    } catch (error) {
      console.error('Failed to remove node from group:', error);
      alert('Failed to remove node from group. Please try again.');
    }
  },
  // ... existing code ...

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
              height,
              pointerEvents: 'all' // Ensure pointer events are enabled
            }
          };
        }
        return node;
      });

      // After updating group dimensions, we need to ensure all child nodes are still draggable
      const groupNode = updatedNodes.find(node => node.id === groupId);
      if (groupNode && groupNode.data.childNodes && groupNode.data.childNodes.length > 0) {
        return {
          nodes: updatedNodes.map(node => {
            if (groupNode.data.childNodes.includes(node.id)) {
              return {
                ...node,
                draggable: true,
                parentNode: groupId,
                extent: 'parent',
                style: {
                  ...node.style,
                  pointerEvents: 'all'
                },
                // Ensure z-index is set properly for nested elements
                zIndex: node.type === 'group' ? 10 : 5
              };
            }
            return node;
          })
        };
      }

      return { nodes: updatedNodes };
    });

    // Chain the refreshes with increasing delays to ensure proper state updates
    const refreshSequence = () => {
      // Immediate refresh
      get().refreshNodeDraggableState();

      // Secondary refresh after ReactFlow updates
      setTimeout(() => {
        get().refreshNodeDraggableState();
      }, 50);

      // Final refresh to ensure stability
      setTimeout(() => {
        get().refreshNodeDraggableState();
      }, 150);
    };

    refreshSequence();
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
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setMenuNodes: (menuNodes) => set({ menuNodes }),
  clearStore: () => set({ 
    nodes: [], 
    edges: [], 
    menuNodes: [],
    selectedNode: null 
  }),
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
