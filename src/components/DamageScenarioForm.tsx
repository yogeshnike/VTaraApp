import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { DamageScenario, DamageScenarioTableMode } from '../types/damageScenario';


interface DamageScenarioFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
  initialData?: DamageScenario | null;
  mode: DamageScenarioTableMode;
}

const SECURITY_PROPERTIES = ['N/A', 'Confidentiality(C)', 'Integrity(I)', 'Availability(A)'] as const;
const CONTROLABILITY_LEVELS = ['N/A', '1', '2', '3', '4'] as const;
const CORPORATE_FLAGS = [
  'Impact on road user safety',
  'Legal/Data Breach',
  'Certification/Emission Issue',
  'Material IP',
  'Financial Impact on Company'
] as const;
const IMPACT_LEVELS = ['N/A', 'negligible', 'moderate', 'major', 'severe'] as const;

interface ImpactValue {
  value: typeof IMPACT_LEVELS[number];
  justification: string;
}

interface RoadUsersValues {
  safety: ImpactValue;
  privacy: ImpactValue;
  financial: ImpactValue;
  operational: ImpactValue;
}

interface BusinessValues {
  ip: ImpactValue;      // Loss of intellectual property
  financial: ImpactValue; // Financial Loss of Business
  brand: ImpactValue;    // Loss of brand reputation
}

