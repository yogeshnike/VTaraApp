import { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { TopNav } from '../components/TopNav';
import { Sidebar } from '../components/Sidebar';
import { Canvas } from '../components/Canvas';
import { Footer } from '../components/Footer';
import { projectApi, canvasApi } from '../services/api';
import { useStore } from '../store/useStore';


interface ProjectPageProps {
  projectId?: string;
}

interface ProjectState {
  projectName: string;
  projectId: string;
  canvasData: {
    nodes: any[];
    edges: any[];
    groups: any[];
  };
}

export function ProjectPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [projectName, setProjectName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const navigate = useNavigate(); // Add this line


  // Get store actions
  const {
    setNodes,
    setEdges,
    setMenuNodes,
    clearStore
  } = useStore();

  // Load project data
  useEffect(() => {
    const loadProjectData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Clear existing store data
        clearStore();

        // First check if we have the data in location state
        const state = location.state as ProjectState;
        if (state?.projectName && state?.canvasData) {
          setProjectName(state.projectName);

          // Initialize store with canvas data
          const { nodes, edges, groups } = state.canvasData;

          console.log(nodes)

          // Transform nodes and groups to the correct format
          const allNodes = [
            ...groups.map(group => ({
              ...group,
              type: 'group',
              // Add position object for groups as well
              position: {
                x: group.x_pos || 0, // Provide default values in case they're missing
                y: group.y_pos || 0
              },
              data: {
                ...group,
                label: group.group_name,
                childNodes: []
              },
              // Add style object with width and height
              style: {
                width: group.width || 300,  // Use backend width or default to 300
                height: group.height || 200, // Use backend height or default to 200
                pointerEvents: 'all'
              }
            })),
            ...nodes.map(node => ({
              ...node,
              type: 'default',
              // Add position object required by React Flow
              position: {
                x: node.x_pos,
                y: node.y_pos
              },
              data: {
                ...node,
                label: node.node_name,
                description: node.node_description,
                // Convert stride_properties from JSONB to array format for the form
                properties: Object.entries(node.stride_properties || {})
                .filter(([_, value]) => value.selected)
                .map(([key]) => key),
                stride_properties: node.stride_properties // Keep the original JSONB too
              },
              draggable: true,
              parentNode: node.group_id
            })),

          ];

          console.log(allNodes)

          // Transform edges to the correct format
          const transformedEdges = edges.map(edge => ({
            ...edge,
            source: edge.source_node_id,
            target: edge.target_node_id,
            sourceHandle: edge.source_handle, // Add this
            targetHandle: edge.target_handle, // Add this
            // Add the data object with the label
            data: {
              label: edge.edge_label || ''
            },
            type: 'smoothstep'
          }));

          // Set the data in the store
          setNodes(allNodes);
          setEdges(transformedEdges);

          // Create menu nodes from node names
          const menuNodeNames = nodes.map(node => node.node_name);
          setMenuNodes(menuNodeNames);

        } else if (projectId) {
          // If not in state, fetch from API
          const [projectData, canvasData] = await Promise.all([
            projectApi.getProject(projectId),
            canvasApi.getCanvas(projectId)
          ]);

          setProjectName(projectData.name);

          // Initialize store with canvas data (same transformation as above)
          const { nodes, edges, groups } = canvasData;

          const allNodes = [
            ...groups.map(group => ({
              ...group,
              type: 'group',
              position: {
                x: group.x_pos || 0,
                y: group.y_pos || 0
              },
              data: {
                ...group,
                label: group.group_name
              },
              style: {
                width: group.width || 300,  // Use backend width or default to 300
                height: group.height || 200, // Use backend height or default to 200
                pointerEvents: 'all'
              }
            })),
            ...nodes.map(node => ({
              ...node,
              type: 'default',
              data: {
                ...node,
                label: node.node_name,
                description: node.node_description,
                // Convert stride_properties from JSONB to array format for the form
                properties: Object.entries(node.stride_properties || {})
                  .filter(([_, value]) => value.selected)
                  .map(([key]) => key),
                stride_properties: node.stride_properties // Keep the original JSONB too
              },
              draggable: true,
              parentNode: node.group_id
            })),
           
          ];

          const transformedEdges = edges.map(edge => ({
            ...edge,
            source: edge.source_node_id,
            target: edge.target_node_id,
            sourceHandle: edge.source_handle,  // Add this
            targetHandle: edge.target_handle,  // Add this
            type: 'smoothstep',
            data: {
              label: edge.edge_label || ''
            },
            style: edge.style || { stroke: '#2563eb', strokeWidth: 2 },  // Add this
            markerEnd: {  // Add this
              type: 'arrowclosed',
              width: 20,
              height: 20,
              color: '#2563eb',
            }
          }));

          setNodes(allNodes);
          setEdges(transformedEdges);

          const menuNodeNames = nodes.map(node => node.node_name);
          setMenuNodes(menuNodeNames);
        }
      } catch (error) {
        console.error('Failed to load project:', error);
        setError('Failed to load project details');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [projectId, location.state, setNodes, setEdges, setMenuNodes, clearStore]);

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
  /* useEffect(() => {
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
   */


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
          onNavigateToHome={() => { navigate('/home') }}
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
