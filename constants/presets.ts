
import type { LiquidConfig } from '../types';

export type PresetCategory = 'Core' | 'Acid' | 'Goofy' | 'Nitrous' | 'Healing' | 'Blends';

export interface Preset {
  name: string;
  description?: string;
  category: PresetCategory;
  config: Partial<LiquidConfig>;
}

// Helper to quickly build themed presets
const neon = (...hex: string[]) => hex;
const pastel = (...hex: string[]) => hex;
const deep = (...hex: string[]) => hex;

const base = (cfg: Partial<LiquidConfig>): Partial<LiquidConfig> => ({
  dropperEnabled: true,
  dropMinRadius: 0.01,
  dropMaxRadius: 0.12,
  dropTimeToMaxMs: 1000,
  dropEasing: 'ease-out',
  symmetryEnabled: false,
  ...cfg,
});

const acidDrippy = (name: string, colors: string[], description?: string): Preset => ({
  name,
  description,
  category: 'Acid',
  config: base({
    surfaceTension: 0.66,
    gravityStrength: 0.55,
    viscosity: 0.22,
    gloss: 0.9,
    lightIntensity: 1.3,
    refractionStrength: 0.8,
    chromaticAberration: 0.02,
    bloom: 0.6,
    colors,
    symmetryEnabled: true,
    symmetryCount: 6,
    symmetryMirror: true,
    // Display hooks
    sceneBrightness: 1.2,
    flashOnResize: true,
    flashIntensity: 0.2,
    flickerEnabled: true,
    flickerIntensity: 0.18,
    edgeRunoffEnabled: true,
    edgeRunoffThicknessPx: 6,
    edgeRunoffLengthScale: 0.8,
    sceneParallaxEnabled: true,
    sceneParallaxAmount: 0.6,
  })
});

const goofy60s = (name: string, colors: string[], description?: string): Preset => ({
  name,
  description,
  category: 'Goofy',
  config: base({
    surfaceTension: 0.58,
    gravityStrength: 0.4,
    viscosity: 0.28,
    bloom: 0.7,
    sunrays: 0.5,
    colors,
    backgroundPattern: 'dots',
    backgroundOpacity: 0.12,
    backgroundScale: 1.2,
    // Display hooks
    sceneBrightness: 1.1,
    flashOnResize: false,
    flickerEnabled: false,
    edgeRunoffEnabled: true,
    edgeRunoffThicknessPx: 3,
    edgeRunoffLengthScale: 0.5,
    sceneParallaxEnabled: true,
    sceneParallaxAmount: 0.3,
  })
});

const nitrous = (name: string, colors: string[], description?: string): Preset => ({
  name,
  description,
  category: 'Nitrous',
  config: base({
    surfaceTension: 0.6,
    gravityStrength: 0.35,
    viscosity: 0.18,
    gloss: 0.95,
    lightIntensity: 1.4,
    refractionStrength: 0.9,
    chromaticAberration: 0.035,
    grain: 0.12,
    flickerEnabled: true,
    flickerIntensity: 0.25,
    sceneBrightness: 1.15,
    // Display hooks
    flashOnResize: true,
    flashIntensity: 0.1,
    edgeRunoffEnabled: true,
    edgeRunoffThicknessPx: 2,
    edgeRunoffLengthScale: 0.4,
    sceneParallaxEnabled: false,
    sceneParallaxAmount: 0.2,
    colors,
  })
});

const healing = (name: string, level: number, colors: string[], description?: string): Preset => ({
  name,
  description,
  category: 'Healing',
  config: base({
    surfaceTension: 0.56 + level * 0.01,
    gravityStrength: 0.35 + level * 0.02,
    viscosity: 0.24 - level * 0.01,
    bloom: 0.5 + level * 0.05,
    sunrays: 0.4 + level * 0.04,
    sceneBrightness: 1.05 + level * 0.03,
    // Display hooks
    flashOnResize: false,
    flickerEnabled: false,
    edgeRunoffEnabled: true,
    edgeRunoffThicknessPx: 2,
    edgeRunoffLengthScale: 0.6,
    sceneParallaxEnabled: false,
    sceneParallaxAmount: 0.2,
    colors,
  })
});

