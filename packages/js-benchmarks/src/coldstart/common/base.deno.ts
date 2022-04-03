import {
  SHTOptions,
  SHT,
  SHTAsync,
  SHTParallelOptions,
  CHTOptions,
  CHT,
  CHTAsync,
  CHTParallelOptions,
} from "../../../../meta/src/deno/main.ts";
import { getImageData } from "../../utils/deno.ts";
import { Benchmark } from "../../../../benchmark/dist/main.mjs";
import { writeCSVObjects } from "https://deno.land/x/csv/mod.ts";
import { runConfig } from "../common/runConfig.ts";

function mapResult(
  result: Record<string, any>,
  sample: Record<string, any>,
  nth: number
) {
  return {
    name: result.name,
    nth,
    time: sample.time,
  };
}

export function denoBaseFactory(
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
      const f = await Deno.open(new URL(fileFn(config.name), import.meta.url), {
        write: true,
        create: true,
        truncate: true,
      });

      console.log("Benchmarking", config.name);
      await new Promise<void>((resolve) => setTimeout(resolve, 200));

      const c = { name: config.name, ...runConfig };
      const result = !async
        ? config.benchmark.runTimeIterations(c)
        : await config.benchmark.runTimeIterationsAsync(c);

      console.log(config.benchmark.getColdSamples());
      const results: any[] = [];
      config.benchmark.getColdSamples().forEach((sample: any, i: number) => {
        results.push(mapResult(result, sample, i));
      });
      await writeCSVObjects(f, results, { header: Object.keys(results[0]) });
      f.close();
    }
    Deno.exit();
  })();
}
