import React from 'react';
import { getTopPanelEnabled, setTopPanelEnabled, getPerfMode, setPerfMode, getReducedMotionPref, setReducedMotionPref, type ReducedPref } from '../../ui/prefs';

import { setExportDefaults, getExportDefaults } from '../../ui/prefs';

interface SettingsPanelProps {
  onClose: () => void;
  onPerfChange: (enabled: boolean) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose, onPerfChange }) => {
  const [top, setTop] = React.useState<boolean>(getTopPanelEnabled());
  const [perf, setPerf] = React.useState<boolean>(getPerfMode());
  const [rm, setRm] = React.useState<ReducedPref>(getReducedMotionPref());
  const [exp, setExp] = React.useState(() => getExportDefaults());

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

      <section>
        <h3 className="text-xs text-gray-300 uppercase font-semibold mb-2">Export defaults</h3>
        <div className="flex gap-2 items-center text-sm text-gray-200">
          <label>Duration</label>
          <select value={exp.duration} onChange={e=>{const v={...exp, duration:parseInt(e.target.value)}; setExp(v); setExportDefaults(v);}} className="bg-gray-800 text-gray-200 rounded-md px-2 py-1 border border-gray-700">
            <option value={5}>5s</option>
            <option value={10}>10s</option>
            <option value={15}>15s</option>
            <option value={30}>30s</option>
          </select>
          <label>Quality</label>
          <select value={exp.quality} onChange={e=>{const v={...exp, quality:parseInt(e.target.value)}; setExp(v); setExportDefaults(v);}} className="bg-gray-800 text-gray-200 rounded-md px-2 py-1 border border-gray-700">
            <option value={1000000}>Low (1 Mbps)</option>
            <option value={5000000}>Medium (5 Mbps)</option>
            <option value={10000000}>High (10 Mbps)</option>
          </select>
        </div>
      </section>

      <div className="flex justify-end">
        <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600">Close</button>
      </div>
    </div>
  );
};
