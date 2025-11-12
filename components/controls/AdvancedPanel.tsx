import React, { useState } from 'react';
import type { LiquidConfig } from '../../types';

export interface AdvancedEffects {
  kaleidoscope: {
    enabled: boolean;
    segments: number; // 2, 4, 6, 8
    rotation: number; // 0-360 degrees
  };
  displacement: {
    enabled: boolean;
    strength: number; // 0-1
    direction: { x: number; y: number };
  };
  tilt: {
    enabled: boolean;
    sensitivity: number; // 0-1
    smoothing: number; // 0-1
    invertX: boolean;
    invertY: boolean;
  };
}

export const DEFAULT_ADVANCED_EFFECTS: AdvancedEffects = {
  kaleidoscope: {
    enabled: false,
    segments: 6,
    rotation: 0,
  },
  displacement: {
    enabled: false,
    strength: 0.5,
    direction: { x: 0, y: 0 },
  },
  tilt: {
    enabled: false,
    sensitivity: 0.7,
    smoothing: 0.8,
    invertX: false,
    invertY: false,
  },
};

interface AdvancedPanelProps {
  effects: AdvancedEffects;
  onEffectsChange: (effects: Partial<AdvancedEffects>) => void;
  onRequestTiltPermission?: () => Promise<boolean>;
  tiltSupported?: boolean;
}

export function AdvancedPanel({
  effects,
  onEffectsChange,
  onRequestTiltPermission,
  tiltSupported = false,
}: AdvancedPanelProps) {
  const [activeSection, setActiveSection] = useState<'kaleidoscope' | 'displacement' | 'tilt' | null>(null);
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Advanced Effects</h3>
      
      {/* Kaleidoscope */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-gray-300">
            <input
              type="checkbox"
              checked={effects.kaleidoscope.enabled}
              onChange={(e) => onEffectsChange({
                kaleidoscope: { ...effects.kaleidoscope, enabled: e.target.checked }
              })}
              className="rounded"
            />
            Kaleidoscope/Mirror
          </label>
          <button
            onClick={() => setActiveSection(activeSection === 'kaleidoscope' ? null : 'kaleidoscope')}
            className="text-xs text-purple-400 hover:text-purple-300"
          >
            {activeSection === 'kaleidoscope' ? '−' : '+'}
          </button>
        </div>
        
        {activeSection === 'kaleidoscope' && effects.kaleidoscope.enabled && (
          <div className="ml-6 space-y-3 p-3 bg-gray-800/30 rounded">
            <div className="space-y-1.5">
              <label className="flex items-center justify-between text-xs">
                <span className="text-gray-300">Segments</span>
                <span className="text-gray-500">{effects.kaleidoscope.segments}</span>
              </label>
              <div className="flex gap-2">
                {[2, 4, 6, 8, 12].map(seg => (
                  <button
                    key={seg}
                    onClick={() => onEffectsChange({
                      kaleidoscope: { ...effects.kaleidoscope, segments: seg }
                    })}
                    className={`flex-1 px-2 py-1 rounded text-xs ${
                      effects.kaleidoscope.segments === seg
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {seg}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="flex items-center justify-between text-xs">
                <span className="text-gray-300">Rotation</span>
                <span className="text-gray-500">{effects.kaleidoscope.rotation.toFixed(0)}°</span>
              </label>
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={effects.kaleidoscope.rotation}
                onChange={(e) => onEffectsChange({
                  kaleidoscope: { ...effects.kaleidoscope, rotation: parseFloat(e.target.value) }
                })}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Displacement */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-gray-300">
            <input
              type="checkbox"
              checked={effects.displacement.enabled}
              onChange={(e) => onEffectsChange({
                displacement: { ...effects.displacement, enabled: e.target.checked }
              })}
              className="rounded"
            />
            Displacement Warp
          </label>
          <button
            onClick={() => setActiveSection(activeSection === 'displacement' ? null : 'displacement')}
            className="text-xs text-purple-400 hover:text-purple-300"
          >
            {activeSection === 'displacement' ? '−' : '+'}
          </button>
        </div>
        
        {activeSection === 'displacement' && effects.displacement.enabled && (
          <div className="ml-6 space-y-3 p-3 bg-gray-800/30 rounded">
            <div className="space-y-1.5">
              <label className="flex items-center justify-between text-xs">
                <span className="text-gray-300">Strength</span>
                <span className="text-gray-500">{(effects.displacement.strength * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={effects.displacement.strength}
                onChange={(e) => onEffectsChange({
                  displacement: { ...effects.displacement, strength: parseFloat(e.target.value) }
                })}
                className="w-full"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs text-gray-300">Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-xs text-gray-400">X</span>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.01"
                    value={effects.displacement.direction.x}
                    onChange={(e) => onEffectsChange({
                      displacement: {
                        ...effects.displacement,
                        direction: { ...effects.displacement.direction, x: parseFloat(e.target.value) }
                      }
                    })}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-400">Y</span>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.01"
                    value={effects.displacement.direction.y}
                    onChange={(e) => onEffectsChange({
                      displacement: {
                        ...effects.displacement,
                        direction: { ...effects.displacement.direction, y: parseFloat(e.target.value) }
                      }
                    })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Tilt Controls */}
      {tiltSupported && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-gray-300">
              <input
                type="checkbox"
                checked={effects.tilt.enabled}
                onChange={async (e) => {
                  if (e.target.checked && onRequestTiltPermission) {
                    const granted = await onRequestTiltPermission();
                    if (granted) {
                      onEffectsChange({
                        tilt: { ...effects.tilt, enabled: true }
                      });
                    }
                  } else {
                    onEffectsChange({
                      tilt: { ...effects.tilt, enabled: e.target.checked }
                    });
                  }
                }}
                className="rounded"
              />
              Tilt Controls (Mobile)
            </label>
            <button
              onClick={() => setActiveSection(activeSection === 'tilt' ? null : 'tilt')}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              {activeSection === 'tilt' ? '−' : '+'}
            </button>
          </div>
          
          {activeSection === 'tilt' && effects.tilt.enabled && (
            <div className="ml-6 space-y-3 p-3 bg-gray-800/30 rounded">
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Sensitivity</span>
                  <span className="text-gray-500">{(effects.tilt.sensitivity * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effects.tilt.sensitivity}
                  onChange={(e) => onEffectsChange({
                    tilt: { ...effects.tilt, sensitivity: parseFloat(e.target.value) }
                  })}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Smoothing</span>
                  <span className="text-gray-500">{(effects.tilt.smoothing * 100).toFixed(0)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={effects.tilt.smoothing}
                  onChange={(e) => onEffectsChange({
                    tilt: { ...effects.tilt, smoothing: parseFloat(e.target.value) }
                  })}
                  className="w-full"
                />
              </div>
              
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs text-gray-300">
                  <input
                    type="checkbox"
                    checked={effects.tilt.invertX}
                    onChange={(e) => onEffectsChange({
                      tilt: { ...effects.tilt, invertX: e.target.checked }
                    })}
                    className="rounded"
                  />
                  Invert X
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-300">
                  <input
                    type="checkbox"
                    checked={effects.tilt.invertY}
                    onChange={(e) => onEffectsChange({
                      tilt: { ...effects.tilt, invertY: e.target.checked }
                    })}
                    className="rounded"
                  />
                  Invert Y
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
