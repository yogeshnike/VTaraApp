import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Edit, Trash2, Plus, Library } from 'lucide-react';
import { Button } from './ui/button';
import { DamageScenarioForm } from './DamageScenarioForm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { DamageScenario, DamageScenarioTableMode } from '../types/damageScenario';
import { damageScenarioApi } from '../services/api';




// Helper function to get impact level color and short text
const getImpactStyle = (level: string) => {
    const styles = {
      severe: { color: 'bg-red-500 text-white', short: 'SEV' },
      major: { color: 'bg-orange-400 text-white', short: 'MAJ' },
      moderate: { color: 'bg-yellow-400 text-black', short: 'MOD' },
      negligible: { color: 'bg-green-400 text-white', short: 'NEG' },
      'n/a': { color: 'bg-gray-400 text-white', short: 'N/A' }
    };
    
    const key = level.toLowerCase();
    return styles[key] || styles['n/a'];
  };
  
  
// Impact Value Display Component
interface ImpactGroupProps {
    title: string;
    overall: string;
    values: {
      [key: string]: { value: string; justification: string };
    };
  }
  
  const ImpactGroup: React.FC<ImpactGroupProps> = ({ title, overall, values }) => {
    const overallStyle = getImpactStyle(overall);
    
    return (
      <div className="min-w-[160px]"> {/* Reduced from 200px to 160px */}
        {/* Header with title and overall value */}
        <div className="flex items-center gap-1 mb-1"> {/* Reduced gap and margin */}
          <span className="text-xs font-medium">{title}</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] ${getImpactStyle(overall).color}`}>
            {overall.toUpperCase()}
          </span>
        </div>
  
        {/* Impact values grid */}
        <div className="grid grid-cols-3 gap-0.5"> {/* Changed to 3 columns for Business, reduced gap */}
          {/* Labels row */}
          {Object.keys(values).map((key) => {
            // Custom label mapping for Business section
            let label = key;
            if (title === "BUSINESS") {
              if (key === "ip") label = "I";
              if (key === "financial") label = "F";
              if (key === "brand") label = "B";
            } else {
              label = key.charAt(0).toUpperCase();
            }
            
            return (
              <div key={`label-${key}`} className="text-center text-[10px] text-gray-500">
                {label}
              </div>
            );
          })}
            {/* Values row */}
        {Object.entries(values).map(([key, { value, justification }]) => {
          const style = getImpactStyle(value);
          return (
            <TooltipProvider key={`value-${key}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`text-center text-[10px] ${style.color} px-1 py-0.5 rounded cursor-help`}>
                    {style.short}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="p-2">
                    <div className="font-bold mb-1">
                      {title === "BUSINESS" ? 
                        (key === "ip" ? "Intellectual Property" :
                         key === "financial" ? "Financial Loss" :
                         "Brand Reputation") :
                        key.charAt(0).toUpperCase() + key.slice(1)}
                    </div>
                    <div>Impact: {value}</div>
                    {justification && (
                      <div className="mt-1 text-xs">
                        Justification: {justification}
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};
  
const RoadUsersGroup: React.FC<{
    overall: string;
    values: {
      safety: { value: string; justification: string };
      privacy: { value: string; justification: string };
      financial: { value: string; justification: string };
      operational: { value: string; justification: string };
    };
  }> = ({ overall, values }) => {
    return (
      <div className="min-w-[160px]">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-xs font-medium">ROAD USERS</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] ${getImpactStyle(overall).color}`}>
            {overall.toUpperCase()}
          </span>
        </div>

        <div className="flex gap-1">
        {/* SAFETY */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <div className="text-[10px] text-gray-500 text-center">S</div>
                <div className={`text-center text-[10px] ${getImpactStyle(values.safety.value).color} px-1.5 py-0.5 rounded cursor-help`}>
                  {getImpactStyle(values.safety.value).short}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="p-2">
                <div className="font-bold mb-1">Safety</div>
                <div>Impact: {values.safety.value}</div>
                <div className="mt-1 text-xs">Justification: {values.safety.justification}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* PRIVACY */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <div className="text-[10px] text-gray-500 text-center">P</div>
                <div className={`text-center text-[10px] ${getImpactStyle(values.privacy.value).color} px-1.5 py-0.5 rounded cursor-help`}>
                  {getImpactStyle(values.privacy.value).short}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="p-2">
                <div className="font-bold mb-1">Privacy</div>
                <div>Impact: {values.privacy.value}</div>
                <div className="mt-1 text-xs">Justification: {values.privacy.justification}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

       {/* Financial */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <div className="text-[10px] text-gray-500 text-center">F</div>
                <div className={`text-center text-[10px] ${getImpactStyle(values.financial.value).color} px-1.5 py-0.5 rounded cursor-help`}>
                  {getImpactStyle(values.financial.value).short}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="p-2">
                <div className="font-bold mb-1">Financial</div>
                <div>Impact: {values.financial.value}</div>
                <div className="mt-1 text-xs">Justification: {values.financial.justification}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <div className="text-[10px] text-gray-500 text-center">O</div>
                <div className={`text-center text-[10px] ${getImpactStyle(values.operational.value).color} px-1.5 py-0.5 rounded cursor-help`}>
                  {getImpactStyle(values.operational.value).short}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="p-2">
                <div className="font-bold mb-1">Operational</div>
                <div>Impact: {values.operational.value}</div>
                <div className="mt-1 text-xs">Justification: {values.operational.justification}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
       </div>
    </div>
  );
};


const BusinessGroup: React.FC<{
    overall: string;
    values: {
      ip: { value: string; justification: string };
      financial: { value: string; justification: string };
      brand: { value: string; justification: string };
    };
  }> = ({ overall, values }) => {
    return (
      <div className="min-w-[160px]">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-xs font-medium">BUSINESS</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] ${getImpactStyle(overall).color}`}>
            {overall.toUpperCase()}
          </span>
        </div>
        
        <div className="flex gap-1">
          {/* IP */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <div className="text-[10px] text-gray-500 text-center">I</div>
                  <div className={`text-center text-[10px] ${getImpactStyle(values.ip.value).color} px-1.5 py-0.5 rounded cursor-help`}>
                    {getImpactStyle(values.ip.value).short}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="p-2">
                  <div className="font-bold mb-1">Intellectual Property</div>
                  <div>Impact: {values.ip.value}</div>
                  <div className="mt-1 text-xs">Justification: {values.ip.justification}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
         {/* Financial */}
         <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <div className="text-[10px] text-gray-500 text-center">F</div>
                <div className={`text-center text-[10px] ${getImpactStyle(values.financial.value).color} px-1.5 py-0.5 rounded cursor-help`}>
                  {getImpactStyle(values.financial.value).short}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="p-2">
                <div className="font-bold mb-1">Financial Loss</div>
                <div>Impact: {values.financial.value}</div>
                <div className="mt-1 text-xs">Justification: {values.financial.justification}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Brand */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <div className="text-[10px] text-gray-500 text-center">B</div>
                <div className={`text-center text-[10px] ${getImpactStyle(values.brand.value).color} px-1.5 py-0.5 rounded cursor-help`}>
                  {getImpactStyle(values.brand.value).short}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="p-2">
                <div className="font-bold mb-1">Brand Reputation</div>
                <div>Impact: {values.brand.value}</div>
                <div className="mt-1 text-xs">Justification: {values.brand.justification}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        </div>
    </div>
  );
};



// Update the component props
interface DamageScenarioTableProps {
  damageScenarios: DamageScenario[];
  onUpdate: (scenarios: DamageScenario[]) => void;
  mode: DamageScenarioTableMode;  // Add this prop
}


export function DamageScenarioTable({damageScenarios, onUpdate, mode }: DamageScenarioTableProps) {
  //const [damageScenarios, setDamageScenarios] = useState<DamageScenario[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showConfigLibrary, setShowConfigLibrary] = useState(false);
  const [editingScenario, setEditingScenario] = useState<DamageScenario | null>(null);
  const [configScenarios, setConfigScenarios] = useState<DamageScenario[]>([]);


  const roadUserDescriptions = {
    safety: 'Safety Impact',
    privacy: 'Privacy Impact',
    financial: 'Financial Impact',
    operational: 'Operational Impact'
  };

  const businessDescriptions = {
    ip: 'Loss of Intellectual Property',
    financial: 'Financial Loss of Business',
    brand: 'Loss of Brand Reputation'
  };


  // Add this helper function at the top of the file
const getSecurityPropertyShort = (property: string) => {
  switch (property) {
    case 'Confidentiality(C)':
      return 'C';
    case 'Integrity(I)':
      return 'I';
    case 'Availability(A)':
      return 'A';
    default:
      return 'N/A';
  }
};

const getSecurityPropertyFull = (property: string) => {
  switch (property) {
    case 'Confidentiality(C)':
      return 'Confidentiality';
    case 'Integrity(I)':
      return 'Integrity';
    case 'Availability(A)':
      return 'Availability';
    default:
      return 'Not Applicable';
  }
};

  const handleEdit = (scenario: DamageScenario) => {
    setEditingScenario(scenario);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this damage scenario?')) {
      try {
        await damageScenarioApi.deleteDamageScenario(id);
        onUpdate(damageScenarios.filter(s => s.id !== id));
      } catch (error) {
        console.error('Failed to delete damage scenario:', error);
        alert('Failed to delete damage scenario. Please try again.');
      }
    }
  };

  // Add this function to fetch config scenarios
  const fetchConfigScenarios = async () => {
    try {
      // Replace this with your actual API call
      const response = await fetch('/api/config/damage-scenarios');
      const data = await response.json();
      setConfigScenarios(data);
    } catch (error) {
      console.error('Failed to fetch config scenarios:', error);
    }
  };

  // Add this function to handle adding a scenario from config
  const handleAddFromConfig = (scenario: DamageScenario) => {
    const newScenario = {
      ...scenario,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onUpdate([...damageScenarios, newScenario]);
    setShowConfigLibrary(false);
  };


  /*const handleFormSubmit = (formData: any) => {
    if (editingScenario) {
      // Handle edit
      setDamageScenarios(scenarios =>
        scenarios.map(scenario =>
          scenario.id === editingScenario.id
            ? { ...scenario, ...formData }
            : scenario
        )
      );
    } else {
      // Handle add
      const newScenario: DamageScenario = {
        id: Date.now().toString(), // You might want to use a proper ID generation method
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setDamageScenarios(prev => [...prev, newScenario]);
    }
    setShowAddForm(false);
    setEditingScenario(null);
  };*/

  const handleFormSubmit = async (formData: any) => {
    try {
      if (editingScenario) {
        // Handle edit
        const updatedScenario = await damageScenarioApi.updateDamageScenario(
          editingScenario.id,
          formData
        );
        onUpdate(
          damageScenarios.map(scenario =>
            scenario.id === editingScenario.id ? updatedScenario : scenario
          )
        );
      }
      setShowAddForm(false);
      setEditingScenario(null);
    } catch (error) {
      console.error('Failed to update damage scenario:', error);
      alert('Failed to update damage scenario. Please try again.');
    }
  };


  const handleFormClose = () => {
    setShowAddForm(false);
    setEditingScenario(null);
  };




  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Damage Scenarios</h2>
        <div className="flex gap-4">
          {/* Different action buttons based on mode */}
          {mode === 'project' ? (
            <>
              {/* Project mode buttons */}
              <Dialog open={showConfigLibrary} onOpenChange={setShowConfigLibrary}>
                {/* ... existing dialog code ... */}
              </Dialog>
              <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
                <Plus size={16} />
                Create New Scenario
              </Button>
            </>
          ) : (
            <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
              <Plus size={16} />
              Add New Damage Scenario
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Common columns with consistent styling */}
              <TableHead className="w-16 text-center">S.No</TableHead>
              <TableHead className="w-[300px] min-w-[300px]">
                <div className="font-semibold">Damage Scenario</div>
              </TableHead>
              <TableHead className="w-[300px] min-w-[300px]">
                <div className="font-semibold">Justification</div>
                </TableHead>
              <TableHead>Security Property</TableHead>
              <TableHead>Controlability</TableHead>
              <TableHead>Corporate Flag</TableHead>
              <TableHead className="min-w-[200px]">Road Users</TableHead>
              <TableHead className="min-w-[200px]">Business</TableHead>
              <TableHead>Created/Updated On</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {damageScenarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  No damage scenarios found. {mode === 'project' ? 'Add one from the config library or create new.' : 'Add one to get started.'}
                </TableCell>
              </TableRow>
            ) : (
              damageScenarios.map((scenario, index) => {
                const roadUsers = typeof scenario.road_users === 'string' 
                  ? JSON.parse(scenario.road_users) 
                  : scenario.road_users;

                const business = typeof scenario.business === 'string' 
                  ? JSON.parse(scenario.business) 
                  : scenario.business;

                return (
                  <TableRow key={scenario.id}>
                    {/* Common columns with consistent styling */}
                    <TableCell className="text-center align-top">
                      {index + 1}
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="w-[300px] min-w-[300px] p-2">
                        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed max-h-[150px] overflow-y-auto">
                          {scenario.name}
                        </div>
                      </div>
                      </TableCell>
                    <TableCell className="align-top">
                      <div className="w-[300px] min-w-[300px] p-2">
                        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed max-h-[150px] overflow-y-auto">
                          {scenario.justification}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-100 text-blue-700 font-medium text-sm cursor-help">
                              {getSecurityPropertyShort(scenario.security_property)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{getSecurityPropertyFull(scenario.security_property)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="align-top">{scenario.controlability}</TableCell>
                    <TableCell className="align-top">{scenario.corporate_flag}</TableCell>
                    <TableCell className="py-2 align-top">
                      <RoadUsersGroup
                        overall={roadUsers.overall}
                        values={roadUsers.values}
                      />
                    </TableCell>
                    <TableCell className="py-2 align-top">
                      <BusinessGroup
                        overall={business.overall}
                        values={business.values}
                      />
                    </TableCell>
                    <TableCell className="align-top">
                      <div>
                        <div className="text-xs text-gray-500">
                          Created: {new Date(scenario.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Updated: {new Date(scenario.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(scenario)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(scenario.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
       {/* Form Modal */}
       {showAddForm && (
        <DamageScenarioForm
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowAddForm(false);
            setEditingScenario(null);
          }}
          initialData={editingScenario}
          mode={mode}
        />
      )}
    </div>
  );

  

}