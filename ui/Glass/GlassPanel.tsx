import React from 'react';

interface GlassPanelProps {
  className?: string;
  children: React.ReactNode;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({ className = '', children }) => {
  return (
    <div className={`bg-gray-900/80 backdrop-blur-md border border-gray-700/60 rounded-2xl shadow-2xl ${className}`}>
      {children}
    </div>
  );
};
