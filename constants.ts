
import type { LiquidConfig } from './types';

export const DEFAULT_CONFIG: LiquidConfig = {
  // Legacy/common
  density: 0.9,
  velocity: 0.3,
  viscosity: 0.18, // Slightly lower for livelier motion
  pressure: 0.8,
  diffusion: 0.6,
  bloom: 0.5,
  sunrays: 0.5,
  colors: ['#ff0000', '#00ff00', '#0000ff'],
  splatRadius: 0.25,
  blendMode: 'lighter',
  chromaticAberration: 0,
  grain: 0.1,

  // Two-phase physics (enhanced for push-away feel)
  surfaceTension: 0.6, // +0.1 for stronger droplet formation
  oilDensity: 0.85,
  waterDensity: 1.0,
  gravityAngleDeg: 90,
  gravityStrength: 0.5, // +0.1 for more dramatic separation
  simScale: 0.5,
  pressureIterations: 12,

  // Optics
  refractiveIndexOil: 1.45,
  gloss: 0.75,
  lightAngleDeg: 45,
  lightIntensity: 1.0,
  refractionStrength: 0.6,
  thinFilm: false,
  
  // Scene brightness and effects
  sceneBrightness: 1.0,
  flashOnResize: true,
  flashIntensity: 0.15,
  flashDurationMs: 300,
  flickerEnabled: false,
  flickerIntensity: 0.2,
  
  // Edge behavior
  edgeRunoffEnabled: true,
  edgeRunoffThicknessPx: 4,
  edgeRunoffLengthScale: 0.6,
  
  // Scene parallax
  sceneParallaxEnabled: false,
  sceneParallaxAmount: 0.5,
  
  // Phase palettes
  oilPalette: ['#FFB200', '#FF8C3A', '#D88C00'],
  waterPalette: ['#00C2FF', '#0077FF', '#2B2DFF'],

  // Input/tool
  activePhase: 'oil',
  dropperEnabled: true, // Main interaction mode
  
  // Dropper settings
  dropMinRadius: 0.01, // 1% of canvas width
  dropMaxRadius: 0.15, // 15% of canvas width (dramatic!)
  dropTimeToMaxMs: 1200, // 1.2 seconds to reach max
  dropEasing: 'ease-out', // Smooth deceleration
  dropPreview: true, // Show preview circle
  dropperCursorEnabled: true,
  dropperCursorUrl: '', // user-provided
  dropperCursorSizePx: 42, // a bit bigger than a dime/mouse cursor
  dropperCursorRotationDeg: -8,
  dropperCursorTipOffsetX: 10,
  dropperCursorTipOffsetY: 32,

  // Targeting visuals
  crosshairSizePx: 12,
  dropPreviewLagMs: 500,
  
  // Optional modes (off by default)
  dripEnabled: false,
  dripIntervalMs: 140,
  lineEnabled: false,
  
  // Symmetry / Kaleidoscope
  symmetryEnabled: false,
  symmetryCount: 6, // Hexagonal by default
  symmetryMirror: true, // True kaleidoscope
  symmetryRotationDeg: 0,
  symmetryOrigin: { x: 0.5, y: 0.5 }, // Canvas center
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
