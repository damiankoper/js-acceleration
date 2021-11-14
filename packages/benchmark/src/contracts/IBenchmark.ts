import { ISimpleEvent } from "strongly-typed-events";
import { BenchmarkResultType, IBenchmarkResult } from "./IBenchmarkResult";

export interface StartConfig {
  /** Whether not to skip first samples based on CoV */
  coldStart?: boolean;
  /** Max acceptable coefficient of variation of steady state */
  cov?: number;
  /** Number of iterations to compute CoV of */
  covWindow?: number;
}

export interface IterationConfig {
  /** Min sample count to run */
  samples?: number;
}

export interface TimeConfig {
  /** Min/max sample count to run */
  minSamples?: number;
  maxSamples?: number;

  /** Min/max time of sample */
  minTime?: number;
  maxTime?: number;
}

export interface GeneralConfig {
  /** Benchmark name used in identifying results */
  name?: string;
  /** Min count in single run to compute averate time */
  count?: number;
}

export interface IBenchmark {
  onSetup: ISimpleEvent<unknown>;
  onCycle: ISimpleEvent<unknown>;
  onSample: ISimpleEvent<unknown>;
  onTeardown: ISimpleEvent<unknown>;

  runIteractions(
    config: GeneralConfig | StartConfig | IterationConfig
  ): IBenchmarkResult<BenchmarkResultType.ITERATIONS>;
  runTimeIterations(
    config: GeneralConfig | StartConfig | TimeConfig
  ): IBenchmarkResult<BenchmarkResultType.TIME_ITERATIONS>;

  runExtractedIteractions(
    config: GeneralConfig | IterationConfig
  ): IBenchmarkResult<BenchmarkResultType.EXTRACTED_ITERATIONS>;
  runExtractedTimeIterations(
    config: GeneralConfig | TimeConfig
  ): IBenchmarkResult<BenchmarkResultType.EXTRACTED_TIME_ITERATIONS>;
}
