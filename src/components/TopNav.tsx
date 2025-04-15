import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Ribbon } from './Ribbon';

const menuItems = [
  'Item Definition',
  'Damage Scenarios',
  'Threat Scenarios',
  'Attack Path',
  'Cybersecurity',
  'Risk Determination & Treatment'
];

export function TopNav() {
  const [activeItem, setActiveItem] = useState('Item Definition');
  const [showRibbon, setShowRibbon] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--top-nav-height',
      '48px'
    );
    document.documentElement.style.setProperty(
      '--ribbon-height',
      showRibbon ? '40px' : '0px'
    );
  }, [showRibbon]);

  const handleMenuClick = (item: string) => {
    setActiveItem(item);
    if (activeItem === item) {
      setShowRibbon(!showRibbon);
    } else {
      setShowRibbon(true);
    }
  };

  return (
    <div className="sticky top-0 z-10">
      <div className="bg-white border-b">
        <div className="flex items-center px-4">
          {menuItems.map((item) => (
            <button
              key={item}
              onClick={() => handleMenuClick(item)}
              className={`px-4 py-2 text-sm font-medium relative ${
                activeItem === item
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-1">
                {item}
                {activeItem === item ? (
                  showRibbon ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      {showRibbon && <Ribbon activeItem={activeItem} />}
    </div>
  );
}
