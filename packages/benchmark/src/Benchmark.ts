import { SimpleEventDispatcher } from "ste-simple-events";
import {
  GeneralConfig,
  IBenchmark,
  IterationConfig,
  StartConfig,
  TimeConfig,
} from "./contracts/IBenchmark";
import {
  BenchmarkResultType,
  IBenchmarkResult,
} from "./contracts/IBenchmarkResult";

export class Benchmark implements IBenchmark {
  private fn: () => void;

  private _onSetup = new SimpleEventDispatcher();
  private _onCycle = new SimpleEventDispatcher();
  private _onSample = new SimpleEventDispatcher();
  private _onTeardown = new SimpleEventDispatcher();

  constructor(fn: () => void) {
    this.fn = fn;
  }

  get onSetup() {
    return this._onSetup.asEvent();
  }
  get onCycle() {
    return this._onCycle.asEvent();
  }
  get onSample() {
    return this._onSample.asEvent();
  }
  get onTeardown() {
    return this._onTeardown.asEvent();
  }

  runIteractions(
    config: GeneralConfig | StartConfig | IterationConfig
  ): IBenchmarkResult<BenchmarkResultType.ITERATIONS> {
    throw new Error("Method not implemented.");
  }
  runTimeIterations(
    config: GeneralConfig | StartConfig | TimeConfig
  ): IBenchmarkResult<BenchmarkResultType.TIME_ITERATIONS> {
    throw new Error("Method not implemented.");
  }
  runExtractedIteractions(
    config: GeneralConfig | IterationConfig
  ): IBenchmarkResult<BenchmarkResultType.EXTRACTED_ITERATIONS> {
    throw new Error("Method not implemented.");
  }
  runExtractedTimeIterations(
    config: GeneralConfig | TimeConfig
  ): IBenchmarkResult<BenchmarkResultType.EXTRACTED_TIME_ITERATIONS> {
    throw new Error("Method not implemented.");
  }
}
