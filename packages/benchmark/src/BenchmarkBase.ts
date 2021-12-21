import {
  GeneralConfig,
  IterationConfig,
  StartConfig,
  TimeConfig,
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

export class BenchmarkBase {
  protected fn: () => void;
  protected timer: new () => ITimer;
  protected readonly tTable = [
    /** T-table for 95% confidence */
    12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228,
    2.201, 2.179, 2.16, 2.145, 2.131, 2.12, 2.11, 2.101, 2.093, 2.086, 2.08,
    2.074, 2.069, 2.064, 2.06, 2.056, 2.052, 2.048, 2.045, 2.042,
    /** INFINITY */ 1.95996398454,
  ];

  protected samples: IBenchmarkSampleResult[] = [];
  protected steadyStateReached = false;
  protected totalTime = 0;
  protected totalMicroRuns = 0;

  public constructor(fn: () => void) {
    this.fn = fn;
    this.timer = this.getTimer();
  }

  public reset(): void {
    this.timer = this.getTimer();
    this.steadyStateReached = false;
    this.totalTime = 0;
    this.totalMicroRuns = 0;
    this.samples = [];
  }

  public getSamples(): IBenchmarkSampleResult[] {
    return [...this.samples];
  }

  protected init(config: GeneralConfig & StartConfig & IterationConfig) {
    this.validateConfig(config);
    this.reset();
  }

  protected validateConfig(
    config: GeneralConfig & StartConfig & TimeConfig & IterationConfig
  ) {
    if (config.samples && config.samples < 2)
      throw new Error("Benchmark requires at least two samples");
    if (config.microRuns && config.microRuns < 1)
      throw new Error("Benchmark requires at least one microrun");
  }

  protected getTimer(): new () => ITimer {
    const timers = [ChromeTimer, PerformanceTimer]
      .filter((t) => t.isAvailable())
      .sort((t1, t2) => t2.resolution - t1.resolution);
    if (timers.length) return timers[0];
    else throw new Error("No available timers!");
  }

  protected shouldRunSample(config: TimeConfig) {
    const samples = this.samples.length;
    const totalTime = this.totalTime;

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

  protected adjustMicroRuns(config: GeneralConfig & TimeConfig) {
    const samples = this.samples.length;
    const timePerMicroRun = Math.max(
      this.totalTime / this.totalMicroRuns,
      Number.EPSILON
    );
    const samplesLeft = Math.max(config.minSamples - samples, 1);
    const timeLeft = Math.max(config.minTime - this.totalTime, 0);
    config.microRuns = Math.ceil(timeLeft / samplesLeft / timePerMicroRun);
  }

  protected getResult<T extends BenchmarkResultType>(
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
      samples: [...this.samples],
    };
  }

  protected getBasicMetrics(times: number[]): BasicMetrics {
    const mean = ss.mean(times);
    const variance = ss.sampleVariance(times);
    const stdev = Math.sqrt(variance);
    return {
      mean,
      var: variance,
      stdev,
    };
  }
}
