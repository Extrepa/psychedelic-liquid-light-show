import { useCallback, useRef, useState } from 'react';
import type { LiquidConfig } from '../types';
import { MAX_HISTORY_SIZE } from '../constants';

export interface HistorySnapshot {
  config: LiquidConfig;
  history: LiquidConfig[];
  historyIndex: number;
}

export function useHistory(initialConfig: LiquidConfig) {
  const [config, setConfig] = useState<LiquidConfig>(initialConfig);
  const historyRef = useRef<LiquidConfig[]>([initialConfig]);
  const indexRef = useRef<number>(0);

  const updateConfig = useCallback(
    (partial: Partial<LiquidConfig>, pushToHistory: boolean = true) => {
      setConfig(curr => {
        const updated = { ...curr, ...partial } as LiquidConfig;

        if (pushToHistory) {
          // Truncate forward history if we've undone
          if (indexRef.current < historyRef.current.length - 1) {
            historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
          }
          historyRef.current.push(updated);
          if (historyRef.current.length > MAX_HISTORY_SIZE) {
            historyRef.current.shift();
          }
          indexRef.current = historyRef.current.length - 1;
        }
        return updated;
      });
    },
    []
  );

  const undo = useCallback(() => {
    if (indexRef.current > 0) {
      indexRef.current -= 1;
      setConfig(historyRef.current[indexRef.current]);
    }
  }, []);

  const redo = useCallback(() => {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current += 1;
      setConfig(historyRef.current[indexRef.current]);
    }
  }, []);

  const getSnapshot = useCallback((): HistorySnapshot => {
    return {
      config,
      history: historyRef.current,
      historyIndex: indexRef.current,
    };
  }, [config]);

  const setFromSnapshot = useCallback((snap: HistorySnapshot) => {
    if (!snap || !snap.history || typeof snap.historyIndex !== 'number') return;
    historyRef.current = snap.history;
    indexRef.current = Math.max(0, Math.min(snap.history.length - 1, snap.historyIndex));
    setConfig(historyRef.current[indexRef.current] ?? snap.config);
  }, []);

  const reset = useCallback((next: LiquidConfig) => {
    historyRef.current = [next];
    indexRef.current = 0;
    setConfig(next);
  }, []);

  return {
    config,
    setConfig,
    updateConfig,
    undo,
    redo,
    getSnapshot,
    setFromSnapshot,
    reset,
    // expose read-only refs for advanced consumers (e.g., persistence)
    historyRef,
    indexRef,
  } as const;
}
