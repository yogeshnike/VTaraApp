import { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useParams, useLocation } from 'react-router-dom';
import { TopNav } from '../components/TopNav';
import { Sidebar } from '../components/Sidebar';
import { Canvas } from '../components/Canvas';
import { Footer } from '../components/Footer';
import { projectApi } from '../services/api';



interface ProjectPageProps {
  projectId?: string;
}

interface ProjectState {
  projectName: string;
  projectId: string;
}

export function ProjectPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [projectName, setProjectName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    
    // Check on initial load
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  // Load project data
  useEffect(() => {
    const loadProjectData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // First check if we have the project name in the location state
        const state = location.state as ProjectState;
        console.log('State:', state);
        if (state?.projectName) {
          setProjectName(state.projectName);
        } else if (projectId) {
          // If not in state, fetch from API
          const projectData = await projectApi.getProject(projectId);
          setProjectName(projectData.name);
        }
      } catch (error) {
        console.error('Failed to load project:', error);
        setError('Failed to load project details');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [projectId, location.state]);


  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-gray-600">Loading project...</div>
    </div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-red-600">{error}</div>
    </div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 relative">
        <Sidebar 
          onToggle={handleSidebarToggle} 
          isMobile={isMobile} 
          isHomePage={false}
          onNavigateToHome={() => {}}
          projectName={projectName}  
        />
        <div 
          className="flex-1 flex flex-col transition-all duration-300"
          style={{ 
            marginLeft: sidebarCollapsed ? '3rem' : (isMobile ? '0' : '16rem'),
            width: isMobile ? '100%' : 'auto'
          }}
        >
          <ReactFlowProvider>
            <TopNav />
            <Canvas />
          </ReactFlowProvider>
        </div>
      </div>
      <Footer sidebarCollapsed={sidebarCollapsed} />
    </div>
  );
}
