attribute vec3 pos;
void main(){
  gl_Position =  vec4(pos.x, pos.y, 0, 1.0) ;
}
