// divergence.frag.glsl
// Compute divergence of velocity field for pressure projection
precision highp float;

varying vec2 vTextureCoord;

uniform sampler2D uVelocity;
uniform vec2 uTexelSize;

void main() {
  // Sample neighboring velocities
  float vL = texture2D(uVelocity, vTextureCoord - vec2(uTexelSize.x, 0.0)).x;
  float vR = texture2D(uVelocity, vTextureCoord + vec2(uTexelSize.x, 0.0)).x;
  float vB = texture2D(uVelocity, vTextureCoord - vec2(0.0, uTexelSize.y)).y;
  float vT = texture2D(uVelocity, vTextureCoord + vec2(0.0, uTexelSize.y)).y;
  
  // Central difference
  float divergence = 0.5 * ((vR - vL) + (vT - vB));
  
  gl_FragColor = vec4(divergence, 0.0, 0.0, 1.0);
}
