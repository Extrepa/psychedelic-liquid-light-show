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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-title"
    >
      <div 
        className="w-full max-w-4xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700/60 rounded-2xl shadow-2xl h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 id="gallery-title" className="text-xl font-bold text-white">Your Gallery</h2>
          <button 
            onClick={onClose} 
            className="p-1 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Close gallery"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <main className="p-4 md:p-6 flex-1 overflow-y-auto">
          {artworks.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">Your gallery is empty. Create some art and save it!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...artworks].reverse().map(artwork => (
                <GalleryItem key={artwork.id} artwork={artwork} onLoad={onLoad} onDelete={onDelete} />
              ))}
            </div>
          )}
        </main>
        </div>
      </div>
    </div>
  );
};
