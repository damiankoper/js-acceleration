export interface HTOptions {
  /** Input image width */
  width: number;
  /** Wether to return hSpace buffer */
  returnHSpace?: boolean;
}

export interface HTParallelOptions extends HTOptions {
  concurrency?: number;
}

export interface HTResults<HTResult> {
  results: HTResult[];
  hSpace?: {
    data: Uint32Array;
    width: number;
  };
}

export type HT<O extends HTOptions, HTResult> = (
  binaryImage: Uint8Array,
  options: O
) => HTResults<HTResult>;

export type HTAsync<O extends HTOptions, HTResult> = (
  binaryImage: Uint8Array,
  options: O
) => Promise<HTResults<HTResult>>;
