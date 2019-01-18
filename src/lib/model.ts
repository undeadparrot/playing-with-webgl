export type TBone = {
  rotation: [number, number, number];
  quat: [number, number, number, number];
  name: string;
  translation: [number, number, number];
  parent: string | TBone;
  world: any;
};

export type TVertices = {
  name: string;
  y: number;
  x: number;
  z: number;
  n: [number, number, number];
  weights: {
    bone: string | TBone;
    weight: number;
  }[];
};
