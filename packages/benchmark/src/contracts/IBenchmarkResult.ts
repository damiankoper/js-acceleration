export enum BenchmarkResultType {
  ITERATIONS,
  TIME_ITERATIONS,
  EXTRACTED_ITERATIONS,
  EXTRACTED_TIME_ITERATIONS,
}

export interface IBenchmarkResult<T = BenchmarkResultType> {
  name: string;
  type: T;

  mean: number;
  /** Variation */
  var: number;
  /** Standard deviation */
  stdev: number;
  /** Standard error of mean */
  sem: number;
  /** Margin of error */
  moe: number;
  /** Relative margin of error */
  rme: number;
}
