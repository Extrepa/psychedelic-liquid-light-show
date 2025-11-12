import React from 'react';
import type { LiquidConfig } from '../types';

interface BackgroundPatternProps {
  config: LiquidConfig;
}

export const BackgroundPattern: React.FC<BackgroundPatternProps> = ({ config }) => {
  const pattern = config.backgroundPattern || 'none';
  const opacity = config.backgroundOpacity ?? 0.1;
  const scale = config.backgroundScale ?? 1;

  if (pattern === 'none') return null;

  const patternSize = 40 * scale;
  const strokeWidth = 1 * scale;

  return (
    <div 
      className="absolute inset-0 pointer-events-none" 
      style={{ opacity, zIndex: 1 }}
    >
      <svg className="w-full h-full">
        <defs>
          {/* Grid Pattern */}
          {pattern === 'grid' && (
            <pattern
              id="grid-pattern"
              x="0"
              y="0"
              width={patternSize}
              height={patternSize}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${patternSize} 0 L 0 0 0 ${patternSize}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
              />
            </pattern>
          )}

          {/* Dots Pattern */}
          {pattern === 'dots' && (
            <pattern
              id="dots-pattern"
              x="0"
              y="0"
              width={patternSize}
              height={patternSize}
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx={patternSize / 2}
                cy={patternSize / 2}
                r={2 * scale}
                fill="currentColor"
              />
            </pattern>
          )}

          {/* Radial Pattern */}
          {pattern === 'radial' && (
            <pattern
              id="radial-pattern"
              x="0"
              y="0"
              width={patternSize * 2}
              height={patternSize * 2}
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx={patternSize}
                cy={patternSize}
                r={patternSize * 0.4}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
              />
              <circle
                cx={patternSize}
                cy={patternSize}
                r={patternSize * 0.7}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
              />
            </pattern>
          )}

          {/* Hexagon Pattern */}
          {pattern === 'hexagons' && (
            <pattern
              id="hexagons-pattern"
              x="0"
              y="0"
              width={patternSize * 1.732}
              height={patternSize * 1.5}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${patternSize * 0.866},${patternSize * 0.25} 
                   L ${patternSize * 0.866},${patternSize * 0.75} 
                   L ${patternSize * 0.433},${patternSize} 
                   L 0,${patternSize * 0.75} 
                   L 0,${patternSize * 0.25} 
                   L ${patternSize * 0.433},0 Z`}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
              />
            </pattern>
          )}
        </defs>

        {/* Apply the pattern */}
        <rect
          width="100%"
          height="100%"
          fill={`url(#${pattern}-pattern)`}
          className="text-white"
        />
      </svg>
    </div>
  );
};
