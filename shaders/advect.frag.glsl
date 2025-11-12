// advect.frag.glsl
// Semi-Lagrangian advection for velocity and phase fields (oil, water)
precision highp float;

varying vec2 vTextureCoord;

uniform sampler2D uField;      // Field to advect (velocity, oilField, or waterField)
uniform sampler2D uVelocity;   // Current velocity field
uniform vec2 uTexelSize;       // 1.0 / simResolution
uniform float uDt;             // Time step
uniform float uDissipation;    // Dissipation factor (1.0 = none, <1.0 = decay)

void main() {
  // Backtrack along velocity
  vec2 coord = vTextureCoord - texture2D(uVelocity, vTextureCoord).xy * uDt * uTexelSize;
  
  // Manual bilinear sampling (clamp to edge)
  coord = clamp(coord, uTexelSize * 0.5, 1.0 - uTexelSize * 0.5);
  
  vec4 result = texture2D(uField, coord);
  
  // Apply dissipation
  result *= uDissipation;
  
  gl_FragColor = result;
}
