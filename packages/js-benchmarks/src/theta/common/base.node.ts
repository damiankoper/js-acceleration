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
  cht: CHT | CHTAsync,
  sht: SHT | SHTAsync,
  shtLookup: SHT | SHTAsync,
  fileFn: (name: string) => string,
  async = false,
  shtOptions: Partial<SHTOptions | SHTParallelOptions> = {},
  chtOptions: Partial<CHTOptions | CHTParallelOptions> = {}
) {
  (async () => {
    const { imageData: imageDataSHT, width: widthSHT } = await getImageData(
      "../../test/threshold/1.jpg"
    );
    const { imageData: imageDataCHT, width: widthCHT } = await getImageData(
      "../../test/threshold/2.png"
    );

    const optionsSHT: SHTOptions = {
      width: widthSHT,
      sampling: { rho: 1, theta: 1 },
      votingThreshold: 0.75,
      ...shtOptions,
    };
    const optionsCHT: CHTOptions = {
      width: widthCHT,
      gradientThreshold: 0.5,
      minDist: 50,
      minR: 20,
      maxR: 100,
      ...chtOptions,
    };

    const benchmarkCHTSimple = !async
      ? new Benchmark(function () {
          cht(imageDataCHT, optionsCHT);
        })
      : new Benchmark(async function () {
          await cht(imageDataCHT, optionsCHT);
        });
    const benchmarkSHTSimple = !async
      ? new Benchmark(function () {
          sht(imageDataSHT, optionsSHT);
        })
      : new Benchmark(async function () {
          await sht(imageDataSHT, optionsSHT);
        });
    const benchmarkSHTSimpleLookup = !async
      ? new Benchmark(function () {
          shtLookup(imageDataSHT, optionsSHT);
        })
      : new Benchmark(async function () {
          await shtLookup(imageDataSHT, optionsSHT);
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

      for (let theta = size.min; theta <= size.max; theta++) {
        optionsSHT.sampling.theta = theta;
        optionsCHT.maxR = 20 + theta * 10;

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
