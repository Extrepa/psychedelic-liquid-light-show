// separation.frag.glsl
// Apply buoyancy forces and enforce oil/water separation (immiscibility)
precision highp float;

varying vec2 vTextureCoord;

uniform sampler2D uVelocity;
uniform sampler2D uOilField;
uniform sampler2D uWaterField;
uniform vec2 uTexelSize;
uniform float uOilDensity;
uniform float uWaterDensity;
uniform float uGravityStrength;
uniform vec2 uGravityDir;      // Normalized gravity direction (e.g., (0, -1) or rotated)

void main() {
  vec2 vel = texture2D(uVelocity, vTextureCoord).xy;
  
  float oilThick = texture2D(uOilField, vTextureCoord).r;
  float waterThick = texture2D(uWaterField, vTextureCoord).r;
  
  // Buoyancy force based on density difference
  // Oil (less dense) gets upward bias; water gets downward
  float totalThick = oilThick + waterThick + 1e-5;
  float oilFrac = oilThick / totalThick;
  float waterFrac = waterThick / totalThick;
  
  // Weighted density
  float density = oilFrac * uOilDensity + waterFrac * uWaterDensity;
  
  // Buoyancy relative to reference (water)
  float buoyancy = (uWaterDensity - density) * uGravityStrength;
  
  // Apply force
  vel += buoyancy * uGravityDir * 0.1;
  
  gl_FragColor = vec4(vel, 0.0, 1.0);
}
