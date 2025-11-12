
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

  // Phase palettes
  oilPalette?: string[];
  waterPalette?: string[];

  // Input/tool
  activePhase?: 'oil' | 'water';
  dropperEnabled?: boolean;
}

export interface SavedArtwork {
  id: number;
  name: string;
  config: LiquidConfig;
  thumbnail: string; // base64 data URL
}