import { TBone, TVertices } from "./model";
import * as glm from "gl-matrix";
import {  applyBoneUpdates } from "./animation-manager";

export function handleBone(
  bones: TBone[],
  bone: TBone,
  isBindPose = false,
  poseBones: TBone[] = null
) {
  let poseBone = bone;
  if (poseBones !== null) {
    poseBone = poseBones.filter(_ => _.name === bone.name)[0];
  }
  const local = glm.mat4.create();
  glm.mat4.translate(local, local, poseBone.translation);
  glm.mat4.rotateX(local, local, poseBone.rotation[0]);
  glm.mat4.rotateY(local, local, poseBone.rotation[1]);
  glm.mat4.rotateZ(local, local, poseBone.rotation[2]);

  if (bone.parent != null) {
    bone.world = glm.mat4.create();
    glm.mat4.multiply(bone.world, bone.parent.world, local);
  } else {
    bone.world = local;
  }
  if (isBindPose) {
    bone.inverseBindPose = glm.mat4.create();
    glm.mat4.invert(bone.inverseBindPose, bone.world);
  }
  bone.offset = glm.mat4.create();
  glm.mat4.multiply(bone.offset, bone.world, bone.inverseBindPose);
  bones
    .filter(x => x.parent == bone.name)
    .map(x => {
      x.parent = bone;
    });
  bones
    .filter(x => x.parent == bone)
    .map(x => {
      handleBone(bones, x, isBindPose, poseBones);
    });
}

export function experiment(
  bones: TBone[],
  poseBones: TBone[],
  vertices: TVertices[],
  animationManager: AnimationManager,
  time: number
) {
  const roots = bones.filter(x => x.parent == null || x.parent == undefined);
  roots.map(_ => handleBone(bones, _, true));
  // bRoot.rotation[2] += Math.PI * 0.015;
  // b1.rotation[1] += Math.PI * 0.15;
  // poseBones[0].rotation[2] = Math.PI * 0.15;
  // poseBones[3].rotation[1] = Math.sin(new Date().getTime() * 0.002) * 2;
  // BONES_POSE[2].rotation[2] = Math.PI * (new Date().getTime() * 0.0002);
  // b2.rotation[2] = Math.PI * (new Date().getTime() * 0.001);
  // b2.rotation[1] += (Math.PI * Math.sin(new Date().getTime() / 150.0)) / -2.0;

  animationManager.work(1/60);
  Object.keys(poseBones).map(
    i => applyBoneUpdates(poseBones[i], animationManager.getBoneUpdates(poseBones[i].name));
  )
  
  roots.map(_ => handleBone(bones, _, false, poseBones));

  const vertbuffer = [];
  vertices.map(v => {
    const v3 = [0, 0, 0];
    v.weights.map(w => {
      const bone = bones.filter(x => x.name == w.bone)[0];
      const v1 = [v.x, v.y, v.z];
      const v2 = [...v1];
      glm.vec3.transformMat4(v2, v2, bone.offset);
      v3[0] += v2[0] * w.weight;
      v3[1] += v2[1] * w.weight;
      v3[2] += v2[2] * w.weight;
    });

    vertbuffer.push(v3[0]);
    vertbuffer.push(v3[1]);
    vertbuffer.push(v3[2]);
  });
  return vertbuffer;
}
