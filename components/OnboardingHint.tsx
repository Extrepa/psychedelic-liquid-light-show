import React from 'react';

interface OnboardingHintProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingHint: React.FC<OnboardingHintProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-gray-900/85 text-white rounded-xl border border-gray-700/60 p-4 max-w-md w-[92vw] shadow-2xl">
        <h2 className="text-base font-semibold mb-2">Quick start</h2>
        <ul className="list-disc pl-5 text-sm text-gray-200 space-y-1">
          <li>Tap or hold to drop. Hold grows the drop. Release to commit.</li>
          <li>Right‑click to change color fast, or use the Colors tab.</li>
          <li>Use the Presets tab to pick a vibe. Cycle presets from the top strip.</li>
          <li>Wheel = Oil/Water. Cmd + Wheel = cycle colors.</li>
          <li>Save from the toolbar. Export video from the same toolbar.</li>
        </ul>
        <div className="text-xs text-gray-400 mt-2">Tip: Open Settings to adjust brightness, flash/flicker, runoff, and parallax.</div>
        <div className="flex justify-end mt-3">
          <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md bg-purple-600 hover:bg-purple-700">Got it</button>
        </div>
      </div>
    </div>
  );
};
