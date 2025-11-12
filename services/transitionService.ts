/**
 * Preset Transition Service
 * 
 * Provides smooth interpolation between config states
 */

import type { LiquidConfig } from '../types';

export interface TransitionOptions {
  duration: number; // milliseconds
  easing: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut';
  onUpdate: (config: LiquidConfig) => void;
  onComplete?: () => void;
}

/**
 * Easing functions
 */
const easingFunctions = {
  linear: (t: number) => t,
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeIn: (t: number) => t * t,
  easeOut: (t: number) => t * (2 - t),
};

/**
 * Interpolate between two numbers
 */
function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Interpolate between two hex colors
 */
function lerpColor(start: string, end: string, t: number): string {
  // Convert hex to RGB
  const startR = parseInt(start.slice(1, 3), 16);
  const startG = parseInt(start.slice(3, 5), 16);
  const startB = parseInt(start.slice(5, 7), 16);
  
  const endR = parseInt(end.slice(1, 3), 16);
  const endG = parseInt(end.slice(3, 5), 16);
  const endB = parseInt(end.slice(5, 7), 16);
  
  // Lerp each channel
  const r = Math.round(lerp(startR, endR, t));
  const g = Math.round(lerp(startG, endG, t));
  const b = Math.round(lerp(startB, endB, t));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Interpolate between two color arrays
 */
function lerpColorArray(start: string[], end: string[], t: number): string[] {
  // Handle different array lengths by padding with last color
  const maxLength = Math.max(start.length, end.length);
  const paddedStart = [...start];
  const paddedEnd = [...end];
  
  while (paddedStart.length < maxLength) {
    paddedStart.push(paddedStart[paddedStart.length - 1] || '#000000');
  }
  while (paddedEnd.length < maxLength) {
    paddedEnd.push(paddedEnd[paddedEnd.length - 1] || '#000000');
  }
  
  return paddedStart.map((startColor, i) => lerpColor(startColor, paddedEnd[i], t));
}

/**
 * Interpolate between two configs
 */
function lerpConfig(start: LiquidConfig, end: LiquidConfig, t: number): LiquidConfig {
  const result: LiquidConfig = { ...start };
  
  // Interpolate numeric values
  const numericKeys: (keyof LiquidConfig)[] = [
    'density', 'velocity', 'viscosity', 'pressure', 'diffusion',
    'bloom', 'sunrays', 'splatRadius', 'chromaticAberration', 'grain',
    'surfaceTension', 'oilDensity', 'waterDensity', 'gravityAngleDeg',
    'gravityStrength', 'simScale', 'pressureIterations',
    'refractiveIndexOil', 'gloss', 'lightAngleDeg', 'lightIntensity',
    'refractionStrength', 'brushSpacing', 'backgroundOpacity',
    'backgroundScale', 'hueShift',
  ];
  
  numericKeys.forEach(key => {
    const startVal = start[key];
    const endVal = end[key];
    if (typeof startVal === 'number' && typeof endVal === 'number') {
      (result as any)[key] = lerp(startVal, endVal, t);
    }
  });
  
  // Interpolate colors
  if (start.colors && end.colors) {
    result.colors = lerpColorArray(start.colors, end.colors, t);
  }
  
  if (start.oilPalette && end.oilPalette) {
    result.oilPalette = lerpColorArray(start.oilPalette, end.oilPalette, t);
  }
  
  if (start.waterPalette && end.waterPalette) {
    result.waterPalette = lerpColorArray(start.waterPalette, end.waterPalette, t);
  }
  
  // For non-numeric values, switch at t=0.5
  if (t < 0.5) {
    result.blendMode = start.blendMode;
    result.activePhase = start.activePhase;
    result.brushPattern = start.brushPattern;
    result.backgroundPattern = start.backgroundPattern;
    result.thinFilm = start.thinFilm;
    result.dropperEnabled = start.dropperEnabled;
    result.eraserMode = start.eraserMode;
  } else {
    result.blendMode = end.blendMode;
    result.activePhase = end.activePhase;
    result.brushPattern = end.brushPattern;
    result.backgroundPattern = end.backgroundPattern;
    result.thinFilm = end.thinFilm;
    result.dropperEnabled = end.dropperEnabled;
    result.eraserMode = end.eraserMode;
  }
  
  return result;
}

export class TransitionService {
  private animationFrameId: number | null = null;
  private startTime: number = 0;
  private isRunning: boolean = false;
  
  /**
   * Start a transition between two configs
   */
  transition(
    startConfig: LiquidConfig,
    endConfig: LiquidConfig,
    options: TransitionOptions
  ): void {
    // Cancel any existing transition
    this.cancel();
    
    this.isRunning = true;
    this.startTime = performance.now();
    
    const animate = (currentTime: number) => {
      if (!this.isRunning) return;
      
      const elapsed = currentTime - this.startTime;
      const progress = Math.min(elapsed / options.duration, 1);
      
      // Apply easing
      const easedProgress = easingFunctions[options.easing](progress);
      
      // Interpolate config
      const interpolatedConfig = lerpConfig(startConfig, endConfig, easedProgress);
      
      // Update
      options.onUpdate(interpolatedConfig);
      
      // Continue or complete
      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.isRunning = false;
        this.animationFrameId = null;
        options.onComplete?.();
      }
    };
    
    this.animationFrameId = requestAnimationFrame(animate);
  }
  
  /**
   * Cancel current transition
   */
  cancel(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Check if a transition is currently running
   */
  isTransitioning(): boolean {
    return this.isRunning;
  }
}

// Singleton instance
let transitionService: TransitionService | null = null;

export function getTransitionService(): TransitionService {
  if (!transitionService) {
    transitionService = new TransitionService();
  }
  return transitionService;
}
