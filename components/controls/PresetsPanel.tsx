import React from 'react';
import { PRESETS, type Preset, type PresetCategory } from '../../constants/presets';
import type { LiquidConfig } from '../../types';

interface PresetsPanelProps {
  onApply: (config: Partial<LiquidConfig>) => void;
}

const groups: PresetCategory[] = ['Core','Acid','Goofy','Nitrous','Healing','Blends'];

export const PresetsPanel: React.FC<PresetsPanelProps> = ({ onApply }) => {
  return (
    <div className="flex flex-col gap-6">
      {groups.map(group => {
        const items = PRESETS.filter(p => p.category === group);
        if (items.length === 0) return null;
        return (
          <div key={group}>
            <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">{group}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {items.map(p => (
                <button
                  key={p.name}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-700 bg-gray-800/60 hover:bg-gray-700 text-left"
                  onClick={() => onApply(p.config)}
                >
                  <div className="mt-0.5 w-2 h-2 rounded-full bg-purple-400" />
                  <div>
                    <div className="text-sm text-white font-medium">{p.name}</div>
                    {p.description && (
                      <div className="text-xs text-gray-300">{p.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
