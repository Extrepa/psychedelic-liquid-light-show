import React from 'react';
import { BeakerIcon } from './icons/BeakerIcon';
import { PaletteIcon } from './icons/PaletteIcon';
import { WandIcon } from './icons/WandIcon';
import { PaintbrushIcon } from './icons/PaintbrushIcon';

export type DockTab = 'simulation' | 'colors' | 'effects' | 'brush';

interface BottomDockProps {
  colors: string[];
  activeColorIndex: number;
  setActiveColorIndex: (i: number) => void;
  minimized: boolean;
  setMinimized: (v: boolean) => void;
  onTogglePanel: (panel: DockTab) => void;
  onToggleStudio?: () => void;
}

const DockButton: React.FC<React.PropsWithChildren<{ onClick: () => void; title: string }>> = ({ onClick, title, children }) => (
  <button onClick={onClick} title={title} aria-label={title} className="p-2 rounded-lg bg-gray-800/80 text-gray-200 hover:bg-gray-700">
    {children}
  </button>
);

export const BottomDock: React.FC<BottomDockProps> = ({ colors, activeColorIndex, setActiveColorIndex, minimized, setMinimized, onTogglePanel, onToggleStudio }) => {
  return (
    <div style={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 3600 }}>
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/80 border border-gray-700/60 rounded-2xl backdrop-blur shadow-xl">
        <button onClick={() => setMinimized(!minimized)} title={minimized ? 'Expand' : 'Minimize'} aria-label="Toggle dock" className="px-2 py-1 rounded-lg bg-gray-800/80 text-gray-200 hover:bg-gray-700">{minimized ? '▲' : '▼'}</button>
        {!minimized && (
          <>
            <button onClick={onToggleStudio} title="Studio Board" aria-label="Studio Board" className="px-2 py-1 rounded-lg bg-gray-800/80 text-gray-200 hover:bg-gray-700">Studio</button>
            <div className="flex items-center gap-2">
              {(['simulation','colors','effects','brush'] as DockTab[]).map(tab => (
                <DockButton key={tab} onClick={() => onTogglePanel(tab)} title={tab[0].toUpperCase()+tab.slice(1)}>
                  {tab==='simulation' && <BeakerIcon className="w-5 h-5"/>}
                  {tab==='colors' && <PaletteIcon className="w-5 h-5"/>}
                  {tab==='effects' && <WandIcon className="w-5 h-5"/>}
                  {tab==='brush' && <PaintbrushIcon className="w-5 h-5"/>}
                </DockButton>
              ))}
            </div>
            <div className="w-px h-6 bg-gray-700 mx-1"/>
            <div className="flex items-center gap-2">
              {colors.map((c, i) => (
                <button key={i} onClick={() => setActiveColorIndex(i)} aria-label={`Color ${i+1}`} title={c}
                  className="w-5 h-5 rounded-full border-2" style={{ background: c, borderColor: i===activeColorIndex ? '#8b5cf6' : '#374151', boxShadow: i===activeColorIndex ? '0 0 0 2px rgba(139,92,246,0.5)' : 'none' }} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};