import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LayoutDashboard, FolderKanban, Settings, Library, LogOut, Home } from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../store/useStore';

interface SidebarProps {
  onToggle: (collapsed: boolean) => void;
  isMobile?: boolean;
  isHomePage?: boolean;
  onNavigateToHome?: () => void;
}

export function Sidebar({ onToggle, isMobile = false, isHomePage = false, onNavigateToHome }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeItem, setActiveItem] = useState<string>('projects');

  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
    onToggle(isCollapsed);
  }, [isMobile, isCollapsed, onToggle]);

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

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'projects', icon: FolderKanban, label: 'Projects' },
    { id: 'configuration', icon: Settings, label: 'Configuration' },
    { id: 'library', icon: Library, label: 'Library' },
  ];

  return (
    <div
      className={clsx(
        'fixed left-0 top-0 border-r transition-all duration-300 z-20 bg-white h-screen flex flex-col',
        isCollapsed ? 'w-16' : 'w-64'
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
        'flex justify-center items-center py-4 h-32',
        isCollapsed ? 'px-4' : 'px-4'
      )}>
        {isCollapsed ? (
          <div className="text-sm font-medium text-gray-700 writing-mode-vertical transform rotate-180 ml-2">
            Vayavya Labs
          </div>
        ) : (
          <img 
            src="/vayavya-logo.svg" 
            alt="Vayavya Labs" 
            className="w-48 transition-all duration-300"
          />
        )}
      </div>

      {/* Menu Items */}
      <div className="flex-1 p-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveItem(item.id)}
            className={clsx(
              'flex items-center gap-3 w-full p-3 rounded-lg transition-colors',
              activeItem === item.id 
                ? 'bg-blue-50 text-blue-600' 
                : 'hover:bg-gray-100 text-gray-600',
              isCollapsed ? 'justify-center' : ''
            )}
          >
            <item.icon size={20} />
            {!isCollapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </button>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="p-2 border-t">
        {!isHomePage && (
          <button
            onClick={handleHomeClick}
            className={clsx(
              'flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100 text-gray-600',
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
            'flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100 text-red-600',
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
