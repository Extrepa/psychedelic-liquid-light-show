import React, { useState, useEffect } from 'react';
import { getAudioService, type AudioReactiveParams } from '../../services/audioService';
import { MicrophoneIcon } from '../icons/MicrophoneIcon';
import { MusicalNoteIcon } from '../icons/MusicalNoteIcon';

interface AudioPanelProps {
  params: AudioReactiveParams;
  onParamsChange: (params: Partial<AudioReactiveParams>) => void;
}

export function AudioPanel({ params, onParamsChange }: AudioPanelProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioData, setAudioData] = useState({ bass: 0, mid: 0, treble: 0, overall: 0 });
  
  const audioService = getAudioService();
  
  useEffect(() => {
    if (params.enabled) {
      const interval = setInterval(() => {
        const data = audioService.getAudioData();
        setAudioData({
          bass: data.bass,
          mid: data.mid,
          treble: data.treble,
          overall: data.overall,
        });
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [params.enabled]);
  
  const handleEnableMicrophone = async () => {
    try {
      setError(null);
      await audioService.initializeMicrophone();
      setIsInitialized(true);
      onParamsChange({ enabled: true });
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
      console.error(err);
    }
  };
  
  const handleToggle = async () => {
    if (!params.enabled) {
      if (!isInitialized) {
        await handleEnableMicrophone();
      } else {
        audioService.play();
        onParamsChange({ enabled: true });
      }
    } else {
      audioService.pause();
      onParamsChange({ enabled: false });
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Audio Reactivity</h3>
        <button
          onClick={handleToggle}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            params.enabled
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {params.enabled ? 'Disable' : 'Enable'}
        </button>
      </div>
      
      {error && (
        <div className="p-2 bg-red-900/30 border border-red-500/50 rounded text-xs text-red-200">
          {error}
        </div>
      )}
      
      {!isInitialized && !params.enabled && (
        <div className="p-3 bg-gray-800/50 rounded-lg text-xs text-gray-300 space-y-2">
          <p className="flex items-center gap-2">
            <MicrophoneIcon className="w-4 h-4" />
            Enable microphone to react to audio input
          </p>
        </div>
      )}
      
      {params.enabled && (
        <>
          {/* Audio level visualizer */}
          <div className="space-y-2 p-3 bg-gray-800/30 rounded-lg">
            <div className="text-xs text-gray-400 mb-2">Audio Levels</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-12">Bass</span>
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-75"
                    style={{ width: `${audioData.bass * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-12">Mid</span>
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-75"
                    style={{ width: `${audioData.mid * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-12">Treble</span>
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-600 to-yellow-500 transition-all duration-75"
                    style={{ width: `${audioData.treble * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Sensitivity */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs">
              <span className="text-gray-300">Sensitivity</span>
              <span className="text-gray-500">{(params.sensitivity * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={params.sensitivity}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onParamsChange({ sensitivity: val });
                audioService.updateParams({ sensitivity: val });
              }}
              className="w-full"
            />
          </div>
          
          {/* Smoothing */}
          <div className="space-y-1.5">
            <label className="flex items-center justify-between text-xs">
              <span className="text-gray-300">Smoothing</span>
              <span className="text-gray-500">{(params.smoothing * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={params.smoothing}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onParamsChange({ smoothing: val });
                audioService.updateParams({ smoothing: val });
              }}
              className="w-full"
            />
          </div>
          
          {/* Frequency Range */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-300">Frequency Range</label>
            <div className="grid grid-cols-2 gap-2">
              {(['bass', 'mid', 'treble', 'full'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    onParamsChange({ frequencyRange: range });
                    audioService.updateParams({ frequencyRange: range });
                  }}
                  className={`px-2 py-1.5 rounded text-xs font-medium transition-all ${
                    params.frequencyRange === range
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Modulation targets */}
          <div className="space-y-2">
            <div className="text-xs text-gray-400 mb-1">Modulate</div>
            
            {[
              { key: 'modulateColors' as const, label: 'Colors', amountKey: 'colorAmount' as const },
              { key: 'modulateVelocity' as const, label: 'Velocity', amountKey: 'velocityAmount' as const },
              { key: 'modulateSize' as const, label: 'Size', amountKey: 'sizeAmount' as const },
              { key: 'modulateParticleCount' as const, label: 'Particles', amountKey: 'particleAmount' as const },
              { key: 'modulateGravity' as const, label: 'Gravity', amountKey: 'gravityAmount' as const },
            ].map(({ key, label, amountKey }) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={params[key]}
                    onChange={(e) => onParamsChange({ [key]: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-xs text-gray-300 flex-1">{label}</span>
                  {params[key] && (
                    <span className="text-xs text-gray-500">
                      {(params[amountKey] * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                {params[key] && (
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={params[amountKey]}
                    onChange={(e) => onParamsChange({ [amountKey]: parseFloat(e.target.value) })}
                    className="w-full ml-6"
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
