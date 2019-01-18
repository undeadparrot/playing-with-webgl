import { experiment } from "./experiment";
import { AnimationManager, TAnimAction } from "./animation-manager";
import { TBone, TVertices } from "../model";
import fragmentShader from "./shaders/fragmentShader.glsl";
import vertexShader from "./shaders/vertexShader.glsl";
import { compileProgram } from "../shader";

export class RiggedMesh {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;

  // stuff from the model
  bones: TBone[];
  vertices: TVertices[];
  animationActions: TAnimAction[];
  animationManager: AnimationManager;

  // attributes and uniforms
  aPos: number;
  aNormal: number;
  aBones: number;
  aWeights: number;
  uBonesMatrices: number;
  uWorldMat: number;
  uViewMat: number;
  uProjectionMat: number;

  constructor(gl, vertices, bones, animationActions) {
    this.gl = gl;
    this.vertices = vertices;
    this.bones = bones;
    this.animationActions = animationActions;

    this.buffer = gl.createBuffer();
    this.program = compileProgram(gl, vertexShader, fragmentShader);
    this.animationManager = new AnimationManager(this.animationActions);

    this.aPos = gl.getAttribLocation(this.program, "a_pos");
    this.aNormal = gl.getAttribLocation(this.program, "a_normal");
    this.aBones = gl.getAttribLocation(this.program, "a_bones");
    this.aWeights = gl.getAttribLocation(this.program, "a_weights");
    this.uBonesMatrices = gl.getUniformLocation(this.program, "u_boneMatrices");
    this.uWorldMat = gl.getUniformLocation(this.program, "u_world");
    this.uViewMat = gl.getUniformLocation(this.program, "u_view");
    this.uProjectionMat = gl.getUniformLocation(this.program, "u_projection");
  }
  getPose() {
    const [data, boneMatrixBuffer, bones] = experiment(
      JSON.parse(JSON.stringify(this.bones)),
      this.vertices,
      this.animationManager
    ).map(_ => _);
    return { data, boneMatrixBuffer, bones };
  }
  draw(projectionMatrix, viewMatrix, worldMatrix) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.useProgram(this.program);

    const { data, boneMatrixBuffer } = this.getPose();
    gl.uniformMatrix4fv(this.uBonesMatrices, false, boneMatrixBuffer);
    gl.uniformMatrix4fv(this.uProjectionMat, false, projectionMatrix);
    gl.uniformMatrix4fv(this.uViewMat, false, viewMatrix);
    gl.uniformMatrix4fv(this.uWorldMat, false, worldMatrix);

    gl.enableVertexAttribArray(this.aPos);
    gl.enableVertexAttribArray(this.aNormal);
    gl.enableVertexAttribArray(this.aWeights);
    gl.enableVertexAttribArray(this.aBones);
    const totalBytes = (3 + 3 + 3 + 3) * 4;
    gl.vertexAttribPointer(this.aPos, 3, gl.FLOAT, false, totalBytes, 0);
    gl.vertexAttribPointer(this.aNormal, 3, gl.FLOAT, false, totalBytes, 12);
    gl.vertexAttribPointer(this.aBones, 3, gl.FLOAT, false, totalBytes, 24);
    gl.vertexAttribPointer(this.aWeights, 3, gl.FLOAT, false, totalBytes, 36);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, data.length / (3 * 4));
  }
}
