
import React, { useRef } from 'react';
import type { LiquidConfig } from '../../types';
import { Tooltip } from '../Tooltip';

interface BrushPanelProps {
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

const PatternButton: React.FC<{ label: string; active: boolean; onClick: () => void; icon?: string }> = ({ label, active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
      active
        ? 'bg-purple-600 text-white shadow-lg'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`}
  >
    {icon && <span className="mr-1">{icon}</span>}
    {label}
  </button>
);

export const BrushPanel: React.FC<BrushPanelProps> = ({ config, updateConfig }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentPattern = config.brushPattern || 'single';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateConfig({ brushStampImage: dataUrl, brushPattern: 'stamp' });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Brush Size */}
      <div>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-3">Brush Size</h3>
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

      {/* Pattern Selection */}
      <div>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-3">Brush Pattern</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <PatternButton
            label="Single"
            icon="●"
            active={currentPattern === 'single'}
            onClick={() => updateConfig({ brushPattern: 'single' })}
          />
          <PatternButton
            label="Polkadots"
            icon="⬤⬤"
            active={currentPattern === 'polkadots'}
            onClick={() => updateConfig({ brushPattern: 'polkadots' })}
          />
          <PatternButton
            label="Stripes"
            icon="||||"
            active={currentPattern === 'stripes'}
            onClick={() => updateConfig({ brushPattern: 'stripes' })}
          />
          <PatternButton
            label="Thin Line"
            icon="─"
            active={currentPattern === 'line'}
            onClick={() => updateConfig({ brushPattern: 'line' })}
          />
          <PatternButton
            label="Text"
            icon="Aa"
            active={currentPattern === 'text'}
            onClick={() => updateConfig({ brushPattern: 'text' })}
          />
          <PatternButton
            label="Stamp"
            icon="🖼️"
            active={currentPattern === 'stamp'}
            onClick={() => fileInputRef.current?.click()}
          />
        </div>
      </div>

      {/* Pattern Spacing */}
      {(currentPattern === 'polkadots' || currentPattern === 'stripes') && (
        <div>
          <h3 className="text-xs text-gray-300 uppercase font-semibold mb-3">Pattern Spacing</h3>
          <Tooltip text="Distance between pattern elements">
            <Slider 
              label="Spacing" 
              value={config.brushSpacing ?? 0.5} 
              onChange={v => updateConfig({ brushSpacing: v })} 
              min={0.1}
              max={1.0}
            />
          </Tooltip>
        </div>
      )}

      {/* Text Input */}
      {currentPattern === 'text' && (
        <div>
          <h3 className="text-xs text-gray-300 uppercase font-semibold mb-3">Brush Text</h3>
          <input
            type="text"
            value={config.brushText || 'Hello'}
            onChange={(e) => updateConfig({ brushText: e.target.value })}
            placeholder="Enter text..."
            className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
            maxLength={20}
          />
          <p className="text-xs text-gray-400 mt-1">Text will follow your brush stroke</p>
        </div>
      )}

      {/* Stamp Preview */}
      {currentPattern === 'stamp' && config.brushStampImage && (
        <div>
          <h3 className="text-xs text-gray-300 uppercase font-semibold mb-3">Stamp Preview</h3>
          <div className="flex items-center gap-3">
            <img 
              src={config.brushStampImage} 
              alt="Stamp" 
              className="w-16 h-16 object-contain bg-gray-800 rounded border border-gray-600"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-xs hover:bg-gray-600 transition-colors"
            >
              Change Image
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};
