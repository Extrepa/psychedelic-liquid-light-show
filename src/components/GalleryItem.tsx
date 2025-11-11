
import React from 'react';
import type { SavedArtwork } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { Tooltip } from './Tooltip';

interface GalleryItemProps {
  artwork: SavedArtwork;
  onLoad: (id: number) => void;
  onDelete: (id: number) => void;
}

export const GalleryItem: React.FC<GalleryItemProps> = ({ artwork, onLoad, onDelete }) => {
  return (
    <div className="group relative aspect-square bg-gray-800 rounded-lg overflow-hidden shadow-md">
      <img src={artwork.thumbnail} alt={artwork.name} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
        <h3 className="text-white font-semibold truncate">{artwork.name}</h3>
        <div className="flex justify-end gap-2">
          <Tooltip text={`Load ${artwork.name}`}>
            <button 
              onClick={() => onLoad(artwork.id)}
              className="p-2 bg-blue-600/80 text-white rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label={`Load ${artwork.name}`}
            >
              <UploadIcon className="w-5 h-5" />
            </button>
          </Tooltip>
          <Tooltip text={`Delete ${artwork.name}`}>
            <button 
              onClick={() => onDelete(artwork.id)}
              className="p-2 bg-red-600/80 text-white rounded-full hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label={`Delete ${artwork.name}`}
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};