/**
 * Convert hex color to HSL
 */
export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }
  
  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}

/**
 * Convert HSL to RGB hex
 */
export function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Rotate hue of a hex color
 * @param hex - Hex color string
 * @param rotation - Hue rotation amount (0-360 degrees)
 */
export function rotateHue(hex: string, rotation: number): string {
  const hsl = hexToHSL(hex);
  hsl.h = (hsl.h + rotation) % 360;
  if (hsl.h < 0) hsl.h += 360;
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * Get a hue-shifted color based on particle age
 * @param baseColor - Base hex color
 * @param ageRatio - Particle age ratio (0 = new, 1 = old)
 * @param shiftAmount - Amount of shift (0-1, where 1 = full 360° rotation)
 */
export function getHueShiftedColor(baseColor: string, ageRatio: number, shiftAmount: number): string {
  if (shiftAmount === 0) return baseColor;
  
  // Rotate hue based on age
  const rotation = ageRatio * shiftAmount * 360;
  return rotateHue(baseColor, rotation);
}
