export interface SHTResult {
  rho: number;
  theta: number;
}

export interface SHTOptions {
  /** Input image width */
  width: number;

  sampling?: {
    /** Diagonal sampling (samples per pixel) */
    rho?: number;
    /** Angular sampling (samples per degree) */
    theta?: number;
  };

  /** Value in range [0, 1] */
  votingThreshold?: number;
  /** Wether to return hSpace buffer */
  returnHSpace?: boolean;
}

export interface SHTParallelOptions extends SHTOptions {
  concurrency?: number;
}

export interface HTResults<HTResult> {
  results: HTResult[];
  hSpace?: {
    data: Uint32Array;
    width: number;
  };
}

export type SHT<O extends SHTOptions = SHTOptions> = (
  binaryImage: Uint8Array,
  options: O
) => HTResults<SHTResult>;

export type SHTAsync<O extends SHTOptions = SHTOptions> = (
  binaryImage: Uint8Array,
  options: O
) => Promise<HTResults<SHTResult>>;
