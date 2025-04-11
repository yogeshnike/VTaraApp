import { useState } from 'react';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { Footer } from './components/Footer';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="h-screen flex flex-col">
      <TopNav />
      <div className="flex flex-1 relative">
        <Sidebar onToggle={handleSidebarToggle} />
        <div 
          className="flex-1 transition-all duration-300"
          style={{ marginLeft: sidebarCollapsed ? '3rem' : '16rem' }}
        >
          <Canvas />
        </div>
      </div>
      <Footer sidebarCollapsed={sidebarCollapsed} />
    </div>
  );
}

export default App;
