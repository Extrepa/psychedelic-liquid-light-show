
import React from 'react';
import type { LiquidConfig } from '../../types';
import { Tooltip } from '../Tooltip';

interface SimulationPanelProps {
  config: LiquidConfig;
  updateConfig: (newConfig: Partial<LiquidConfig>) => void;
}

const Slider: React.FC<{ label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number }> = ({ label, value, onChange, min = 0, max = 1, step = 0.01 }) => (
  <div className="flex flex-col">
    <label className="text-xs text-gray-300 mb-1 capitalize">{label}</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
    />
  </div>
);

export const SimulationPanel: React.FC<SimulationPanelProps> = ({ config, updateConfig }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Tooltip text="Controls how much the fluid resists compression.">
        <Slider label="Density" value={config.density} onChange={v => updateConfig({ density: v })} />
      </Tooltip>
      <Tooltip text="The speed at which disturbances propagate.">
        <Slider label="Velocity" value={config.velocity} onChange={v => updateConfig({ velocity: v })} />
      </Tooltip>
      <Tooltip text="The thickness of the fluid. Higher values are more syrupy.">
        <Slider label="Viscosity" value={config.viscosity} onChange={v => updateConfig({ viscosity: v })} />
      </Tooltip>
      <Tooltip text="An external force applied to the fluid.">
        <Slider label="Pressure" value={config.pressure} onChange={v => updateConfig({ pressure: v })} />
      </Tooltip>
      <Tooltip text="How quickly colors mix and spread.">
        <Slider label="Diffusion" value={config.diffusion} onChange={v => updateConfig({ diffusion: v })} />
      </Tooltip>
    </div>
  );
};
