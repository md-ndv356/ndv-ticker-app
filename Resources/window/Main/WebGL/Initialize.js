const webglInitialize = async function(){

const gldata = {};

  /** @type {HTMLCanvasElement} */
const canvas = document.getElementById("maincanvas");
const gl = canvas.getContext("webgl");

let vsCode = await fetch("./WebGL/default.vertex.glsl").then(response => response.text());
let fsCode = await fetch("./WebGL/default.fragment.glsl").then(response => response.text());

gl.disable(gl.DEPTH_TEST);
gl.disable(gl.CULL_FACE);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0, 0, 0, 0);
gl.colorMask(true, true, true, true);
gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
gl.activeTexture(gl.TEXTURE0);

const program_texture = createShaderProgram(gl, vsCode, fsCode);

const config = {
  maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE)
};
gl.useProgram(program_texture);
const aTextureCoord = gl.getAttribLocation(program_texture, "aTextureCoord");
const aVertexPosition = gl.getAttribLocation(program_texture, "aVertexPosition");
const uTextureSize = gl.getUniformLocation(program_texture, "uTextureSize");
const uTextureAlpha = gl.getUniformLocation(program_texture, "uTextureAlpha");
const uPositionOffset = gl.getUniformLocation(program_texture, "uPositionOffset");
const rgbDistortionCoeff = gl.getUniformLocation(program_texture, "rgbDistortionCoeff");
gl.enableVertexAttribArray(aTextureCoord);
gl.enableVertexAttribArray(aVertexPosition);
gl.uniform2f(uTextureSize, canvas.width, canvas.height);
gl.uniform1f(uTextureAlpha, 1);
gl.uniform2f(uPositionOffset, 0, 0);
gl.uniform1f(rgbDistortionCoeff, 0);

/**
 * ARRAY_BUFFERへの登録も同時に行います
 * @param {WebGLRenderingContextBase} gl
 * @param {Array<Number>} bufferData
 * @returns {WebGLBuffer}
 */
function createArrayBuffer(gl, bufferData){
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferData), gl.STATIC_DRAW);
  return buffer;
}
/**
 * ELEMENT_ARRAY_BUFFERへの登録も同時に行います
 * @param {WebGLRenderingContextBase} gl
 * @param {Array<Number>} bufferData
 * @returns {WebGLBuffer}
 */
function createElementArrayBuffer(gl, bufferData){
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bufferData), gl.STATIC_DRAW);
  return buffer;
}
/**
 * TEXTURE_2Dへの登録も同時に行います
 * @param {WebGLRenderingContextBase} gl
 * @param {HTMLImageElement} image
 * @return {WebGLTexture}
 */
function createTexture(gl, image){
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}
/**
 * @param {WebGLRenderingContextBase} gl
 * @returns {WebGLFramebuffer}
 */
function createFramebuffer(gl){
  const buffer = gl.createFramebuffer();
  return buffer;
}
/**
 * @param {WebGLRenderingContextBase} gl
 * @param {String} vsSource
 * @param {String} fsSource
 * @returns {WebGLProgram}
 */
function createShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw gl.getProgramInfoLog(shaderProgram);
  }
  return shaderProgram;
}
/**
 * @param {WebGLRenderingContextBase} gl
 * @param {Number} type
 * @param {String} source
 * @returns {WebGLShader}
 */
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader, source);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(type);
    console.error(source);
    throw gl.getShaderInfoLog(shader);
  }
  return shader;
}

function registerBufferData(gl, position, texCoord, indices){
  const positionBuffer = createArrayBuffer(gl, position);
  const textureCoord = createArrayBuffer(gl, texCoord);
  const indicesBuffer = createElementArrayBuffer(gl, indices);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoord);
  gl.vertexAttribPointer(aTextureCoord, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
}
// [[ x1, y1, x2, y2 ]]
function convertSquareData(firstIndex = 0, ...datas){
  return datas.map(data => {
    return {
      data: data.map(item => [ item[0], item[1], item[2], item[1], item[0], item[3], item[2], item[3] ]),
      index: "0".repeat(data.length).split("").flatMap((v, i) => {
        let idx = firstIndex + i * 4;
        return [idx, idx+1, idx+2, idx+2, idx+1, idx+3];
      })
    };
  });
}

gldata.canvas = canvas;
gldata.gl = gl;
gldata.fun = { loadShader, createShaderProgram, createFramebuffer, createTexture, createElementArrayBuffer, createArrayBuffer, registerBufferData, convertSquareData };
gldata.config = config;
gldata.program = {
  texture: program_texture
};
gldata.positions = {
  uTextureAlpha: uTextureAlpha,
  uTextureSize: uTextureSize,
  uPositionOffset: uPositionOffset,
  rgbDistortionCoeff: rgbDistortionCoeff
};
gldata.textures = {};
gldata.buffers = {};

return gldata;

};
