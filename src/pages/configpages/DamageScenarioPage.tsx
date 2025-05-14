import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { DamageScenarioForm } from '../../components/DamageScenarioForm';
import { DamageScenarioTable } from '../../components/DamageScenarioTable';
import { Upload, Download, Plus,ChevronLeft,ChevronRight } from 'lucide-react';
import { configurationApi,damageScenarioApi } from '../../services/api';
import { DamageScenario } from '../../types/damageScenario';


interface Configuration {
    id: string;
    name: string;
  }



export function DamageScenarioPage() {
  const { configId } = useParams<{ configId: string }>();
  const [showAddForm, setShowAddForm] = useState(false);
  const [damageScenarios, setDamageScenarios] = useState<DamageScenario[]>([]);
  const [configuration, setConfiguration] = useState<Configuration | null>(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (configId) {
      loadConfiguration();
      loadDamageScenarios();
    }
  }, [configId]);


  const loadDamageScenarios = async () => {
    try {
      setIsLoading(true);
      const scenarios = await damageScenarioApi.getDamageScenarios(configId);
      // Format the scenarios before setting state
      const formattedScenarios = scenarios.map(scenario => ({
        ...scenario,
        road_users: typeof scenario.road_users === 'string' 
          ? JSON.parse(scenario.road_users) 
          : scenario.road_users,
        business: typeof scenario.business === 'string' 
          ? JSON.parse(scenario.business) 
          : scenario.business
      }));

      console.log('Loaded scenarios:', formattedScenarios); // Debug log
      setDamageScenarios(formattedScenarios);
    } catch (error) {
      console.error('Failed to load damage scenarios:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleUpdate = (updatedScenarios: DamageScenario[]) => {
    setDamageScenarios(updatedScenarios);
  };

  const loadConfiguration = async () => {
    try {
      setIsLoading(true);
      const data = await configurationApi.getConfiguration(configId!);
      console.log('Configuration loaded:', data); // Debug log
      setConfiguration(data);
    } catch (error) {
      console.error('Failed to load configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }


  // Handle form submission
  const handleFormSubmit = async (formData: any) => {
    try {
      // Transform the data to match the backend expectations
      const requestData = {
        name: formData.name,
        justification: formData.justification,
        security_property: formData.securityProperty,
        controlability: formData.controlability,
        corporate_flag: formData.corporateFlag,
        road_users: formData.roadUsers,
        business: formData.business,
        
      };

      // Add config_id to the request but not as part of the main schema validation
      if (configId) {
        requestData['config_id'] = configId;
      }
  
      // Add this line to see the exact data being sent
    console.log('Request data being sent:', JSON.stringify(requestData, null, 2));
  
      const newScenario = await damageScenarioApi.createDamageScenario(requestData);
      
      console.log('Created damage scenario:', newScenario); // Debug log

      // Ensure the returned data has the correct structure
      const formattedScenario = {
        ...newScenario,
        road_users: typeof newScenario.road_users === 'string' 
          ? JSON.parse(newScenario.road_users) 
          : newScenario.road_users,
        business: typeof newScenario.business === 'string' 
          ? JSON.parse(newScenario.business) 
          : newScenario.business
      };
      
      setDamageScenarios(prev => [...prev, newScenario]);
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create damage scenario:', error);
      alert('Failed to create damage scenario. Please try again.');
    }
  };

  // Handle import JSON
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          // Add configId to each imported scenario
          const scenariosWithConfig = importedData.map((scenario: DamageScenario) => ({
            ...scenario,
            configId: configId
          }));
          setDamageScenarios(prev => [...prev, ...scenariosWithConfig]);
        } catch (error) {
          console.error('Error importing JSON:', error);
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle export JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(damageScenarios, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `damage-scenarios-${configId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <button 
              onClick={() => navigate('/home')}
              className="hover:text-gray-700"
            >
              Home
            </button>
            <ChevronRight size={16} />
            <button 
              onClick={() => navigate('/home')}
              className="hover:text-gray-700"
            >
              Configurations
            </button>
            <ChevronRight size={16} />
            <button 
              onClick={() => navigate(`/configuration/${configId}`)}
              className="hover:text-gray-700"
            >
              {configuration?.name || 'Configuration'}
            </button>
            <ChevronRight size={16} />
            <span className="text-gray-900">Damage Scenarios</span>
          </nav>

          {/* Main Title */}
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {configuration?.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage damage scenarios for this configuration
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {/* Import button */}
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload size={16} />
                  Import JSON
                </Button>
              </div>
              
              {/* Export button */}
              <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
                <Download size={16} />
                Export JSON
              </Button>

              {/* Add button */}
              <Button 
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 bg-blue-600 text-white"
              >
                <Plus size={16} />
                Add Damage Scenario
              </Button>
            </div>
          </div>
        </div>
      </div>
       {/* Content */}
       <div className="p-6">
        {/* Damage Scenario Form Modal */}
        {showAddForm && (
          <DamageScenarioForm
            onSubmit={handleFormSubmit}
            onClose={() => setShowAddForm(false)}
            mode="config"
          />
        )}

        {/* Damage Scenario Table */}
        <div className="bg-white rounded-lg shadow">
          <DamageScenarioTable
             damageScenarios={damageScenarios}
             onUpdate={handleUpdate}
             mode="config"
          />
        </div>
      </div>
    </div>
  );
}