const blendy = (name: string, colors: string[], extra?: Partial<LiquidConfig>, description?: string): Preset => ({
  name,
  description,
  category: 'Blends',
  config: base({
    surfaceTension: 0.62,
    gravityStrength: 0.48,
    viscosity: 0.2,
    bloom: 0.65,
    symmetryEnabled: true,
    symmetryCount: 8,
    symmetryMirror: true,
    colors,
    ...extra,
  })
});

export const PRESETS: Preset[] = [
{ name: 'Cosmic Soup', category: 'Core', description: 'Balanced classic fluid feel', config: { density: 0.9, velocity: 0.3, viscosity: 0.2, pressure: 0.8, diffusion: 0.6, bloom: 0.5, sunrays: 0.5, colors: ['#ff0000', '#00ff00', '#0000ff'], splatRadius: 0.25 } },
{ name: 'Lava Lamp', category: 'Core', description: 'Heavy blobs with warm palette', config: { density: 0.8, velocity: 0.2, viscosity: 0.7, pressure: 0.1, diffusion: 0.8, bloom: 0.7, sunrays: 0.2, colors: ['#ff4800', '#ff8400', '#ff0000'], splatRadius: 0.5 } },
{ name: 'Aurora Borealis', category: 'Core', description: 'Fast wisps in cool lights', config: { density: 0.5, velocity: 0.7, viscosity: 0.1, pressure: 0.5, diffusion: 0.4, bloom: 0.4, sunrays: 0.6, colors: ['#00ff99', '#00aaff', '#9933ff'], splatRadius: 0.4 } },
{ name: 'Neon Noir', category: 'Core', description: 'High-contrast neon film look', config: { density: 0.6, velocity: 0.8, viscosity: 0.1, pressure: 0.7, diffusion: 0.5, bloom: 0.8, sunrays: 0.3, colors: ['#ff00ff', '#00ffff', '#ff00aa', '#00ffaa'], splatRadius: 0.3 } },
{ name: 'Oceanic Depth', category: 'Core', description: 'Slow deep sea motion', config: { density: 0.9, velocity: 0.1, viscosity: 0.8, pressure: 0.2, diffusion: 0.9, bloom: 0.2, sunrays: 0.1, colors: ['#000033', '#002266', '#004499', '#0066cc'], splatRadius: 0.6 } },
{ name: 'Fairy Garden', category: 'Core', description: 'Bright airy pastels and glow', config: { density: 0.4, velocity: 0.5, viscosity: 0.3, pressure: 0.4, diffusion: 0.7, bloom: 0.6, sunrays: 0.7, colors: ['#ffb3de', '#ffd6ab', '#ffffd1', '#abffd6', '#a3e6ff'], splatRadius: 0.2 } },
{ name: 'Ink Drop', category: 'Core', description: 'Monochrome minimal diffusion', config: { density: 1.0, velocity: 0.5, viscosity: 0.01, pressure: 0.2, diffusion: 0.0, bloom: 0.1, sunrays: 0.1, colors: ['#ffffff', '#cccccc', '#999999'], splatRadius: 0.1 } },
{ name: 'Pastel Dreams', category: 'Core', description: 'Soft candy gradients', config: { density: 0.7, velocity: 0.4, viscosity: 0.3, pressure: 0.6, diffusion: 0.7, bloom: 0.6, sunrays: 0.3, colors: ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff'], splatRadius: 0.3 } },
{ name: 'Errl Day', category: 'Core', description: 'Golden oil, vibrant water, shimmer', config: { surfaceTension: 0.62, viscosity: 0.45, oilDensity: 0.85, waterDensity: 1.0, gravityAngleDeg: 100, gravityStrength: 0.55, simScale: 0.5, pressureIterations: 12, refractiveIndexOil: 1.47, gloss: 0.80, lightAngleDeg: 35, lightIntensity: 1.20, refractionStrength: 0.80, thinFilm: true, oilPalette: ['#FFB200', '#D88C00', '#A85E00', '#FFD67B', '#FF8C3A'], waterPalette: ['#00C2FF', '#0077FF', '#2B2DFF', '#7A00FF', '#00FFA6'], colors: ['#FFB200', '#00C2FF', '#D88C00', '#0077FF', '#FF8C3A'], density: 0.85, velocity: 0.4, diffusion: 0.7, bloom: 0.6, sunrays: 0.5, splatRadius: 0.3, blendMode: 'lighter', chromaticAberration: 0.02, grain: 0.15 } },

  // Acid drippy
  ...[
    acidDrippy('Meltshift', neon('#ff3b3b','#ff9f1a','#ffe600','#33ff99','#32aaff')),
    acidDrippy('Dripadelic', neon('#ff00aa','#ff0066','#ff5500','#ffaa00','#ffee00')),
    acidDrippy('Acid Carousel', neon('#ff5af7','#ffe45e','#5eff7e','#5ed8ff')),
    acidDrippy('Neon Ooze', neon('#00ffd5','#00ff73','#7bff00','#ffe100')),
    acidDrippy('Kaleido-Drip', neon('#ff4d4d','#ff66ff','#66ffff','#66ff66')),
    acidDrippy('Wax Melt Mirage', neon('#ffbf00','#ff7b00','#ffd64d','#ff9f40')),
    acidDrippy('Lava Lullaby', neon('#ff6b6b','#ffa36b','#ffd36b','#fff36b')),
    acidDrippy('Chromagloop', neon('#f72585','#7209b7','#3a0ca3','#4361ee','#4cc9f0')),
    acidDrippy('Psygoo Pool', neon('#ff00ff','#00ffff','#00ff88','#ffff00')),
    acidDrippy('Tie-Dye Taffy', neon('#ff7eb3','#ff65a3','#7afcff','#feff9c')),
    acidDrippy('Melt Circus', neon('#ff4d00','#ffb300','#ffe100','#00ffa8')),
    acidDrippy('Vortex Viscosity', neon('#a1ff0a','#0aff99','#0aefff','#7a0aff')),
  ],

  // 60s goofy
  ...[
    goofy60s('Groovy Grin', pastel('#ffd6e8','#ffe29a','#c3fbd8','#a0e7e5')),
    goofy60s('Wobble Pop', pastel('#ffcad4','#f7d6e0','#cdeac0','#c3bef0')),
    goofy60s('Jello Jive', pastel('#ff9aa2','#ffdac1','#b5ead7','#c7ceea')),
    goofy60s('Bubblegum Lava', pastel('#ff7eb9','#ff65a3','#7afcff','#feff9c')),
    goofy60s('Happenin’ Haze', pastel('#ffd1ff','#d1ffd6','#d1e8ff','#fff1d1')),
    goofy60s('Boogie Swirl', pastel('#ffd6a5','#fdffb6','#caffbf','#9bf6ff')),
    goofy60s('Doodle Drool', pastel('#fcd5ce','#faedcd','#d4a373','#cddafd')),
    goofy60s('Funky Fondue', pastel('#ffe3e3','#fad2e1','#e2f0cb','#c9e4de')),
    goofy60s('Polka Puddle', pastel('#bde0fe','#a2d2ff','#ffc8dd','#ffafcc')),
    goofy60s('Popcorn Paisley', pastel('#fff1a8','#ffd6a5','#ffc6ff','#a0c4ff')),
    goofy60s('Laugh Track Lagoon', pastel('#e4c1f9','#a9def9','#d0f4de','#fcf6bd')),
    goofy60s('Go-Go Goo', pastel('#f4a261','#e9c46a','#2a9d8f','#e76f51')),
  ],

  // Nitrous
  ...[
    nitrous('Balloon Room', deep('#8ec5ff','#b3e5ff','#e0f7ff','#ffffff')),
    nitrous('Laughing Drift', deep('#88ccff','#bbddff','#e6f5ff','#f8ffff')),
    nitrous('Blue Balloon Bloom', deep('#6fb3ff','#a6d0ff','#d9edff','#ffffff')),
    nitrous('N2O Nightlight', deep('#4da3ff','#85c5ff','#cfeaff','#f5fbff')),
    nitrous('Velvet Vapor', deep('#5d6d7e','#8395a7','#b8c6d9','#ecf2f9')),
    nitrous('Silver Hiss', deep('#c0d6df','#e3eff6','#f7fbff','#ffffff')),
    nitrous('Dental Dreamwave', deep('#8fd3fe','#84fab0','#b6e0fe','#e4f5ff')),
    nitrous('Giggle Glide', deep('#9ad0f5','#c0e4ff','#e6f5ff','#ffffff')),
    nitrous('Aerogel Aura', deep('#bde0fe','#d7efff','#eef9ff','#ffffff')),
    nitrous('Cloud Tank', deep('#a3bded','#cfcfe8','#f5f7fa','#ffffff')),
    nitrous('Nitrous Nectar', deep('#64c8ff','#9fe0ff','#d8f4ff','#ffffff')),
    nitrous('Foggy Halo', deep('#8bbcd7','#b7d7ee','#e2f0fb','#ffffff')),
  ],

  // Healing levels
  ...[
    healing('Level 1: Soothing Ripple', 1, pastel('#a8e6cf','#dcedc1','#ffd3b6','#ffaaa5')),
    healing('Level 2: Aloe Glow', 2, pastel('#b7e4c7','#95d5b2','#74c69d','#52b788')),
    healing('Level 3: Rose Quartz Wash', 3, pastel('#f4acb7','#f7cad0','#e8aeb7','#fde2e4')),
    healing('Level 4: Reiki Rain', 4, pastel('#bde0fe','#c0fdff','#dee2ff','#ffd6ff')),
    healing('Level 5: Sacred Serum', 5, pastel('#caffbf','#b7f0ad','#9df7a1','#97f9a9')),
    healing('Level 6: Temple Tonic', 6, pastel('#bee3f8','#c6f6d5','#feebc8','#fed7e2')),
    healing('Level 7: Seraphic Soak', 7, pastel('#e9d8fd','#c4b5fd','#a78bfa','#ddd6fe')),
  ],

  // Extra blends
  ...[
    blendy('Mandalooze', neon('#ffadad','#ffd6a5','#fdffb6','#caffbf'), { symmetryCount: 12, symmetryRotationDeg: 15 }),
    blendy('Dripnosis', neon('#ff7eb9','#ff65a3','#7afcff','#feff9c'), { dropTimeToMaxMs: 1400 }),
    blendy('Cosmic Pudding', neon('#9b5de5','#f15bb5','#fee440','#00bbf9'), { viscosity: 0.26 }),
    blendy('Paisley Plasma', neon('#30cfd0','#330867','#5b247a','#1bcedf'), { backgroundPattern: 'radial', backgroundOpacity: 0.08 }),
    blendy('Velvet Vortex', deep('#352f44','#5c5470','#b9b4c7','#faf0e6'), { gloss: 0.85 }),
    blendy('Tranquil Taffy', pastel('#ffd6e0','#e2f0cb','#c9e4de','#bee3db'), { gravityStrength: 0.38 }),
    blendy('Saffron Swell', neon('#ffb703','#fb8500','#8ecae6','#219ebc'), { lightIntensity: 1.3 }),
    blendy('Honey Haze', pastel('#ffe5a5','#ffd166','#ffd07f','#ffad60'), { bloom: 0.7 }),
    blendy('Ether Taffeta', deep('#8ec5fc','#e0c3fc','#f9f9ff','#ffffff'), { chromaticAberration: 0.03 }),
    blendy('Prism Puddle', neon('#f72585','#b5179e','#7209b7','#560bad','#4361ee'), { symmetryCount: 8, symmetryRotationDeg: 22 }),
  ],
];
