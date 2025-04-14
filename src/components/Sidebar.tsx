import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText, Bomb, Shield, Target, BarChart2, ClipboardList, ChevronDown, Home, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../store/useStore';

interface SidebarProps {
  onToggle: (collapsed: boolean) => void;
  isMobile?: boolean;
  isHomePage?: boolean;
  onNavigateToHome?: () => void;
}

export function Sidebar({ onToggle, isMobile = false, isHomePage = false, onNavigateToHome }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [expandedItem, setExpandedItem] = useState<string | null>('Item Definition');
  const menuNodes = useStore(state => state.menuNodes);

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

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
    // Handle logout logic here
    console.log('User logged out');
    // Typically would clear auth tokens and redirect to login page
  };

  const menuItems = [
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

      {/* Logo Section */}
      <div className={clsx(
        'flex justify-center items-center py-4',
        isCollapsed ? 'px-1' : 'px-4'
      )}>
        <img 
          src="/vayavya-logo.svg" 
          alt="Vayavya Labs" 
          className={clsx(
            'transition-all duration-300',
            isCollapsed ? 'w-10' : 'w-48'
          )}
        />
      </div>

      {/* Space between logo and menu items */}
      <div className="h-4"></div>

      {/* Menu Items - with flex-1 to push bottom buttons down */}
      <div className="p-2 overflow-y-auto flex-1">
        {!isHomePage && menuItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
              className={clsx(
                'flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded',
                expandedItem === item.id && 'bg-gray-100'
              )}
            >
              <item.icon size={20} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left text-sm">{item.id}</span>
                  {item.subItems && item.subItems.length > 0 && <ChevronDown size={16} />}
                </>
              )}
            </button>
            {!isCollapsed && expandedItem === item.id && item.subItems && item.subItems.length > 0 && (
              <div className="ml-8 mt-1">
                {item.subItems.map((subItem) => (
                  <button
                    key={subItem}
                    className="flex items-center gap-2 w-full p-2 text-sm hover:bg-gray-100 rounded"
                  >
                    {subItem}
                  </button>
                ))}
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
            <Home size={20} />
            {!isCollapsed && <span className="text-sm">Back to Home</span>}
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
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );
}
