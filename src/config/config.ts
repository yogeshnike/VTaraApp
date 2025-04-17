/**
 * Application Configuration
 * 
 * This file contains configuration settings for the application.
 * Update the BACKEND_URL to point to your API server.
 */

// Log environment variables for debugging
console.log('Environment variables:', {
    VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL
  });
  
  interface Config {
    BACKEND_URL: string;
    API_TIMEOUT: number;
    DEFAULT_USER_ID: string; // Temporary until auth is implemented
  }
  
  const config: Config = {
    // Backend API URL - Change this to your actual backend URL
    BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api',
    
    // API request timeout in milliseconds
    API_TIMEOUT: 30000,
    
    // Default user ID (temporary until authentication is implemented)
    DEFAULT_USER_ID: 'user-1',
  };
  
  // Log the final config for debugging
  console.log('Application config:', config);
  
  export default config;
