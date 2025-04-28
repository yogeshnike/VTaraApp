import { useCallback } from 'react';
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import { useStore } from '../store/useStore';
import { useState } from 'react';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,  // Add these new props
  targetPosition,  // Add these new props
  data,
  markerEnd,
}: EdgeProps) {
  // Use getSmoothStepPath instead of getStraightPath for zigzag effect
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16, // Add this for smoother corners
  });

  
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data?.label || '');


  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            backgroundColor: 'white',
            padding: '4px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 500,
            zIndex: 1000, // Add high z-index to ensure visibility
            //boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            //border: '1px solid #e5e7eb',
          }}
          className="nodrag nopan"
         
        >
          {isEditing ? (
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              //onBlur={handleBlur}
              //onKeyDown={handleKeyDown}
              className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <div
              className="cursor-pointer hover:bg-gray-50 px-2 py-1"
            >
              {data?.label || 'Click to add label'}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}