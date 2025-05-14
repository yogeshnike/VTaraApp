import { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { TopNav } from '../components/TopNav';
import { Sidebar } from '../components/Sidebar';
import { Canvas } from '../components/Canvas';
import { Footer } from '../components/Footer';
import { projectApi, canvasApi } from '../services/api';
import { useStore } from '../store/useStore';
import { ThreatScenariosTable } from '../components/ThreatScenariosTable';
import { DamageScenarioTable } from '../components/DamageScenarioTable';
import { ProjectStatusSelector } from '../components/ProjectStatusSelector';
import { DamageScenario } from '../types/damageScenario';



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
  const [damageScenarios, setDamageScenarios] = useState<DamageScenario[]>([]);

  const { projectId } = useParams<{ projectId: string }>();
  const location = useLocation();
  const navigate = useNavigate(); // Add this line

 // Add this line to get nodes from the store
 const nodes = useStore(state => state.nodes);

  
   // ... existing state ...
   const [currentView, setCurrentView] = useState<'canvas' | 'threatScenarios' | 'damageScenarios'>('canvas');

   // Add new state for project status
  const [projectStatus, setProjectStatus] = useState<'Not-Started' | 'In-Progress' | 'Completed'>('Not-Started');

  // Add handler for status change
  const handleStatusChange = async (newStatus: 'Not-Started' | 'In-Progress' | 'Completed') => {
    try {
      // Update in backend
      await projectApi.updateProjectStatus(projectId!, newStatus);
      // Update local state
      setProjectStatus(newStatus);
    } catch (error) {
      console.error('Failed to update project status:', error);
      // You might want to show an error toast here
    }
  };

  const handleUpdate = (updatedScenarios: DamageScenario[]) => {
    setDamageScenarios(updatedScenarios);
  };



  // Add this handler function
const handleDamageScenariosUpdate = (updatedScenarios: DamageScenario[]) => {
  setDamageScenarios(updatedScenarios);
};

// Add the handler function
const handleMenuItemClick = (itemId: string) => {
  console.log('Menu item clicked:', itemId); // For debugging
  if (itemId === 'Threat Scenarios') {
    console.log('Current nodes state:', nodes); // Add this line
    setCurrentView('threatScenarios');
  } else if (itemId === 'Item Definition') {
    setCurrentView('canvas');
  } else if (itemId === 'Damage Scenarios') {
    setCurrentView('damageScenarios');
  }
};

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
          setProjectStatus(state.projectStatus || 'Not-Started'); // Add this line

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


          // 3. Create hierarchical menu structure
          // First create menu items for groups
          const menuItems = groups.map(group => ({
            id: group.id,
            label: group.group_name,
            type: 'group' as const,
            children: []
          }));

          // Then process nodes and organize them into the hierarchy
          nodes.forEach(node => {
            const nodeMenuItem = {
              id: node.id,
              label: node.node_name,
              type: 'node' as const
            };

            if (node.group_id) {
              // If node belongs to a group, add it to that group's children
              const parentGroup = menuItems.find(item => item.id === node.group_id);
              if (parentGroup) {
                parentGroup.children = parentGroup.children || [];
                parentGroup.children.push(nodeMenuItem);
              }
            } else {
              // If node doesn't belong to a group, add it at root level
              menuItems.push(nodeMenuItem);
            }
          });


          // Set the data in the store
          setNodes(allNodes);
          setEdges(transformedEdges);
          setMenuNodes(menuItems);

          /*
          // In the loadProjectData function, update the menu nodes initialization:
          const menuNodes = nodes.map(node => ({
            id: node.id,
            label: node.node_name,
            type: node.type === 'group' ? 'group' : 'node' as 'group' | 'node',
            children: node.type === 'group' ? [] : undefined
          }));

          // After creating the initial menu items, organize them into hierarchy
          const organizedMenuNodes = menuNodes.filter(item => {
            if (item.type === 'node') {
              const node = nodes.find(n => n.id === item.id);
              if (node?.parentNode) {
                const parentMenuItem = menuNodes.find(m => m.id === node.parentNode);
                if (parentMenuItem) {
                  parentMenuItem.children = parentMenuItem.children || [];
                  parentMenuItem.children.push(item);
                  return false;
                }
              }
            }
            return true;
          });

          setMenuNodes(organizedMenuNodes);*/
        } else if (projectId) {
          // If not in state, fetch from API
          const [projectData, canvasData] = await Promise.all([
            projectApi.getProject(projectId),
            canvasApi.getCanvas(projectId)
          ]);

          setProjectName(projectData.name);
          setProjectStatus(projectData.status || 'Not-Started'); // Add this line
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

          // 6. Create hierarchical menu structure for API data
      const menuItems = groups.map(group => ({
        id: group.id,
        label: group.group_name,
        type: 'group' as const,
        children: []
      }));

      nodes.forEach(node => {
        const nodeMenuItem = {
          id: node.id,
          label: node.node_name,
          type: 'node' as const
        };

        if (node.group_id) {
          const parentGroup = menuItems.find(item => item.id === node.group_id);
          if (parentGroup) {
            parentGroup.children = parentGroup.children || [];
            parentGroup.children.push(nodeMenuItem);
          }
        } else {
          menuItems.push(nodeMenuItem);
        }
      });

          setNodes(allNodes);
          setEdges(transformedEdges);

          setMenuNodes(menuItems);
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
          onMenuItemClick={handleMenuItemClick} // Add this prop
        />
        <div
          className="flex-1 flex flex-col transition-all duration-300"
          style={{
            marginLeft: sidebarCollapsed ? '3rem' : (isMobile ? '0' : '16rem'),
            width: isMobile ? '100%' : 'auto'
          }}
        >
        <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-800">{projectName}</h1>
              <ProjectStatusSelector
                currentStatus={projectStatus}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
          <ReactFlowProvider>
            <TopNav />
            {currentView === 'canvas' ? (
              <Canvas />
            ) : currentView === 'threatScenarios' ? (
              <ThreatScenariosTable />
            ) : (
              <DamageScenarioTable
                  damageScenarios={damageScenarios}
                  onUpdate={handleUpdate}
                  mode="project"
                />
            )}
          </ReactFlowProvider>
        </div>
      </div>
      <Footer sidebarCollapsed={sidebarCollapsed} />
    </div>
  );
}
