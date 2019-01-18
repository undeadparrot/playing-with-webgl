import * as glm from "gl-matrix";
import VERTICES from "./models/vertices.json";
import BONES from "./models/bones-bindpose.json";
import ACTIONS from "./models/actions.json";
import { RiggedMesh } from "./lib/rigged-mesh";
import { CanvasOverlay } from "./lib/canvas-overlay";
import { InputManager } from "./lib/input";
import { Camera } from "./lib/camera";
import { Instance } from "./lib/instance";

const canvas = document.getElementById("gl");
const gl = canvas.getContext("webgl2", {
  premultipliedAlpha: false,
  alpha: false
}) as WebGLRenderingContext;
const inputManager = new InputManager();
inputManager.register(window);
const camera = new Camera();
camera.pos[2] = 3;
camera.pos[1] = 2;

const model = new RiggedMesh(gl, VERTICES, BONES, ACTIONS);
const overlay = new CanvasOverlay(gl);
const instances = [new Instance(model)];

let animationIndex = 0;

function resize(width, height) {
  canvas.width = width;
  canvas.height = height;
  overlay.reinitializeTexture(width, height);
  gl.viewport(0, 0, canvas.width, canvas.height);
}
resize(800, 400);
window.addEventListener("resize", () =>
  resize(window.innerWidth, window.innerHeight)
);

function update(deltaTime: number) {
  inputManager.update();
  model.animationManager.work(deltaTime);
  camera.mouseLook(
    deltaTime,
    inputManager.mouseDelta.x,
    inputManager.mouseDelta.y
  );
  if (inputManager.mousePressed.right) {
    canvas.requestPointerLock();
  }
  const move = [0, 0, 0];
  if (inputManager.keysDown.w) {
    move[2] += -0.5;
  }
  if (inputManager.keysDown.s) {
    move[2] += 0.5;
  }
  if (inputManager.keysDown.d) {
    move[0] += 0.5;
  }
  if (inputManager.keysDown.a) {
    move[0] += -0.5;
  }
  if (inputManager.keysDown.l) {
    // instances[0].rot[1] += -0.05;
    glm.quat.rotateY(instances[0].quat, instances[0].quat, 0.01);
  }
  if (inputManager.keysPressed.q) {
    animationIndex =
      (animationIndex + 1) % model.animationManager.actions.length;
  }
  if (inputManager.keysPressed.e) {
    const action = model.animationManager.actions[animationIndex];
    model.animationManager.startAction(action.name);
  }
  camera.move(deltaTime, move[0], move[1], move[2]);
}

function render(previousTime: number) {
  const time = new Date().valueOf();
  const deltaTime = (time - previousTime) / 100;
  update(deltaTime);

  const viewMatrix = camera.getViewMatrix();
  const projectionMatrix = camera.getProjectionMatrix();

  gl.clearColor(0.1, 0.3, 0.2, 1.0);

  // draw 3d objects
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.clear(gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.BLEND);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  instances.map(_ => _.draw(projectionMatrix, viewMatrix));

  // draw overlay in 2d
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.disable(gl.CULL_FACE);
  gl.disable(gl.DEPTH_TEST);

  overlay.ctx.clearRect(0, 0, overlay.canvas.width, overlay.canvas.height);
  overlay.addText3D(`origin`, 0, 0, 0, viewMatrix, projectionMatrix);
  overlay.addText3D(`y`, 0, 3, 0, viewMatrix, projectionMatrix);
  overlay.addText2D(
    `${camera.pos[0].toFixed(2)}, ${camera.pos[2].toFixed(2)}`,
    9,
    9
  );
  overlay.addText2D(`${camera.yaw.toFixed(2)}, ${camera.pitch.toFixed(2)}`, 9);
  const y = 20;
  const animationManager = (instances[0].renderable as RiggedMesh)
    .animationManager;
  const action = model.animationManager.actions[animationIndex];
  overlay.addText2D(`${action.name}: ${action.time}`, 9, y + 9);

  const poseBones = (instances[0].renderable as RiggedMesh).getPose().bones;
  BONES.map(_ => {
    overlay.addText3D(
      _.name,
      _.translation[0],
      _.translation[1],
      _.translation[2],
      viewMatrix,
      projectionMatrix
    );
  });

  overlay.draw();

  requestAnimationFrame(() => render(time));
}
render(new Date().valueOf());
