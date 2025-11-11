import { renderHook, act } from '@testing-library/react';
import { useSessionPersistence } from '../hooks/useSessionPersistence';
import { DEFAULT_CONFIG } from '../constants';
import type { LiquidConfig } from '../types';

const SESSION_KEY = 'liquid-art-session';
const PROMPT_KEY = 'liquid-art-prompt-restore';

function makeState(overrides: Partial<{ config: LiquidConfig; history: LiquidConfig[]; historyIndex: number; isPlaying: boolean; isGridVisible: boolean; activeColorIndex: number; }> = {}) {
  const base = {
    config: DEFAULT_CONFIG,
    history: [DEFAULT_CONFIG],
    historyIndex: 0,
    isPlaying: true,
    isGridVisible: false,
    activeColorIndex: 0,
  };
  return { ...base, ...overrides };
}

describe('useSessionPersistence', () => {
  beforeEach(() => {
    try { localStorage.removeItem('liquid-art-session'); } catch {}
    try { localStorage.removeItem('liquid-art-prompt-restore'); } catch {}
  });

  it('prompts restore when keys exist and enabled', () => {
    localStorage.setItem(PROMPT_KEY, 'true');
    localStorage.setItem(SESSION_KEY, JSON.stringify(makeState()));

    const restoreSpy = vi.fn();
    const collect = () => makeState();

    const { result } = renderHook(() =>
      useSessionPersistence({ enabled: true, collect, restore: restoreSpy })
    );

    expect(result.current.showRestorePrompt).toBe(true);

    act(() => {
      result.current.handleRestore();
    });

    expect(restoreSpy).toHaveBeenCalled();
    expect(localStorage.getItem(PROMPT_KEY)).toBeNull();
  });

  it('saves on beforeunload when enabled', () => {
    const collect = () => makeState({ isPlaying: false });
    const restoreSpy = vi.fn();

    renderHook(() => useSessionPersistence({ enabled: true, collect, restore: restoreSpy }));

    // Simulate unload
    window.dispatchEvent(new Event('beforeunload'));

    expect(localStorage.getItem(PROMPT_KEY)).toBe('true');
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
    expect(saved.isPlaying).toBe(false);
  });

  it('dismiss clears keys', () => {
    localStorage.setItem(PROMPT_KEY, 'true');
    localStorage.setItem(SESSION_KEY, JSON.stringify(makeState()));

    const { result } = renderHook(() =>
      useSessionPersistence({ enabled: true, collect: () => makeState(), restore: vi.fn() })
    );

    act(() => {
      result.current.handleDismiss();
    });

    expect(localStorage.getItem(PROMPT_KEY)).toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });
});
