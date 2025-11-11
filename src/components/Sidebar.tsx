import React, { useEffect, useRef, useState } from 'react';
import type { LiquidConfig } from '../types';
import { PRESETS } from '../constants/presets';

interface SidebarProps {
  config: LiquidConfig;
  updateConfig: (cfg: Partial<LiquidConfig>) => void;
  isGridVisible: boolean;
  setIsGridVisible: (v: boolean) => void;
  activeColorIndex: number;
  setActiveColorIndex: (i: number) => void;
  behaviorMode: 'blend' | 'alternate' | 'sequence';
  setBehaviorMode: (m: 'blend'|'alternate'|'sequence') => void;
  onClear: () => void;
  visible: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  config,
  updateConfig,
  isGridVisible,
  setIsGridVisible,
  activeColorIndex,
  setActiveColorIndex,
  behaviorMode,
  setBehaviorMode,
  onClear,
  visible,
  onClose,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{x:number,y:number}>(() => {
    const s = localStorage.getItem('sidebar-pos');
    return s ? JSON.parse(s) : { x: 12, y: 80 };
  });
  const [drag, setDrag] = useState<{sx:number, sy:number, px:number, py:number}|null>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!drag) return;
      const nx = drag.px + (e.clientX - drag.sx);
      const ny = drag.py + (e.clientY - drag.sy);
      setPos({ x: Math.max(8, nx), y: Math.max(60, ny) });
    };
    const up = () => {
      if (!drag) return;
      setDrag(null);
      // snap to nearest edge
      const screenW = window.innerWidth;
      const x = pos.x < screenW/2 ? 12 : screenW - 212; // 200 width + margins
      const snapped = { x, y: pos.y };
      setPos(snapped);
      localStorage.setItem('sidebar-pos', JSON.stringify(snapped));
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  }, [drag, pos]);

  if (!visible) return null;

  const SegButton: React.FC<{label:string; active:boolean; onClick:()=>void}> = ({label, active, onClick}) => (
    <button onClick={onClick} className={`px-2 py-1 text-xs rounded ${active? 'bg-purple-600 text-white':'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}>{label}</button>
  );

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', left: pos.x, top: pos.y, width: 200, zIndex: 4800 }}
      className="pointer-events-auto select-none"
    >
      <div
        onMouseDown={(e)=>setDrag({ sx:e.clientX, sy:e.clientY, px:pos.x, py:pos.y })}
        className="flex items-center justify-between px-2 py-1 bg-gray-900/90 text-white border border-gray-700/60 rounded-t-xl backdrop-blur"
        style={{ cursor: 'move' }}
      >
        <span className="text-xs font-bold">Tools</span>
        <button onClick={onClose} aria-label="Close" className="px-2 text-gray-300 hover:text-white">×</button>
      </div>
      <div className="bg-gray-900/85 border-x border-b border-gray-700/60 rounded-b-xl p-2 backdrop-blur" style={{ color:'#e5e7eb', textShadow:'0 1px 2px rgba(0,0,0,0.6)' }}>

        {/* Paint behavior */}
        <div className="mb-2 p-2 rounded-lg border border-gray-600/50 bg-gray-900/40">
          <div className="text-[11px] font-semibold mb-1">Paint Behavior</div>
          <div className="flex gap-1 mb-1">
            <SegButton label="Blend" active={behaviorMode==='blend'} onClick={()=>setBehaviorMode('blend')} />
            <SegButton label="Alternate" active={behaviorMode==='alternate'} onClick={()=>setBehaviorMode('alternate')} />
            <SegButton label="Sequence" active={behaviorMode==='sequence'} onClick={()=>setBehaviorMode('sequence')} />
          </div>
          <label className="text-[11px]">Blend</label>
          <select value={config.blendMode as any} onChange={e=>updateConfig({ blendMode: e.target.value })} className="w-full bg-gray-900/70 border border-gray-600 text-white text-xs rounded px-2 py-1">
            {['lighter','screen','overlay','soft-light','multiply','difference'].map(m=> <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Colors & Presets */}
        <div className="mb-2 p-2 rounded-lg border border-gray-600/50 bg-gray-900/40">
          <div className="text-[11px] font-semibold mb-1">Quick Color</div>
          <div className="flex items-center gap-1 mb-1">
            <input type="text" value={config.colors[activeColorIndex]||''} onChange={e=>{
              const arr=[...config.colors]; arr[activeColorIndex]=e.target.value; updateConfig({ colors: arr });
            }} className="flex-1 bg-gray-900/70 border border-gray-600 text-white text-xs rounded px-2 py-1" />
            <input type="color" value={config.colors[activeColorIndex]||'#000000'} onChange={e=>{
              const arr=[...config.colors]; arr[activeColorIndex]=e.target.value; updateConfig({ colors: arr });
            }} className="w-6 h-6" />
          </div>
          <div className="flex flex-wrap gap-1 mb-1">
            {config.colors.map((c,i)=> (
              <button key={i} onClick={()=>setActiveColorIndex(i)} title={c} className="w-5 h-5 rounded-full border-2" style={{ background:c, borderColor: i===activeColorIndex?'#8b5cf6':'#374151' }} />
            ))}
            <button onClick={()=>{ const arr=[...config.colors,'#ffffff']; updateConfig({ colors: arr }); setActiveColorIndex(arr.length-1); }} className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-200">+ </button>
          </div>
          <div className="overflow-x-auto whitespace-nowrap flex gap-1 mb-1">
            {PRESETS.slice(0,10).map(p=> (
              <button key={p.name} onClick={()=>p.config.colors && updateConfig({ colors: p.config.colors })} className="px-2 py-1 text-xs rounded bg-gray-800 text-gray-200 hover:bg-gray-700" title={p.name}>{p.name}</button>
            ))}
          </div>
        </div>

        {/* Brush */}
        <div className="mb-2 p-2 rounded-lg border border-gray-600/50 bg-gray-900/40">
          <div className="text-[11px] font-semibold mb-1">Brush</div>
          <input type="range" min={0.1} max={1} step={0.01} value={config.splatRadius} onChange={e=>updateConfig({ splatRadius: parseFloat(e.target.value) })} className="w-[170px]" />
        </div>

        {/* Motion */}
        <div className="mb-2 p-2 rounded-lg border border-gray-600/50 bg-gray-900/40">
          <div className="text-[11px] font-semibold mb-1">Motion</div>
          <label className="text-[11px]">Velocity</label>
          <input type="range" min={0} max={1} step={0.01} value={config.velocity} onChange={e=>updateConfig({ velocity: parseFloat(e.target.value) })} className="w-[170px]" />
          <label className="text-[11px]">Viscosity</label>
          <input type="range" min={0} max={1} step={0.01} value={config.viscosity} onChange={e=>updateConfig({ viscosity: parseFloat(e.target.value) })} className="w-[170px]" />
          <div className="flex gap-1 mt-1">
            <button onClick={()=>updateConfig({ velocity:0.45, viscosity:0.35 })} className="px-2 py-1 text-xs rounded bg-blue-600 text-white">Recommended</button>
            <button onClick={()=>updateConfig({ velocity:0.9, viscosity:0.05 })} className="px-2 py-1 text-xs rounded bg-purple-600 text-white">Wild</button>
          </div>
        </div>

        {/* Effects & Grid */}
        <div className="mb-2 p-2 rounded-lg border border-gray-600/50 bg-gray-900/40">
          <div className="text-[11px] font-semibold mb-1">Effects</div>
          <label className="text-[11px]">Bloom</label>
          <input type="range" min={0} max={1} step={0.01} value={config.bloom} onChange={e=>updateConfig({ bloom: parseFloat(e.target.value) })} className="w-[170px]" />
          <label className="text-[11px]">Sunrays</label>
          <input type="range" min={0} max={1} step={0.01} value={config.sunrays} onChange={e=>updateConfig({ sunrays: parseFloat(e.target.value) })} className="w-[170px]" />
          <div className="mt-1">
            <label className="text-[11px] flex items-center gap-2">
              <input type="checkbox" checked={isGridVisible} onChange={e=>setIsGridVisible(e.target.checked)} /> Grid overlay
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="p-2 rounded-lg border border-gray-600/50 bg-gray-900/40">
          <div className="flex gap-1">
            <button onClick={onClear} className="flex-1 px-2 py-1 text-xs rounded bg-red-600 text-white">Clear</button>
            <button onClick={onClose} className="flex-1 px-2 py-1 text-xs rounded bg-gray-700 text-gray-200">Close</button>
          </div>
        </div>

      </div>
    </div>
  );
};