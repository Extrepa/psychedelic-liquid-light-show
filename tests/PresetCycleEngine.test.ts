import { describe, it, expect } from 'vitest';
import { nextIndex, type CycleMode } from '../features/presets/PresetCycleEngine';

function run(mode: CycleMode, len: number, steps: number) {
  let s = { current: 0, dir: 1 as 1 | -1 };
  const out: number[] = [];
  for (let i = 0; i < steps; i++) {
    s = nextIndex(mode, s, len);
    out.push(s.current);
  }
  return out;
}

describe('PresetCycleEngine.nextIndex', () => {
  it('sequential wraps around', () => {
    const seq = run('sequential', 3, 5);
    expect(seq).toEqual([1, 2, 0, 1, 2]);
  });
  it('pingpong bounces at edges', () => {
    const seq = run('pingpong', 3, 6);
    expect(seq).toEqual([1, 2, 1, 0, 1, 2]);
  });
  it('random always returns valid index', () => {
    const seq = run('random', 4, 20);
    expect(seq.every(i => i >= 0 && i < 4)).toBe(true);
  });
});
