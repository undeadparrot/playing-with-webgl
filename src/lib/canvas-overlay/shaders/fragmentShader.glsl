uniform sampler2D t_canvas;
uniform mediump vec2 resolution;
void main(){
    mediump vec4 color = texture2D(t_canvas, vec2(gl_FragCoord.x/resolution.x,0.0-gl_FragCoord.y/resolution.y));
  gl_FragColor = color;
}