import { Handle, Position, NodeProps } from 'reactflow';

interface DefaultNodeData {
  label: string;
  description?: string;
  properties?: string[];
}

export default function DefaultNode({ data }: NodeProps<DefaultNodeData>) {
    return (
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200 min-w-[100px] min-h-[40px] flex items-center justify-center">
        <div className="font-bold text-center">{data.label}</div>
        
        {/* Single handle for each position that can act as both source and target */}
        <Handle
          type="source"
          position={Position.Top}
          style={{ background: '#2563eb' }}
          id="top"
        />
  
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: '#2563eb' }}
          id="bottom"
        />
  
        <Handle
          type="source"
          position={Position.Left}
          style={{ background: '#2563eb' }}
          id="left"
        />
  
        <Handle
          type="source"
          position={Position.Right}
          style={{ background: '#2563eb' }}
          id="right"
        />
      </div>
    );
  }