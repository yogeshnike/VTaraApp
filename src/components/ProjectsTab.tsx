import React, { useState, useEffect } from 'react';
import { Plus, Upload, Edit2, Trash2, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { projectApi, ProjectCreateRequest, ProjectResponse, canvasApi,configurationApi } from '../services/api';
import config from '../config/config';

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
  config_id: string; // Add this field
}

interface Configuration {
  id: string;
  name: string;
  created_at: string;
}

export function ProjectsTab({ projects, isLoading, error, setProjects }) {

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const navigate = useNavigate();


  // Add useEffect to fetch configurations when form is opened
  useEffect(() => {
    if (showCreateForm) {
      fetchConfigurations();
    }
  }, [showCreateForm]);


  // Add function to fetch configurations
  const fetchConfigurations = async () => {
    try {
      //const response = configurationApi.getConfiguration();
      const data = await configurationApi.getConfigurations();
      setConfigurations(data);
      // Set first configuration as default if available
      if (data.length > 0) {
        setSelectedConfigId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch configurations:', error);
      alert('Failed to load configurations. Please try again.');
    }
  };


  // Move all the project-related functions here
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim() || !selectedConfigId) {
      alert('Please fill in all required fields');
      return;
    }
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
        max_vulnerability: 0,
        config_id: selectedConfigId // Add the selected configuration ID
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
        createdOn: today,
        config_id: selectedConfigId // Add the configuration ID to the project
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
      // Reset form
      setProjectName('');
      setProjectDescription('');
      setSelectedConfigId('');
    }
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const navigateToProject = async (projectId?: string) => {
    try {
      // First get the project details
      const projectData = await projectApi.getProject(projectId);

      // Then get the canvas data (nodes, edges, groups)
      const canvasData = await canvasApi.getCanvas(projectId);

      // Navigate to project page with all necessary data
      navigate(`/project/${projectId}`, {
        state: {
          projectName: projectData.name,
          projectId: projectId,
          canvasData: canvasData
        }
      });
    } catch (error) {
      console.error('Error loading project:', error);
      alert('Failed to load project. Please try again.');
    }
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

  // ... other helper functions ...

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Copy the projects section from HomePage */}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Configuration <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedConfigId}
                  onChange={(e) => setSelectedConfigId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a configuration</option>
                  {configurations.map(config => (
                    <option key={config.id} value={config.id}>
                      {config.name}
                    </option>
                  ))}
                </select>
                {configurations.length === 0 && (
                  <p className="mt-1 text-sm text-red-500">
                    No configurations available. Please create a configuration first.
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => { setShowCreateForm(false);
                    setProjectName('');
                    setProjectDescription('');
                    setSelectedConfigId('');
                  }}
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
    </div>
  );
}