import { useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, Bomb, Shield, Target, BarChart2, ClipboardList, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../store/useStore';

interface SidebarProps {
  onToggle: (collapsed: boolean) => void;
}

export function Sidebar({ onToggle }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>('Item Definition');
  const menuNodes = useStore(state => state.menuNodes);

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onToggle(newCollapsedState);
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
        'fixed left-0 border-r transition-all duration-300 z-10 bg-white',
        isCollapsed ? 'w-12' : 'w-64'
      )}
      style={{ 
        top: 'calc(var(--top-nav-height, 48px) + var(--ribbon-height, 0px))', 
        height: 'calc(100vh - var(--top-nav-height, 48px) - var(--ribbon-height, 0px))' 
      }}
    >
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-4 bg-white border rounded-full p-1 z-10"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="p-2 overflow-y-auto h-full mt-4">
        {menuItems.map((item) => (
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
    </div>
  );
}
