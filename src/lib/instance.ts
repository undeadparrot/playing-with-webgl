import * as glm from "gl-matrix";
export class Instance {
  pos: [number, number, number];
  quat: glm.quat;
  renderable: any;
  constructor(renderable) {
    this.renderable = renderable;
    this.pos = [0, 0, 0];
    this.quat = glm.quat.create();
  }
  draw(projectionMatrix, viewMatrix) {
    const mat = glm.mat4.create();
    glm.mat4.fromQuat(mat, this.quat);
    glm.mat4.translate(mat, mat, [-this.pos[0], -this.pos[1], -this.pos[2]]);
    this.renderable.draw(projectionMatrix, viewMatrix, mat);
  }
}
