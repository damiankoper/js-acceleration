export interface SHTResult {
  rho: number;
  theta: number;
}

export interface SHTOptions {
  /** Input image width */
  width: number;

  sampling?: {
    /** Diagonal sampling (pixels) */
    rho?: number;
    /** Angular sampling (degrees) */
    theta?: number;
  };

  /** Value in range [0, 1] */
  votingThreshold?: number;
}

export interface HTResults<HTResult> {
  results: HTResult[];
  hSpace?: {
    data: Uint32Array;
    width: number;
  };
}

export type SHT = (
  binaryImage: ArrayBuffer,
  options: SHTOptions
) => HTResults<SHTResult>;

export type SHTSequentialSimple = (
  binaryImage: Uint8Array,
  options: SHTOptions
) => HTResults<SHTResult>;

export type SHTSequentialSimpleLookup = (
  binaryImage: Uint8Array,
  options: SHTOptions
) => HTResults<SHTResult>;
