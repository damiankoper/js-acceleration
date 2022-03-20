import { HT, HTAsync, HTOptions, HTParallelOptions, HTResults } from "./ht";

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
  votingThreshold?: number;
}

export interface SHTOptions
  extends HTOptions<SHTSampling>,
    SHTSpecificOptions {}
export interface SHTParallelOptions
  extends HTParallelOptions<SHTSampling>,
    SHTSpecificOptions {}

export type SHTResults = HTResults<SHTResult>;

export type SHT = HT<SHTOptions, SHTSampling, SHTResult>;
export type SHTAsync = HTAsync<SHTOptions, SHTSampling, SHTResult>;
