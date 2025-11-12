

import React from 'react';
import type { LiquidConfig } from '../../types';
import { GridIcon } from '../icons/GridIcon';
import { Tooltip } from '../Tooltip';

interface EffectsPanelProps {
  config: LiquidConfig;
  // FIX: Update updateConfig to allow optional second argument
  updateConfig: (newConfig: Partial<LiquidConfig>, pushToHistory?: boolean) => void;
  isGridVisible: boolean;
  setIsGridVisible: (visible: boolean) => void;
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

export const EffectsPanel: React.FC<EffectsPanelProps> = ({ config, updateConfig, isGridVisible, setIsGridVisible }) => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">Blending</h3>
        <Tooltip text="How new colors interact with existing colors on the canvas.">
            <select
                value={config.blendMode}
                onChange={e => updateConfig({ blendMode: e.target.value })}
                className="w-full bg-gray-900/70 border border-gray-600 text-white placeholder-gray-400 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition duration-200"
            >
                {BLEND_MODES.map(mode => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                ))}
            </select>
        </Tooltip>
      </div>
      <div>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">Post Effects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Tooltip text="Adds a soft, glowing halo around bright areas.">
            <Slider label="Bloom" value={config.bloom} onChange={v => updateConfig({ bloom: v })} />
          </Tooltip>
          <Tooltip text="Casts radiating light rays from bright areas.">
            <Slider label="Sunrays" value={config.sunrays} onChange={v => updateConfig({ sunrays: v })} />
          </Tooltip>
          <Tooltip text="Adds a retro color-fringing effect.">
            <Slider label="Chromatic Aberration" value={config.chromaticAberration} onChange={v => updateConfig({ chromaticAberration: v }, false)} max={0.1} />
          </Tooltip>
          <Tooltip text="Applies a cinematic grain texture.">
            <Slider label="Grain" value={config.grain} onChange={v => updateConfig({ grain: v }, false)} />
          </Tooltip>
        </div>
      </div>

      <div>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">Realistic Optics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Tooltip text="Specular shininess. Higher = sharper highlights.">
            <Slider label="Gloss" value={config.gloss ?? 0.75} onChange={v => updateConfig({ gloss: v })} />
          </Tooltip>
          <Tooltip text="Refractive index of oil (1.0–2.0). Affects light bending.">
            <Slider label="Refractive Index" value={config.refractiveIndexOil ?? 1.45} onChange={v => updateConfig({ refractiveIndexOil: v })} min={1.0} max={2.0} step={0.01} />
          </Tooltip>
          <Tooltip text="Light angle in degrees (0–90).">
            <Slider label="Light Angle" value={config.lightAngleDeg ?? 45} onChange={v => updateConfig({ lightAngleDeg: v })} min={0} max={90} step={1} />
          </Tooltip>
          <Tooltip text="Light intensity multiplier.">
            <Slider label="Light Intensity" value={config.lightIntensity ?? 1.0} onChange={v => updateConfig({ lightIntensity: v })} min={0} max={2.0} />
          </Tooltip>
          <Tooltip text="Refraction distortion strength.">
            <Slider label="Refraction Strength" value={config.refractionStrength ?? 0.6} onChange={v => updateConfig({ refractionStrength: v })} />
          </Tooltip>
        </div>
      </div>

      <div>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">Advanced</h3>
        <Tooltip text="Enable iridescent thin-film shimmer on oil edges (GPU intensive).">
          <Toggle label={<span>Thin-Film Interference</span>} checked={config.thinFilm ?? false} onChange={v => updateConfig({ thinFilm: v })} />
        </Tooltip>
      </div>
      <div>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">Background Pattern</h3>
        <div className="space-y-4">
          <Tooltip text="Choose a decorative background pattern.">
            <select
              value={config.backgroundPattern || 'none'}
              onChange={e => updateConfig({ backgroundPattern: e.target.value as any })}
              className="w-full bg-gray-900/70 border border-gray-600 text-white placeholder-gray-400 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition duration-200"
            >
              <option value="none">None</option>
              <option value="grid">Grid</option>
              <option value="dots">Dots</option>
              <option value="radial">Radial Circles</option>
              <option value="hexagons">Hexagons</option>
            </select>
          </Tooltip>
          
          {config.backgroundPattern && config.backgroundPattern !== 'none' && (
            <>
              <Tooltip text="Pattern opacity (0 = invisible, 1 = solid)">
                <Slider 
                  label="Opacity" 
                  value={config.backgroundOpacity ?? 0.1} 
                  onChange={v => updateConfig({ backgroundOpacity: v })} 
                  min={0}
                  max={0.5}
                  step={0.01}
                />
              </Tooltip>
              
              <Tooltip text="Pattern size multiplier">
                <Slider 
                  label="Scale" 
                  value={config.backgroundScale ?? 1} 
                  onChange={v => updateConfig({ backgroundScale: v })} 
                  min={0.5}
                  max={3}
                  step={0.1}
                />
              </Tooltip>
            </>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">Overlays</h3>
        <Tooltip text="Toggle a visual grid for alignment.">
            <Toggle label={<><GridIcon className="w-5 h-5"/><span>Grid</span></>} checked={isGridVisible} onChange={setIsGridVisible} />
        </Tooltip>
      </div>
    </div>
  );
};
