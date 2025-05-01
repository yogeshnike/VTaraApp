import { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { useStore } from '../store/useStore';
import { X, Trash2, Ungroup } from 'lucide-react';
import { STRIDE_PROPERTIES, STRIDE_LETTERS, StridePropertiesJSON } from '../constants/stride';
import { nodeApi } from '../services/api';
import { useParams } from 'react-router-dom';

interface NodeEditFormProps {
  node: Node;
}

export function NodeEditForm({ node }: NodeEditFormProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const { updateNode, deleteNode, setSelectedNode, removeNodeFromGroup, isNodeInGroup } = useStore();
  const [name, setName] = useState(node.data.label);
  const [description, setDescription] = useState(node.data.description);
  // Initialize properties from the node's STRIDE properties
  const [properties, setProperties] = useState<string[]>(() => {
    // If we have an array already, use it
    if (Array.isArray(node.data.properties)) {
      return node.data.properties;
    }
    // Otherwise, convert from JSONB format
    if (node.data.stride_properties) {
      return Object.entries(node.data.stride_properties)
        .filter(([_, value]) => value.selected)
        .map(([key]) => key);
    }
    return [];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add effect to update local state when node data changes
  useEffect(() => {
    setName(node.data.label);
    setDescription(node.data.description);
    setProperties(node.data.properties || []);
  }, [node]);

  // Convert array of selected properties to JSONB format
  const formatStrideProperties = (selectedProperties: string[]): StridePropertiesJSON => {
    const strideJson = {} as StridePropertiesJSON;
    
    STRIDE_PROPERTIES.forEach(property => {
      strideJson[property] = {
        name: property,
        selected: selectedProperties.includes(property),
        description: `${property} threat`
      };
    });
    
    return strideJson;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      // Format STRIDE properties as JSONB
      const stridePropertiesJson = formatStrideProperties(properties);

      // Create update data
      const updateData = {
        node_name: name,
        node_description: description,
        stride_properties: stridePropertiesJson,
      };

      // Call API to update node
      await nodeApi.updateNode(projectId, node.id, updateData);

      // Update local state
      updateNode(node.id, {
        name,
        description,
        properties,
        stride_properties: stridePropertiesJson // Add this to keep both formats
      });

      // Close form
      setSelectedNode(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update node');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this node?')) {
      return;
    }

    setError(null);
    setIsDeleting(true);

    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      // Call API to delete node
      await nodeApi.deleteNode(projectId, node.id);

      // Update local state
      deleteNode(node.id);

      // Close form
      setSelectedNode(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete node');
      setIsDeleting(false);
    }
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
    <div className="fixed top-[calc(var(--top-nav-height,48px)+var(--ribbon-height,0px)+5rem)] right-4 w-80 bg-white rounded-lg shadow-lg border p-4">
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
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
                disabled={isSubmitting || isDeleting}
              >
                <Ungroup size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
              disabled={isSubmitting || isDeleting}
            >
              <Trash2 size={18} />
            </button>
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="p-1.5 hover:bg-gray-100 rounded"
              disabled={isSubmitting || isDeleting}
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
            disabled={isSubmitting || isDeleting}
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
            disabled={isSubmitting || isDeleting}
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
                  disabled={isSubmitting || isDeleting}
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
            disabled={isSubmitting || isDeleting}
          >
            {isSubmitting ? 'Updating...' : 'Update Node'}
          </button>
        </div>
      </form>
    </div>
  );
}
