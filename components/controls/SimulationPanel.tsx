
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
    <div className="flex flex-col gap-6">
      {/* Legacy params */}
      <div>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">Classic Params</h3>
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
          <Tooltip text="How long particles stay visible before fading. Higher = longer trails.">
            <Slider label="Fade Speed" value={config.diffusion} onChange={v => updateConfig({ diffusion: v })} />
          </Tooltip>
        </div>
      </div>

      {/* Two-phase physics */}
      <div>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">Oil & Water Physics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Tooltip text="Surface tension pulls liquid into droplets. Higher = stronger pooling.">
            <Slider label="Surface Tension" value={config.surfaceTension ?? 0.5} onChange={v => updateConfig({ surfaceTension: v })} />
          </Tooltip>
          <Tooltip text="Oil density relative to water. Lower = oil floats higher.">
            <Slider label="Oil Density" value={config.oilDensity ?? 0.85} onChange={v => updateConfig({ oilDensity: v })} min={0.5} max={1.0} />
          </Tooltip>
          <Tooltip text="Water density (reference). Oil floats when less dense.">
            <Slider label="Water Density" value={config.waterDensity ?? 1.0} onChange={v => updateConfig({ waterDensity: v })} min={0.8} max={1.2} />
          </Tooltip>
          <Tooltip text="Gravity strength. Higher = faster separation.">
            <Slider label="Gravity Strength" value={config.gravityStrength ?? 0.4} onChange={v => updateConfig({ gravityStrength: v })} />
          </Tooltip>
          <Tooltip text="Gravity angle in degrees. 90=down, 0=right, 180=left.">
            <Slider label="Gravity Angle" value={config.gravityAngleDeg ?? 90} onChange={v => updateConfig({ gravityAngleDeg: v })} min={0} max={360} step={1} />
          </Tooltip>
          <Tooltip text="Simulation resolution scale (lower = faster, less detail).">
            <Slider label="Sim Resolution" value={config.simScale ?? 0.5} onChange={v => updateConfig({ simScale: v })} min={0.25} max={1.0} step={0.05} />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
