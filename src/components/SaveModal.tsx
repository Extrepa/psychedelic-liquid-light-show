
import React, { useEffect, useRef } from 'react';
import { SaveIcon } from './icons/SaveIcon';
import { CloseIcon } from './icons/CloseIcon';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  artworkName: string;
  setArtworkName: (name: string) => void;
}

export const SaveModal: React.FC<SaveModalProps> = ({ isOpen, onClose, onSave, artworkName, setArtworkName }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus the input when the modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed z-50"
      role="dialog"
      aria-modal="false"
      aria-labelledby="save-modal-title"
      style={{ position:'fixed', top: 64, right: 16, zIndex: 5000 }}
    >
      <div 
        className="bg-gray-900/90 border border-gray-700 rounded-xl shadow-2xl w-[320px] p-4 backdrop-blur"
        onKeyDown={handleKeyDown}
      >
        <div className="flex justify-between items-start mb-2">
            <h2 id="save-modal-title" className="text-sm font-bold text-white">Save Artwork</h2>
            <button onClick={onClose} aria-label="Close save dialog" className="p-1 text-gray-300 rounded hover:bg-gray-700 hover:text-white">
                <CloseIcon className="w-4 h-4" />
            </button>
        </div>
        <p className="text-xs text-gray-300 mb-2">Name your creation and save it to the gallery.</p>
        <input
          ref={inputRef}
          type="text"
          value={artworkName}
          onChange={(e) => setArtworkName(e.target.value)}
          placeholder="e.g., Cosmic Bloom"
          className="w-full bg-gray-900/70 border border-gray-600 text-white placeholder-gray-400 text-xs rounded-md px-2 py-1"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 text-xs font-medium text-gray-300 bg-gray-700 rounded hover:bg-gray-600">Cancel</button>
          <button onClick={onSave} className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 flex items-center gap-1">
            <SaveIcon className="w-3 h-3" /> Save
          </button>
        </div>
      </div>
    </div>
  );
};