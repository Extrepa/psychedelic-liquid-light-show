/**
 * capabilities.ts
 * 
 * Probes WebGL features and extensions for the two-phase liquid sim.
 * Determines available render target formats (half-float vs RGBA8) and feature gates.
 */

export interface WebGLCapabilities {
  supported: boolean;
  halfFloat: boolean;
  halfFloatLinear: boolean;
  float: boolean;
  floatLinear: boolean;
  colorBufferFloat: boolean;
  colorBufferHalfFloat: boolean;
  maxTextureSize: number;
  /** Best format for simulation RTs: 'half-float', 'float', or 'rgba8' */
  rtFormat: 'half-float' | 'float' | 'rgba8';
}

let cachedCaps: WebGLCapabilities | null = null;

/**
 * Detects WebGL1 capabilities. Caches result.
 */
export function detectWebGLCapabilities(): WebGLCapabilities {
  if (cachedCaps) return cachedCaps;

  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', { failIfMajorPerformanceCaveat: false });

  if (!gl) {
    cachedCaps = {
      supported: false,
      halfFloat: false,
      halfFloatLinear: false,
      float: false,
      floatLinear: false,
      colorBufferFloat: false,
      colorBufferHalfFloat: false,
      maxTextureSize: 0,
      rtFormat: 'rgba8',
    };
    return cachedCaps;
  }

  const halfFloatExt = gl.getExtension('OES_texture_half_float');
  const halfFloatLinearExt = gl.getExtension('OES_texture_half_float_linear');
  const floatExt = gl.getExtension('OES_texture_float');
  const floatLinearExt = gl.getExtension('OES_texture_float_linear');
  const colorBufferFloatExt = gl.getExtension('WEBGL_color_buffer_float');
  const colorBufferHalfFloatExt = gl.getExtension('EXT_color_buffer_half_float');

  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

  // Determine best RT format
  let rtFormat: 'half-float' | 'float' | 'rgba8' = 'rgba8';
  if (halfFloatExt && colorBufferHalfFloatExt) {
    rtFormat = 'half-float';
  } else if (floatExt && colorBufferFloatExt) {
    rtFormat = 'float';
  }

  cachedCaps = {
    supported: true,
    halfFloat: !!halfFloatExt,
    halfFloatLinear: !!halfFloatLinearExt,
    float: !!floatExt,
    floatLinear: !!floatLinearExt,
    colorBufferFloat: !!colorBufferFloatExt,
    colorBufferHalfFloat: !!colorBufferHalfFloatExt,
    maxTextureSize,
    rtFormat,
  };

  return cachedCaps;
}

/**
 * Quick check: is WebGL available at all?
 */
export function supportsWebGL(): boolean {
  return detectWebGLCapabilities().supported;
}
