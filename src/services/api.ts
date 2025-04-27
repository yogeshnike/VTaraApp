import config from '../config/config';
import { StridePropertiesJSON } from '../constants/stride';

/**
 * API Service
 * 
 * Provides methods for interacting with the backend API.
 */

// Log the backend URL for debugging
console.log('API Service initialized with backend URL:', config.BACKEND_URL);

// Error class for API errors
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Base API request function with error handling
async function apiRequest<T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: any
): Promise<T> {
  const url = `${config.BACKEND_URL}${endpoint}`;
  
  // Log the full URL being requested for debugging
  console.log(`Making ${method} request to: ${url}`);
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      // Add authorization headers here when authentication is implemented
    },
    body: data ? JSON.stringify(data) : undefined,
  };
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.API_TIMEOUT);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `API request failed with status ${response.status}`,
        response.status
      );
    }
    
    // For 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      500
    );
  }
}

// Project related API interfaces
export interface ProjectCreateRequest {
  name: string;
  description: string;
  created_by: string;
  start_date: string; // YYYY-MM-DD format
  end_date?: string; // Optional, YYYY-MM-DD format
  status: 'Not-Started' | 'In Progress' | 'Completed';
  overall_risk: number;
  max_vulnerability: number;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  created_by: string;
  start_date: string;
  end_date?: string;
  status: string;
  overall_risk: number;
  max_vulnerability: number;
  created_at: string;
  updated_at: string;
}

// Project API methods
export const projectApi = {
  // Create a new project
  createProject: (projectData: ProjectCreateRequest): Promise<ProjectResponse> => {
    console.log('Creating project with data:', projectData);
    return apiRequest<ProjectResponse>('/projects', 'POST', projectData);
  },
  
  // Get all projects
  getProjects: (): Promise<ProjectResponse[]> => {
    console.log('Fetching all projects');
    return apiRequest<ProjectResponse[]>('/projects');
  },
  
  // Get a specific project by ID
  getProject: (projectId: string): Promise<ProjectResponse> => {
    console.log(`Fetching project with ID: ${projectId}`);
    return apiRequest<ProjectResponse>(`/projects/${projectId}`);
  },
  
  // Update a project
  updateProject: (projectId: string, projectData: Partial<ProjectCreateRequest>): Promise<ProjectResponse> => {
    console.log(`Updating project ${projectId} with data:`, projectData);
    return apiRequest<ProjectResponse>(`/projects/${projectId}`, 'PUT', projectData);
  },
  
  // Delete a project
  deleteProject: (projectId: string): Promise<void> => {
    console.log(`Deleting project with ID: ${projectId}`);
    return apiRequest<void>(`/projects/${projectId}`, 'DELETE');
  }
};

interface NodeCreateData {
  project_id: string;
  node_name: string;
  node_description: string;
  x_pos: number;
  y_pos: number;
  stride_properties: string[];
  group_id?: string;
}

interface NodeUpdateData {
  node_name: string;
  node_description: string;
  stride_properties: StridePropertiesJSON;
}

interface NodeResponse {
  id: string;
  node_name: string;
  x_pos: number;
  y_pos: number;
  group_id: string | null;
}

export const nodeApi = {
  createNode: async (project_id: string, nodedata: NodeCreateData): Promise<NodeResponse> => {
    console.log('Creating node with data:', nodedata);
    /*const response = await fetch(`${API_BASE_URL}/api/nodes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create node');
    }*/

    return apiRequest<NodeResponse>(`/${project_id}/nodes`, 'POST', nodedata);

    //return response.json();
  },
  updateNode: async (project_id: string, node_id: string, nodeData: NodeUpdateData): Promise<NodeResponse> => {
    console.log('Updating node with data:', nodeData);
    return apiRequest<NodeResponse>(
      `/${project_id}/nodes/${node_id}`,
      'PUT',
      nodeData
    );
  },
  updateNodeGroup: async (project_id: string, node_id: string, group_id: string | null): Promise<NodeResponse> => {
    console.log('Updating node group:', { node_id, group_id });
    return apiRequest<NodeResponse>(
      `/${project_id}/nodes/${node_id}/group`,
      'PUT',
      { group_id }
    );
  },
  deleteNode: async (project_id: string, node_id: string): Promise<void> => {
    console.log('Deleting node:', node_id);
    return apiRequest<void>(
      `/${project_id}/nodes/${node_id}`,
      'DELETE'
    );
  },
};

// Add group interfaces
interface GroupCreateRequest {
  id: string;
  group_name: string;
  project_id: string;
  parent_group_id?: string;
}

interface GroupUpdateRequest {
  group_name: string;
}

interface GroupResponse {
  id: string;
  group_name: string;
  project_id: string;
  parent_group_id?: string;
  created_at: string;
  updated_at: string;
}

// Add group API methods to existing api object
export const groupApi = {
  // Create a new group
  createGroup: async (project_id: string, groupData: GroupCreateRequest): Promise<GroupResponse> => {
    console.log('Creating group with data:', groupData);
    return apiRequest<GroupResponse>(
      `/${project_id}/groups`,
      'POST',
      groupData
    );
  },

  // Update an existing group
  updateGroup: async (project_id: string, group_id: string, groupData: GroupUpdateRequest): Promise<GroupResponse> => {
    console.log('Updating group with data:', groupData);
    return apiRequest<GroupResponse>(
      `/${project_id}/groups/${group_id}`,
      'PUT',
      groupData
    );
  },

  // Delete a group
  deleteGroup: async (project_id: string, group_id: string): Promise<void> => {
    console.log('Deleting group:', group_id);
    return apiRequest<void>(
      `/${project_id}/groups/${group_id}`,
      'DELETE'
    );
  }
};


interface EdgeCreateRequest {
  source_node_id: string;
  target_node_id: string;
  edge_label: string;
}

interface EdgeUpdateRequest {
  edge_label: string;
}

interface EdgeResponse {
  id: string;
  source_node_id: string;
  target_node_id: string;
  edge_label: string;
}

export const edgeApi = {
  createEdge: async (project_id: string, edgeData: EdgeCreateRequest): Promise<EdgeResponse> => {
    return apiRequest<EdgeResponse>(
      `/${project_id}/edges`,
      'POST',
      edgeData
    );
  },

  updateEdge: async (project_id: string, edge_id: string, edgeData: EdgeUpdateRequest): Promise<EdgeResponse> => {
    return apiRequest<EdgeResponse>(
      `/${project_id}/edges/${edge_id}`,
      'PUT',
      edgeData
    );
  },
};