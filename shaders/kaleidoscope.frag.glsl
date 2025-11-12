precision highp float;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uSegments; // Number of mirror segments (2, 4, 6, 8, etc.)
uniform float uAngle; // Rotation angle in radians
uniform vec2 uCenter; // Center point for kaleidoscope (0-1)

varying vec2 vUv;

const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;

void main() {
  // Translate to center
  vec2 uv = vUv - uCenter;
  
  // Apply rotation
  float s = sin(uAngle);
  float c = cos(uAngle);
  uv = vec2(
    uv.x * c - uv.y * s,
    uv.x * s + uv.y * c
  );
  
  // Convert to polar coordinates
  float radius = length(uv);
  float angle = atan(uv.y, uv.x);
  
  // Calculate segment angle
  float segmentAngle = TWO_PI / uSegments;
  
  // Mirror within segment
  angle = mod(angle, segmentAngle);
  
  // Mirror alternating segments for more interesting patterns
  float segmentIndex = floor(angle / segmentAngle);
  if (mod(segmentIndex, 2.0) > 0.5) {
    angle = segmentAngle - mod(angle, segmentAngle);
  }
  
  // Convert back to cartesian
  uv = vec2(
    cos(angle) * radius,
    sin(angle) * radius
  );
  
  // Translate back from center
  uv = uv + uCenter;
  
  // Clamp to valid texture coordinates
  uv = clamp(uv, 0.0, 1.0);
  
  // Sample texture
  vec4 color = texture2D(uTexture, uv);
  
  gl_FragColor = color;
}
