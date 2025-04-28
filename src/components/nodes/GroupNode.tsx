import { useState, useRef, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { X, Ungroup } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { groupApi } from '../../services/api';

export interface GroupNodeData {
  label: string;
  description?: string;
  childNodes?: string[];
}

export default function GroupNode({ id, data, selected }: NodeProps<GroupNodeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateNode, deleteNode, removeNodeFromGroup, isNodeInGroup, refreshNodeDraggableState } = useStore();

  // Get project ID from URL
  const projectId = window.location.pathname.split('/project/')[1];
  // Check if this group is inside another group
  const parentGroupId = isNodeInGroup(id);
  const isChildGroup = !!parentGroupId;


  const handleEditComplete = async (newLabel: string) => {
    if (!projectId) return;

    const groupName = newLabel.trim() || 'Untitled Group';
    
    try {
      // First update in backend
      await groupApi.updateGroup(projectId, id, {
        group_name: groupName,
        parent_group_id: parentGroupId
      });

      // Then update UI if backend update was successful
      updateNode(id, { 
        name: groupName,
        description: data.description || '', 
        properties: [] 
      });
    } catch (error) {
      console.error('Failed to update group:', error);
      // Revert the label to its previous value
      setLabel(data.label || 'Untitled Group');
      alert('Failed to update group name. Please try again.');
    }
  };

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    updateNode(id, { 
      name: label, 
      description: data.description || '', 
      properties: [] 
    });
  }, [id, label, data.description, updateNode]);



  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      handleEditComplete(label);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setLabel(data.label || 'Untitled Group'); // Revert changes
    }
  }, [label, data.label]);

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!projectId) return;

    try {
      // Check if group has children
      const hasChildren = data.childNodes && data.childNodes.length > 0;
      
      if (hasChildren) {
        const confirm = window.confirm(
          'This group contains other items. Deleting it will ungroup all items. Continue?'
        );
        if (!confirm) return;
      }

      // First delete from backend
      await groupApi.deleteGroup(projectId, id);

      // Then update UI if backend delete was successful
      deleteNode(id);
    } catch (error) {
      console.error('Failed to delete group:', error);
      alert('Failed to delete group. Please try again.');
    }
  }, [id, projectId, data.childNodes, deleteNode]);

  const handleUngroup = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    removeNodeFromGroup(id);
  }, [id, removeNodeFromGroup]);

  return (
    <>
      {/* NodeResizer is rendered outside the main group container */}
      <NodeResizer 
        minWidth={200} 
        minHeight={80} 
        isVisible={selected} 
        lineClassName="border-blue-400" 
        handleClassName="h-3 w-3 bg-white border-2 border-blue-400 rounded"
        onResizeEnd={(_, params) => {
          // Ensure proper event handling sequence
          const handleResize = () => {
            // Update dimensions
            const resizeEvent = new CustomEvent('group-resized', {
              detail: {
                id,
                width: params.width,
                height: params.height
              }
            });
            document.dispatchEvent(resizeEvent);
            
            // Force ReactFlow update
            document.dispatchEvent(new Event('mouseup'));
          };
          
          // Execute resize handling in next tick
          setTimeout(handleResize, 0);
        }}
      />
      
      {/* Group container with minimal styling */}
      <div 
        className="group-node bg-blue-50 border-2 border-blue-200 rounded-md min-w-[200px]"
        style={{ 
          pointerEvents: 'all', // Change to 'none' to allow edge interactions
          position: 'relative',
          zIndex: 0, // Lower z-index for the content area
          touchAction: 'none'
        }}
      >
        {/* Header bar is a separate element at the top */}
        <div 
          className="group-node-header border-b border-blue-200 h-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header content container */}
          <div className="absolute inset-x-0 top-0 h-full flex items-center justify-center">
            {isEditing ? (
              <input
                ref={inputRef}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="Enter group name"
                className="text-sm font-medium bg-white px-1 py-0.5 rounded border border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500 w-4/5 mx-auto"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div 
                className="text-sm font-medium text-blue-700 cursor-pointer px-1 py-0.5 w-full text-center"
                onDoubleClick={handleDoubleClick}
              >
                {label || 'Untitled Group'}
              </div>
            )}
          </div>
          
          {/* Action buttons positioned absolutely */}
          <div className="absolute right-1 top-1 flex items-center space-x-1 z-10">
            {/* Ungroup button - only show for child groups */}
            {isChildGroup && (
              <button 
                className="p-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-500 hover:text-blue-600 shadow-sm"
                onClick={handleUngroup}
                title="Ungroup (move outside parent)"
              >
                <Ungroup size={14} strokeWidth={2.5} />
              </button>
            )}
            
            {/* Delete button */}
            <button 
              className="p-1 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 shadow-sm"
              onClick={handleDelete}
              title="Delete group"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        
        {/* Empty content area - child nodes will be rendered here by ReactFlow */}
        <div className="p-2" style={{ pointerEvents: 'all' }}>
          {/* This area is intentionally left empty for child nodes */}
        </div>
      </div>
      
      {/* Connection handles with improved z-index and positioning */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-2 h-2 bg-blue-500 z-10" 
        id="top-target"
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-2 h-2 bg-blue-500 z-10" 
        id="bottom-source"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-2 h-2 bg-blue-500 z-10" 
        id="left-target"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-2 h-2 bg-blue-500 z-10" 
        id="right-source"
      />
    </>
  );
}
