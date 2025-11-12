// splat.frag.glsl
// Inject thickness and dye into oil or water field with Gaussian falloff
precision highp float;

varying vec2 vTextureCoord;

uniform sampler2D uField;       // Current phase field (oil or water)
uniform vec2 uPoint;            // Splat position (normalized 0–1)
uniform float uRadius;          // Splat radius (in texture space)
uniform vec3 uColor;            // Dye color (RGB)
uniform float uThickness;       // Amount of thickness to add

void main() {
  vec4 current = texture2D(uField, vTextureCoord);
  
  // Distance from splat center
  float dist = distance(vTextureCoord, uPoint);
  
  // Gaussian falloff
  float strength = exp(-dist * dist / (uRadius * uRadius * 0.5));
  
  // Add thickness (R channel) and dye (GBA channels)
  float newThickness = current.r + uThickness * strength;
  vec3 newDye = current.gba + uColor * strength * uThickness;
  
  gl_FragColor = vec4(newThickness, newDye);
}
