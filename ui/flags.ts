import { getTopPanelEnabled } from './prefs';

export function isTopPanelEnabled(): boolean {
  return getTopPanelEnabled();
}

export { setTopPanelEnabled } from './prefs';
