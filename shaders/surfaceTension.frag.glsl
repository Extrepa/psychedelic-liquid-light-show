// surfaceTension.frag.glsl
// Apply surface tension via Laplacian smoothing to encourage pooling
precision highp float;

varying vec2 vTextureCoord;

uniform sampler2D uField;          // Phase field (oil or water)
uniform vec2 uTexelSize;
uniform float uSurfaceTension;     // Tension coefficient
uniform float uDt;

void main() {
  vec4 center = texture2D(uField, vTextureCoord);
  
  // Sample neighbors (thickness in R channel)
  float tL = texture2D(uField, vTextureCoord - vec2(uTexelSize.x, 0.0)).r;
  float tR = texture2D(uField, vTextureCoord + vec2(uTexelSize.x, 0.0)).r;
  float tB = texture2D(uField, vTextureCoord - vec2(0.0, uTexelSize.y)).r;
  float tT = texture2D(uField, vTextureCoord + vec2(0.0, uTexelSize.y)).r;
  
  // Laplacian of thickness
  float laplacian = (tL + tR + tB + tT) - 4.0 * center.r;
  
  // Apply tension: thickness += tension * laplacian * dt
  float newThickness = center.r + uSurfaceTension * laplacian * uDt;
  
  // Clamp to [0, max]
  newThickness = clamp(newThickness, 0.0, 10.0);
  
  gl_FragColor = vec4(newThickness, center.gba);
}
