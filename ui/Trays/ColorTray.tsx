import React, { useRef, useState, useEffect } from 'react';
import type { LiquidConfig } from '../../types';
import { Tooltip } from '../../components/Tooltip';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { ShuffleIcon } from '../../components/icons/ShuffleIcon';

interface ColorTrayProps {
  colors: string[];
  activeColorIndex: number;
  setActiveColorIndex: (i: number) => void;
  updateConfig: (newConfig: Partial<LiquidConfig>) => void;
}

export const ColorTray: React.FC<ColorTrayProps> = ({ colors, activeColorIndex, setActiveColorIndex, updateConfig }) => {
  const [hexInput, setHexInput] = useState(colors[activeColorIndex] || '');
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (colors[activeColorIndex]) setHexInput(colors[activeColorIndex]);
  }, [colors, activeColorIndex]);

  const setColorAt = (index: number, value: string) => {
    const next = [...colors];
    next[index] = value;
    updateConfig({ colors: next });
  };

  const handlePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexInput(value);
    setColorAt(activeColorIndex, value);
  };

  const handleHexBlur = () => {
    const re = /^#([0-9a-fA-F]{3}){1,2}$/i;
    if (re.test(hexInput)) setColorAt(activeColorIndex, hexInput);
    else setHexInput(colors[activeColorIndex] || '#000000');
  };

  const addColor = () => {
    const next = [...colors, '#ffffff'];
    updateConfig({ colors: next });
    setActiveColorIndex(next.length - 1);
  };

  const removeColor = (i: number) => {
    if (colors.length <= 1) return;
    const next = colors.filter((_, idx) => idx !== i);
    updateConfig({ colors: next });
  };

  const shuffleColors = () => {
    const shuffled = [...colors].sort(() => Math.random() - 0.5);
    updateConfig({ colors: shuffled });
  };

  return (
    <div className="fixed top-4 left-[calc(4rem+140px)] z-39 pointer-events-none">
      <div className="flex items-center gap-3 p-2 bg-gray-900/70 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl pointer-events-auto">
        {/* Active swatch + hex */}
        <Tooltip text="Active color">
          <button
            onClick={() => colorInputRef.current?.click()}
            className="w-9 h-9 rounded-md border-2 border-gray-600"
            style={{ backgroundColor: colors[activeColorIndex] || '#000000' }}
            aria-label="Open color picker"
          />
        </Tooltip>
        <input
          ref={colorInputRef}
          type="color"
          className="sr-only"
          value={colors[activeColorIndex] || '#000000'}
          onChange={handlePicker}
          tabIndex={-1}
        />
        <input
          type="text"
          value={hexInput}
          onChange={e => setHexInput(e.target.value)}
          onBlur={handleHexBlur}
          onKeyDown={e => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
          className="w-28 bg-gray-900/70 border border-gray-600 font-mono text-white text-sm rounded-md px-2 py-1"
          aria-label="Active color hex"
        />

        <div className="w-px h-6 bg-gray-700" />

        {/* Palette */}
        <div className="flex items-center gap-2" role="listbox" aria-label="Color palette">
          {colors.map((c, i) => (
            <div key={i} className="relative group">
              <button
                onClick={() => setActiveColorIndex(i)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') { e.preventDefault(); setActiveColorIndex(Math.min(colors.length - 1, i + 1)); }
                  if (e.key === 'ArrowLeft')  { e.preventDefault(); setActiveColorIndex(Math.max(0, i - 1)); }
                  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); removeColor(i); }
                }}
                tabIndex={0}
                className={`w-8 h-8 rounded-full border-2 ${activeColorIndex === i ? 'border-purple-500 ring-2 ring-purple-500' : 'border-gray-600'} transition`}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${i + 1}`}
                aria-selected={activeColorIndex === i}
              />
              <button
                onClick={() => removeColor(i)}
                className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 text-[10px] leading-4 opacity-0 group-hover:opacity-100"
                aria-label={`Remove color ${i + 1}`}
              >
                ×
              </button>
            </div>
          ))}
          <Tooltip text="Add color">
            <button onClick={addColor} className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-200 flex items-center justify-center">
              <PlusIcon className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip text="Shuffle colors">
            <button onClick={shuffleColors} className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-200 flex items-center justify-center">
              <ShuffleIcon className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
