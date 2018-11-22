import fragmentShader from "./fragmentShader.glsl";
import vertexShader from "./vertexShader.glsl";

const width = 320;
const height = 240;
const canvas = document.getElementById("gl");
canvas.width = width;
canvas.height = height;
const gl = canvas.getContext("webgl") as WebGLRenderingContext;
gl.clearColor(0.1, 0.3, 0.2, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const vShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vShader, vertexShader);
gl.compileShader(vShader);
if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
  throw new Error("Failed to compile shader: " + gl.getShaderInfoLog(vShader));
}

const fShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fShader, fragmentShader);
gl.compileShader(fShader);
if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
  throw new Error("Failed to compile shader: " + gl.getShaderInfoLog(fShader));
}

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
