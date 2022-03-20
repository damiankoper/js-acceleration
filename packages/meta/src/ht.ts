export interface HTOptions<Sampling> {
  /** Input image width */
  width: number;
  /** Sampling of HT params  */
  sampling?: Sampling;
  /** Wether to return hSpace buffer */
  returnHSpace?: boolean;
}

export interface HTParallelOptions<Sampling> extends HTOptions<Sampling> {
  concurrency?: number;
}

export interface HTResults<HTResult> {
  results: HTResult[];
  hSpace?: {
    data: Uint32Array;
    width: number;
  };
}

export type HT<O extends HTOptions<Sampling>, Sampling, HTResult> = (
  binaryImage: Uint8Array,
  options: O
) => HTResults<HTResult>;

export type HTAsync<O extends HTOptions<Sampling>, Sampling, HTResult> = (
  binaryImage: Uint8Array,
  options: O
) => Promise<HTResults<HTResult>>;
