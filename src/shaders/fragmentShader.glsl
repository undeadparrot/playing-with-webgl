varying mediump vec3 outcol;
varying mediump vec4 outnormal;
varying mediump vec4 outlightdir;
void main(){
  gl_FragColor = vec4(
    vec3(1.0, 1.0, 1.0) //* clamp(dot(outnormal, outlightdir), 0.0, 1.0)
    , 1.0);
}