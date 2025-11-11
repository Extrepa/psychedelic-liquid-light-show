import React, { useEffect, useRef } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal>
      <div ref={ref} className="bg-gray-900/80 backdrop-blur-md border border-gray-700/60 rounded-2xl shadow-2xl p-6 w-full max-w-lg" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-white font-semibold">Keyboard Shortcuts</h2>
          <button className="p-1 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white" onClick={onClose} aria-label="Close shortcuts">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <ul className="text-gray-200 text-sm space-y-2">
          <li><span className="text-gray-400">?</span> Open this help</li>
          <li><span className="text-gray-400">G</span> Toggle grid</li>
          <li><span className="text-gray-400">P</span> Play/Pause</li>
          <li><span className="text-gray-400">S</span> Save artwork</li>
          <li><span className="text-gray-400">E</span> Export video</li>
          <li><span className="text-gray-400">Z / Shift+Z</span> Undo / Redo</li>
        </ul>
      </div>
    </div>
  );
};
