import config from '../config/config';

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
