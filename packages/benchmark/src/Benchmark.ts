import {
  GeneralConfig,
  generalConfigDefaults,
  IBenchmark,
  IterationConfig,
  iterationConfigDefaults,
  StartConfig,
  startConfigDefaults,
  TimeConfig,
  timeConfigDefaults,
} from "./contracts/IBenchmark";
import {
  BenchmarkResultType,
  IBenchmarkResult,
} from "./contracts/IBenchmarkResult";
import { BenchmarkBase } from "./BenchmarkBase";

export class Benchmark extends BenchmarkBase implements IBenchmark {
  public runIterations(
    config: GeneralConfig & StartConfig & IterationConfig
  ): IBenchmarkResult<BenchmarkResultType.ITERATIONS> {
    config = this.initIterations(config);
    this.waitForSteadyState(config);
    while (this.samples.length < config.samples) {
      this.runSample(config);
    }
    return this.getResult(BenchmarkResultType.ITERATIONS, config);
  }

  public async runIterationsAsync(
    config: GeneralConfig & StartConfig & IterationConfig
  ): Promise<IBenchmarkResult<BenchmarkResultType.ITERATIONS>> {
    config = this.initIterations(config);
    await this.waitForSteadyStateAsync(config);
    while (this.samples.length < config.samples) {
      await this.runSampleAsync(config);
    }
    return this.getResult(BenchmarkResultType.ITERATIONS, config);
  }

  private initIterations(
    config: GeneralConfig & StartConfig & IterationConfig
  ) {
    this.init(config);
    config = Object.assign(
      {},
      generalConfigDefaults(),
      startConfigDefaults(),
      iterationConfigDefaults(),
      config
    );
    return config;
  }

  public runTimeIterations(
    config: GeneralConfig & StartConfig & TimeConfig
  ): IBenchmarkResult<BenchmarkResultType.TIME_ITERATIONS> {
    config = this.initTimeIterations(config);
    this.waitForSteadyState(config);
    while (this.shouldRunSample(config)) {
      this.runSample(config);
      this.adjustMicroRuns(config);
    }
    return this.getResult(BenchmarkResultType.TIME_ITERATIONS, config);
  }

  public async runTimeIterationsAsync(
    config: GeneralConfig & StartConfig & TimeConfig
  ): Promise<IBenchmarkResult<BenchmarkResultType.TIME_ITERATIONS>> {
    config = this.initTimeIterations(config);
    await this.waitForSteadyStateAsync(config);
    while (this.shouldRunSample(config)) {
      await this.runSampleAsync(config);
      this.adjustMicroRuns(config);
    }
    return this.getResult(BenchmarkResultType.TIME_ITERATIONS, config);
  }

  private initTimeIterations(config: GeneralConfig & StartConfig & TimeConfig) {
    this.init(config);
    config = Object.assign(
      {},
      generalConfigDefaults(),
      startConfigDefaults(),
      timeConfigDefaults(),
      config
    );
    return config;
  }

  private waitForSteadyState(config: GeneralConfig & StartConfig) {
    while (!this.steadyStateReached && config.steadyState) {
      this.runSample(config);
      this.checkSteadyState(config);
    }
  }

  private async waitForSteadyStateAsync(config: GeneralConfig & StartConfig) {
    while (!this.steadyStateReached && config.steadyState) {
      await this.runSampleAsync(config);
      this.checkSteadyState(config);
    }
  }

  private checkSteadyState(config: GeneralConfig & StartConfig) {
    this.steadyStateReached = this.isSteadyState(config);
    if (this.steadyStateReached) {
      this.coldSamples = [...this.samples];
      this.samples = [];
      this.totalMicroRuns = 0;
      this.totalTime = 0;
    }
  }

  private isSteadyState(config: StartConfig): boolean {
    if (this.samples.length < config.covWindow) return false;
    const samples = this.samples.slice(-config.covWindow);
    const { mean, stdev } = this.getBasicMetrics(samples.map((s) => s.time));
    const cov = stdev / mean;
    return cov <= config.cov;
  }

  private runSample(config: GeneralConfig) {
    const sampleSetup = this.setupSample(config);
    const { timer, microRunsTotal } = sampleSetup;
    let { microRuns } = sampleSetup;

    timer.start();
    while (microRuns--) {
      this.fn();
    }
    const t = timer.stop();

    this.teardownSample(t, microRunsTotal);
  }

  private async runSampleAsync(config: GeneralConfig) {
    const sampleSetup = this.setupSample(config);
    const { timer, microRunsTotal } = sampleSetup;
    let { microRuns } = sampleSetup;

    timer.start();
    while (microRuns--) {
      await this.fn();
    }
    const t = timer.stop();

    this.teardownSample(t, microRunsTotal);
  }

  private setupSample(config: GeneralConfig) {
    const microRunsTotal = config.microRuns;
    const microRuns = microRunsTotal;
    const timer = new this.timer();
    this.setup();
    return { timer, microRuns, microRunsTotal };
  }

  private teardownSample(t: number, microRunsTotal: number) {
    this.teardown();
    this.totalTime += t;
    this.totalMicroRuns += microRunsTotal;
    this.samples.push({
      microRuns: microRunsTotal,
      time: t / microRunsTotal,
      totalTime: t,
    });
  }
}
