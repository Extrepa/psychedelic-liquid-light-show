import { useEffect, useState, useCallback } from 'react';
import type { SavedArtwork, LiquidConfig } from '../types';

const STORAGE_KEY = 'liquid-art-gallery';

export function useArtworkGallery() {
  const [savedArtworks, setSavedArtworks] = useState<SavedArtwork[]>([]);

  // Load from localStorage once
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSavedArtworks(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load artworks from localStorage', e);
    }
  }, []);

  const persist = useCallback((items: SavedArtwork[]) => {
    setSavedArtworks(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist artworks', e);
    }
  }, []);

  const addArtwork = useCallback((art: SavedArtwork) => {
    persist([...savedArtworks, art]);
  }, [persist, savedArtworks]);

  const createAndSaveArtwork = useCallback((name: string, config: LiquidConfig, thumbnail: string) => {
    const art: SavedArtwork = {
      id: Date.now(),
      name,
      config,
      thumbnail,
    };
    persist([...savedArtworks, art]);
    return art;
  }, [persist, savedArtworks]);

  const deleteArtwork = useCallback((id: number) => {
    const next = savedArtworks.filter(a => a.id !== id);
    persist(next);
  }, [persist, savedArtworks]);

  const getArtworkById = useCallback((id: number) => {
    return savedArtworks.find(a => a.id === id) || null;
  }, [savedArtworks]);

  return {
    savedArtworks,
    addArtwork,
    createAndSaveArtwork,
    deleteArtwork,
    getArtworkById,
  } as const;
}
