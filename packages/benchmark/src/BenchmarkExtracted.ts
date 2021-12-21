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
  private nameCounter = 0;

  public runIterations(
    config: GeneralConfig & IterationConfig,
    context: Record<string, unknown> = {}
  ): IBenchmarkResult<BenchmarkResultType.ITERATIONS> {
    this.init(config);
    config = Object.assign(
      {},
      generalConfigDefaults(),
      iterationConfigDefaults(),
      config
    );

    while (this.samples.length < config.samples) {
      this.runExtractedSample(config, context);
    }

    return this.getResult(BenchmarkResultType.ITERATIONS, config);
  }

  public runTimeIterations(
    config: GeneralConfig & TimeConfig,
    context: Record<string, unknown> = {}
  ): IBenchmarkResult<BenchmarkResultType.TIME_ITERATIONS> {
    this.init(config);
    config = Object.assign(
      {},
      generalConfigDefaults(),
      timeConfigDefaults(),
      config
    );

    while (this.shouldRunSample(config)) {
      this.runExtractedSample(config, context);
      this.adjustMicroRuns(config);
    }

    return this.getResult(BenchmarkResultType.TIME_ITERATIONS, config);
  }

  private runExtractedSample(
    config: GeneralConfig,
    context: Record<string, unknown> = {}
  ) {
    const nTotal = config.microRuns;

    const fn = this.createFunction(config);

    // single sample
    const t = fn.call(context, { timer: this.timer, config, globals: context });

    this.totalTime += t;
    this.totalMicroRuns += nTotal;
    this.samples.push({ microRuns: nTotal, time: t / nTotal, totalTime: t });
  }

  private createFunction(
    config: GeneralConfig
  ): (context: Record<string, unknown>) => number {
    const regex = /^[^{]*\{([\s\S]*)\}\s*$|=>([\s\S]*)\s*$/;
    const fnString = this.fn.toString().match(regex)[1];
    const setupString = this.setup.toString().match(regex)[1];
    const teardownString = this.teardown.toString().match(regex)[1];
    const template = `
    return (
      function(@context) {
        let @n = @context.config.microRuns;
        let @t = new @context.timer()
        ${setupString}
        @t.start();
        while(@n--){
          ${fnString}
        }
        let @tt = @t.stop();
        ${teardownString}
        return @tt;
      }
    )`.replace(/@/g, config.name + (this.nameCounter++).toString());
    const fn = Function(template);

    return fn();
  }
}
