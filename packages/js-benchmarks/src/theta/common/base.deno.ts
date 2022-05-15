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
import { size } from "../common/runConfig.ts";

function mapResult(result: Record<string, any>, sizeTheta: number) {
  return {
    key: `${result.name}_${sizeTheta}`,
    name: result.name,
    sizeTheta,
    mean: result.mean,
    stdev: result.stdev,
    sem: result.sem,
    moe: result.moe,
    rme: result.rme,
    version: Deno.version.deno,
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
      const f = await Deno.open(new URL(fileFn(config.name), import.meta.url), {
        write: true,
        create: true,
        truncate: true,
      });

      const results: any[] = [];
      for (let theta = size.min; theta <= size.max; theta++) {
        if (optionsSHT.sampling) optionsSHT.sampling.theta = theta;
        optionsCHT.maxR = 20 + theta * 10;

        console.log("Benchmarking", config.name, "size:", theta);
        await new Promise<void>((resolve) => setTimeout(resolve, 200));

        const c = { name: config.name, ...runConfig };
        const result = !async
          ? config.benchmark.runTimeIterations(c)
          : await config.benchmark.runTimeIterationsAsync(c);

        results.push(mapResult(result, theta));
        console.log(result.mean);
      }
      await writeCSVObjects(f, results, { header: Object.keys(results[0]) });
      f.close();
    }
    Deno.exit();
  })();
}
