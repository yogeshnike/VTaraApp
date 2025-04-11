import { Plus, Layout, Group } from 'lucide-react';
import { useState } from 'react';
import { NodeForm } from './NodeForm';
import { useStore } from '../store/useStore';

interface RibbonProps {
  activeItem: string;
}

export function Ribbon({ activeItem }: RibbonProps) {
  const [showNodeForm, setShowNodeForm] = useState(false);
  const addNode = useStore(state => state.addNode);

  return (
    <>
      <div className="bg-gray-100 border-b px-4 py-2">
        <div className="flex items-center gap-4">
          <button 
            className="flex flex-col items-center px-3 py-1 rounded hover:bg-white"
            onClick={() => setShowNodeForm(true)}
          >
            <Plus size={18} />
            <span className="text-xs mt-1">New Data</span>
          </button>
          <button className="flex flex-col items-center px-3 py-1 rounded hover:bg-white">
            <Layout size={18} />
            <span className="text-xs mt-1">New Component</span>
          </button>
          <button className="flex flex-col items-center px-3 py-1 rounded hover:bg-white">
            <Group size={18} />
            <span className="text-xs mt-1">Group</span>
          </button>
        </div>
      </div>
      {showNodeForm && (
        <NodeForm
          onSubmit={(data) => {
            addNode(data);
            setShowNodeForm(false);
          }}
          onClose={() => setShowNodeForm(false)}
        />
      )}
    </>
  );
}
