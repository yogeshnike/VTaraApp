import React from 'react';

interface FooterProps {
  sidebarCollapsed: boolean;
}

export function Footer({ sidebarCollapsed }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer 
      className="relative border-t py-3 px-4 text-sm text-gray-600 z-10"
      style={{ 
        marginLeft: sidebarCollapsed ? '3rem' : '16rem'
      }}
    >
      <div 
        className="absolute top-0 left-0 h-[1px] bg-gray-200 transition-all duration-300"
        style={{ width: '100%' }}
      />
      <div className="relative z-0 text-right text-xs sm:text-sm">
        © {currentYear} Vayavya Labs Pvt. Ltd. All rights reserved
      </div>
    </footer>
  );
}
