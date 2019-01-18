import { TBone, TVertices } from "./model";
import * as glm from "gl-matrix";
import { applyBoneUpdates } from "./animation-manager";

export function handleBone(bones: TBone[], bone: TBone, isBindPose = false) {
  const local = glm.mat4.create();
  glm.mat4.translate(local, local, bone.translation);
  const localRot = glm.mat4.create();
  glm.mat4.fromQuat(localRot, bone.quat);
  glm.mat4.multiply(local, local, localRot);

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
      handleBone(bones, x, isBindPose);
    });
}

export function experiment(
  bones: TBone[],
  vertices: TVertices[],
  animationManager: AnimationManager
) {
  const roots = bones.filter(x => x.parent == null || x.parent == undefined);
  roots.map(_ => handleBone(bones, _, true));

  Object.keys(bones).map(i =>
    applyBoneUpdates(bones[i], animationManager.getBoneUpdates(bones[i].name))
  );

  roots.map(_ => handleBone(bones, _, false, bones));

  const matbuffer = new Float32Array(4 * 4 * bones.length);
  const vertbuffer = [];
  vertices.map(v => {
    const v3 = [0, 0, 0];
    if (v.weights.length < 1) {
      v.weights.push({ bone: "Root", weight: 1.0 });
    }
    const vertBoneIndices = [];
    const vertBoneWeights = [];
    v.weights.map((w, i) => {
      const bone = bones.filter(x => x.name == w.bone)[0];
      const boneIndex = bones.findIndex(_ => _ === bone);
      vertBoneIndices.push(boneIndex);
      vertBoneWeights.push(w.weight);
      const v1 = [v.x, v.y, v.z];
      const v2 = [...v1];
      matbuffer.set(bone.offset, boneIndex * 4 * 4);
      v3[0] += v2[0]; // * w.weight;
      v3[1] += v2[1]; // * w.weight;
      v3[2] += v2[2]; // * w.weight;
    });
    vertbuffer.push(v3[0]);
    vertbuffer.push(v3[1]);
    vertbuffer.push(v3[2]);
    vertbuffer.push(v.n[0]);
    vertbuffer.push(v.n[1]);
    vertbuffer.push(v.n[2]);
    vertbuffer.push(vertBoneIndices[0] || 0);
    vertbuffer.push(vertBoneIndices[1] || 0);
    vertbuffer.push(vertBoneIndices[2] || 0);
    vertbuffer.push(vertBoneWeights[0] || 1);
    vertbuffer.push(vertBoneWeights[1] || 0);
    vertbuffer.push(vertBoneWeights[2] || 0);
  });
  return [vertbuffer, matbuffer, bones];
}
