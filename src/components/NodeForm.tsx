import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { STRIDE_PROPERTIES, STRIDE_LETTERS, StridePropertiesJSON } from '../constants/stride';
import { nodeApi } from '../services/api';
import { useStore } from '../store/useStore';
import { useReactFlow } from 'reactflow'; // Add this import
import { formatStrideProperties } from '../constants/stride';

interface NodeFormProps {
  onSubmit: (data: { name: string; description: string; properties: string[] }) => void;
  onClose: () => void;
  position?: { x: number; y: number };
}

export function NodeForm({ onSubmit, onClose, position }: NodeFormProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [properties, setProperties] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const addNode = useStore(state => state.addNode);
  const { getViewport } = useReactFlow(); // Get viewport information

  const getRandomPosition = () => {
    const viewport = getViewport();
    const centerX = (viewport.x + window.innerWidth / 2) / viewport.zoom;
    const centerY = (viewport.y + window.innerHeight / 2) / viewport.zoom;
    
    // Add some random offset from the center
    const offsetX = (Math.random() - 0.5) * 200;
    const offsetY = (Math.random() - 0.5) * 200;
    
    return {
      x: centerX + offsetX,
      y: centerY + offsetY
    };
  };




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      // Use provided position or generate random position
      const nodePosition = position || getRandomPosition();

// Format STRIDE properties as JSONB
const stridePropertiesJson = formatStrideProperties(properties);

      // Create node data for API
      const nodeData = {
        project_id: projectId,
        node_name: name,
        node_description: description,
        x_pos: nodePosition.x,
        y_pos: nodePosition.y,
        stride_properties: stridePropertiesJson,
        group_id: null
      };

      // Call API to create node
      const response = await nodeApi.createNode(projectId,nodeData);

      // Add node to local state using the response from the backend
      addNode({
        id: response.id, // Use the ID from the backend
        name: response.node_name,
        description,
        properties,
        position: {
          x: response.x_pos,
          y: response.y_pos
        },
        group_id: response.group_id
      });
       // Clear form
       setName('');
       setDescription('');
       setProperties([]);
       
       // Close form
       onClose();
 
     } catch (err) {
       setError(err instanceof Error ? err.message : 'Failed to create node');
     } finally {
       setIsSubmitting(false);
     }
   };

  const handlePropertyToggle = (property: string) => {
    setProperties(prev => 
      prev.includes(property)
        ? prev.filter(p => p !== property)
        : [...prev, property]
    );
  };

  return (
    <div className="fixed top-[calc(var(--top-nav-height,48px)+var(--ribbon-height,0px)+5rem)] right-4 w-80 bg-white rounded-lg shadow-lg border p-4">
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
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

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            disabled={isSubmitting}
          >
          {isSubmitting ? 'Adding...' : 'Add Node'}
          </button>
        </div>
      </form>
    </div>
  );
}
