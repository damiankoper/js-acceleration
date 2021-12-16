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
    this.init(config);
    config = Object.assign(
      {},
      generalConfigDefaults(),
      startConfigDefaults(),
      iterationConfigDefaults(),
      config
    );

    this.waitForSteadyState(config);

    while (this.samples.length < config.samples) {
      this.runSample(config);
    }

    return this.getResult(BenchmarkResultType.ITERATIONS, config);
  }

  public runTimeIterations(
    config: GeneralConfig & StartConfig & TimeConfig
  ): IBenchmarkResult<BenchmarkResultType.TIME_ITERATIONS> {
    this.init(config);
    config = Object.assign(
      {},
      generalConfigDefaults(),
      startConfigDefaults(),
      timeConfigDefaults(),
      config
    );

    this.waitForSteadyState(config);

    while (this.shouldRunSample(config)) {
      this.runSample(config);
      this.adjustMicroRuns(config);
    }

    return this.getResult(BenchmarkResultType.TIME_ITERATIONS, config);
  }

  private waitForSteadyState(config: GeneralConfig & StartConfig) {
    while (!this.steadyStateReached && config.steadyState) {
      this.runSample(config);
      this.steadyStateReached = this.isSteadyState(config);
      if (this.steadyStateReached) this.samples = [];
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
    const microRunsTotal = config.microRuns;
    let microRuns = microRunsTotal;

    const timer = new this.timer();
    timer.start();
    while (microRuns--) {
      this.fn();
    }
    const t = timer.stop();

    this.totalTime += t;
    this.totalCount += microRunsTotal;
    this.samples.push({
      count: microRunsTotal,
      time: t / microRunsTotal,
      totalTime: t,
    });
  }
}
