// Local palette and vibe generation without external APIs.
import type { LiquidConfig } from '../types';

const PRESET_THEMES: Record<string, { colors: string[]; config: Partial<LiquidConfig> }> = {
  lava: {
    colors: ['#ff4800', '#ff8400', '#ff0000', '#7a1e00'],
    config: { velocity: 0.7, viscosity: 0.15, density: 0.8, pressure: 0.6 },
  },
  ocean: {
    colors: ['#003366', '#006699', '#00aacc', '#66ddff'],
    config: { velocity: 0.3, viscosity: 0.6, density: 0.6, pressure: 0.3 },
  },
  neon: {
    colors: ['#ff00ff', '#00ffff', '#aaff00', '#ffaa00'],
    config: { velocity: 0.8, viscosity: 0.1, density: 0.5, pressure: 0.7 },
  },
  forest: {
    colors: ['#0b3d0b', '#146b14', '#2da12d', '#a7f866'],
    config: { velocity: 0.4, viscosity: 0.4, density: 0.7, pressure: 0.4 },
  },
  pastel: {
    colors: ['#ffd6e7', '#ffe9c7', '#fff6a9', '#c9ffd9', '#c9f0ff'],
    config: { velocity: 0.4, viscosity: 0.35, density: 0.6, pressure: 0.5 },
  },
};

function randomHex(): string {
  const n = () => Math.floor(Math.random() * 256);
  const to = (v: number) => v.toString(16).padStart(2, '0');
  return `#${to(n())}${to(n())}${to(n())}`;
}

export async function generateColorPalette(prompt: string): Promise<string[]> {
  const p = prompt.toLowerCase();
  if (p.includes('lava') || p.includes('fire')) return PRESET_THEMES.lava.colors;
  if (p.includes('ocean') || p.includes('sea')) return PRESET_THEMES.ocean.colors;
  if (p.includes('neon')) return PRESET_THEMES.neon.colors;
  if (p.includes('forest')) return PRESET_THEMES.forest.colors;
  if (p.includes('pastel')) return PRESET_THEMES.pastel.colors;
  // Fallback: random but pleasant palette
  const base = randomHex();
  const out = [base];
  while (out.length < 5) out.push(randomHex());
  return out;
}

export async function generateVibe(prompt: string): Promise<{ colors: string[]; config: Partial<LiquidConfig> } | null> {
  const p = prompt.toLowerCase();
  if (p.includes('lava') || p.includes('fire')) return PRESET_THEMES.lava;
  if (p.includes('ocean') || p.includes('sea')) return PRESET_THEMES.ocean;
  if (p.includes('neon')) return PRESET_THEMES.neon;
  if (p.includes('forest')) return PRESET_THEMES.forest;
  if (p.includes('pastel')) return PRESET_THEMES.pastel;
  // Heuristic fallback: map keywords
  const colors = await generateColorPalette(prompt);
  const config: Partial<LiquidConfig> = {
    velocity: p.includes('calm') ? 0.3 : p.includes('chaos') ? 0.85 : 0.6,
    viscosity: p.includes('syrup') || p.includes('molasses') ? 0.7 : p.includes('smoke') ? 0.15 : 0.35,
    density: p.includes('heavy') ? 0.9 : p.includes('light') ? 0.4 : 0.6,
    pressure: p.includes('storm') ? 0.8 : 0.5,
  };
  return { colors, config };
}
