import { SimpleEventDispatcher } from "ste-simple-events";
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
  BasicMetrics,
  BenchmarkResultType,
  IBenchmarkResult,
} from "./contracts/IBenchmarkResult";
import { IBenchmarkSampleResult } from "./contracts/IBenchmarkSampleResult";
import { ITimer } from "./contracts/ITimer";
import { ChromeTimer } from "./timers/ChromeTimer";
import { NodeHRTimer } from "./timers/NodeHRTimer";
import { PerformanceTimer } from "./timers/PerformanceTimer";
import * as ss from "simple-statistics";

export class Benchmark implements IBenchmark {
  private fn: () => void;
  private timer: ITimer;
  private readonly tTable = [
    /** T-table for 95% confidence */
    12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228,
    2.201, 2.179, 2.16, 2.145, 2.131, 2.12, 2.11, 2.101, 2.093, 2.086, 2.08,
    2.074, 2.069, 2.064, 2.06, 2.056, 2.052, 2.048, 2.045, 2.042,
    /** INFINITY */ 1.95996398454,
  ];

  private samples: IBenchmarkSampleResult[] = [];
  private steadyStateReached = false;

  private _onSetup = new SimpleEventDispatcher();
  private _onSample = new SimpleEventDispatcher();
  private _onTeardown = new SimpleEventDispatcher();

  public constructor(fn: () => void) {
    this.fn = fn;
    this.timer = this.getTimer();
  }

  public get onSetup() {
    return this._onSetup.asEvent();
  }
  public get onSample() {
    return this._onSample.asEvent();
  }
  public get onTeardown() {
    return this._onTeardown.asEvent();
  }

  public reset(): void {
    this.timer = this.getTimer();
    this.samples = [];
  }

  public getSamples(): IBenchmarkSampleResult[] {
    return [...this.samples];
  }

  public runIterations(
    config: GeneralConfig & StartConfig & IterationConfig
  ): IBenchmarkResult<BenchmarkResultType.ITERATIONS> {
    this.reset();
    config = Object.assign(
      {},
      generalConfigDefaults(),
      startConfigDefaults(),
      iterationConfigDefaults(),
      config
    );

    while (!this.steadyStateReached) {
      this.runSample(config);
      this.steadyStateReached = this.isSteadyState(config);
      if (this.steadyStateReached) this.samples = [];
    }

    while (this.samples.length < config.samples) {
      this.runSample(config);
    }

    return this.getResult(BenchmarkResultType.ITERATIONS, config);
  }

  public runTimeIterations(
    config: GeneralConfig & StartConfig & TimeConfig
  ): IBenchmarkResult<BenchmarkResultType.TIME_ITERATIONS> {
    this.reset();
    config = Object.assign(
      {},
      generalConfigDefaults(),
      startConfigDefaults(),
      timeConfigDefaults(),
      config
    );

    while (!this.steadyStateReached) {
      this.runSample(config);
      this.steadyStateReached = this.isSteadyState(config);
      if (this.steadyStateReached) this.samples = [];
    }

    while (this.shouldRunSample(config)) {
      this.runSample(config);
    }

    return this.getResult(BenchmarkResultType.TIME_ITERATIONS, config);
  }

  private shouldRunSample(config: TimeConfig) {
    const samples = this.samples.length;
    const totalTime = this.samples.reduce((a, b) => a + b.totalTime, 0);

    const samplesExceeded = samples >= config.maxSamples;
    const timeExceeded = totalTime >= config.maxTime;
    const minSamplesReached = samples >= config.minSamples;
    const minTimeReached = totalTime >= config.minTime;

    return (
      (timeExceeded && !minSamplesReached) ||
      (samplesExceeded && !minTimeReached) ||
      (!samplesExceeded && !timeExceeded)
    );
  }

  public runExtractedIterations(
    config: GeneralConfig & IterationConfig
  ): IBenchmarkResult<BenchmarkResultType.EXTRACTED_ITERATIONS> {
    this.reset();
    throw new Error("Method not implemented.");
  }
  public runExtractedTimeIterations(
    config: GeneralConfig & TimeConfig
  ): IBenchmarkResult<BenchmarkResultType.EXTRACTED_TIME_ITERATIONS> {
    this.reset();
    throw new Error("Method not implemented.");
  }

  private getTimer(): ITimer {
    const timers = [ChromeTimer, NodeHRTimer, PerformanceTimer]
      .filter((t) => t.isAvailable())
      .sort((t1, t2) => t2.resolution - t1.resolution);
    return new timers[0]();
  }

  private runSample(config: GeneralConfig) {
    const nTotal = config.count;
    let n = nTotal;

    // single sample
    this.timer.start();
    while (n--) {
      this.fn();
    }
    const t = this.timer.stop();

    this.samples.push({ count: nTotal, time: t / nTotal, totalTime: t });
  }

  private getResult<T extends BenchmarkResultType>(
    type: T,
    config: GeneralConfig,
    samples = this.samples
  ): IBenchmarkResult<T> {
    const times = samples.map((s) => s.time);
    const basicMetrics = this.getBasicMetrics(times);

    const size = times.length;
    const sem = basicMetrics.stdev / Math.sqrt(size);
    const moe = sem * this.tTable[Math.min(size - 1, this.tTable.length) - 1];
    const rme = moe / basicMetrics.mean || 0;

    return {
      ...basicMetrics,
      name: config.name,
      type,
      sem,
      moe,
      rme,
    };
  }

  private getBasicMetrics(times: number[]): BasicMetrics {
    const mean = ss.mean(times);
    const variance = ss.sampleVariance(times);
    const stdev = Math.sqrt(variance);
    return {
      mean,
      var: variance,
      stdev,
    };
  }

  private isSteadyState(config: StartConfig): boolean {
    if (config.steadyState) {
      if (this.samples.length < config.covWindow) return false;
      const samples = this.samples.slice(-config.covWindow);
      const { mean, stdev } = this.getBasicMetrics(samples.map((s) => s.time));
      const cov = stdev / mean;
      console.log(cov);

      return cov <= config.cov;
    }
    return true;
  }

  private validateConfig(
    config: GeneralConfig & StartConfig & TimeConfig & IterationConfig
  ) {
    if (config.samples && config.samples <= 2)
      throw new Error("Benchmark requires at least two samples");
  }
}
