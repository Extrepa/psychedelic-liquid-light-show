
import React from 'react';

interface ActionPanelProps {
  position: 'bottom-left' | 'bottom-right';
  children: React.ReactNode;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ position, children }) => {
  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div className={`absolute z-30 ${positionClasses[position]}`}>
      <div className="flex items-center gap-2 p-1 bg-gray-900/70 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl">
        {children}
      </div>
    </div>
  );
};
