import { useCallback } from 'react';
import { EdgeProps, getStraightPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import { useStore } from '../store/useStore';
import { useState } from 'react';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const { updateEdgeLabel } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data?.label || '');

  /*
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    //setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (label !== data?.label) {
      updateEdgeLabel(id, label);
    }
  }, [id, label, data?.label, updateEdgeLabel]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (label !== data?.label) {
        updateEdgeLabel(id, label);
      }
    }
  }, [id, label, data?.label, updateEdgeLabel]);

  */

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