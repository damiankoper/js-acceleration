import { HT, HTAsync, HTOptions, HTParallelOptions, HTResults } from "./ht";

export interface CHTResult {
  x: number;
  y: number;
  r: number;
}

export interface CHTSampling {
  /** Center x coordinate sampling (samples per pixel) */
  x?: number;
  /** Center y coordinate sampling (samples per pixel) */
  y?: number;
  /** Radius sampling (samples per pixel) */
  r?: number;
}

export interface CHTSpecificOptions {
  gradientThreshold?: number;
}

export interface CHTOptions
  extends HTOptions<CHTSampling>,
    CHTSpecificOptions {}
export interface CHTParallelOptions
  extends HTParallelOptions<CHTSampling>,
    CHTSpecificOptions {}

export type CHTResults = HTResults<CHTResult>;

export type CHT = HT<CHTOptions, CHTSampling, CHTResult>;
export type CHTAsync = HTAsync<CHTOptions, CHTSampling, CHTResult>;
