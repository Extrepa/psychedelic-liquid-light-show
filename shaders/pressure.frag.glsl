// pressure.frag.glsl
// Jacobi iteration for pressure solve (Poisson equation)
precision highp float;

varying vec2 vTextureCoord;

uniform sampler2D uPressure;    // Previous pressure iteration
uniform sampler2D uDivergence;  // Divergence field
uniform vec2 uTexelSize;

void main() {
  // Sample neighbors
  float pL = texture2D(uPressure, vTextureCoord - vec2(uTexelSize.x, 0.0)).r;
  float pR = texture2D(uPressure, vTextureCoord + vec2(uTexelSize.x, 0.0)).r;
  float pB = texture2D(uPressure, vTextureCoord - vec2(0.0, uTexelSize.y)).r;
  float pT = texture2D(uPressure, vTextureCoord + vec2(0.0, uTexelSize.y)).r;
  
  float div = texture2D(uDivergence, vTextureCoord).r;
  
  // Jacobi step: p = (pL + pR + pB + pT - div) / 4
  float pressure = (pL + pR + pB + pT - div) * 0.25;
  
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
