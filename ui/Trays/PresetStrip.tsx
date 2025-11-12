import React from 'react';
import { PRESETS, type PresetCategory } from '../../constants/presets';
import type { LiquidConfig } from '../../types';

export type CycleMode = 'sequential' | 'pingpong' | 'random';
export type Cadence = 'per-stroke' | 'per-splat';

interface PresetStripProps {
  onApply: (config: Partial<LiquidConfig>) => void;
  selected: number[];
  onToggleSelect: (idx: number) => void;
  cycleEnabled: boolean;
  setCycleEnabled: (v: boolean) => void;
  cycleMode: CycleMode;
  setCycleMode: (m: CycleMode) => void;
  cadence: Cadence;
  setCadence: (c: Cadence) => void;
}

export const PresetStrip: React.FC<PresetStripProps> = ({ onApply, selected, onToggleSelect, cycleEnabled, setCycleEnabled, cycleMode, setCycleMode, cadence, setCadence }) => {
  const [category, setCategory] = React.useState<'All' | PresetCategory>('All');
  const cats: ('All' | PresetCategory)[] = ['All','Core','Acid','Goofy','Nitrous','Healing','Blends'];
  const visible = category === 'All' ? PRESETS : PRESETS.filter(p => p.category === category);
  return (
    <div className="fixed top-[4rem] left-4 z-38 pointer-events-none">
      <div className="flex items-center gap-1.5 p-1.5 bg-gray-900/70 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl pointer-events-auto max-w-[92vw] overflow-x-auto md:gap-2 md:p-2">
        {/* Categories */}
        {cats.map(c => (
          <button key={c} onClick={() => setCategory(c)} className={`px-2 py-1 text-xs rounded-full border ${category===c ? 'bg-purple-600/40 text-white border-purple-500' : 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600'}`}>{c}</button>
        ))}
        
        <div className="w-px h-6 bg-gray-700 mx-1" />
        
        {visible.map((p, i) => {
          // compute actual index in PRESETS for selection toggle
          const idx = PRESETS.findIndex(pp => pp.name === p.name);
          const isSel = selected.includes(idx);
          return (
            <button
              key={p.name}
onClick={(e) => {
                if (e.metaKey || e.ctrlKey) onToggleSelect(idx);
                else onApply(p.config);
              }}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onApply(p.config); }
                if ((e.key === 'a' || e.key === 'A') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onToggleSelect(i); }
              }}
              tabIndex={0}
className={`px-2 py-1 text-xs md:text-sm rounded-full whitespace-nowrap border ${isSel ? 'bg-purple-600/40 text-white border-purple-500' : 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600'}`}
              title={p.name}
              aria-pressed={isSel}
            >
              {p.name}
            </button>
          );
        })}

        <div className="w-px h-6 bg-gray-700 mx-1" />

        <label className="flex items-center gap-2 text-gray-200 text-sm">
          <input type="checkbox" checked={cycleEnabled} onChange={e => setCycleEnabled(e.target.checked)} />
          Cycle
        </label>

        <select
          value={cycleMode}
          onChange={e => setCycleMode(e.target.value as CycleMode)}
          className="bg-gray-800 text-gray-200 text-sm rounded-md px-2 py-1 border border-gray-700"
        >
          <option value="sequential">Sequential</option>
          <option value="pingpong">Ping-pong</option>
          <option value="random">Random</option>
        </select>
        <select
          value={cadence}
          onChange={e => setCadence(e.target.value as Cadence)}
          className="bg-gray-800 text-gray-200 text-sm rounded-md px-2 py-1 border border-gray-700"
        >
          <option value="per-stroke">Per-stroke</option>
          <option value="per-splat">Per-splat</option>
        </select>
      </div>
    </div>
  );
};
