import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2,  Eye } from 'lucide-react';
import { configurationApi } from '../services/api';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

interface Configuration {
  id: string;
  name: string;
  created_at: string;
}

export function ConfigurationTab() {
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [configName, setConfigName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingConfig, setEditingConfig] = useState<Configuration | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setIsLoading(true);
      const data = await configurationApi.getConfigurations();
      console.log(data)
      setConfigurations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configurations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddConfig = async () => {
    if (!configName.trim()) return;

    try {
      const newConfig = await configurationApi.createConfiguration({ name: configName });
      setConfigurations([...configurations, newConfig]);
      setConfigName('');
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to create configuration:', err);
      alert('Failed to create configuration');
    }
  };

  const handleEditConfig = async (config: Configuration) => {
    if (!configName.trim()) return;

    try {
      const updatedConfig = await configurationApi.updateConfiguration(config.id, { name: configName });
      setConfigurations(configurations.map(c => 
        c.id === config.id ? updatedConfig : c
      ));
      setConfigName('');
      setEditingConfig(null);
    } catch (err) {
      console.error('Failed to update configuration:', err);
      alert('Failed to update configuration');
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this configuration?')) return;

    try {
      await configurationApi.deleteConfiguration(id);
      setConfigurations(configurations.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete configuration:', err);
      alert('Failed to delete configuration');
    }
  };

  const Modal = ({ onClose, onSubmit, title, initialValue = '' }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <input
          type="text"
          value={configName}
          onChange={(e) => setConfigName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md mb-4"
          placeholder="Configuration Name"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setConfigName('');
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            {title === 'Add New Configuration' ? 'Add' : 'Update'}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Configurations</h2>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add Configuration
        </Button>
      </div>

      {showAddForm && (
        <Modal
          title="Add New Configuration"
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAddConfig}
        />
      )}

      {editingConfig && (
        <Modal
          title="Edit Configuration"
          onClose={() => {
            setEditingConfig(null);
            setConfigName('');
          }}
          onSubmit={() => handleEditConfig(editingConfig)}
          initialValue={editingConfig.name}
        />
      )}

      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Loading configurations...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configurations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                    No configurations yet. Click "Add Configuration" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                configurations.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>{config.name}</TableCell>
                    <TableCell>
                      {new Date(config.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                      <button
                          onClick={() => navigate(`/configuration/${config.id}`)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingConfig(config);
                            setConfigName(config.name);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteConfig(config.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}