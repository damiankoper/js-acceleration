import { ISimpleEvent } from "strongly-typed-events";
import { BenchmarkResultType, IBenchmarkResult } from "./IBenchmarkResult";
import { IBenchmarkSampleResult } from "./IBenchmarkSampleResult";

export interface StartConfig {
  /** Whether not to skip first samples based on CoV */
  coldStart?: boolean;
  /** Max acceptable coefficient of variation of steady state */
  cov?: number;
  /** Number of iterations to compute CoV of */
  covWindow?: number;
}

export const startConfigDefaults = (): StartConfig => ({
  coldStart: true,
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
  count?: number;
}

export const generalConfigDefaults = (): GeneralConfig => ({
  name: `benchmark-${new Date().getTime()}`,
  count: 1,
});

export interface IBenchmark {
  onSetup: ISimpleEvent<unknown>;
  onSample: ISimpleEvent<unknown>;
  onTeardown: ISimpleEvent<unknown>;

  /**
   * Restores initial state of test
   */
  reset(): void;

  getSamples(): IBenchmarkSampleResult[];

  runIterations(
    config: GeneralConfig & StartConfig & IterationConfig
  ): IBenchmarkResult<BenchmarkResultType.ITERATIONS>;
  runTimeIterations(
    config: GeneralConfig & StartConfig & TimeConfig
  ): IBenchmarkResult<BenchmarkResultType.TIME_ITERATIONS>;

  runExtractedIterations(
    config: GeneralConfig & IterationConfig
  ): IBenchmarkResult<BenchmarkResultType.EXTRACTED_ITERATIONS>;
  runExtractedTimeIterations(
    config: GeneralConfig & TimeConfig
  ): IBenchmarkResult<BenchmarkResultType.EXTRACTED_TIME_ITERATIONS>;
}
