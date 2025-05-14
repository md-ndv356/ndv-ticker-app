precision mediump float;

uniform sampler2D uSampler;
uniform float uTextureAlpha;
uniform float rgbDistortionCoeff;
varying vec2 vTextureCoord;

void main(){
  vec4 color_l = texture2D(uSampler, vec2(vTextureCoord.x - rgbDistortionCoeff, vTextureCoord.y));
  vec4 color_m = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y));
  vec4 color_r = texture2D(uSampler, vec2(vTextureCoord.x + rgbDistortionCoeff, vTextureCoord.y));
  gl_FragColor = vec4(color_l.r, color_m.g, color_r.b, (color_l.a + color_m.a + color_r.a) / 3.0) * vec4(1.0, 1.0, 1.0, uTextureAlpha);
}