
export interface LiquidConfig {
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
}

export interface SavedArtwork {
  id: number;
  name: string;
  config: LiquidConfig;
  thumbnail: string; // base64 data URL
}