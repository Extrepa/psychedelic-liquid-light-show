
import React from 'react';
import type { SavedArtwork } from '../types';
import { GalleryItem } from './GalleryItem';
import { CloseIcon } from './icons/CloseIcon';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  artworks: SavedArtwork[];
  onLoad: (id: number) => void;
  onDelete: (id: number) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({ isOpen, onClose, artworks, onLoad, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed z-50"
      role="dialog"
      aria-modal="false"
      aria-labelledby="gallery-title"
      style={{ position:'fixed', top: 64, right: 16, width: 380, zIndex: 5000 }}
    >
      <div 
        className="bg-gray-900/90 border border-gray-700 rounded-xl shadow-2xl w-full h-[60vh] flex flex-col backdrop-blur"
      >
        <header className="flex items-center justify-between p-3 border-b border-gray-700">
          <h2 id="gallery-title" className="text-sm font-bold text-white">Gallery</h2>
          <button onClick={onClose} className="p-1 text-gray-300 rounded hover:bg-gray-700 hover:text-white" aria-label="Close gallery">
            <CloseIcon className="w-4 h-4" />
          </button>
        </header>
        <main className="p-3 flex-1 overflow-y-auto">
          {artworks.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-sm">Your gallery is empty. Save an artwork to see it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[...artworks].reverse().map(artwork => (
                <GalleryItem key={artwork.id} artwork={artwork} onLoad={onLoad} onDelete={onDelete} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};