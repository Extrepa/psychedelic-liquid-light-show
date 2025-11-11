import { renderHook, act } from '@testing-library/react';
import { useHistory } from '../hooks/useHistory';
import { DEFAULT_CONFIG } from '../constants';

describe('useHistory', () => {
  it('initializes with given config and pushes updates to history', () => {
    const { result } = renderHook(() => useHistory(DEFAULT_CONFIG));

    expect(result.current.config).toEqual(DEFAULT_CONFIG);

    act(() => {
      result.current.updateConfig({ density: 0.5 });
    });

    expect(result.current.config.density).toBe(0.5);
    // Undo should restore
    act(() => {
      result.current.undo();
    });
    expect(result.current.config.density).toBe(DEFAULT_CONFIG.density);

    // Redo should reapply
    act(() => {
      result.current.redo();
    });
    expect(result.current.config.density).toBe(0.5);
  });

  it('provides snapshot and can restore from it', () => {
    const { result } = renderHook(() => useHistory(DEFAULT_CONFIG));

    act(() => {
      result.current.updateConfig({ viscosity: 0.77 });
      result.current.updateConfig({ pressure: 0.11 });
    });

    const snap = result.current.getSnapshot();
    expect(snap.history.length).toBeGreaterThan(1);

    // Reset then restore
    act(() => {
      result.current.reset(DEFAULT_CONFIG);
    });
    expect(result.current.config.pressure).toBe(DEFAULT_CONFIG.pressure);

    act(() => {
      result.current.setFromSnapshot(snap);
    });
    expect(result.current.config.pressure).toBe(0.11);
  });
});
