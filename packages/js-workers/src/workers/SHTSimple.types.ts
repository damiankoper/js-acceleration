export type SHTSimpleKernel = {
  run: (
    hxFrom: number,
    hxTo: number,
    width: number,
    height: number,
    binaryImage: Uint8Array,
    hsWidth: number,
    houghSpace: Uint32Array,
    samplingThetaRad: number,
    samplingRho: number
  ) => Promise<number>;
};
