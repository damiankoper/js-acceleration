import { SHT, SHTAsync, SHTOptions, SHTParallelOptions } from "meta";
import { getImageData } from "../../utils/node";
import { Benchmark } from "benchmark";
import { format } from "fast-csv";
import { createWriteStream } from "fs";
import { IBenchmarkResult } from "benchmark/dist/contracts/IBenchmarkResult";
import { runConfig, size } from "./runConfig";

function mapResult(result: IBenchmarkResult, sizeTheta: number) {
  return {
    key: `${result.name}_${sizeTheta}`,
    name: result.name,
    sizeTheta,
    mean: result.mean,
    stdev: result.stdev,
    sem: result.sem,
    moe: result.moe,
    rme: result.rme,
    version: process.version,
  };
}

export function nodeBaseFactory(
  sht: SHT | SHTAsync,
  shtLookup: SHT | SHTAsync,
  fileFn: (name: string) => string,
  async = false,
  shtOptions: Partial<SHTOptions | SHTParallelOptions> = {}
) {
  (async () => {
    const { imageData, width } = await getImageData(
      "../../test/threshold/1.jpg"
    );

    const options: SHTOptions = {
      width,
      sampling: { rho: 1, theta: 1 },
      votingThreshold: 0.75,
      ...shtOptions,
    };
    const benchmarkSHTSimple = !async
      ? new Benchmark(function () {
          sht(imageData, options);
        })
      : new Benchmark(async function () {
          await sht(imageData, options);
        });
    const benchmarkSHTSimpleLookup = !async
      ? new Benchmark(function () {
          shtLookup(imageData, options);
        })
      : new Benchmark(async function () {
          await shtLookup(imageData, options);
        });

    const configs = [
      { benchmark: benchmarkSHTSimple, name: "SHT_Simple" },
      { benchmark: benchmarkSHTSimpleLookup, name: "SHT_Simple_Lookup" },
    ];
    for (const config of configs) {
      const stream = format({ headers: true });
      stream.pipe(
        createWriteStream(new URL(fileFn(config.name), import.meta.url))
      );

      for (let theta = size.min; theta <= size.max; theta++) {
        options.sampling.theta = theta;
        console.log("Benchmarking", config.name, "size:", theta);
        await new Promise<void>((resolve) => setTimeout(resolve, 200));

        const c = { name: config.name, ...runConfig };
        const result = !async
          ? config.benchmark.runTimeIterations(c)
          : await config.benchmark.runTimeIterationsAsync(c);

        stream.write(mapResult(result, theta));
        console.log(result.mean);
      }
      stream.end();
    }
    process.exit();
  })();
}
