import { useEffect } from 'react';

interface FooterProps {
  sidebarCollapsed: boolean;
}

export function Footer({ sidebarCollapsed }: FooterProps) {
  useEffect(() => {
    document.documentElement.style.setProperty('--footer-height', '40px');
  }, []);

  return (
    <footer 
      className="bg-white border-t py-2 px-4 text-sm text-gray-600 flex justify-between items-center"
      style={{ 
        marginLeft: sidebarCollapsed ? '3rem' : '16rem',
        transition: 'margin-left 0.3s'
      }}
    >
      <div>© {new Date().getFullYear()} Vayavya Labs. All rights reserved.</div>
      <div>Version 1.0.0</div>
    </footer>
  );
}
