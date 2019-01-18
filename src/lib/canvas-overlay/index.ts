import * as glm from "gl-matrix";
import fragmentShader from "./shaders/fragmentShader.glsl";
import vertexShader from "./shaders/vertexShader.glsl";

export class CanvasOverlay {
  gl: WebGLRenderingContext;
  vShader: WebGLShader;
  fShader: WebGLShader;
  program: WebGLProgram;
  buffer: WebGLBuffer;
  texture: WebGLTexture;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  constructor(gl) {
    this.gl = gl;
    const vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, vertexShader);
    gl.compileShader(vShader);
    if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
      throw new Error(
        "Failed to compile shader: " + gl.getShaderInfoLog(vShader)
      );
    }
    this.vShader = vShader;

    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, fragmentShader);
    gl.compileShader(fShader);
    if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
      throw new Error(
        "Failed to compile shader: " + gl.getShaderInfoLog(fShader)
      );
    }
    this.fShader = fShader;

    const buffer = gl.createBuffer();

    this.buffer = buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1]),
      gl.STATIC_DRAW
    );

    this.program = gl.createProgram();
    gl.attachShader(this.program, vShader);
    gl.attachShader(this.program, fShader);
    gl.linkProgram(this.program);

    this.reinitializeTexture(256, 256);
  }
  reinitializeTexture(width, height) {
    const gl = this.gl;
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.strokeStyle = "yellow";
    this.ctx.font = "8pt Courier New";
    if (this.texture !== undefined) {
      gl.deleteTexture(this.texture);
    }
    this.texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  }
  addText3D(text, x, y, z, worldMatrix, projectionMatrix) {
    const moveVec = glm.vec4.fromValues(x, y, z, 1);
    glm.vec4.transformMat4(moveVec, moveVec, worldMatrix);
    glm.vec4.transformMat4(moveVec, moveVec, projectionMatrix);
    if (moveVec[2] < 0) {
      // the point is behind the camera
      return;
    }
    const screenX = (moveVec[0] / moveVec[3]) * (this.canvas.width / 2);
    const screenY = (moveVec[1] / moveVec[3]) * (this.canvas.height / 2) * -1;
    this.ctx.strokeText(
      text,
      this.canvas.width / 2 + screenX,
      this.canvas.height / 2 + screenY
    );
  }
  addText2D(text, x, y, z) {
    this.ctx.strokeText(text, x, y);
  }
  draw() {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.useProgram(this.program);
    const posAttrib = gl.getAttribLocation(this.program, "pos");
    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 8, 0);
    const resolutionUniform = gl.getUniformLocation(this.program, "resolution");
    gl.uniform2fv(resolutionUniform, [this.canvas.width, this.canvas.height]);

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this.canvas
    );
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}
