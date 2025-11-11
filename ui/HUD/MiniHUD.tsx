import React, { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../prefs';

interface MiniHUDProps {
  visible: boolean;
  presetName?: string;
  mode?: 'sequential' | 'pingpong' | 'random';
  cadence?: 'per-stroke' | 'per-splat';
}

export const MiniHUD: React.FC<MiniHUDProps> = ({ visible, presetName, mode, cadence }) => {
  const [show, setShow] = useState(visible);
  useEffect(() => setShow(visible), [visible]);

  // Read reduced motion with user override
  const prefersReduced = prefersReducedMotion();

  return (
    <div className={`fixed top-2 left-1/2 -translate-x-1/2 z-50 ${prefersReduced ? '' : 'transition-opacity duration-300'} ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="px-3 py-1 text-xs text-white bg-gray-900/80 backdrop-blur-md border border-gray-700/60 rounded-full shadow-xl">
        {presetName ? `${presetName}` : 'Preset cycle'}
        {mode ? ` • ${mode}` : ''}
        {cadence ? ` • ${cadence}` : ''}
      </div>
    </div>
  );
};
