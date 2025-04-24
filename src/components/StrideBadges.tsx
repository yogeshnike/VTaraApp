import React from 'react';
import { STRIDE_LETTERS } from '../constants/stride';

interface StrideBadgesProps {
  properties: string[];
  size?: 'sm' | 'md' | 'lg';
}

export function StrideBadges({ properties, size = 'sm' }: StrideBadgesProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-7 h-7 text-base'
  };

  return (
    <div className="flex gap-1">
      {properties.map(prop => {
        const letter = STRIDE_LETTERS[prop as keyof typeof STRIDE_LETTERS];
        if (!letter) return null;
        
        return (
          <div 
            key={prop} 
            className={`
              ${sizeClasses[size]}
              flex items-center justify-center
              rounded-full
              bg-blue-100 text-blue-800
              font-semibold
              hover:bg-blue-200
              transition-colors
              cursor-default
            `}
            title={prop}
          >
            {letter}
          </div>
        );
      })}
    </div>
  );
}