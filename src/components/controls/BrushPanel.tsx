
import React from 'react';
import type { LiquidConfig } from '../../types';
import { Tooltip } from '../Tooltip';

interface BrushPanelProps {
  config: LiquidConfig;
  updateConfig: (newConfig: Partial<LiquidConfig>) => void;
}

const Slider: React.FC<{ label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number }> = ({ label, value, onChange, min = 0, max = 1, step = 0.01 }) => (
  <div className="inline-flex flex-col gap-1 p-2 rounded-lg border border-gray-600/50 bg-gray-900/40 w-max">
    <label className="text-xs text-gray-300 mb-1 capitalize">{label}</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-44 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
    />
  </div>
);

export const BrushPanel: React.FC<BrushPanelProps> = ({ config, updateConfig }) => {
  return (
    <div className="flex flex-col gap-4">
      <Tooltip text="Controls the size of the interactive splats.">
        <Slider 
          label="Splat Size" 
          value={config.splatRadius} 
          onChange={v => updateConfig({ splatRadius: v })} 
          min={0.1}
          max={1.0}
        />
      </Tooltip>
    </div>
  );
};