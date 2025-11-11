import React from 'react';
import { BeakerIcon } from './icons/BeakerIcon';
import { PaletteIcon } from './icons/PaletteIcon';
import { WandIcon } from './icons/WandIcon';
import { PaintbrushIcon } from './icons/PaintbrushIcon';
import type { Tab } from './Toolbar';

interface EdgeDockProps {
  activePanel: Tab | null;
  setActivePanel: (panel: Tab | null) => void;
}

const DockButton: React.FC<{ active: boolean; onClick: () => void; label: string; children: React.ReactNode }>
  = ({ active, onClick, label, children }) => (
  <button
    onClick={onClick}
    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg border border-gray-700/50 
                ${active ? 'bg-purple-600 text-white' : 'bg-gray-800/80 text-gray-200 hover:bg-gray-700 hover:text-white'}`}
    aria-label={label}
    title={label}
  >
    {children}
  </button>
);

export const EdgeDock: React.FC<EdgeDockProps> = ({ activePanel, setActivePanel }) => {
  const toggle = (tab: Tab) => setActivePanel(activePanel === tab ? null : tab);

  return (
    <div className="pointer-events-none">
      {/* Left edge hotzone + dock */}
      <div className="group fixed left-0 top-1/2 -translate-y-1/2 z-30 px-1 py-2 pointer-events-auto" style={{ position: 'fixed', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 3000, padding: '8px 4px' }}>
        <div className="translate-x-[-8px] group-hover:translate-x-0 transition-transform duration-200" style={{ transform: 'translateX(-8px)' }}>
          <div className="flex flex-col gap-2 bg-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-2" style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(55,65,81,0.5)', borderRadius: 16, padding: 8 }}>
            <DockButton active={activePanel==='simulation'} onClick={() => toggle('simulation')} label="Simulation">
              <BeakerIcon className="w-5 h-5" />
            </DockButton>
            <DockButton active={activePanel==='colors'} onClick={() => toggle('colors')} label="Colors">
              <PaletteIcon className="w-5 h-5" />
            </DockButton>
            <DockButton active={activePanel==='effects'} onClick={() => toggle('effects')} label="Effects">
              <WandIcon className="w-5 h-5" />
            </DockButton>
            <DockButton active={activePanel==='brush'} onClick={() => toggle('brush')} label="Brush">
              <PaintbrushIcon className="w-5 h-5" />
            </DockButton>
          </div>
        </div>
      </div>
    </div>
  );
};