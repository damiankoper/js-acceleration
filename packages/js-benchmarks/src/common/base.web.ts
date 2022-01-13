import { SHT, SHTAsync, SHTOptions, SHTParallelOptions } from "meta";
import { getImageData } from "../utils/web";
import { Benchmark } from "benchmark";
import { IBenchmarkResult } from "benchmark/dist/contracts/IBenchmarkResult";
import { runConfig, size } from "./runConfig";
import { unparse } from "papaparse";
import { saveAs } from "file-saver";
import testImage from "../../../../test/threshold/1.jpg";

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
    version: result.platform.version,
  };
}

export function webBaseFactory(
  sht: SHT | SHTAsync,
  shtLookup: SHT | SHTAsync,
  fileFn: (name: string, env: string) => string,
  async = false,
  shtOptions: Partial<SHTOptions | SHTParallelOptions> = {}
) {
  (async () => {
    const { imageData, width } = await getImageData(testImage);

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

    let env = "TBD";
    const csvMap = new Map<string, string>();
    const configs = [
      { benchmark: benchmarkSHTSimple, name: "SHT_Simple" },
      {
        benchmark: benchmarkSHTSimpleLookup,
        name: "SHT_Simple_Lookup",
      },
    ];
    for (const config of configs) {
      const results: unknown[] = [];
      for (let theta = size.min; theta <= size.max; theta++) {
        options.sampling.theta = theta;
        const msg = `Benchmarking ${config.name} size: ${theta}\n`;
        console.log(msg);
        document.body.innerText += msg;
        await new Promise<void>((resolve) => setTimeout(resolve, 200));

        const c = { name: config.name, ...runConfig };
        const result = !async
          ? config.benchmark.runTimeIterations(c)
          : await config.benchmark.runTimeIterationsAsync(c);

        env = result.platform.name;
        results.push(mapResult(result, theta));
        console.log(result.mean);
      }
      csvMap.set(config.name, unparse(results));
    }

    for (const [name, csv] of csvMap) {
      const file = new File([csv], fileFn(name, env), {
        type: "text/csv;charset=utf-8",
      });
      saveAs(file);
    }
  })();
}
