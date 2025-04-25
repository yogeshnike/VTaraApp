import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Bomb, 
  Shield, 
  Target, 
  BarChart2, 
  ClipboardList, 
  ChevronDown, 
  Home, 
  LogOut,
  LayoutDashboard,
  FolderKanban,
  Settings,
  Library
} from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../store/useStore';
import { StrideBadges } from './StrideBadges';

interface SidebarProps {
  onToggle: (collapsed: boolean) => void;
  isMobile?: boolean;
  isHomePage?: boolean;
  onNavigateToHome?: () => void;
  projectName?: string;  // Add this line
}

export function Sidebar({ onToggle, isMobile = false, isHomePage = false, onNavigateToHome, projectName }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(isHomePage || isMobile);
  const [expandedItem, setExpandedItem] = useState<string | null>('Item Definition');
  const menuNodes = useStore(state => state.menuNodes);

  // Add this to get nodes from the store
  const nodes = useStore(state => state.nodes);

  // Modify the subItems rendering in the menu items section
  const getNodeProperties = (nodeName: string) => {
    const node = nodes.find(n => n.data.label === nodeName);
    return node?.data.properties || [];
  };

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    } else if (isHomePage) {
      setIsCollapsed(true);
    }
  }, [isMobile, isHomePage]);

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onToggle(newCollapsedState);
  };

  const handleHomeClick = () => {
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  const handleLogout = () => {
    console.log('User logged out');
  };

  const homeMenuItems = [
    { id: 'Dashboard', icon: LayoutDashboard },
    { id: 'Projects', icon: FolderKanban },
    { id: 'Configuration', icon: Settings },
    { id: 'Library', icon: Library }
  ];

  const projectMenuItems = [
    {
      id: 'Item Definition',
      icon: FileText,
      subItems: menuNodes
    },
    { id: 'Damage Scenarios', icon: Bomb },
    { id: 'Threat Scenarios', icon: Shield },
    {
      id: 'Attack Path Analysis',
      icon: Target,
      subItems: ['Attack', 'Attack Trees']
    },
    { id: 'Goals, Claims and Requirements', icon: Target },
    { id: 'Catalogs', icon: ClipboardList },
    { id: 'Risk Determination and Risk Treatment', icon: BarChart2 },
    { id: 'Reporting', icon: ClipboardList }
  ];

  const menuItems = isHomePage ? homeMenuItems : projectMenuItems;

  return (
    <div
      className={clsx(
        'fixed left-0 top-0 border-r transition-all duration-300 z-20 bg-white h-screen flex flex-col',
        isCollapsed ? 'w-12' : 'w-64'
      )}
    >
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-4 bg-white border rounded-full p-1 z-10"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className={clsx(
        'flex flex-col justify-center items-center py-4', // Changed to flex-col
        isCollapsed ? 'px-1' : 'px-4'
      )}>
        {isCollapsed ? (
          <div className="writing-mode-vertical text-xs font-medium text-gray-700 whitespace-nowrap transform rotate-180">
            Vayavya Labs
          </div>
        ) : (
          <>
            <img 
              src="/vayavya-logo.svg" 
              alt="Vayavya Labs" 
              className="w-48"
            />
            {!isHomePage && projectName && (
              <div className="mt-4 text-lg font-semibold text-gray-800 text-center">
                {projectName}
              </div>
            )}
          </>
        )}
      </div>

      {/* Space between logo and menu items */}
      <div className="h-4"></div>

      {/* Menu Items */}
      <div className="p-2 overflow-y-auto flex-1">
        {menuItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
              className={clsx(
                'flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded mb-1',
                expandedItem === item.id && 'bg-gray-100'
              )}
            >
              <item.icon size={20} className="text-gray-600" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left text-sm font-medium text-gray-700">{item.id}</span>
                  {!isHomePage && item.subItems && item.subItems.length > 0 && (
                    <ChevronDown size={16} className="text-gray-500" />
                  )}
                </>
              )}
            </button>
            {!isHomePage && !isCollapsed && expandedItem === item.id && item.subItems && item.subItems.length > 0 && (
              <div className="ml-8 mt-1">
              {item.subItems.map((subItem) => {
                const properties = item.id === 'Item Definition' ? getNodeProperties(subItem) : [];
                
                return (
                  <div
                    key={subItem}
                    className="flex items-center justify-between w-full p-2 text-sm hover:bg-gray-100 rounded text-gray-600"
                  >
                    <span>{subItem}</span>
                    {item.id === 'Item Definition' && properties.length > 0 && (
                      <div className="ml-2">
                        <StrideBadges properties={properties} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="p-2 border-t">
        {!isHomePage && (
          <button
            onClick={handleHomeClick}
            className={clsx(
              'flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded mb-2',
              isCollapsed ? 'justify-center' : ''
            )}
          >
            <Home size={20} className="text-gray-600" />
            {!isCollapsed && <span className="text-sm font-medium text-gray-700">Back to Home</span>}
          </button>
        )}
        <button
          onClick={handleLogout}
          className={clsx(
            'flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded text-red-600',
            isCollapsed ? 'justify-center' : ''
          )}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
