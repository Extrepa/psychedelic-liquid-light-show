
import React from 'react';

interface GridOverlayProps {
  isVisible: boolean;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '2rem 2rem',
      }}
    />
  );
};