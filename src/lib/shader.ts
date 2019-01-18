export function compileProgram(
  gl: WebGLRenderingContext,
  vertexShader: string,
  fragmentShader: string
) {
  const vShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vShader, vertexShader);
  gl.compileShader(vShader);
  if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
    throw new Error(
      "Failed to compile shader: " + gl.getShaderInfoLog(vShader)
    );
  }

  const fShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fShader, fragmentShader);
  gl.compileShader(fShader);
  if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
    throw new Error(
      "Failed to compile shader: " + gl.getShaderInfoLog(fShader)
    );
  }

  const program = gl.createProgram();
  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);
  gl.linkProgram(program);

  return program;
}
