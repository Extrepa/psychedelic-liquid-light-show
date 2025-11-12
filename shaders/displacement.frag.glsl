precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uDisplacementMap; // Optional noise texture for displacement
uniform vec2 uResolution;
uniform float uTime;
uniform float uStrength; // Displacement strength (0-1)
uniform vec2 uDirection; // Displacement direction vector

varying vec2 vUv;

// Simple noise function for procedural displacement
float noise(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  float a = noise(i);
  float b = noise(i + vec2(1.0, 0.0));
  float c = noise(i + vec2(0.0, 1.0));
  float d = noise(i + vec2(1.0, 1.0));
  
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fractalNoise(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  
  for (int i = 0; i < 4; i++) {
    value += amplitude * smoothNoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  
  return value;
}

void main() {
  vec2 uv = vUv;
  
  // Create animated displacement field
  vec2 noiseCoord = uv * 3.0 + uTime * 0.1;
  float noiseX = fractalNoise(noiseCoord + vec2(0.0, uTime * 0.05));
  float noiseY = fractalNoise(noiseCoord + vec2(100.0, uTime * 0.07));
  
  // Apply displacement
  vec2 displacement = vec2(noiseX, noiseY) * 2.0 - 1.0;
  displacement *= uStrength * 0.05;
  
  // Add directional displacement
  displacement += uDirection * uStrength * 0.03;
  
  // Apply to UV
  uv += displacement;
  
  // Wrap UVs for seamless effect
  uv = fract(uv);
  
  // Sample texture with displacement
  vec4 color = texture2D(uTexture, uv);
  
  gl_FragColor = color;
}
