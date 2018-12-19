import * as glm from "gl-matrix";
import fragmentShader from "./shaders/fragmentShader.glsl";
import vertexShader from "./shaders/vertexShader.glsl";
import VERTICES from "./models/vertices.json";
import BONES from "./models/bones-bindpose.json";
import BONES_POSE from "./models/bones-pose.json";
import ACTIONS from "./models/actions.json";
import { experiment } from "./lib/experiment";
import { AnimationManager } from "./lib/animation-manager";

const width = 320;
const height = 240;
const canvas = document.getElementById("gl");
canvas.width = width;
canvas.height = height;
const gl = canvas.getContext("webgl") as WebGLRenderingContext;
gl.clearColor(0.1, 0.3, 0.2, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.enable(gl.BLEND);
gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);

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

const program = gl.createProgram();
gl.attachShader(program, vShader);
gl.attachShader(program, fShader);
gl.linkProgram(program);
gl.useProgram(program);

const camera = {
  pitch: 0.0,
  yaw: 0.0,
  x: 0,
  y: 0,
  z: 5
};
window.addEventListener(
  "mousemove",
  (ev: MouseEvent): any => {
    camera.pitch += ev.movementY * 0.01;
    camera.yaw += ev.movementX * 0.01;
  }
);

window.addEventListener("keypress", (ev: KeyboardEvent) => {
  switch (ev.key) {
    case "w":
      camera.z += 0.5;
      break;
    case "s":
      camera.z -= 0.5;
      break;
    case "a":
      camera.x -= 0.5;
      break;
    case "d":
      camera.x += 0.5;
      break;
  }
});

const posAttrib = gl.getAttribLocation(program, "pos");
// const normalAttrib = gl.getAttribLocation(program, "normal");
gl.enableVertexAttribArray(posAttrib);
// gl.enableVertexAttribArray(normalAttrib);
gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 12, 0);
// gl.vertexAttribPointer(normalAttrib, 3, gl.FLOAT, false, 24, 12);

const modelView = gl.getUniformLocation(program, "modelView");
const projection = gl.getUniformLocation(program, "projection");
const animationManager = new AnimationManager(ACTIONS);
animationManager.startAction("idle");
window.addEventListener("mouseup", () => animationManager.startAction("walk"));

function render(t) {
  const data = experiment(BONES, BONES_POSE, VERTICES, animationManager, t).map(
    _ => _ * 1
  );
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  // glm.mat4.rotateX(matrix, matrix, t);
  const matrix = glm.mat4.create();
  glm.mat4.frustum(matrix, -1, 1, -1, 1, 1.0, 30);
  gl.uniformMatrix4fv(projection, false, matrix);

  const matrix2 = glm.mat4.create();
  glm.mat4.translate(matrix2, matrix2, [-camera.x, -camera.y, -camera.z]);
  glm.mat4.rotateX(matrix2, matrix2, -camera.pitch);
  glm.mat4.rotateY(matrix2, matrix2, -camera.yaw);
  gl.uniformMatrix4fv(modelView, false, matrix2);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, data.length / 3);
  gl.drawArrays(gl.TRIANGLES, 0, data.length / 3);
  requestAnimationFrame(() => render(t + 0.01));
}
render(0);