export function DamageScenarioForm({ onSubmit, onClose, initialData, mode }: DamageScenarioFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        justification: initialData?.justification || '',
        securityProperty: initialData?.securityProperty || 'N/A',
        controlability: initialData?.controlability || 'N/A',
        corporateFlag: initialData?.corporateFlag || '',
        roadUsers: {
          overall: initialData?.roadUsers?.overall || 'N/A',
          values: {
            safety: {
              value: initialData?.roadUsers?.values?.safety?.value || 'N/A',
              justification: initialData?.roadUsers?.values?.safety?.justification || ''
            },
            privacy: {
              value: initialData?.roadUsers?.values?.privacy?.value || 'N/A',
              justification: initialData?.roadUsers?.values?.privacy?.justification || ''
            },
            financial: {
              value: initialData?.roadUsers?.values?.financial?.value || 'N/A',
              justification: initialData?.roadUsers?.values?.financial?.justification || ''
            },
            operational: {
              value: initialData?.roadUsers?.values?.operational?.value || 'N/A',
              justification: initialData?.roadUsers?.values?.operational?.justification || ''
            }
          }
        },
        business: {
            overall: initialData?.business?.overall || 'N/A',
            values: {
              ip: {
                value: initialData?.business?.values?.ip?.value || 'N/A',
                justification: initialData?.business?.values?.ip?.justification || ''
              },
              financial: {
                value: initialData?.business?.values?.financial?.value || 'N/A',
                justification: initialData?.business?.values?.financial?.justification || ''
              },
              brand: {
                value: initialData?.business?.values?.brand?.value || 'N/A',
                justification: initialData?.business?.values?.brand?.justification || ''
              }
            }
          }
        });

  // Add useEffect to log the initial data and form data for debugging
  useEffect(() => {
    if (initialData) {
      console.log('Initial Data:', initialData);
      console.log('Form Data:', formData);
    }
  }, [initialData, formData]);

  // Function to calculate average impact level
  const calculateOverallImpact = (values: Record<string, ImpactValue>) => {
    const impactMap = {
      'N/A': 0,
      'negligible': 1,
      'moderate': 2,
      'major': 3,
      'severe': 4
    };

    const validValues = Object.values(values)
      .filter(item => item.value !== 'N/A')
      .map(item => item.value);

    if (validValues.length === 0) return 'N/A';

    const sum = validValues.reduce((acc, curr) => acc + impactMap[curr], 0);
    const avg = sum / validValues.length;

    if (avg === 0) return 'N/A';
    if (avg <= 1) return 'negligible';
    if (avg <= 2) return 'moderate';
    if (avg <= 3) return 'major';
    return 'severe';
  };

  // Update overall values when individual values change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      roadUsers: {
        ...prev.roadUsers,
        overall: calculateOverallImpact(prev.roadUsers.values)
      },
      business: {
        ...prev.business,
        overall: calculateOverallImpact(prev.business.values)
      }
    }));
  }, [formData.roadUsers.values, formData.business.values]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If in config mode, ensure configId is set
    
      onSubmit(formData);
    
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? 'Edit Damage Scenario' : 'Add Damage Scenario'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic fields remain the same */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Damage Scenario Name
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 p-2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

           {/* Add Justification textarea */}
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Justification
            </label>
            <textarea
              className="w-full rounded-md border border-gray-300 p-2 min-h-[100px]"
              value={formData.justification}
              onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
              placeholder="Enter justification for the damage scenario..."
            />
          </div>


          {/* Security Property */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Security Property
            </label>
            <select
              className="w-full rounded-md border border-gray-300 p-2"
              value={formData.securityProperty}
              onChange={(e) => setFormData({ ...formData, securityProperty: e.target.value })}
            >
              {SECURITY_PROPERTIES.map(prop => (
                <option key={prop} value={prop}>{prop}</option>
              ))}
            </select>
          </div>

           {/* Controlability */}
           <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Controlability
            </label>
            <select
              className="w-full rounded-md border border-gray-300 p-2"
              value={formData.controlability}
              onChange={(e) => setFormData({ ...formData, controlability: e.target.value })}
            >
              {CONTROLABILITY_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>


          {/* Corporate Flag */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corporate Flag
            </label>
            <select
              className="w-full rounded-md border border-gray-300 p-2"
              value={formData.corporateFlag}
              onChange={(e) => setFormData({ ...formData, corporateFlag: e.target.value })}
            >
              <option value="">Select a flag</option>
              {CORPORATE_FLAGS.map(flag => (
                <option key={flag} value={flag}>{flag}</option>
              ))}
            </select>
          </div>

          {/* Other basic fields... */}

          {/* Road Users Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Road Users (Overall: {formData.roadUsers.overall})
            </label>
            <div className="space-y-4">
              {Object.entries(formData.roadUsers.values).map(([key, value]) => (
                <div key={key} className="border rounded-md p-4">
                  <div className="font-medium capitalize mb-2">{key}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Impact Level</label>
                      <select
                        className="w-full rounded-md border border-gray-300 p-2"
                        value={value.value}
                        onChange={(e) => setFormData({
                          ...formData,
                          roadUsers: {
                            ...formData.roadUsers,
                            values: {
                              ...formData.roadUsers.values,
                              [key]: { ...value, value: e.target.value }
                            }
                          }
                        })}
                      >
                        {IMPACT_LEVELS.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                    <label className="block text-sm text-gray-600 mb-1">Justification</label>
                      <textarea
                        className="w-full rounded-md border border-gray-300 p-2"
                        rows={2}
                        value={value.justification}
                        onChange={(e) => setFormData({
                          ...formData,
                          roadUsers: {
                            ...formData.roadUsers,
                            values: {
                              ...formData.roadUsers.values,
                              [key]: { ...value, justification: e.target.value }
                            }
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business (Overall: {formData.business.overall})
            </label>
            <div className="space-y-4">
              {Object.entries(formData.business.values).map(([key, value]) => (
                <div key={key} className="border rounded-md p-4">
                  <div className="font-medium mb-2">
                    {key === 'ip' ? 'Intellectual Property (IP)' :
                     key === 'financial' ? 'Financial Loss of Business (F)' :
                     'Loss of Brand Reputation (B)'}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Impact Level</label>
                      <select
                        className="w-full rounded-md border border-gray-300 p-2"
                        value={value.value}
                        onChange={(e) => setFormData({
                          ...formData,
                          business: {
                            ...formData.business,
                            values: {
                              ...formData.business.values,
                              [key]: { ...value, value: e.target.value }
                            }
                          }
                        })}
                      >
                        {IMPACT_LEVELS.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Justification</label>
                      <textarea
                       className="w-full rounded-md border border-gray-300 p-2"
                       rows={2}
                       value={value.justification}
                       onChange={(e) => setFormData({
                         ...formData,
                         business: {
                           ...formData.business,
                           values: {
                             ...formData.business.values,
                             [key]: { ...value, justification: e.target.value }
                           }
                         }
                       })}
                     />
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>


          {/* Form Actions */}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {initialData ? 'Update' : 'Add'} Damage Scenario
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}