import { ISimpleEvent } from "ste-simple-events";
import {
  GeneralConfig,
  IBenchmark,
  IterationConfig,
  StartConfig,
  TimeConfig,
} from "./contracts/IBenchmark";

export class Benchmark implements IBenchmark {
  private fn: () => void;

  constructor(fn: () => void) {
    this.fn = fn;
  }

  onSetup: ISimpleEvent<unknown>;
  onCycle: ISimpleEvent<unknown>;
  onSample: ISimpleEvent<unknown>;
  onTeardown: ISimpleEvent<unknown>;

  runIteractions(config: GeneralConfig | StartConfig | IterationConfig) {
    throw new Error("Method not implemented.");
  }
  runTimeIterations(config: GeneralConfig | StartConfig | TimeConfig) {
    throw new Error("Method not implemented.");
  }
  runExtractedIteractions(config: GeneralConfig | IterationConfig) {
    throw new Error("Method not implemented.");
  }
  runExtractedTimeIterations(config: GeneralConfig | TimeConfig) {
    throw new Error("Method not implemented.");
  }
}
