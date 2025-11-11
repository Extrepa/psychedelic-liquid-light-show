
import React from 'react';
import type { LiquidConfig } from '../../types';
import { Tooltip } from '../Tooltip';

interface SimulationPanelProps {
  config: LiquidConfig;
  updateConfig: (newConfig: Partial<LiquidConfig>) => void;
}

const Slider: React.FC<{ label: string; help?: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number }> = ({ label, help, value, onChange, min = 0, max = 1, step = 0.01 }) => (
  <div className="inline-flex flex-col gap-1 p-2 rounded-lg border border-gray-600/50 bg-gray-900/40 w-max">
    <label className="text-xs mb-1 capitalize" style={{ color: '#e5e7eb', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>{label}</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-44 h-2 rounded-lg appearance-none accent-purple-500"
      style={{ background: '#374151' }}
    />
    {help && <small style={{ color: '#9ca3af', marginTop: 2, maxWidth: '14rem' }}>{help}</small>}
  </div>
);

export const SimulationPanel: React.FC<SimulationPanelProps> = ({ config, updateConfig }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Quick */}
      <div className="grid grid-cols-1 gap-4">
        <Slider label="Velocity" help="How fast the fluid moves" value={config.velocity} onChange={v => updateConfig({ velocity: v })} />
        <Slider label="Viscosity" help="Thicker fluid resists motion" value={config.viscosity} onChange={v => updateConfig({ viscosity: v })} />
      </div>
      {/* Advanced */}
      <details>
        <summary className="cursor-pointer text-sm text-gray-300">Advanced: Fluid Parameters</summary>
        <div className="grid grid-cols-1 gap-4 mt-2">
          <Slider label="Density" help="Compression resistance" value={config.density} onChange={v => updateConfig({ density: v })} />
          <Slider label="Pressure" help="External force applied" value={config.pressure} onChange={v => updateConfig({ pressure: v })} />
          <Slider label="Diffusion" help="How quickly colors mix" value={config.diffusion} onChange={v => updateConfig({ diffusion: v })} />
        </div>
      </details>
    </div>
  );
};
