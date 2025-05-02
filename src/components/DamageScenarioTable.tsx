import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { DamageScenarioForm } from './DamageScenarioForm';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


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



interface DamageScenario {
    id: string;
    name: string;
    justification: string; // Add justification to interface
    securityProperty: string;
    controlability: string;
    corporateFlag: string;
    roadUsers: {
      overall: string;
      values: {
        safety: { value: string; justification: string };
        privacy: { value: string; justification: string };
        financial: { value: string; justification: string };
        operational: { value: string; justification: string };
      };
    };
    business: {
      overall: string;
      values: {
        ip: { value: string; justification: string };
        financial: { value: string; justification: string };
        brand: { value: string; justification: string };
      };
    };
    createdAt: string;
    updatedAt: string;
  }

export function DamageScenarioTable() {
  const [damageScenarios, setDamageScenarios] = useState<DamageScenario[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingScenario, setEditingScenario] = useState<DamageScenario | null>(null);

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

  const handleEdit = (scenario: DamageScenario) => {
    setEditingScenario(scenario);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this damage scenario?')) {
      setDamageScenarios(scenarios => scenarios.filter(s => s.id !== id));
    }
  };

  const handleFormSubmit = (formData: any) => {
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
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setEditingScenario(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Damage Scenarios</h2>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Damage Scenario
        </Button>
      </div>

      {showAddForm && (
        <DamageScenarioForm
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
          initialData={editingScenario}
        />
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">S.No</TableHead> {/* Added S.No column */}
              <TableHead className="w-[200px]">Damage Scenario</TableHead> {/* Fixed width */}
              <TableHead className="w-[200px]">Justification</TableHead>
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
            {damageScenarios.map((scenario,index) => (
              <TableRow key={scenario.id}>
                 <TableCell className="text-center align-top">
                  {index + 1}
                </TableCell>
                <TableCell className="align-top">
                  <div className="w-[200px] whitespace-pre-wrap break-words text-[14px]">
                    {scenario.name}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  <div className="w-[200px] whitespace-pre-wrap break-words text-[14px]">
                    {scenario.justification}
                  </div>
                </TableCell>
                <TableCell className="align-top">{scenario.securityProperty}</TableCell>
                <TableCell className="align-top">{scenario.controlability}</TableCell>
                <TableCell className="align-top">{scenario.corporateFlag}</TableCell>
                <TableCell className="py-2 align-top">
                  <RoadUsersGroup
                    overall={scenario.roadUsers.overall}
                    values={scenario.roadUsers.values}
                  />
                </TableCell>
                <TableCell className="py-2 align-top">
                  <BusinessGroup
                    overall={scenario.business.overall}
                    values={scenario.business.values}
                  />
                </TableCell>
                <TableCell className="align-top">
                  <div>
                    <div className="text-xs text-gray-500">Created: {new Date(scenario.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">Updated: {new Date(scenario.updatedAt).toLocaleDateString()}</div>
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}