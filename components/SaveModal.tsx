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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-modal-title"
    >
      <div 
        className="w-full max-w-md"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700/60 rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-start mb-4">
            <h2 id="save-modal-title" className="text-lg font-semibold text-white">Save Your Artwork</h2>
            <button onClick={onClose} aria-label="Close save dialog" className="p-1 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white">
                <CloseIcon className="w-5 h-5" />
            </button>
        </div>
        
        <p className="text-sm text-gray-300 mb-4">Give your creation a name to save it to your gallery.</p>
        
        <input
          ref={inputRef}
          type="text"
          value={artworkName}
          onChange={(e) => setArtworkName(e.target.value)}
          placeholder="e.g., Cosmic Bloom"
          className="w-full bg-gray-900/70 border border-gray-600 text-white placeholder-gray-400 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition duration-200"
        />
        
        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button 
            onClick={onSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
          >
            <SaveIcon className="w-4 h-4" />
            Save
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};
