
export interface LiquidConfig {
  // Legacy/common params (keep for backward compat)
  density: number;
  velocity: number;
  viscosity: number;
  pressure: number;
  diffusion: number;
  bloom: number;
  sunrays: number;
  colors: string[];
  splatRadius: number;
  blendMode: string;
  chromaticAberration: number;
  grain: number;

  // Two-phase physics
  surfaceTension?: number;
  oilDensity?: number;
  waterDensity?: number;
  gravityAngleDeg?: number;
  gravityStrength?: number;
  simScale?: number;
  pressureIterations?: number;

  // Optics
  refractiveIndexOil?: number;
  gloss?: number;
  lightAngleDeg?: number;
  lightIntensity?: number;
  refractionStrength?: number;
  thinFilm?: boolean;
  
  // Scene brightness and effects
  sceneBrightness?: number; // overall brightness multiplier (0.5–2)
  flashOnResize?: boolean; // flash white highlight on resize
  flashIntensity?: number; // 0–1 strength of resize flash
  flashDurationMs?: number; // ms to fade the flash
  flickerEnabled?: boolean; // random flicker on splats
  flickerIntensity?: number; // 0–1 per-splat flicker strength
  
  // Edge behavior
  edgeRunoffEnabled?: boolean; // show drips running off screen edges
  edgeRunoffThicknessPx?: number; // thickness in pixels
  edgeRunoffLengthScale?: number; // 0–1 how long the runoff travels
  
  // Scene parallax
  sceneParallaxEnabled?: boolean;
  sceneParallaxAmount?: number; // 0–1 how strong rotateY parallax is
  
  // Phase palettes
  oilPalette?: string[];
  waterPalette?: string[];

  // Input/tool
  activePhase?: 'oil' | 'water';
  
  // Brush patterns
  brushPattern?: 'single' | 'polkadots' | 'stripes' | 'line' | 'spray' | 'text' | 'stamp';
  brushText?: string;
  brushStampImage?: string; // base64 data URL
  brushSpacing?: number; // for patterns like stripes/polkadots
  eraserMode?: boolean; // eraser active
  
  // Background patterns
  backgroundPattern?: 'none' | 'grid' | 'dots' | 'radial' | 'hexagons';
  backgroundOpacity?: number; // 0-1
  backgroundScale?: number; // pattern size multiplier
  
  // Color effects
  hueShift?: number; // 0-1, amount of hue rotation over particle lifetime
  
  // Dropper mode (main interaction)
  dropperEnabled?: boolean;
  dropMinRadius?: number; // normalized to canvas width, e.g. 0.01
  dropMaxRadius?: number; // normalized to canvas width, e.g. 0.15
  dropTimeToMaxMs?: number; // milliseconds to grow from min to max
  dropEasing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  dropPreview?: boolean; // show preview circle while holding
  // Custom dropper art overlay
  dropperCursorEnabled?: boolean;
  dropperCursorUrl?: string; // data URL or path to image
  dropperCursorSizePx?: number; // displayed size in pixels
  dropperCursorRotationDeg?: number; // visual rotation of the dropper art
  dropperCursorTipOffsetX?: number; // px from image left to tip alignment
  dropperCursorTipOffsetY?: number; // px from image top to tip alignment
  
  // Optional modes (off by default)
  dripEnabled?: boolean; // emit micro-drops at interval while holding
  dripIntervalMs?: number; // milliseconds between drips
  lineEnabled?: boolean; // continuous drawing mode (existing brush patterns)
  
  // Symmetry / Kaleidoscope
  symmetryEnabled?: boolean;
  symmetryCount?: 2 | 4 | 6 | 8 | 12; // number of symmetric copies
  symmetryMirror?: boolean; // true kaleidoscope mirroring
  symmetryRotationDeg?: number; // rotation offset 0-360
  symmetryOrigin?: { x: number; y: number }; // normalized 0-1, default center
}

export interface SavedArtwork {
  id: number;
  name: string;
  config: LiquidConfig;
  thumbnail: string; // base64 data URL
}