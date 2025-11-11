
import type { LiquidConfig } from '../types';

export const DEFAULT_CONFIG: LiquidConfig = {
  density: 0.9,
  velocity: 0.3,
  viscosity: 0.2,
  pressure: 0.8,
  diffusion: 0.6,
  bloom: 0.5,
  sunrays: 0.5,
  colors: ['#ff0000', '#00ff00', '#0000ff'],
  splatRadius: 0.25,
  blendMode: 'lighter',
  chromaticAberration: 0,
  grain: 0.1,
};

export const MAX_HISTORY_SIZE = 30;