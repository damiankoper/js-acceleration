import { BenchmarkResultType, IBenchmarkResult } from "./IBenchmarkResult";
import { IBenchmarkSampleResult } from "./IBenchmarkSampleResult";

export interface StartConfig {
  /** Whether not to skip first samples based on CoV */
  steadyState?: boolean;
  /** Max acceptable coefficient of variation of steady state */
  cov?: number;
  /** Number of iterations to compute CoV of */
  covWindow?: number;
}

export const startConfigDefaults = (): StartConfig => ({
  steadyState: false,
  cov: 0.1,
  covWindow: 5,
});

export interface IterationConfig {
  /** Min sample count to run */
  samples?: number;
}

export const iterationConfigDefaults = (): IterationConfig => ({
  samples: 5,
});

export interface TimeConfig {
  /** Min sample count to run */
  minSamples?: number;
  /** Min sample count to run */
  maxSamples?: number;

  /** Min time of sample */
  minTime?: number;
  /** Max time of sample */
  maxTime?: number;
}

export const timeConfigDefaults = (): TimeConfig => ({
  minSamples: 0,
  maxSamples: 0,
  minTime: 0,
  maxTime: 30000,
});

export interface GeneralConfig {
  /** Benchmark name used in identifying results */
  name?: string;
  /** Min count in single run to compute average time */
  microRuns?: number;
}

export const generalConfigDefaults = (): GeneralConfig => ({
  name: `benchmark_${new Date().getTime()}`,
  microRuns: 1,
});

export interface IBenchmark {
  /**
   * Sets/restores initial state of test
   */
  reset(): void;

  getSamples(): IBenchmarkSampleResult[];

  runIterations(
    config: GeneralConfig & StartConfig & IterationConfig
  ): IBenchmarkResult<BenchmarkResultType.ITERATIONS>;
  runTimeIterations(
    config: GeneralConfig & StartConfig & TimeConfig
  ): IBenchmarkResult<BenchmarkResultType.TIME_ITERATIONS>;
}
