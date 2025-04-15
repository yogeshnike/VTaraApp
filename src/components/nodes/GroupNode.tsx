import { useState, useRef, useCallback } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { X } from 'lucide-react';
import { useStore } from '../../store/useStore';

export interface GroupNodeData {
  label: string;
  description?: string;
  childNodes?: string[];
}

export default function GroupNode({ id, data, selected }: NodeProps<GroupNodeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || 'Group');
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateNode, deleteNode } = useStore();

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
      updateNode(id, { 
        name: label, 
        description: data.description || '', 
        properties: [] 
      });
    }
  }, [id, label, data.description, updateNode]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  }, [id, deleteNode]);

  return (
    <>
      {/* NodeResizer is rendered outside the main group container */}
      <NodeResizer 
        minWidth={200} 
        minHeight={80} 
        isVisible={selected} 
        lineClassName="border-blue-400" 
        handleClassName="h-3 w-3 bg-white border-2 border-blue-400 rounded"
      />
      
      {/* Group container with minimal styling */}
      <div className="group-node bg-blue-50 border-2 border-blue-200 rounded-md min-w-[200px]">
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
                className="text-sm font-medium bg-white px-1 py-0.5 rounded border border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500 w-4/5 mx-auto"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div 
                className="text-sm font-medium text-blue-700 cursor-pointer px-1 py-0.5 w-full text-center"
                onDoubleClick={handleDoubleClick}
              >
                {label}
              </div>
            )}
          </div>
          
          {/* Delete button positioned absolutely */}
          <button 
            className="absolute right-1 top-1 p-1 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 shadow-sm z-10"
            onClick={handleDelete}
            title="Delete group"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Empty content area - child nodes will be rendered here by ReactFlow */}
        <div className="p-2">
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
