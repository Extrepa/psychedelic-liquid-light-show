
import React, { useRef } from 'react';
import type { LiquidConfig } from '../../types';
import { Tooltip } from '../Tooltip';

interface BrushPanelProps {
  config: LiquidConfig;
  updateConfig: (newConfig: Partial<LiquidConfig>) => void;
  onSetSymmetryOrigin?: () => void;
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

export const BrushPanel: React.FC<BrushPanelProps> = ({ config, updateConfig, onSetSymmetryOrigin }) => {
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
      {/* Dropper Controls (Main Interaction) */}
      <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
        <h3 className="text-sm font-semibold text-purple-200 mb-3 flex items-center gap-2">
          💧 Dropper Mode (Main)
        </h3>
        
        <div className="space-y-4">
          {/* Mode toggles */}
          <div className="flex gap-2">
            <button
              onClick={() => updateConfig({ dropperEnabled: true, lineEnabled: false, dripEnabled: false })}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                config.dropperEnabled && !config.lineEnabled && !config.dripEnabled
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Single Drop
            </button>
            <button
              onClick={() => updateConfig({ dripEnabled: true, dropperEnabled: false, lineEnabled: false })}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                config.dripEnabled
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Drip
            </button>
            <button
              onClick={() => updateConfig({ lineEnabled: true, dropperEnabled: false, dripEnabled: false })}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                config.lineEnabled
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Line
            </button>
          </div>
          
          {/* Dropper settings */}
          {config.dropperEnabled && !config.lineEnabled && (
            <>
              {/* Dropper icon controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-xs text-gray-300">
                  <input
                    type="checkbox"
                    checked={config.dropperCursorEnabled ?? true}
                    onChange={e => updateConfig({ dropperCursorEnabled: e.target.checked })}
                    className="rounded"
                  />
                  Show dropper tool overlay
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        updateConfig({ dropperCursorUrl: ev.target?.result as string, dropperCursorEnabled: true });
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="text-xs text-gray-300"
                  />
                  <span className="text-xs text-gray-400">Upload dropper art</span>
                </div>
              </div>

              <Tooltip text="Dropper icon size (in pixels)">
                <Slider 
                  label={`Dropper Size: ${config.dropperCursorSizePx ?? 42}px`}
                  value={config.dropperCursorSizePx ?? 42} 
                  onChange={v => updateConfig({ dropperCursorSizePx: Math.round(v) })} 
                  min={24}
                  max={96}
                  step={1}
                />
              </Tooltip>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Tooltip text="Rotate the dropper art">
                  <Slider 
                    label={`Rotation: ${(config.dropperCursorRotationDeg ?? -8)}°`}
                    value={config.dropperCursorRotationDeg ?? -8} 
                    onChange={v => updateConfig({ dropperCursorRotationDeg: Math.round(v) })} 
                    min={-45}
                    max={45}
                    step={1}
                  />
                </Tooltip>
                <Tooltip text="Align the tip with the cursor (horizontal offset)">
                  <Slider 
                    label={`Tip X: ${config.dropperCursorTipOffsetX ?? 10}px`}
                    value={config.dropperCursorTipOffsetX ?? 10} 
                    onChange={v => updateConfig({ dropperCursorTipOffsetX: Math.round(v) })} 
                    min={-64}
                    max={64}
                    step={1}
                  />
                </Tooltip>
                <Tooltip text="Align the tip with the cursor (vertical offset)">
                  <Slider 
                    label={`Tip Y: ${config.dropperCursorTipOffsetY ?? 32}px`}
                    value={config.dropperCursorTipOffsetY ?? 32} 
                    onChange={v => updateConfig({ dropperCursorTipOffsetY: Math.round(v) })} 
                    min={-64}
                    max={96}
                    step={1}
                  />
                </Tooltip>
              </div>

              <Tooltip text="Minimum drop size (quick tap)">
                <Slider 
                  label={`Min Size: ${((config.dropMinRadius || 0.01) * 100).toFixed(0)}%`}
                  value={config.dropMinRadius || 0.01} 
                  onChange={v => updateConfig({ dropMinRadius: Math.min(v, config.dropMaxRadius || 0.15) })} 
                  min={0.005}
                  max={0.15}
                  step={0.005}
                />
              </Tooltip>
              
              <Tooltip text="Maximum drop size (hold 1.2s)">
                <Slider 
                  label={`Max Size: ${((config.dropMaxRadius || 0.15) * 100).toFixed(0)}%`}
                  value={config.dropMaxRadius || 0.15} 
                  onChange={v => updateConfig({ dropMaxRadius: Math.max(v, config.dropMinRadius || 0.01) })} 
                  min={0.01}
                  max={0.25}
                  step={0.005}
                />
              </Tooltip>
              
              <Tooltip text="Time to grow from min to max size">
                <Slider 
                  label={`Growth Time: ${((config.dropTimeToMaxMs || 1200) / 1000).toFixed(1)}s`}
                  value={config.dropTimeToMaxMs || 1200} 
                  onChange={v => updateConfig({ dropTimeToMaxMs: v })} 
                  min={500}
                  max={2000}
                  step={100}
                />
              </Tooltip>
              
              <div>
                <label className="text-xs text-gray-300 mb-2 block">Growth Easing</label>
                <select
                  value={config.dropEasing || 'ease-out'}
                  onChange={e => updateConfig({ dropEasing: e.target.value as any })}
                  className="w-full bg-gray-700 text-white text-xs rounded-lg px-3 py-2 border border-gray-600"
                >
                  <option value="linear">Linear</option>
                  <option value="ease-in">Ease In</option>
                  <option value="ease-out">Ease Out (Recommended)</option>
                  <option value="ease-in-out">Ease In-Out</option>
                </select>
              </div>
              
              <label className="flex items-center gap-2 text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={config.dropPreview !== false}
                  onChange={e => updateConfig({ dropPreview: e.target.checked })}
                  className="rounded"
                />
                Show preview circle while holding
              </label>
            </>
          )}
          
          {/* Drip settings */}
          {config.dripEnabled && (
            <Tooltip text="Milliseconds between micro-drops">
              <Slider 
                label={`Drip Interval: ${config.dripIntervalMs || 140}ms`}
                value={config.dripIntervalMs || 140} 
                onChange={v => updateConfig({ dripIntervalMs: v })} 
                min={60}
                max={300}
                step={10}
              />
            </Tooltip>
          )}
        </div>
      </div>
      
      {/* Symmetry/Kaleidoscope Controls */}
      <div className="p-4 bg-pink-900/20 border border-pink-500/30 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-pink-200 flex items-center gap-2">
            ✨ Symmetry / Kaleidoscope
          </h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.symmetryEnabled || false}
              onChange={e => updateConfig({ symmetryEnabled: e.target.checked })}
              className="rounded"
            />
            <span className="text-xs text-gray-300">Enable</span>
          </label>
        </div>
        
        {config.symmetryEnabled && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-300 mb-2 block">Symmetry Count</label>
              <div className="grid grid-cols-5 gap-2">
                {[2, 4, 6, 8, 12].map(count => (
                  <button
                    key={count}
                    onClick={() => updateConfig({ symmetryCount: count as any })}
                    className={`px-2 py-1.5 rounded text-xs font-medium transition-all ${
                      (config.symmetryCount || 6) === count
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
            
            <label className="flex items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={config.symmetryMirror !== false}
                onChange={e => updateConfig({ symmetryMirror: e.target.checked })}
                className="rounded"
              />
              Mirror (True Kaleidoscope)
            </label>
            
            <Tooltip text="Rotate the entire mandala pattern">
              <Slider 
                label={`Rotation: ${config.symmetryRotationDeg || 0}°`}
                value={config.symmetryRotationDeg || 0} 
                onChange={v => updateConfig({ symmetryRotationDeg: v })} 
                min={0}
                max={360}
                step={1}
              />
            </Tooltip>
            
            {onSetSymmetryOrigin && (
              <button
                onClick={onSetSymmetryOrigin}
                className="w-full px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-xs hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <span>🎯</span>
                Set Origin Point
              </button>
            )}
          </div>
        )}
      </div>
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
            label="Spray Paint"
            icon="💨"
            active={currentPattern === 'spray'}
            onClick={() => updateConfig({ brushPattern: 'spray' })}
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

      {/* Eraser Mode Toggle */}
      <div>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-3">Eraser Tool</h3>
        <button
          onClick={() => updateConfig({ eraserMode: !config.eraserMode })}
          className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${
            config.eraserMode
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {config.eraserMode ? '🧹 Eraser Active' : '🖌️ Paint Mode'}
        </button>
        {config.eraserMode && (
          <p className="text-xs text-gray-400 mt-2">Click and drag to remove particles</p>
        )}
      </div>

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
