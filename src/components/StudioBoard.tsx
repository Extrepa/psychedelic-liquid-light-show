import React from 'react';
import type { LiquidConfig } from '../types';
import { SimulationPanel } from './controls/SimulationPanel';
import { EffectsPanel } from './controls/EffectsPanel';
import { ColorPanel } from './controls/ColorPanel';
import { BrushPanel } from './controls/BrushPanel';
import { CloseIcon } from './icons/CloseIcon';
import { PRESETS } from '../constants/presets';

interface StudioBoardProps {
  config: LiquidConfig;
  updateConfig: (cfg: Partial<LiquidConfig>) => void;
  isGridVisible: boolean;
  setIsGridVisible: (v: boolean) => void;
  activeColorIndex: number;
  setActiveColorIndex: (i: number) => void;
  isGenerating: boolean;
  onGeneratePalette: (p: string) => void;
  onGenerateVibe: (p: string) => void;
  onClose: () => void;
}

export const StudioBoard: React.FC<StudioBoardProps> = ({ config, updateConfig, isGridVisible, setIsGridVisible, activeColorIndex, setActiveColorIndex, isGenerating, onGeneratePalette, onGenerateVibe, onClose }) => {
  const applyMixingStyle = (style: 'balanced' | 'lava' | 'aurora' | 'ink') => {
    if (style === 'balanced') {
      updateConfig({ blendMode: 'lighter', velocity: 0.45, viscosity: 0.35, bloom: 0.6, sunrays: 0.4 });
    } else if (style === 'lava') {
      updateConfig({ blendMode: 'overlay', velocity: 0.7, viscosity: 0.2, bloom: 0.8, sunrays: 0.3 });
    } else if (style === 'aurora') {
      updateConfig({ blendMode: 'screen', velocity: 0.5, viscosity: 0.15, bloom: 0.4, sunrays: 0.6 });
    } else if (style === 'ink') {
      updateConfig({ blendMode: 'multiply', velocity: 0.3, viscosity: 0.8, bloom: 0.1, sunrays: 0.1 });
    }
  };

  const applyPaletteOnly = (colors: string[]) => updateConfig({ colors });

  return (
    <div style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 80, zIndex: 5000, width: 'min(1100px, 94vw)' }}>
      <div className="bg-gray-900/85 border border-gray-700/60 rounded-2xl shadow-2xl backdrop-blur pointer-events-auto" style={{ color: '#e5e7eb', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/60">
          <h2 className="text-lg font-extrabold">Studio Board</h2>
          <button onClick={onClose} aria-label="Close board" className="p-1 text-gray-300 hover:text-white"><CloseIcon className="w-5 h-5"/></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 max-h-[60vh] overflow-y-auto">

          {/* Overview */}
          <div className="md:col-span-3 inline-flex flex-col gap-2 p-3 rounded-xl border border-gray-600/50 bg-gray-900/40">
            <h3 className="text-sm font-bold">Overview</h3>
            <p className="text-sm text-gray-300">This is a projector-inspired liquid light lab. Paint persists and mixes. Use quick sets or tweak sliders. Clear is undoable.</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => applyMixingStyle('balanced')} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">Balanced</button>
              <button onClick={() => applyMixingStyle('lava')} className="px-3 py-1 rounded bg-orange-600 text-white text-sm">Lava</button>
              <button onClick={() => applyMixingStyle('aurora')} className="px-3 py-1 rounded bg-emerald-600 text-white text-sm">Aurora</button>
              <button onClick={() => applyMixingStyle('ink')} className="px-3 py-1 rounded bg-gray-600 text-white text-sm">Ink</button>
            </div>
          </div>

          {/* Colors & Palettes */}
          <div className="inline-flex flex-col gap-3 p-3 rounded-xl border border-gray-600/50 bg-gray-900/40">
            <h3 className="text-sm font-bold">Colors & Palettes</h3>
            {/* Palette ribbon */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {PRESETS.slice(0, 7).map(p => (
                  <button key={p.name} onClick={() => p.config.colors && applyPaletteOnly(p.config.colors)} className="px-2 py-1 rounded bg-gray-800 text-gray-200 text-xs hover:bg-gray-700" title={p.name}>{p.name}</button>
                ))}
              </div>
              <small className="text-gray-400">Apply palette only (does not change motion).</small>
            </div>
            <ColorPanel
              config={config}
              updateConfig={updateConfig}
              onGeneratePalette={onGeneratePalette}
              onGenerateVibe={onGenerateVibe}
              isGenerating={isGenerating}
              activeColorIndex={activeColorIndex}
              setActiveColorIndex={setActiveColorIndex}
            />
          </div>

          {/* Simulation */}
          <div className="inline-flex flex-col gap-3 p-3 rounded-xl border border-gray-600/50 bg-gray-900/40">
            <h3 className="text-sm font-bold">Simulation</h3>
            <p className="text-xs text-gray-300">Controls motion and mixing. Higher viscosity feels like syrup; velocity speeds up flow.</p>
            <SimulationPanel config={config} updateConfig={updateConfig} />
          </div>

          {/* Effects & Mixing */}
          <div className="inline-flex flex-col gap-3 p-3 rounded-xl border border-gray-600/50 bg-gray-900/40">
            <h3 className="text-sm font-bold">Effects & Mixing</h3>
            <p className="text-xs text-gray-300">Blend defines how colors combine. Bloom and Sunrays add glow and light beams; filmic options emulate retro camera artifacts.</p>
            <EffectsPanel config={config} updateConfig={updateConfig as any} isGridVisible={isGridVisible} setIsGridVisible={setIsGridVisible} />
          </div>

          {/* Brush */}
          <div className="inline-flex flex-col gap-3 p-3 rounded-xl border border-gray-600/50 bg-gray-900/40">
            <h3 className="text-sm font-bold">Brush</h3>
            <p className="text-xs text-gray-300">Adjust splat size to switch between finer drips and broad blotches.</p>
            <BrushPanel config={config} updateConfig={updateConfig} />
          </div>

        </div>
      </div>
    </div>
  );
};