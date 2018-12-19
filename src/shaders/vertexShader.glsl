attribute vec3 pos;
attribute vec3 normal;
varying mediump vec3 outcol;
uniform mat4 modelView;
uniform mat4 projection;
varying mediump vec4 outnormal;
varying mediump vec4 outlightdir;
varying mediump mat4 outmodelview;
void main(){
  vec4 n = vec4(normal, 1.0);
  outnormal = n;
  // vec4 lightDir = vec4(0.5, 0.5, 0.0, 0.0) * modelView;
  // outlightdir=lightDir;
  outcol = vec3(1.0, 1.0, 1.0) ;//* clamp(dot(n, lightDir), 0.0, 1.0);
  gl_PointSize = 2.0;
  gl_Position =  projection * modelView * vec4(pos.x, pos.y, pos.z, 1.0) ;
}
