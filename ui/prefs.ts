export type ReducedPref = 'auto' | 'on' | 'off';

export function getTopPanelEnabled(): boolean {
  try {
    const url = new URL(window.location.href);
    const uiParam = url.searchParams.get('ui');
    if (uiParam === 'top') return true;
    if (uiParam === 'classic') return false;
    const ls = localStorage.getItem('ui:topPanel');
    if (ls === '1') return true;
    if (ls === '0') return false;
  } catch {}
  return true;
}

export function setTopPanelEnabled(enabled: boolean) {
  try { localStorage.setItem('ui:topPanel', enabled ? '1' : '0'); } catch {}
}

export function getPerfMode(): boolean {
  try { return localStorage.getItem('ui:perf') === '1'; } catch { return false; }
}
export function setPerfMode(enabled: boolean) {
  try { localStorage.setItem('ui:perf', enabled ? '1' : '0'); } catch {}
}

export function getReducedMotionPref(): ReducedPref {
  try { return (localStorage.getItem('ui:reducedMotion') as ReducedPref) || 'auto'; } catch { return 'auto'; }
}
export function setReducedMotionPref(v: ReducedPref) {
  try { localStorage.setItem('ui:reducedMotion', v); } catch {}
}

export function prefersReducedMotion(): boolean {
  const pref = getReducedMotionPref();
  if (pref === 'on') return true;
  if (pref === 'off') return false;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
}

export type ExportDefaults = { duration: number; quality: number };
export function getExportDefaults(): ExportDefaults {
  try {
    const raw = localStorage.getItem('ui:export');
    if (!raw) return { duration: 10, quality: 5_000_000 };
    const parsed = JSON.parse(raw);
    return { duration: parsed.duration ?? 10, quality: parsed.quality ?? 5_000_000 };
  } catch { return { duration: 10, quality: 5_000_000 }; }
}
export function setExportDefaults(v: ExportDefaults) {
  try { localStorage.setItem('ui:export', JSON.stringify(v)); } catch {}
}
