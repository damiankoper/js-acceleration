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
import { getImageData } from "../../utils/web";
import { Benchmark } from "benchmark";
import { IBenchmarkResult } from "benchmark/dist/contracts/IBenchmarkResult";
import { runConfig } from "./runConfig";
import { unparse } from "papaparse";
import { saveAs } from "file-saver";
import testImageSHT from "../../../../../test/threshold/1.jpg";
import testImageCHT from "../../../../../test/threshold/2.png";
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
  };
}

export function webBaseFactory(
  cht: CHT | CHTAsync,
  sht: SHT | SHTAsync,
  shtLookup: SHT | SHTAsync,
  fileFn: (name: string, env: string) => string,
  async = false,
  shtOptions: Partial<SHTOptions | SHTParallelOptions> = {},
  chtOptions: Partial<CHTOptions | CHTParallelOptions> = {}
) {
  (async () => {
    const { imageData: imageDataSHT, width: widthSHT } = await getImageData(
      testImageSHT
    );
    const { imageData: imageDataCHT, width: widthCHT } = await getImageData(
      testImageCHT
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

    let env = "TBD";
    const csvMap = new Map<string, string>();
    const configs = [
      { benchmark: benchmarkCHTSimple, name: "CHT_Simple" },
      { benchmark: benchmarkSHTSimple, name: "SHT_Simple" },
      {
        benchmark: benchmarkSHTSimpleLookup,
        name: "SHT_Simple_Lookup",
      },
    ];
    for (const config of configs) {
      const results: unknown[] = [];
      const msg = `Benchmarking ${config.name}\n`;
      console.log(msg);
      document.body.innerText += msg;
      await new Promise<void>((resolve) => setTimeout(resolve, 200));

      const c = { name: config.name, ...runConfig };
      const result = !async
        ? config.benchmark.runTimeIterations(c)
        : await config.benchmark.runTimeIterationsAsync(c);

      console.log(config.benchmark.getColdSamples());
      config.benchmark.getColdSamples().forEach((sample, i) => {
        results.push(mapResult(result, sample, i));
      });
      csvMap.set(config.name, unparse(results));
      env = result.platform.name;
    }
    document.body.style.background = "green";
    for (const [name, csv] of csvMap) {
      const file = new File([csv], fileFn(name, env), {
        type: "text/csv;charset=utf-8",
      });
      saveAs(file);
    }
  })();
}
