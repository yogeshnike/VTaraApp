import { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { useStore } from '../store/useStore';
import { X, Trash2, Ungroup } from 'lucide-react';
import { STRIDE_PROPERTIES, STRIDE_LETTERS } from '../constants/stride';

interface NodeEditFormProps {
  node: Node;
}

export function NodeEditForm({ node }: NodeEditFormProps) {
  const { updateNode, deleteNode, setSelectedNode, removeNodeFromGroup, isNodeInGroup } = useStore();
  const [name, setName] = useState(node.data.label);
  const [description, setDescription] = useState(node.data.description);
  const [properties, setProperties] = useState<string[]>(node.data.properties || []);

  // Add effect to update local state when node data changes
  useEffect(() => {
    setName(node.data.label);
    setDescription(node.data.description);
    setProperties(node.data.properties || []);
  }, [node]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only update the node (and STRIDE badges) when form is submitted
    updateNode(node.id, { 
      name, 
      description, 
      properties 
    });
  };

  const handleDelete = () => {
    deleteNode(node.id);
  };

  const handleUngroup = () => {
    removeNodeFromGroup(node.id);
  };

  const handlePropertyToggle = (property: string) => {
    // Only update local state, don't update the node yet
    setProperties(prev => 
      prev.includes(property)
        ? prev.filter(p => p !== property)
        : [...prev, property]
    );
  };

  const parentGroupId = isNodeInGroup(node.id);

  return (
    <div className="fixed top-[calc(var(--top-nav-height,48px)+var(--ribbon-height,0px)+1rem)] right-4 w-80 bg-white rounded-lg shadow-lg border p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Node</h3>
          <div className="flex gap-2">
            {parentGroupId && (
              <button
                type="button"
                onClick={handleUngroup}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                title="Remove from group"
              >
                <Ungroup size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 size={18} />
            </button>
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="p-1.5 hover:bg-gray-100 rounded"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Node Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            STRIDE Properties
          </label>
          <div className="space-y-2">
            {STRIDE_PROPERTIES.map((property) => (
              <label key={property} className="flex items-center">
                <input
                  type="checkbox"
                  checked={properties.includes(property)}
                  onChange={() => handlePropertyToggle(property)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">{property}</span>
                  <div className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                    {STRIDE_LETTERS[property]}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Update Node
          </button>
        </div>
      </form>
    </div>
  );
}
