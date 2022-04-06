import { HT, HTAsync, HTOptions, HTParallelOptions, HTResults } from "./ht.ts";

export interface SHTSampling {
  /** Diagonal sampling (samples per pixel) */
  rho?: number;
  /** Angular sampling (samples per degree) */
  theta?: number;
}

export interface SHTResult {
  rho: number;
  theta: number;
}

export interface SHTSpecificOptions {
  /** Sampling of HT params  */
  sampling?: SHTSampling;

  /** Value in range between [0, 1]  */
  votingThreshold?: number;
}

export interface SHTOptions extends HTOptions, SHTSpecificOptions {}
export interface SHTParallelOptions
  extends HTParallelOptions,
    SHTSpecificOptions {}

export type SHTResults = HTResults<SHTResult>;

export type SHT = HT<SHTOptions, SHTResult>;
export type SHTAsync = HTAsync<SHTOptions, SHTResult>;
export type SHTParallelAsync = HTAsync<SHTParallelOptions, SHTResult>;
