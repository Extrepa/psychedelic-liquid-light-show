// passthrough.vert.glsl
// Shared vertex shader for all full-screen quad passes (GLSL ES 1.00 / WebGL1)

attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

varying vec2 vTextureCoord;

void main() {
  vTextureCoord = aTextureCoord;
  gl_Position = vec4(aVertexPosition, 0.0, 1.0);
}
