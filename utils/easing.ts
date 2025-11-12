/**
 * Easing functions for smooth animations
 * All functions take t in range [0, 1] and return eased value in [0, 1]
 */

export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

export function linear(t: number): number {
  return Math.max(0, Math.min(1, t));
}

export function easeIn(t: number): number {
  t = Math.max(0, Math.min(1, t));
  return t * t;
}

export function easeOut(t: number): number {
  t = Math.max(0, Math.min(1, t));
  return 1 - (1 - t) * (1 - t);
}

export function easeInOut(t: number): number {
  t = Math.max(0, Math.min(1, t));
  if (t < 0.5) {
    return 2 * t * t;
  } else {
    return 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
}

/**
 * Get easing function by name
 */
export function getEasing(type: EasingType = 'ease-out'): (t: number) => number {
  switch (type) {
    case 'linear': return linear;
    case 'ease-in': return easeIn;
    case 'ease-out': return easeOut;
    case 'ease-in-out': return easeInOut;
    default: return easeOut;
  }
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}
