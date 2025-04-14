import { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'project'>('home');
  
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

  const navigateToProject = () => {
    setCurrentPage('project');
  };

  const navigateToHome = () => {
    setCurrentPage('home');
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 relative">
        <Sidebar 
          onToggle={handleSidebarToggle} 
          isMobile={isMobile} 
          isHomePage={currentPage === 'home'}
          onNavigateToHome={navigateToHome}
        />
        <div 
          className="flex-1 flex flex-col transition-all duration-300"
          style={{ 
            marginLeft: sidebarCollapsed ? '3rem' : (isMobile ? '0' : '16rem'),
            width: isMobile ? '100%' : 'auto'
          }}
        >
          {currentPage === 'home' ? (
            <HomePage onNavigateToProject={navigateToProject} />
          ) : (
            <>
              <TopNav />
              <Canvas />
            </>
          )}
        </div>
      </div>
      <Footer sidebarCollapsed={sidebarCollapsed} />
    </div>
  );
}

export default App;
