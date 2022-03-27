export type SHTSimpleLookupKernel = {
  run: (
    hxFrom: number,
    hxTo: number,
    width: number,
    height: number,
    binaryImage: Uint8Array,
    hsWidth: number,
    houghSpace: Uint32Array,
    samplingRho: number,
    sinLookup: Float32Array,
    cosLookup: Float32Array
  ) => Promise<number>;
};
