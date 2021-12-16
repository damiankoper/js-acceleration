import {
  GeneralConfig,
  generalConfigDefaults,
  IBenchmark,
  IterationConfig,
  iterationConfigDefaults,
  TimeConfig,
  timeConfigDefaults,
} from "./contracts/IBenchmark";
import {
  BenchmarkResultType,
  IBenchmarkResult,
} from "./contracts/IBenchmarkResult";
import { BenchmarkBase } from "./BenchmarkBase";

export class BenchmarkExtracted extends BenchmarkBase implements IBenchmark {
  public runIterations(
    config: GeneralConfig & IterationConfig
  ): IBenchmarkResult<BenchmarkResultType.ITERATIONS> {
    this.init(config);
    config = Object.assign(
      {},
      generalConfigDefaults(),
      iterationConfigDefaults(),
      config
    );

    while (this.samples.length < config.samples) {
      this.runExtractedSample(config);
    }

    return this.getResult(BenchmarkResultType.ITERATIONS, config);
  }

  public runTimeIterations(
    config: GeneralConfig & TimeConfig
  ): IBenchmarkResult<BenchmarkResultType.TIME_ITERATIONS> {
    this.init(config);
    config = Object.assign(
      {},
      generalConfigDefaults(),
      timeConfigDefaults(),
      config
    );

    while (this.shouldRunSample(config)) {
      this.runExtractedSample(config);
      this.adjustMicroRuns(config);
    }

    return this.getResult(BenchmarkResultType.TIME_ITERATIONS, config);
  }

  private runExtractedSample(config: GeneralConfig) {
    const nTotal = config.microRuns;

    const fn = this.createFunction(config);

    // single sample
    const t = fn({ timer: this.timer, config });

    this.totalTime += t;
    this.totalCount += nTotal;
    this.samples.push({ count: nTotal, time: t / nTotal, totalTime: t });
  }

  private createFunction(
    config: GeneralConfig
  ): (context: Record<string, unknown>) => number {
    const fnString = this.fn.toString().match(/^[^{]*\{([\s\S]*)\}\s*$/)[1];
    const template = `return (
      function(@context) {
        let @n = @context.config.microRuns;
        let @t = new @context.timer()
        @t.start();
        while(@n--){
          ${fnString}
        }
        let @tt = @t.stop();
        return @tt;
      }
    )`.replace(/@/g, config.name || "");
    const fn = Function(template);

    return fn();
  }
}
