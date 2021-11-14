import { ISimpleEvent } from "strongly-typed-events";

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

  runIteractions(config: GeneralConfig | StartConfig | IterationConfig);
  runTimeIterations(config: GeneralConfig | StartConfig | TimeConfig);

  runExtractedIteractions(config: GeneralConfig | IterationConfig);
  runExtractedTimeIterations(config: GeneralConfig | TimeConfig);
}
