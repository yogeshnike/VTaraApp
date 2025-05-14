import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { configurationApi } from '../services/api';

type TabType = 'attack-damage' | 'cybersecurity' | 'catalogs';

interface CatalogSection {
  title: string;
  description: string;
  itemCount: number;
  path?: string; // Add this to support navigation
}

export function ConfigurationViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('catalogs');
  const [configuration, setConfiguration] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfiguration();
  }, [id]);

  // Add a handler for section clicks
  const handleSectionClick = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  const loadConfiguration = async () => {
    try {
      setIsLoading(true);
      const data = await configurationApi.getConfiguration(id!);
      setConfiguration(data);
    } catch (error) {
      console.error('Failed to load configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const catalogSections: CatalogSection[] = [
    {
      title: 'Security Requirements',
      description: 'Manage and view security requirements for your configuration',
      itemCount: 0
    },
    {
      title: 'Functions',
      description: 'Define and manage functional requirements',
      itemCount: 0
    },
    {
      title: 'Damage Scenarios',
      description: 'View and manage potential damage scenarios',
      itemCount: 0,
      path: `/configuration/${id}/damage-scenarios` // Add path for navigation
    },
    {
      title: 'Goals Catalog',
      description: 'Define and track security goals',
      itemCount: 0
    }
  ];

  const ComingSoonMessage = () => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-700">Coming Soon</h3>
        <p className="text-gray-500 mt-2">This feature is currently under development.</p>
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }


    // Update the catalog sections rendering to handle clicks
  const RenderCatalogSections = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {catalogSections.map((section) => (
          <div
            key={section.title}
            className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 ${
              section.path ? 'cursor-pointer' : ''
            }`}
            onClick={() => handleSectionClick(section.path)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {section.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {section.description}
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {section.itemCount} items
                </span>
              </div>
              {section.path && (
                <div className="mt-4">
                  <span className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View Details →
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft size={20} />
              <span>Back</span>
            </button>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              {configuration?.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('attack-damage')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'attack-damage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Attack & Damage Scenarios
            </button>
            <button
              onClick={() => setActiveTab('cybersecurity')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cybersecurity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cybersecurity Property
            </button>
            <button
              onClick={() => setActiveTab('catalogs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'catalogs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Catalogs
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'attack-damage' && <ComingSoonMessage />}
        {activeTab === 'cybersecurity' && <ComingSoonMessage />}
        {activeTab === 'catalogs' && <RenderCatalogSections />}
      </div>
    </div>
  );
}