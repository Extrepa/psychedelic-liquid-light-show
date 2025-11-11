
import React from 'react';

export const BackgroundGradient: React.FC = () => {
  return (
    <div
      className="absolute inset-0 -z-10"
      style={{
        position: 'absolute', inset: 0, zIndex: -1,
        background: 'linear-gradient(270deg, #0f0c29, #302b63, #24243e, #0f0c29)',
        backgroundSize: '400% 400%',
        animation: 'gradient-shift 30s ease infinite',
      }}
    />
  );
};