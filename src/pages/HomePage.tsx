import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Edit2, Trash2, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import config from '../config/config';
import { projectApi, ProjectCreateRequest, ProjectResponse } from '../services/api';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';

import { useEffect } from 'react';


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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { addNode } = useStore();

  // Sample projects data
  /*const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Vehicle Security Assessment',
      description: 'Comprehensive security assessment for connected vehicles',
      riskLevel: 4,
      vulnerability: 3,
      status: 'In Progress',
      users: ['John D.', 'Sarah M.'],
      createdOn: '2023-10-15'
    },
    {
      id: '2',
      name: 'IoT Device Certification',
      description: 'Security certification for IoT devices',
      riskLevel: 2,
      vulnerability: 1,
      status: 'Completed',
      users: ['Mike T.'],
      createdOn: '2023-09-22'
    },
    {
      id: '3',
      name: 'Smart Home System',
      description: 'Risk assessment for smart home ecosystem',
      riskLevel: 3,
      vulnerability: 4,
      status: 'Not-Started',
      users: ['Emily R.', 'David K.', 'Lisa P.'],
      createdOn: '2023-11-01'
    }
  ]);
  */

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

  const navigateToProject = (projectId?: string) => {
    navigate(projectId ? `/project/${projectId}` : '/project');
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) return;
    
    setIsCreating(true);
    
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      const projectData: ProjectCreateRequest = {
        name: projectName,
        description: projectDescription,
        created_by: config.DEFAULT_USER_ID,
        start_date: today,
        status: 'Not-Started',
        overall_risk: 0,
        max_vulnerability: 0
      };
      
      console.log('Creating project with data:', projectData);
       // Try to create project with API
    const response = await projectApi.createProject(projectData);
    
    console.log('Response:', response);
    // Assuming the API returns the created project with an id
    const createdProject = response;


    
    // Add to local state
    setProjects([...projects, {
      id: createdProject.id,
      name: projectName,
      description: projectDescription,
      riskLevel: 0,
      vulnerability: 0,
      status: 'Not-Started',
      users: [config.DEFAULT_USER_ID],
      createdOn: today
    }]);

    // Navigate to the project page with state
    navigate(`/project/${createdProject.id}`, {
      state: {
        projectName: projectName,
        projectId: createdProject.id
      }
    });

    } catch (error) {
      // Show error message to user
    const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
    // You'll need to implement a toast or alert system to show this message
    alert(errorMessage); // Replace this with your preferred error display method
      // Handle error (show message to user)
    } finally {
      setIsCreating(false);
      setShowCreateForm(false);
    }
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const renderRiskLevel = (level: number) => {
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < level ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
          />
        ))}
        <span className="ml-1">{level}/5</span>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not-Started': return 'bg-gray-200 text-gray-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
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
              {activeTab === 'projects' ? (
                <div className="bg-white rounded-lg shadow">
                  {/* Projects Header */}
                  <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-medium">Projects</h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center"
                      >
                        <Plus size={16} className="mr-1" />
                        New Project
                      </button>
                      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm flex items-center">
                        <Upload size={16} className="mr-1" />
                        Import
                      </button>
                    </div>
                  </div>
                  
                  {/* Create Project Form */}
                  {showCreateForm && (
                    <div className="p-6 border-b bg-gray-50">
                      <h3 className="text-lg font-medium mb-4">Create New Project</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project Name
                          </label>
                          <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter project name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter project description"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setShowCreateForm(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleCreateProject}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                            disabled={isCreating}
                          >
                            {isCreating ? 'Creating...' : 'Create'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Projects List */}
                  <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">Loading projects...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-red-500">{error}</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No projects found. Create a new project to get started.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overall Risk
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Max Vulnerability
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created On
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="text-sm font-medium text-blue-600 cursor-pointer" 
                          onClick={() => navigateToProject(project.id)}
                        >
                          {project.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {project.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderRiskLevel(project.overall_risk)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderRiskLevel(project.max_vulnerability)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.created_by}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.created_at}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-700">Coming Soon</h3>
                    <p className="text-gray-500 mt-2">
                      The {activeTab} section is currently under development.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer sidebarCollapsed={sidebarCollapsed} />
    </div>
  );
}
