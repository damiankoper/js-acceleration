
import { SHTOptions, SHT, SHTAsync, SHTParallelOptions} from "../../../../meta/dist/main.mjs";
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
    version: Deno.version.deno
  };
}
export function denoBaseFactory(
  sht: SHT | SHTAsync,
  shtLookup: SHT | SHTAsync,
  fileFn: (name: string) => string,
  async = false,
  shtOptions: Partial<SHTOptions | SHTParallelOptions> = {}
) {
  (async () => {
    const { imageData, width } = await getImageData("../../test/threshold/1.jpg");

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
      const f = await Deno.open(new URL(fileFn(config.name), import.meta.url),
        {
          write: true,
          create: true,
          truncate: true,
        }
      );

      const results: any[] = [];
      for (let theta = size.min; theta <= size.max; theta++) {
        options.sampling.theta = theta;
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
