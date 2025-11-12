import React, { useEffect, useRef, useState } from 'react';
import type { LiquidConfig } from '../types';
import { SimulationPanel } from './controls/SimulationPanel';
import { ColorPanel } from './controls/ColorPanel';
import { EffectsPanel } from './controls/EffectsPanel';
import { BrushPanel } from './controls/BrushPanel';
import { PresetsPanel } from './controls/PresetsPanel';
import { SettingsPanel } from './controls/SettingsPanel';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { UndoIcon } from './icons/UndoIcon';
import { RedoIcon } from './icons/RedoIcon';
import { SaveIcon } from './icons/SaveIcon';
import { FilmIcon } from './icons/FilmIcon';
import { GridIcon } from './icons/GridIcon';
import { BeakerIcon } from './icons/BeakerIcon';
import { PaletteIcon } from './icons/PaletteIcon';
import { WandIcon } from './icons/WandIcon';
import { PaintbrushIcon } from './icons/PaintbrushIcon';
import { GearIcon } from './icons/GearIcon';

interface ControlDockProps {
  config: LiquidConfig;
  updateConfig: (cfg: Partial<LiquidConfig>) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExport: () => void;
  isRecording: boolean;
  isGridVisible: boolean;
  onToggleGrid: () => void;
  activeColorIndex: number;
  setActiveColorIndex: (i: number) => void;
  onGeneratePalette: (prompt: string) => void;
  onGenerateVibe: (prompt: string) => void;
  isGenerating: boolean;
  onSetSymmetryOrigin?: () => void;
}

const TABS = [
  { id: 'brush', label: 'Brush', icon: PaintbrushIcon },
  { id: 'colors', label: 'Colors', icon: PaletteIcon },
  { id: 'presets', label: 'Presets', icon: PaletteIcon },
  { id: 'effects', label: 'Effects', icon: WandIcon },
  { id: 'simulation', label: 'Sim', icon: BeakerIcon },
  { id: 'settings', label: 'Settings', icon: GearIcon },
] as const;

export const ControlDock: React.FC<ControlDockProps> = ({
  config,
  updateConfig,
  isPlaying,
  onTogglePlay,
  onUndo,
  onRedo,
  onSave,
  onExport,
  isRecording,
  isGridVisible,
  onToggleGrid,
  activeColorIndex,
  setActiveColorIndex,
  onGeneratePalette,
  onGenerateVibe,
  isGenerating,
  onSetSymmetryOrigin,
}) => {
  type TabId = typeof TABS[number]['id'];
  const [activeTab, setActiveTab] = useState<TabId>('brush');
  const [collapsed, setCollapsed] = useState(false);
  const [pos, setPos] = useState<{x:number;y:number}>(() => {
    try {
      const raw = localStorage.getItem('ui:dock-pos');
      return raw ? JSON.parse(raw) : { x: 8, y: 8 };
    } catch { return { x: 8, y: 8 }; }
  });
  useEffect(() => { try { localStorage.setItem('ui:dock-pos', JSON.stringify(pos)); } catch {} }, [pos]);

  const draggingRef = useRef<{dx:number;dy:number}|null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const onDragStart = (e: React.PointerEvent) => {
    const el = dockRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    draggingRef.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onDragMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const nx = Math.max(4, Math.min(window.innerWidth - 200, e.clientX - draggingRef.current.dx));
    const ny = Math.max(4, Math.min(window.innerHeight - 120, e.clientY - draggingRef.current.dy));
    setPos({ x: nx, y: ny });
  };
  const onDragEnd = (e: React.PointerEvent) => { draggingRef.current = null; };

  const scale = 0.8; // compact by ~20%
  return (
    <div
      ref={dockRef}
      className="fixed z-[4000] select-none"
      style={{ left: pos.x, top: pos.y, transform: `scale(${scale})`, transformOrigin: 'top left' }}
    >
      <div
        className="flex items-center gap-1 p-1 bg-gray-900/70 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl"
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
      >
        <button onClick={onTogglePlay} className="p-1 rounded bg-gray-800/80 text-gray-200 hover:bg-gray-700">
          {isPlaying ? <PauseIcon className="w-4 h-4"/> : <PlayIcon className="w-4 h-4"/>}
        </button>
        <button onClick={onUndo} className="p-1 rounded bg-gray-800/80 text-gray-200 hover:bg-gray-700"><UndoIcon className="w-4 h-4"/></button>
        <button onClick={onRedo} className="p-1 rounded bg-gray-800/80 text-gray-200 hover:bg-gray-700"><RedoIcon className="w-4 h-4"/></button>
        <button onClick={onSave} className="p-1 rounded bg-gray-800/80 text-gray-200 hover:bg-gray-700"><SaveIcon className="w-4 h-4"/></button>
        <button onClick={onExport} className={`p-1 rounded bg-gray-800/80 text-gray-200 hover:bg-gray-700 ${isRecording ? 'text-red-400' : ''}`}><FilmIcon className="w-4 h-4"/></button>
        <button onClick={onToggleGrid} className={`p-1 rounded ${isGridVisible ? 'bg-purple-600/40 text-white' : 'bg-gray-800/80 text-gray-200 hover:bg-gray-700'}`}><GridIcon className="w-4 h-4"/></button>
        <div className="w-px h-5 bg-gray-700 mx-1" />
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`p-1 rounded ${activeTab===t.id ? 'bg-purple-600/40 text-white' : 'bg-gray-800/80 text-gray-200 hover:bg-gray-700'}`} title={t.label}>
            <t.icon className="w-4 h-4" />
          </button>
        ))}
        <div className="w-px h-5 bg-gray-700 mx-1" />
        <button onClick={()=>setCollapsed(c=>!c)} className="px-2 py-1 text-xs rounded bg-gray-800/80 text-gray-200 hover:bg-gray-700">{collapsed?'Show':'Hide'}</button>
      </div>
      {!collapsed && (
        <div className="mt-1 bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl p-2 w-[min(92vw,300px)] max-h-[60vh] overflow-auto">
          {activeTab==='brush' && (
            <BrushPanel config={config} updateConfig={updateConfig} onSetSymmetryOrigin={onSetSymmetryOrigin} />
          )}
          {activeTab==='colors' && (
            <ColorPanel config={config} updateConfig={updateConfig} onGeneratePalette={onGeneratePalette} onGenerateVibe={onGenerateVibe} isGenerating={isGenerating} activeColorIndex={activeColorIndex} setActiveColorIndex={setActiveColorIndex} />
          )}
          {activeTab==='presets' && (
            <PresetsPanel onApply={(cfg)=>updateConfig(cfg)} />
          )}
          {activeTab==='effects' && (
            <EffectsPanel config={config} updateConfig={updateConfig} isGridVisible={false} setIsGridVisible={()=>{}} />
          )}
          {activeTab==='simulation' && (
            <SimulationPanel config={config} updateConfig={updateConfig} />
          )}
          {activeTab==='settings' && (
            <SettingsPanel onClose={()=>setCollapsed(true)} onPerfChange={()=>{}} config={config} updateConfig={updateConfig} />
          )}
        </div>
      )}
    </div>
  );
};
