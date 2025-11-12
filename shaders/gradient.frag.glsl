// gradient.frag.glsl
// Subtract pressure gradient from velocity to enforce incompressibility
precision highp float;

varying vec2 vTextureCoord;

uniform sampler2D uVelocity;
uniform sampler2D uPressure;
uniform vec2 uTexelSize;

void main() {
  vec2 vel = texture2D(uVelocity, vTextureCoord).xy;
  
  // Sample pressure neighbors
  float pL = texture2D(uPressure, vTextureCoord - vec2(uTexelSize.x, 0.0)).r;
  float pR = texture2D(uPressure, vTextureCoord + vec2(uTexelSize.x, 0.0)).r;
  float pB = texture2D(uPressure, vTextureCoord - vec2(0.0, uTexelSize.y)).r;
  float pT = texture2D(uPressure, vTextureCoord + vec2(0.0, uTexelSize.y)).r;
  
  // Gradient
  vec2 gradient = 0.5 * vec2(pR - pL, pT - pB);
  
  // Subtract gradient
  vel -= gradient;
  
  gl_FragColor = vec4(vel, 0.0, 1.0);
}
