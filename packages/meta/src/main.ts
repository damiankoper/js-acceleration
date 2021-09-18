export interface SHTResult {
  rho: number;
  theta: number;
}

export interface SHTOptions {
  /** Input image width */
  width: number;

  resolution?: {
    /** Diagonal resolution (pixels) */
    rho?: number;
    /** Angular resolution (degrees) */
    theta?: number;
  };

  votingThreshold?: {
    /** Diagonal threshold (pixels) */
    rho?: number;
    /** Angular threshold (degrees) */
    theta?: number;
  };
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
