// diffuse.frag.glsl
// Viscosity/diffusion step for velocity (implicit Jacobi solve)
precision highp float;

varying vec2 vTextureCoord;

uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
uniform float uViscosity;  // Viscosity coefficient
uniform float uDt;

void main() {
  vec2 vel = texture2D(uVelocity, vTextureCoord).xy;
  
  // Sample neighbors
  vec2 vL = texture2D(uVelocity, vTextureCoord - vec2(uTexelSize.x, 0.0)).xy;
  vec2 vR = texture2D(uVelocity, vTextureCoord + vec2(uTexelSize.x, 0.0)).xy;
  vec2 vB = texture2D(uVelocity, vTextureCoord - vec2(0.0, uTexelSize.y)).xy;
  vec2 vT = texture2D(uVelocity, vTextureCoord + vec2(0.0, uTexelSize.y)).xy;
  
  // Jacobi iteration for viscosity: v = (v + α * (vL + vR + vB + vT)) / (1 + 4α)
  float alpha = uViscosity * uDt / (uTexelSize.x * uTexelSize.x);
  vec2 result = (vel + alpha * (vL + vR + vB + vT)) / (1.0 + 4.0 * alpha);
  
  gl_FragColor = vec4(result, 0.0, 1.0);
}
