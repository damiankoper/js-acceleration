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

export class Benchmark implements IBenchmark {
  private fn: () => void;
  private timer: ITimer;

  private totalTime = 0;
  private samples: IBenchmarkSampleResult[] = [];

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
    this.totalTime = 0;
    this.samples = [];
  }

  public runIterations(
    config: GeneralConfig & StartConfig & IterationConfig
  ): IBenchmarkResult<BenchmarkResultType.ITERATIONS> {
    config = Object.assign(
      {},
      generalConfigDefaults(),
      startConfigDefaults(),
      iterationConfigDefaults(),
      config
    );

    let s = config.samples;

    // single sample
    while (s--) {
      this.runSample(config);
    }
  }

  public runTimeIterations(
    config: GeneralConfig & StartConfig & TimeConfig
  ): IBenchmarkResult<BenchmarkResultType.TIME_ITERATIONS> {
    throw new Error("Method not implemented.");
  }

  public runExtractedIterations(
    config: GeneralConfig & IterationConfig
  ): IBenchmarkResult<BenchmarkResultType.EXTRACTED_ITERATIONS> {
    throw new Error("Method not implemented.");
  }
  public runExtractedTimeIterations(
    config: GeneralConfig & TimeConfig
  ): IBenchmarkResult<BenchmarkResultType.EXTRACTED_TIME_ITERATIONS> {
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
    // TODO handle coldStart here on globally(run) ?
    while (n--) {
      this.fn();
    }
    const t = this.timer.stop();

    this.totalTime += t;
    this.samples.push({ count: nTotal, time: t / nTotal });
  }

  private computeResult(samples = this.samples): IBenchmarkResult {}

  private computeBasicMetrics(samples): BasicMetrics {}
}
