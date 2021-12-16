export enum BenchmarkResultType {
  ITERATIONS,
  TIME_ITERATIONS,
}

export interface BasicMetrics {
  /** Mean */
  mean: number;
  /** Variation */
  var: number;
  /** Standard deviation */
  stdev: number;
}

export interface ExtendedMetrics {
  /** Standard error of mean */
  sem: number;
  /** Margin of error */
  moe: number;
  /** Relative margin of error */
  rme: number;
}
export interface IBenchmarkResult<T = BenchmarkResultType>
  extends BasicMetrics,
    ExtendedMetrics {
  name: string;
  type: T;
}
