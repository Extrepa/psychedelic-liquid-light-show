import React from 'react';
import type { LiquidConfig } from '../types';

interface DimmerSliderProps {
  config: LiquidConfig;
  updateConfig: (cfg: Partial<LiquidConfig>) => void;
}

export const DimmerSlider: React.FC<DimmerSliderProps> = ({ config, updateConfig }) => {
  const value = config.sceneBrightness ?? 1.0;
  return (
    <div className="fixed right-2 top-1/2 -translate-y-1/2 z-[3500] flex flex-col items-center gap-2 p-2 bg-gray-900/70 border border-gray-700/50 rounded-xl backdrop-blur-md shadow-2xl">
      <div className="text-[10px] text-gray-300">Lights</div>
      <input
        type="range"
        min={0.6}
        max={2.0}
        step={0.05}
        value={value}
        onChange={e=>updateConfig({ sceneBrightness: parseFloat(e.target.value) })}
        className="h-28 w-4 accent-purple-500 rotate-[-90deg] origin-center"
        style={{ writingMode: 'bt-lr' as any }}
        aria-label="Ambient brightness"
        title="Ambient brightness"
      />
    </div>
  );
};
