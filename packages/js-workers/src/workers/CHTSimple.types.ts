export type CHTSimpleKernel = {
  runConv2: (
    yFrom: number,
    yTo: number,
    width: number,
    input: Uint8Array,
    result: Int32Array,
    kernel: number[][],
    kernelShift: number
  ) => Promise<void>;

  runGradient: (
    yFrom: number,
    yTo: number,
    width: number,
    height: number,
    minR: number,
    maxR: number,
    minRad2: number,
    maxRad2: number,
    gxSpace: Int32Array,
    gySpace: Int32Array,
    houghSpace: Uint32Array
  ) => Promise<number>;
};
