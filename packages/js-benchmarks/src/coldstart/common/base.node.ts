import {
  CHT,
  CHTAsync,
  CHTOptions,
  CHTParallelOptions,
  SHT,
  SHTAsync,
  SHTOptions,
  SHTParallelOptions,
} from "meta";
import { getImageData } from "../../utils/node";
import { Benchmark } from "benchmark";
import { format } from "fast-csv";
import { createWriteStream } from "fs";
import { IBenchmarkResult } from "benchmark/dist/contracts/IBenchmarkResult";
import { runConfig } from "./runConfig";
import { IBenchmarkSampleResult } from "benchmark/dist/contracts/IBenchmarkSampleResult";

function mapResult(
  result: IBenchmarkResult,
  sample: IBenchmarkSampleResult,
  nth: number
) {
  return {
    name: result.name,
    nth,
    time: sample.time,
    version: process.version,
  };
}

export function nodeBaseFactory(
  cht: CHT | CHTAsync,
  sht: SHT | SHTAsync,
  shtLookup: SHT | SHTAsync,
  fileFn: (name: string) => string,
  async = false,
  shtOptions: Partial<SHTOptions | SHTParallelOptions> = {},
  chtOptions: Partial<CHTOptions | CHTParallelOptions> = {}
) {
  (async () => {
    const { imageData, width } = await getImageData(
      "../../test/threshold/2.png"
    );

    const optionsSHT: SHTOptions = {
      width,
      sampling: { rho: 1, theta: 1 },
      votingThreshold: 0.75,
      ...shtOptions,
    };
    const optionsCHT: CHTOptions = {
      width,
      gradientThreshold: 0.5,
      minDist: 50,
      minR: 20,
      maxR: 100,
      ...chtOptions,
    };

    const benchmarkCHTSimple = !async
      ? new Benchmark(function () {
          cht(imageData, optionsCHT);
        })
      : new Benchmark(async function () {
          await cht(imageData, optionsCHT);
        });
    const benchmarkSHTSimple = !async
      ? new Benchmark(function () {
          sht(imageData, optionsSHT);
        })
      : new Benchmark(async function () {
          await sht(imageData, optionsSHT);
        });
    const benchmarkSHTSimpleLookup = !async
      ? new Benchmark(function () {
          shtLookup(imageData, optionsSHT);
        })
      : new Benchmark(async function () {
          await shtLookup(imageData, optionsSHT);
        });

    const configs = [
      { benchmark: benchmarkCHTSimple, name: "CHT_Simple" },
      { benchmark: benchmarkSHTSimple, name: "SHT_Simple" },
      { benchmark: benchmarkSHTSimpleLookup, name: "SHT_Simple_Lookup" },
    ];
    for (const config of configs) {
      const stream = format({ headers: true });
      stream.pipe(
        createWriteStream(new URL(fileFn(config.name), import.meta.url))
      );

      console.log("Benchmarking", config.name);
      await new Promise<void>((resolve) => setTimeout(resolve, 200));

      const c = { name: config.name, ...runConfig };
      const result = !async
        ? config.benchmark.runTimeIterations(c)
        : await config.benchmark.runTimeIterationsAsync(c);

      console.log(config.benchmark.getColdSamples());
      config.benchmark.getColdSamples().forEach((sample, i) => {
        stream.write(mapResult(result, sample, i));
      });
      stream.end();
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    process.exit();
  })();
}
