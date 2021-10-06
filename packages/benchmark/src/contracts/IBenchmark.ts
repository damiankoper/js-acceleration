export interface StateOptions {
  /** Whether not to skip first samples based on CoV */
  coldStart?: boolean;
  /** Number of  */
  window?: number;
  /** Max coefficient of variation*/
  cov?: number;
}

export interface IterationOptions {
  samples?: number;
}

export interface TimeOptions {
  minTime?: number;
  maxTime?: number;
}

export interface IBenchmark {
  runIteractions(options: StateOptions | IterationOptions);
  runTimeIterations(options: StateOptions | IterationOptions | TimeOptions);
  runExtracted(options: StateOptions | IterationOptions | TimeOptions);
}
