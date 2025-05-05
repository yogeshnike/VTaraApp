import React, { useState,useEffect } from 'react';
import { useStore } from '../store/useStore';
import { STRIDE_MAPPING } from '../utils/strideUtils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table'; // You might need to create these UI components
import { Edit, Trash2, Plus } from 'lucide-react';
import { Button } from './ui/button'; // Create or import a Button component

interface ThreatScenario {
  id: string;
  sno: number;
  name: string;
  type: string;
  component: string;
  asset: string;
  damageScenario: string;
  impact: 'High' | 'Medium' | 'Low';
  feasibility: 'High' | 'Medium' | 'Low';
  currentRisk: string;
  initialRisk: string;
  cybersecurityGoals: string[];
  attackTrees: string[];
  attackPath: string;
  nodeId: string; // Add this to track which node this threat belongs to
}

export function ThreatScenariosTable() {
  const threatScenarios = useStore(state => state.threatScenarios);
  const setThreatScenarios = useStore(state => state.setThreatScenarios);
  const nodes = useStore(state => state.nodes);
  
  

   // Function to get group name for a node
   const getNodeGroupName = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node?.parentNode) return 'N/A';
    
    const groupNode = nodes.find(n => n.id === node.parentNode);
    return groupNode?.data.label || 'N/A';
  };

    // Function to generate threat scenarios from nodes
    useEffect(() => {
      const generatedScenarios: ThreatScenario[] = [];
      let snoCounter = 1;
  
      console.log('Nodes changed, regenerating scenarios:', nodes);

      nodes.forEach(node => {
        if (node.type === 'default' && node.data.stride_properties) {
          console.log('Processing node:', node.data.label, node.data.stride_properties);
          
          // Iterate through the STRIDE properties object
          Object.entries(node.data.stride_properties).forEach(([strideName, strideData]) => {
            // Only create scenarios for selected STRIDE properties
            if (strideData.selected) {
              console.log('Processing selected STRIDE property:', strideName);
              const strideInfo = STRIDE_MAPPING[strideName];
              
              if (strideInfo) {
                const scenario: ThreatScenario = {
                  id: `${node.id}-${strideName}-${snoCounter}`,
                  sno: snoCounter++,
                  name: strideInfo.defaultScenario(node.data.label),
                  type: strideName.charAt(0), // Get first letter of STRIDE property
                  component: getNodeGroupName(node.id),
                  asset: node.data.label,
                  damageScenario: 'N/A',
                  impact: 'Medium',
                  feasibility: 'Medium',
                  currentRisk: 'N/A',
                  initialRisk: 'N/A',
                  cybersecurityGoals: strideInfo.defaultGoals,
                  attackTrees: strideInfo.defaultAttackTrees,
                  attackPath: strideInfo.defaultAttackPath,
                  nodeId: node.id
                };
                console.log('Generated scenario:', scenario);
                generatedScenarios.push(scenario);
              }
            }
          });
        }
      });
  

      console.log(generatedScenarios)
  
      setThreatScenarios(generatedScenarios);
    }, [nodes, setThreatScenarios]);


  const handleEdit = (id: string) => {
    // Implement edit functionality
    console.log('Edit threat scenario:', id);
  };

  const handleDelete = (id: string) => {
    // Implement delete functionality
    if (window.confirm('Are you sure you want to delete this threat scenario?')) {
      setThreatScenarios(scenarios => scenarios.filter(s => s.id !== id));
    }
  };

  const handleAdd = () => {
    // Implement add functionality
    console.log('Add new threat scenario');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Threat Scenarios</h2>
        <Button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Threat Scenario
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">S.No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Component</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Damage Scenario</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead>Feasibility</TableHead>
              <TableHead>Current Risk</TableHead>
              <TableHead>Initial Risk</TableHead>
              <TableHead>Cybersecurity Goals</TableHead>
              <TableHead>Attack Trees</TableHead>
              <TableHead>Attack Path</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {threatScenarios.map((scenario) => (
              <TableRow key={scenario.id}>
                <TableCell>{scenario.sno}</TableCell>
                <TableCell>{scenario.name}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-sm ${
                    scenario.type === 'S' ? 'bg-red-100 text-red-800' :
                    scenario.type === 'T' ? 'bg-orange-100 text-orange-800' :
                    scenario.type === 'R' ? 'bg-yellow-100 text-yellow-800' :
                    scenario.type === 'I' ? 'bg-green-100 text-green-800' :
                    scenario.type === 'D' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {scenario.type}
                  </span>
                </TableCell>
                <TableCell>{scenario.component}</TableCell>
                <TableCell>{scenario.asset}</TableCell>
                <TableCell>{scenario.damageScenario}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-sm ${
                    scenario.impact === 'High' ? 'bg-red-100 text-red-800' :
                    scenario.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {scenario.impact}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-sm ${
                    scenario.feasibility === 'High' ? 'bg-red-100 text-red-800' :
                    scenario.feasibility === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {scenario.feasibility}
                  </span>
                </TableCell>
                <TableCell>{scenario.currentRisk}</TableCell>
                <TableCell>{scenario.initialRisk}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {scenario.cybersecurityGoals.map((goal, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {goal}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {scenario.attackTrees.map((tree, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                        {tree}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{scenario.attackPath}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(scenario.id)}
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