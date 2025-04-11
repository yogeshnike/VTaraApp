import { useState } from 'react';

const NODE_PROPERTIES = [
  'Confidentiality',
  'Integrity',
  'Authenticity',
  'Non-repudiation',
  'Availability'
] as const;

interface NodeFormProps {
  onSubmit: (data: { name: string; description: string; properties: string[] }) => void;
  onClose: () => void;
}

export function NodeForm({ onSubmit, onClose }: NodeFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [properties, setProperties] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, properties });
    setName('');
    setDescription('');
    setProperties([]);
  };

  const handlePropertyToggle = (property: string) => {
    setProperties(prev => 
      prev.includes(property)
        ? prev.filter(p => p !== property)
        : [...prev, property]
    );
  };

  return (
    <div className="fixed top-[calc(var(--top-nav-height,48px)+var(--ribbon-height,0px)+1rem)] right-4 w-80 bg-white rounded-lg shadow-lg border p-4">
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
            Properties
          </label>
          <div className="space-y-2">
            {NODE_PROPERTIES.map((property) => (
              <label key={property} className="flex items-center">
                <input
                  type="checkbox"
                  checked={properties.includes(property)}
                  onChange={() => handlePropertyToggle(property)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700">{property}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Add Node
          </button>
        </div>
      </form>
    </div>
  );
}
