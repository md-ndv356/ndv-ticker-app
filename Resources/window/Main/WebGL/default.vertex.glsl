attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
uniform vec2 uTextureSize;
uniform vec2 uPositionOffset;
varying vec2 vTextureCoord;

void main(){
  vec2 coords = ((aVertexPosition + uPositionOffset) / uTextureSize * 2.0 - 1.0) * vec2(1, -1);
  gl_Position = vec4(coords, 0, 1);
  vTextureCoord = aTextureCoord;
}