import React from 'react';
import type { LiquidConfig } from '../types';
import { Tooltip } from './Tooltip';

interface DropperProps {
  config: LiquidConfig;
  updateConfig: (newConfig: Partial<LiquidConfig>) => void;
}

export const Dropper: React.FC<DropperProps> = ({ config, updateConfig }) => {
  const phase = config.activePhase || 'oil';
  const currentPalette = phase === 'oil' ? (config.oilPalette || config.colors) : (config.waterPalette || config.colors);
  
  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-2 items-end">
      <Tooltip text="Toggle between Oil and Water droppers">
        <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-2 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 uppercase font-semibold">Dropper</span>
            <button
              onClick={() => updateConfig({ activePhase: phase === 'oil' ? 'water' : 'oil' })}
              className="relative w-16 h-8 rounded-full bg-gray-700 transition-colors"
              style={{
                background: phase === 'oil' 
                  ? 'linear-gradient(90deg, #FFB200, #D88C00)' 
                  : 'linear-gradient(90deg, #00C2FF, #0077FF)',
              }}
            >
              <div 
                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${phase === 'water' ? 'translate-x-8' : ''}`}
              />
            </button>
            <span className="text-xs text-white font-medium capitalize min-w-[40px]">{phase}</span>
          </div>
          
          {/* Current color preview */}
          <div className="mt-2 flex items-center gap-1">
            {currentPalette.slice(0, 5).map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full border border-gray-600"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </Tooltip>
    </div>
  );
};
