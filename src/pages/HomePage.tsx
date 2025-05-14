import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Edit2, Trash2, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import config from '../config/config';
import {projectApi, ProjectCreateRequest, ProjectResponse, canvasApi} from '../services/api';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { ProjectsTab } from '../components/ProjectsTab';
import { useEffect } from 'react';

import { DashboardTab } from '../components/DashboardTab';
import { ConfigurationTab } from '../components/ConfigurationTab';


type TabType = 'dashboard' | 'projects' | 'configuration' | 'library';

interface Project {
  id: string;
  name: string;
  description: string;
  overall_risk: number;
  max_vulnerability: number;
  status: 'Not-Started' | 'In Progress' | 'Completed';
  created_by: string;
  created_at: string;
  updated_at: string;
  start_date: string;
  end_date: string | null;
}

export function HomePage() {

  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { addNode } = useStore();



  
  // Fetch projects when component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await projectApi.getProjects();
        
        // Ensure response is an array before mapping
        if (Array.isArray(response)) {
          const transformedProjects = response.map(project => ({
            id: project.id,
            name: project.name,
            description: project.description,
            overall_risk: project.overall_risk,
            max_vulnerability: project.max_vulnerability,
            status: project.status,
            created_by: project.created_by,
            created_at: new Date(project.created_at).toLocaleDateString(),
            updated_at: project.updated_at,
            start_date: project.start_date,
            end_date: project.end_date
          }));
          setProjects(transformedProjects);
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
        console.error('Error fetching projects:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);


  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  // In your tab content rendering section, replace with:
const renderTabContent = () => {
  switch (activeTab) {
    case 'dashboard':
      return <DashboardTab />;
    case 'projects':
      return (
        <ProjectsTab
          projects={projects}
          isLoading={isLoading}
          error={error}
          setProjects={setProjects}
        />
      );
    case 'configuration':
      return <ConfigurationTab />;
    case 'library':
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-700">Coming Soon</h3>
            <p className="text-gray-500 mt-2">
              The library section is currently under development.
            </p>
          </div>
        </div>
      );
    default:
      return null;
  }
};

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 relative">
        <Sidebar 
          onToggle={handleSidebarToggle} 
          isMobile={isMobile} 
          isHomePage={true}
          onNavigateToHome={() => {}}
        />
        <div 
          className="flex-1 flex flex-col transition-all duration-300"
          style={{ 
            marginLeft: sidebarCollapsed ? '3rem' : (isMobile ? '0' : '16rem'),
            width: isMobile ? '100%' : 'auto'
          }}
        >
          <div className="flex flex-col h-full">
            {/* App Title */}
            <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-blue-600">TaraApp</h1>
            </div>
            
            {/* Tabs */}
            <div className="bg-white border-b">
              <div className="flex">
                {(['dashboard', 'projects', 'configuration', 'library'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === tab
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="flex-1 bg-gray-50 p-6 overflow-auto">
              {renderTabContent()}
              
            </div>
          </div>
        </div>
      </div>
      <Footer sidebarCollapsed={sidebarCollapsed} />
    </div>
  );
}
