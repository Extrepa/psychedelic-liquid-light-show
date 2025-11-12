
import type { LiquidConfig } from './types';

export const DEFAULT_CONFIG: LiquidConfig = {
  // Legacy/common
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

  // Two-phase physics (mobile-safe defaults)
  surfaceTension: 0.5,
  oilDensity: 0.85,
  waterDensity: 1.0,
  gravityAngleDeg: 90,
  gravityStrength: 0.4,
  simScale: 0.5,
  pressureIterations: 12,

  // Optics
  refractiveIndexOil: 1.45,
  gloss: 0.75,
  lightAngleDeg: 45,
  lightIntensity: 1.0,
  refractionStrength: 0.6,
  thinFilm: false,

  // Phase palettes
  oilPalette: ['#FFB200', '#FF8C3A', '#D88C00'],
  waterPalette: ['#00C2FF', '#0077FF', '#2B2DFF'],

  // Input/tool
  activePhase: 'oil',
  dropperEnabled: false,
};

export const MAX_HISTORY_SIZE = 30;

/**
 * "Errl Day" preset: commemorates the day Errl was made with golden oil and vibrant water palettes,
 * tuned buoyancy, and optical shimmer.
 */
export const PRESET_ERRL_DAY: Partial<LiquidConfig> = {
  // Physics
  surfaceTension: 0.62,
  viscosity: 0.45,
  oilDensity: 0.85,
  waterDensity: 1.0,
  gravityAngleDeg: 100,
  gravityStrength: 0.55,
  simScale: 0.5,
  pressureIterations: 12,

  // Optics
  refractiveIndexOil: 1.47,
  gloss: 0.80,
  lightAngleDeg: 35,
  lightIntensity: 1.20,
  refractionStrength: 0.80,
  thinFilm: true,

  // Palettes
  oilPalette: ['#FFB200', '#D88C00', '#A85E00', '#FFD67B', '#FF8C3A'],
  waterPalette: ['#00C2FF', '#0077FF', '#2B2DFF', '#7A00FF', '#00FFA6'],

  // Legacy for compat
  colors: ['#FFB200', '#00C2FF', '#D88C00', '#0077FF', '#FF8C3A'],
  density: 0.85,
  velocity: 0.4,
  diffusion: 0.7,
  bloom: 0.6,
  sunrays: 0.5,
  splatRadius: 0.3,
  blendMode: 'lighter',
  chromaticAberration: 0.02,
  grain: 0.15,
};
