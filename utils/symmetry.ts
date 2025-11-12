/**
 * Symmetry / Kaleidoscope utilities
 * Generates symmetric points for mandala-like patterns
 */

export interface Point {
  x: number;
  y: number;
}

export interface SymmetryOptions {
  origin: Point; // normalized 0-1
  count: 2 | 4 | 6 | 8 | 12; // number of symmetric copies
  mirror: boolean; // true kaleidoscope (mirrored wedges)
  rotationDeg: number; // rotation offset 0-360
}

/**
 * Generate symmetric points from a single input point
 * All coordinates are normalized (0-1)
 */
export function getSymmetryPoints(point: Point, options: SymmetryOptions): Point[] {
  const { origin, count, mirror, rotationDeg } = options;
  
  // Translate point relative to origin
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  
  // Convert to polar coordinates
  const r = Math.sqrt(dx * dx + dy * dy);
  const theta = Math.atan2(dy, dx);
  
  // Constants
  const TWO_PI = Math.PI * 2;
  const rotationRad = (rotationDeg * Math.PI) / 180;
  const wedge = TWO_PI / count;
  
  // Calculate relative angle within wedge
  let thetaRelative = ((theta - rotationRad) % wedge + wedge) % wedge;
  
  // Apply mirroring if enabled (true kaleidoscope)
  let thetaFolded = thetaRelative;
  if (mirror) {
    // Mirror within the wedge
    if (thetaRelative > wedge / 2) {
      thetaFolded = wedge - thetaRelative;
    }
  }
  
  // Generate symmetric points
  const points: Point[] = [];
  
  for (let k = 0; k < count; k++) {
    const angle = rotationRad + k * wedge + thetaFolded;
    
    const x = origin.x + r * Math.cos(angle);
    const y = origin.y + r * Math.sin(angle);
    
    // Clamp to valid range (0-1) to avoid numeric drift
    points.push({
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    });
  }
  
  return points;
}

/**
 * Check if symmetry is effectively enabled
 */
export function isSymmetryActive(config: { symmetryEnabled?: boolean; symmetryCount?: number }): boolean {
  return config.symmetryEnabled === true && (config.symmetryCount || 0) >= 2;
}
