import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="relative group flex items-center justify-center">
      {children}
      <div className="absolute bottom-full mb-2 w-max max-w-xs px-3 py-1.5 text-xs font-semibold text-white bg-gray-900/80 backdrop-blur border border-gray-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none -translate-x-1/2 left-1/2 z-50">
        {text}
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-700"></div>
      </div>
    </div>
  );
};