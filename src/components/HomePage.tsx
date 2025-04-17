import { useState } from 'react';
import { Plus, Upload, Edit2, Trash2, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import config from '../config/config';
import { projectApi, ProjectCreateRequest } from '../services/api';


// Add this near the top of your file, after the imports
console.log('BACKEND_URL from config:', config.BACKEND_URL);
console.log('Raw env variable:', import.meta.env.VITE_BACKEND_URL);

interface HomePageProps {
  onNavigateToProject: () => void;
}

type TabType = 'dashboard' | 'projects' | 'configuration' | 'library';

interface Project {
  id: string;
  name: string;
  description: string;
  riskLevel: number;
  vulnerability: number;
  status: 'Not-Started' | 'In Progress' | 'Completed';
  users: string[];
  createdOn: string;
}

export function HomePage({ onNavigateToProject }: HomePageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const { addNode } = useStore();

  // Sample projects data
  const [projects, setProjects] = useState<Project[]>([
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
      
      // Uncomment when backend is ready
      await projectApi.createProject(projectData);
      
      // For now, just simulate success
      console.log('Project created successfully (simulated)');
      
      // Navigate to the project
      onNavigateToProject();
    } catch (error) {
      console.error('Failed to create project:', error);
      // Handle error (show message to user)
    } finally {
      setIsCreating(false);
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
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Projects List */}
            <div className="overflow-x-auto">
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
                      Users
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
                        <div className="text-sm font-medium text-blue-600 cursor-pointer" onClick={onNavigateToProject}>
                          {project.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {project.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderRiskLevel(project.riskLevel)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderRiskLevel(project.vulnerability)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex -space-x-2 overflow-hidden">
                          {project.users.map((user, index) => (
                            <div
                              key={index}
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 border border-white text-xs font-medium"
                              title={user}
                            >
                              {user.charAt(0)}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.createdOn}
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
  );
}
