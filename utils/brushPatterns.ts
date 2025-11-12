import type { LiquidConfig } from '../types';

export interface SplatPoint {
  x: number;
  y: number;
  radius: number;
}

/**
 * Generate splat points based on brush pattern
 */
export function generateBrushPattern(
  x: number,
  y: number,
  baseRadius: number,
  config: LiquidConfig,
  canvasWidth: number,
  lastPos?: { x: number; y: number }
): SplatPoint[] {
  const pattern = config.brushPattern || 'single';
  const spacing = config.brushSpacing ?? 0.5;

  switch (pattern) {
    case 'single':
      return [{ x, y, radius: baseRadius }];

    case 'polkadots': {
      // Create a cluster of dots around the point
      const points: SplatPoint[] = [];
      const dotCount = 5;
      const spread = baseRadius * (1 + spacing) * 3;
      
      for (let i = 0; i < dotCount; i++) {
        const angle = (i / dotCount) * Math.PI * 2;
        const distance = spread * (0.5 + Math.random() * 0.5);
        points.push({
          x: x + Math.cos(angle) * distance,
          y: y + Math.sin(angle) * distance,
          radius: baseRadius * (0.4 + Math.random() * 0.3),
        });
      }
      return points;
    }

    case 'stripes': {
      // Create parallel stripes perpendicular to movement
      const points: SplatPoint[] = [];
      const stripeCount = 3;
      const stripeSpacing = baseRadius * (2 + spacing * 3);
      
      // Calculate perpendicular direction
      let angle = 0;
      if (lastPos) {
        const dx = x - lastPos.x;
        const dy = y - lastPos.y;
        angle = Math.atan2(dy, dx) + Math.PI / 2;
      }
      
      for (let i = -Math.floor(stripeCount / 2); i <= Math.floor(stripeCount / 2); i++) {
        points.push({
          x: x + Math.cos(angle) * i * stripeSpacing,
          y: y + Math.sin(angle) * i * stripeSpacing,
          radius: baseRadius * 0.6,
        });
      }
      return points;
    }

    case 'line': {
      // Thin continuous line
      return [{ x, y, radius: baseRadius * 0.2 }];
    }

    case 'text': {
      // Render text along the path (simplified - just place text at point)
      // In a real implementation, this would need proper text rendering
      const text = config.brushText || 'Hello';
      const points: SplatPoint[] = [];
      const charSpacing = baseRadius * 2;
      
      // Create a simple pattern representing text
      for (let i = 0; i < text.length; i++) {
        points.push({
          x: x + (i - text.length / 2) * charSpacing,
          y: y,
          radius: baseRadius * 0.5,
        });
      }
      return points;
    }

    case 'stamp': {
      // For stamp, we'll just return a single larger splat
      // In a real implementation, you'd sample the image and create splats based on pixel data
      return [{ x, y, radius: baseRadius * 2 }];
    }

    default:
      return [{ x, y, radius: baseRadius }];
  }
}

/**
 * Apply brush pattern with stamp image sampling (advanced)
 */
export function sampleStampImage(
  stampImageUrl: string,
  x: number,
  y: number,
  size: number,
  callback: (points: SplatPoint[], colors: string[]) => void
) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sample at lower resolution for performance
    const sampleSize = 32;
    canvas.width = sampleSize;
    canvas.height = sampleSize;

    ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
    const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);

    const points: SplatPoint[] = [];
    const colors: string[] = [];

    // Sample pixels and create splats
    for (let sy = 0; sy < sampleSize; sy += 2) {
      for (let sx = 0; sx < sampleSize; sx += 2) {
        const idx = (sy * sampleSize + sx) * 4;
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];
        const a = imageData.data[idx + 3];

        // Only create splat if pixel is visible
        if (a > 50) {
          const px = x + (sx / sampleSize - 0.5) * size;
          const py = y + (sy / sampleSize - 0.5) * size;
          
          points.push({
            x: px,
            y: py,
            radius: (size / sampleSize) * 1.5,
          });
          colors.push(`rgb(${r}, ${g}, ${b})`);
        }
      }
    }

    callback(points, colors);
  };
  img.src = stampImageUrl;
}
