// shade.frag.glsl
// Composite and shade oil + water with realistic optics
precision highp float;

varying vec2 vTextureCoord;

uniform sampler2D uOilField;
uniform sampler2D uWaterField;
uniform sampler2D uBackground;     // Optional background for refraction
uniform vec2 uTexelSize;
uniform vec2 uResolution;

// Optics params
uniform float uRefractiveIndexOil;
uniform float uGloss;              // Shininess (Blinn-Phong exponent scale)
uniform vec3 uLightDir;            // Normalized light direction
uniform float uLightIntensity;
uniform float uRefractionStrength;
uniform bool uThinFilm;            // Enable thin-film interference

// Helper: compute normal from thickness gradient
vec3 computeNormal(sampler2D field, vec2 uv, vec2 texelSize) {
  float tL = texture2D(field, uv - vec2(texelSize.x, 0.0)).r;
  float tR = texture2D(field, uv + vec2(texelSize.x, 0.0)).r;
  float tB = texture2D(field, uv - vec2(0.0, texelSize.y)).r;
  float tT = texture2D(field, uv + vec2(0.0, texelSize.y)).r;
  
  float dzdx = (tR - tL) * 0.5;
  float dzdy = (tT - tB) * 0.5;
  
  return normalize(vec3(-dzdx, -dzdy, 1.0));
}

// Schlick Fresnel approximation
float fresnel(float cosTheta, float n1, float n2) {
  float F0 = pow((n1 - n2) / (n1 + n2), 2.0);
  return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

// Thin-film interference (simplified rainbow shimmer)
vec3 thinFilmColor(float thickness, float viewAngle) {
  // Wavelength-dependent phase shift
  float phase = thickness * 10.0 + viewAngle * 3.14159;
  vec3 color = vec3(
    0.5 + 0.5 * sin(phase),
    0.5 + 0.5 * sin(phase + 2.094),
    0.5 + 0.5 * sin(phase + 4.189)
  );
  return color * 0.3; // Subtle shimmer
}

void main() {
  vec4 oilData = texture2D(uOilField, vTextureCoord);
  vec4 waterData = texture2D(uWaterField, vTextureCoord);
  
  float oilThick = oilData.r;
  vec3 oilDye = oilData.gba;
  
  float waterThick = waterData.r;
  vec3 waterDye = waterData.gba;
  
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  
  // === Water shading (underneath) ===
  vec3 waterNormal = computeNormal(uWaterField, vTextureCoord, uTexelSize);
  float waterNdotL = max(dot(waterNormal, uLightDir), 0.0);
  
  // Beer–Lambert absorption for water
  vec3 waterTransmittance = exp(-waterDye * waterThick * 2.0);
  vec3 waterColor = (1.0 - waterTransmittance) * vec3(0.7, 0.9, 1.0); // Slight blue tint
  
  // Specular for water
  vec3 waterH = normalize(uLightDir + viewDir);
  float waterSpec = pow(max(dot(waterNormal, waterH), 0.0), 20.0 * uGloss);
  waterColor += waterSpec * uLightIntensity * 0.4;
  
  float waterAlpha = clamp(waterThick * 0.5, 0.0, 1.0);
  
  // === Oil shading (on top) ===
  vec3 oilNormal = computeNormal(uOilField, vTextureCoord, uTexelSize);
  float oilNdotL = max(dot(oilNormal, uLightDir), 0.0);
  
  // Beer–Lambert for oil (more saturated)
  vec3 oilTransmittance = exp(-oilDye * oilThick * 1.5);
  vec3 oilColor = (1.0 - oilTransmittance) * vec3(1.0, 0.95, 0.85); // Warm tint
  
  // Specular for oil with Fresnel
  float oilNdotV = max(dot(oilNormal, viewDir), 0.0);
  float F = fresnel(oilNdotV, 1.0, uRefractiveIndexOil);
  
  vec3 oilH = normalize(uLightDir + viewDir);
  float oilSpec = pow(max(dot(oilNormal, oilH), 0.0), 30.0 * uGloss);
  oilColor += (oilSpec * F * uLightIntensity) * 1.2;
  
  // Thin-film shimmer on oil edges
  if (uThinFilm && oilThick > 0.1 && oilThick < 1.5) {
    oilColor += thinFilmColor(oilThick, oilNdotV);
  }
  
  float oilAlpha = clamp(oilThick * 0.6, 0.0, 1.0);
  
  // === Refraction ===
  vec2 refractionOffset = oilNormal.xy * uRefractionStrength * 0.02;
  vec2 bgCoord = clamp(vTextureCoord + refractionOffset, vec2(0.0), vec2(1.0));
  vec3 bgColor = texture2D(uBackground, bgCoord).rgb;
  
  // === Composite: background -> water -> oil ===
  vec3 finalColor = mix(bgColor, waterColor, waterAlpha);
  finalColor = mix(finalColor, oilColor, oilAlpha);
  
  // Tone map and gamma correct
  finalColor = finalColor / (finalColor + 1.0); // Simple Reinhard
  finalColor = pow(finalColor, vec3(1.0 / 2.2));
  
  gl_FragColor = vec4(finalColor, 1.0);
}
