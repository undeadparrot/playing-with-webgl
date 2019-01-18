varying mediump vec3 v_normal;
void main(){
  mediump vec3 lightdir = normalize(vec3(0.0, 0.5, 0.5));
  gl_FragColor = vec4(
    vec3(1.0,1.0,1.0) * clamp(dot(v_normal, lightdir), 0.15, 1.0)
    , 1.0);
}