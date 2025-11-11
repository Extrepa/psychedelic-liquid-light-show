import React, { useEffect, useState } from 'react';
import type { LiquidConfig } from '../../types';
import { GridIcon } from '../icons/GridIcon';
import { Tooltip } from '../Tooltip';

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

const Toggle: React.FC<{ label: React.ReactNode; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
    <button
        onClick={() => onChange(!checked)}
        className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${checked ? 'bg-purple-600/30 text-purple-200' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
    >
      {label}
    </button>
  );

const BLEND_MODES = [
    { value: 'lighter', label: 'Additive' },
    { value: 'screen', label: 'Screen' },
    { value: 'overlay', label: 'Overlay' },
    { value: 'soft-light', label: 'Soft Light' },
    { value: 'multiply', label: 'Multiply' },
    { value: 'difference', label: 'Difference' },
];

interface EffectsPanelProps {
  config: LiquidConfig;
  updateConfig: (newConfig: Partial<LiquidConfig>, pushToHistory?: boolean) => void;
  isGridVisible: boolean;
  setIsGridVisible: (visible: boolean) => void;
}

export const EffectsPanel: React.FC<EffectsPanelProps> = ({ config, updateConfig, isGridVisible, setIsGridVisible }) => {
  const [showGridTip, setShowGridTip] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('grid-tip-dismissed') === 'true';
    setShowGridTip(!seen);
  }, []);

  const handleToggleGrid = (v: boolean) => {
    setIsGridVisible(v);
    if (showGridTip) {
      localStorage.setItem('grid-tip-dismissed', 'true');
      setShowGridTip(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">Blending</h3>
        <div className="inline-flex flex-col gap-1 p-2 rounded-lg border border-gray-600/50 bg-gray-900/40 w-max">
            <label className="text-xs mb-1" style={{ color: '#e5e7eb', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>How colors blend</label>
            <select
                value={config.blendMode}
                onChange={e => updateConfig({ blendMode: e.target.value })}
                className="bg-gray-900/70 border border-gray-600 text-white placeholder-gray-400 text-sm rounded-md px-3 py-2"
            >
                {BLEND_MODES.map(mode => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                ))}
            </select>
            <small style={{ color: '#9ca3af' }}>How new colors interact with existing paint.</small>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Slider label="Bloom" help="Soft glow around bright areas" value={config.bloom} onChange={v => updateConfig({ bloom: v })} />
        <Slider label="Sunrays" help="Radiating rays from highlights" value={config.sunrays} onChange={v => updateConfig({ sunrays: v })} />
      </div>

      <details className="mt-2">
        <summary className="cursor-pointer text-sm text-gray-300">Advanced: Filmic</summary>
        <div className="grid grid-cols-1 gap-4 mt-2">
          <Slider label="Chromatic Aberration" help="Retro color fringing" value={config.chromaticAberration} onChange={v => updateConfig({ chromaticAberration: v }, false)} max={0.1} />
          <Slider label="Grain" help="Cinematic film texture" value={config.grain} onChange={v => updateConfig({ grain: v }, false)} />
        </div>
      </details>

      <div className="mt-2">
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">Overlays</h3>
        <div className="flex flex-col gap-1">
          <Toggle label={<><GridIcon className="w-5 h-5"/><span>Grid</span></>} checked={isGridVisible} onChange={handleToggleGrid} />
          {showGridTip ? (
            <small style={{ color: '#cbd5e1' }}>Click to toggle the visual grid for alignment.</small>
          ) : (
            <small style={{ color: '#94a3b8' }}>Grid overlay</small>
          )}
        </div>
      </div>
    </div>
  );
};