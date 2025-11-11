export type CycleMode = 'sequential' | 'pingpong' | 'random';

export interface CycleState {
  current: number; // index within selected list
  dir: 1 | -1;    // for pingpong
}

export function nextIndex(mode: CycleMode, state: CycleState, listLen: number): CycleState {
  if (listLen <= 0) return state;
  if (mode === 'random') {
    let next = Math.floor(Math.random() * listLen);
    // avoid repeating same value if possible
    if (listLen > 1 && next === state.current) {
      next = (next + 1) % listLen;
    }
    return { current: next, dir: state.dir };
  }
  if (mode === 'sequential') {
    const next = (state.current + 1) % listLen;
    return { current: next, dir: 1 };
  }
  // pingpong
  let next = state.current + state.dir;
  if (next >= listLen) {
    next = listLen - 2 >= 0 ? listLen - 2 : 0;
    return { current: next, dir: -1 };
  }
  if (next < 0) {
    next = listLen > 1 ? 1 : 0;
    return { current: next, dir: 1 };
  }
  return { current: next, dir: state.dir };
}
