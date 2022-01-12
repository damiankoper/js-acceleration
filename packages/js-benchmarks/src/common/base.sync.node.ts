import { SHT, SHTOptions } from "meta";
import { getImageData } from "../utils/node";
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
  sht: SHT,
  shtLookup: SHT,
  fileFn: (name: string) => string
) {
  (async () => {
    const { imageData, width } = await getImageData(
      "../../test/threshold/1.jpg"
    );

    const options: SHTOptions = {
      width,
      sampling: { rho: 1, theta: 1 },
      votingThreshold: 0.75,
    };
    const benchmarkSHTSimple = new Benchmark(function () {
      sht(imageData, options);
    });
    const benchmarkSHTSimpleLookup = new Benchmark(function () {
      shtLookup(imageData, options);
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

        const result = config.benchmark.runTimeIterations({
          name: config.name,
          ...runConfig,
        });
        stream.write(mapResult(result, theta));
      }
      stream.end();
    }
  })();
}
