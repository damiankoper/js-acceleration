import { HT, HTAsync, HTOptions, HTParallelOptions, HTResults } from "./ht";

export interface CHTResult {
  x: number;
  y: number;
  r: number;
}

export interface CHTSpecificOptions {
  /** Value in range between [0, 1] */
  gradientThreshold?: number;
  /** Minimum distance between centers of detected circles */
  minDist: number;
  /** Min radius to look for */
  minR: number;
  /** Max radius to look for */
  maxR: number;
}

export interface CHTOptions extends HTOptions, CHTSpecificOptions {}
export interface CHTParallelOptions
  extends HTParallelOptions,
    CHTSpecificOptions {}

export type CHTResults = HTResults<CHTResult>;

export type CHT = HT<CHTOptions, CHTResult>;
export type CHTAsync = HTAsync<CHTOptions, CHTResult>;
export type CHTParallelAsync = HTAsync<CHTParallelOptions, CHTResult>;
