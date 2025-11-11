import { useCallback, useEffect, useState } from 'react';
import type { LiquidConfig } from '../types';

// Keys kept consistent with existing app behavior
const SESSION_KEY = 'liquid-art-session';
const PROMPT_KEY = 'liquid-art-prompt-restore';

export interface SessionState {
  config: LiquidConfig;
  history: LiquidConfig[];
  historyIndex: number;
  isPlaying: boolean;
  isGridVisible: boolean;
  activeColorIndex: number;
}

interface UseSessionPersistenceArgs {
  enabled: boolean; // when false, clears any pending prompt and does not save
  collect: () => SessionState; // collect current app state for saving
  restore: (state: SessionState) => void; // apply a saved state to the app
}

export function useSessionPersistence({ enabled, collect, restore }: UseSessionPersistenceArgs) {
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  // On unload, save or clear depending on enabled
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!enabled) {
        try {
          localStorage.removeItem(PROMPT_KEY);
          localStorage.removeItem(SESSION_KEY);
        } catch {}
        return;
      }
      try {
        const state = collect();
        localStorage.setItem(SESSION_KEY, JSON.stringify(state));
        localStorage.setItem(PROMPT_KEY, 'true');
      } catch (e) {
        console.error('Failed to save session to localStorage', e);
        localStorage.removeItem(PROMPT_KEY);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, collect]);

  // On mount, decide whether to prompt restoration
  useEffect(() => {
    try {
      const shouldPrompt = localStorage.getItem(PROMPT_KEY) === 'true';
      const savedStateJSON = localStorage.getItem(SESSION_KEY);
      if (enabled && shouldPrompt && savedStateJSON) {
        setShowRestorePrompt(true);
      } else {
        localStorage.removeItem(PROMPT_KEY);
        localStorage.removeItem(SESSION_KEY);
      }
    } catch (e) {
      console.error('Failed to read session from localStorage', e);
    }
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRestore = useCallback(() => {
    try {
      const savedStateJSON = localStorage.getItem(SESSION_KEY);
      if (!savedStateJSON) return;
      const savedState: SessionState = JSON.parse(savedStateJSON);
      restore(savedState);
    } catch (e) {
      console.error('Failed to restore session', e);
      localStorage.removeItem(SESSION_KEY);
    } finally {
      localStorage.removeItem(PROMPT_KEY);
      setShowRestorePrompt(false);
    }
  }, [restore]);

  const handleDismiss = useCallback(() => {
    localStorage.removeItem(PROMPT_KEY);
    localStorage.removeItem(SESSION_KEY);
    setShowRestorePrompt(false);
  }, []);

  return { showRestorePrompt, handleRestore, handleDismiss } as const;
}
