import React from 'react';
import { getTopPanelEnabled, setTopPanelEnabled, getPerfMode, setPerfMode, getReducedMotionPref, setReducedMotionPref, type ReducedPref } from '../../ui/prefs';

interface SettingsPanelProps {
  onClose: () => void;
  onPerfChange: (enabled: boolean) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose, onPerfChange }) => {
  const [top, setTop] = React.useState<boolean>(getTopPanelEnabled());
  const [perf, setPerf] = React.useState<boolean>(getPerfMode());
  const [rm, setRm] = React.useState<ReducedPref>(getReducedMotionPref());

  const applyTop = (v: boolean) => {
    setTop(v);
    setTopPanelEnabled(v);
  };
  const applyPerf = (v: boolean) => {
    setPerf(v);
    setPerfMode(v);
    onPerfChange(v);
  };
  const applyRm = (v: ReducedPref) => {
    setRm(v);
    setReducedMotionPref(v);
  };

  return (
    <div className="flex flex-col gap-4">
      <section>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">Layout</h3>
        <label className="flex items-center gap-2 text-gray-200">
          <input type="checkbox" checked={top} onChange={e => applyTop(e.target.checked)} />
          Use top-left AppBar + pull-down panel
        </label>
        <p className="text-xs text-gray-500 mt-1">Change persists; reload to apply if it doesn’t switch immediately.</p>
      </section>

      <section>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">Performance</h3>
        <label className="flex items-center gap-2 text-gray-200">
          <input type="checkbox" checked={perf} onChange={e => applyPerf(e.target.checked)} />
          Performance mode (lighter effects)
        </label>
        <p className="text-xs text-gray-500 mt-1">Reduces effect intensity and particle work for smoother rendering.</p>
      </section>

      <section>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">Reduced motion</h3>
        <div className="flex gap-2">
          <button onClick={() => applyRm('auto')} className={`px-2 py-1 rounded-md border ${rm==='auto'?'border-purple-500 text-white bg-purple-600/30':'border-gray-600 text-gray-200 bg-gray-700'}`}>Auto</button>
          <button onClick={() => applyRm('on')} className={`px-2 py-1 rounded-md border ${rm==='on'?'border-purple-500 text-white bg-purple-600/30':'border-gray-600 text-gray-200 bg-gray-700'}`}>On</button>
          <button onClick={() => applyRm('off')} className={`px-2 py-1 rounded-md border ${rm==='off'?'border-purple-500 text-white bg-purple-600/30':'border-gray-600 text-gray-200 bg-gray-700'}`}>Off</button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Overrides system preference for panel/HUD animations.</p>
      </section>

      <div className="flex justify-end">
        <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600">Close</button>
      </div>
    </div>
  );
};
