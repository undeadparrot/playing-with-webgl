export type TBone = {
  rotation: [number, number, number];
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
  weights: [
    {
      bone: string;
      weight: number;
    }[]
  ];
};
