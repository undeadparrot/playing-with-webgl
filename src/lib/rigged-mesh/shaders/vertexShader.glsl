attribute vec3 a_pos;
attribute vec3 a_normal;
attribute  vec3 a_bones;
attribute mediump vec3 a_weights;
uniform mat4 u_world;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 u_boneMatrices[32];
varying mediump vec3 v_normal;
varying mediump mat4 v_view;

void main(){
  v_normal = normalize(a_normal * mat3(u_world));

  mat4 bone1 = u_boneMatrices[int(a_bones.x)];
  mat4 bone2 = u_boneMatrices[int(a_bones.y)];
  mat4 bone3 = u_boneMatrices[int(a_bones.z)];

  vec4 pos = vec4(a_pos, 1.0);
  pos = (
    (bone1 * pos * a_weights.x)
    +
    (bone2 * pos * a_weights.y)
    +
    (bone3 * pos * a_weights.z)
  );
  gl_Position =  u_projection * u_view * u_world * pos ;
  gl_Position = u_projection * u_view * u_world * pos;
}
