
import React, { useState, useRef, useEffect } from 'react';
import type { LiquidConfig } from '../../types';
import { PlusIcon } from '../icons/PlusIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { PRESETS } from '../../constants/presets';
import { ShuffleIcon } from '../icons/ShuffleIcon';
import { Tooltip } from '../Tooltip';

interface ColorPanelProps {
  config: LiquidConfig;
  updateConfig: (newConfig: Partial<LiquidConfig>) => void;
  onGeneratePalette: (prompt: string) => void;
  onGenerateVibe: (prompt: string) => void;
  isGenerating: boolean;
  activeColorIndex: number;
  setActiveColorIndex: (index: number) => void;
}

export const ColorPanel: React.FC<ColorPanelProps> = ({ config, updateConfig, onGeneratePalette, onGenerateVibe, isGenerating, activeColorIndex, setActiveColorIndex }) => {
  const [prompt, setPrompt] = useState('Vibrant sunset over a neon city');
  const [hexInput, setHexInput] = useState(config.colors[activeColorIndex] || '');
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if(config.colors[activeColorIndex]) {
      setHexInput(config.colors[activeColorIndex]);
    }
  }, [activeColorIndex, config.colors]);

  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...config.colors];
    newColors[index] = newColor;
    updateConfig({ colors: newColors });
  };
  
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHexInput(e.target.value);
  };

  const handleHexInputBlur = () => {
    const hexRegex = /^#([0-9a-fA-F]{3}){1,2}$/i;
    if (hexRegex.test(hexInput)) {
        handleColorChange(activeColorIndex, hexInput);
    } else {
        setHexInput(config.colors[activeColorIndex]);
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setHexInput(newColor);
    handleColorChange(activeColorIndex, newColor);
  };

  const handleAddColor = () => {
    const newColors = [...config.colors, '#ffffff'];
    updateConfig({ colors: newColors });
    setActiveColorIndex(newColors.length - 1);
  };

  const handleRemoveColor = (index: number) => {
    if (config.colors.length <= 1) return;
    const newColors = config.colors.filter((_, i) => i !== index);
    updateConfig({ colors: newColors });
  };
  
  const handleGenerateClick = (generator: (p: string) => void) => {
      if(prompt.trim()){
          generator(prompt);
      }
  };

  const handlePresetClick = (presetConfig: Partial<LiquidConfig>) => {
    updateConfig(presetConfig);
  }

  const shuffleColors = () => {
    const shuffled = [...config.colors].sort(() => Math.random() - 0.5);
    updateConfig({ colors: shuffled });
  };

  return (
    <div className="flex flex-col gap-4">
      
      <div>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">Phase</h3>
        <div className="flex gap-2">
          <button
            onClick={() => updateConfig({ activePhase: 'oil', colors: config.oilPalette || config.colors })}
            className={`px-3 py-1 rounded-md text-sm ${config.activePhase==='oil' ? 'bg-purple-600/40 text-white border border-purple-500' : 'bg-gray-700 text-gray-200 border border-gray-600'}`}
          >Oil</button>
          <button
            onClick={() => updateConfig({ activePhase: 'water', colors: config.waterPalette || config.colors })}
            className={`px-3 py-1 rounded-md text-sm ${config.activePhase==='water' ? 'bg-purple-600/40 text-white border border-purple-500' : 'bg-gray-700 text-gray-200 border border-gray-600'}`}
          >Water</button>
        </div>
      </div>

      <div>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">Active Color</h3>
        <div className="flex items-center gap-2">
           <Tooltip text="Click to open color picker">
            <button
              onClick={() => colorInputRef.current?.click()}
className="w-8 h-8 md:w-10 md:h-10 rounded-md border border-gray-600 md:border-2 cursor-pointer"
              style={{ backgroundColor: config.colors[activeColorIndex] || '#000000' }}
              aria-label="Open color picker for active color"
            />
          </Tooltip>
          <input
            type="text"
            value={hexInput}
            onChange={handleHexInputChange}
            onBlur={handleHexInputBlur}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            className="flex-1 bg-gray-900/70 border border-gray-600 font-mono text-white placeholder-gray-400 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition duration-200"
            aria-label="Active color hex code"
          />
           <input
            ref={colorInputRef}
            type="color"
            className="sr-only"
            value={config.colors[activeColorIndex] || '#000000'}
            onChange={handlePickerChange}
            tabIndex={-1}
          />
        </div>
      </div>

      <div>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">Palette</h3>
        <div className="flex flex-wrap items-center gap-2">
          {config.colors.map((color, index) => (
            <Tooltip key={index} text={`Select ${color.toUpperCase()}`}>
              <div className="relative group">
                <button
                  onClick={() => setActiveColorIndex(index)}
                  className={`w-6 h-6 rounded-full cursor-pointer appearance-none border ${activeColorIndex === index ? 'border-purple-500 ring-2 ring-purple-500' : 'border-gray-600'} hover:border-purple-400 transition-all`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select Color ${index + 1}: ${color}`}
                />
                <button 
                  onClick={() => handleRemoveColor(index)} 
                  className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove color ${index + 1}`}
                >
                  &times;
                </button>
              </div>
            </Tooltip>
          ))}
          <Tooltip text="Add new color">
            <button onClick={handleAddColor} className="w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-400 flex items-center justify-center">
              <PlusIcon className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip text="Shuffle colors">
            <button onClick={shuffleColors} className="w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-400 flex items-center justify-center">
              <ShuffleIcon className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
      
      <div>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">Generate with AI</h3>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Bioluminescent forest"
            className="w-full bg-gray-900/70 border border-gray-600 text-white placeholder-gray-400 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition duration-200"
          />
          <div className="flex gap-2">
            <button 
              onClick={() => handleGenerateClick(onGeneratePalette)}
              disabled={isGenerating}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed"
            >
              <SparklesIcon className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? '...' : 'Palette'}</span>
            </button>
            <button 
              onClick={() => handleGenerateClick(onGenerateVibe)}
              disabled={isGenerating}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed"
            >
              <SparklesIcon className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? '...' : 'Vibe'}</span>
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">Presets</h3>
        <div className="flex flex-wrap gap-2">
            {PRESETS.map(preset => (
                <button
                    key={preset.name}
                    onClick={() => handlePresetClick(preset.config)}
                    className="px-3 py-1 text-sm bg-gray-700 text-gray-200 rounded-full hover:bg-gray-600 hover:text-white transition-colors"
                >
                    {preset.name}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};
