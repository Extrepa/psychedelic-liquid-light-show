import { renderHook, act } from '@testing-library/react';
import { useArtworkGallery } from '../hooks/useArtworkGallery';
import { DEFAULT_CONFIG } from '../constants';

describe('useArtworkGallery', () => {
  beforeEach(() => {
    try { localStorage.removeItem('liquid-art-gallery'); } catch {}
  });

  it('loads from localStorage and can create/delete artworks', () => {
    const { result } = renderHook(() => useArtworkGallery());

    expect(result.current.savedArtworks.length).toBe(0);

    act(() => {
      result.current.createAndSaveArtwork('Test', DEFAULT_CONFIG, 'data:image/png;base64,AAA');
    });

    expect(result.current.savedArtworks.length).toBe(1);
    const id = result.current.savedArtworks[0].id;

    // get by id
    expect(result.current.getArtworkById(id)?.name).toBe('Test');

    act(() => {
      result.current.deleteArtwork(id);
    });

    expect(result.current.savedArtworks.length).toBe(0);
  });
});
