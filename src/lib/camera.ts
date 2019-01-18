import * as glm from "gl-matrix";
export class Camera {
  yaw: number = 0;
  pitch: number = 0;
  pos: glm.vec3;
  moveSpeed = 2;
  turnSpeed = 0.2;
  constructor() {
    this.pos = glm.vec3.create();
  }
  mouseLook(deltaTime, x, y) {
    this.yaw += x * this.turnSpeed * deltaTime;
    this.pitch += y * this.turnSpeed * deltaTime;
    this.yaw = this.yaw % (2 * Math.PI);
    this.pitch = Math.min(
      Math.PI * 0.25,
      Math.max(Math.PI * -0.25, this.pitch)
    );
  }
  move(deltaTime, x, y, z) {
    const directionMat = glm.mat4.create();
    // glm.mat4.rotateX(directionMat, directionMat, this.pitch);
    glm.mat4.rotateY(directionMat, directionMat, this.yaw);

    const moveVec = glm.vec3.fromValues(x, y, z);
    glm.vec3.transformMat4(moveVec, moveVec, directionMat);
    this.pos[0] += moveVec[0] * this.moveSpeed * deltaTime;
    this.pos[1] += moveVec[1] * this.moveSpeed * deltaTime;
    this.pos[2] += moveVec[2] * this.moveSpeed * deltaTime;
  }
  getViewMatrix() {
    const mat = glm.mat4.create();
    glm.mat4.rotateX(mat, mat, -this.pitch);
    glm.mat4.rotateY(mat, mat, -this.yaw);
    glm.mat4.translate(mat, mat, [-this.pos[0], -this.pos[1], -this.pos[2]]);
    return mat;
  }
  getProjectionMatrix() {
    const mat = glm.mat4.create();
    glm.mat4.frustum(mat, -1, 1, -1, 1, 1.0, 30);
    return mat;
  }
}
