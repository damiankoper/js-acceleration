/* eslint-disable @typescript-eslint/no-unused-vars */
import * as sequential from "js-sequential";
import * as workers from "js-workers";
import {
  wasmSequentialFactory,
  wasmSequentialImplicitSIMDFactory,
  wasmSequentialSIMDFactory,
  asmSequentialFactory,
} from "wasm-sequential";
import {
  getImageData,
  renderCHTResults,
  renderHSpace,
  renderSHTResults,
} from "./utils";
import "./style.scss";

import * as gpu from "js-gpu";

(async () => {
  const shtOptions = {
    sampling: { rho: 1, theta: 1 },
    votingThreshold: 0.75,
    concurrency: 4,
    returnHSpace: true,
  };

  const chtOptions = {
    sampling: {},
    gradientThreshold: 0.5,
    minDist: 50,
    minR: 1,
    maxR: 100,
    concurrency: 4,
    returnHSpace: true,
  };

  const wasmSequential = await wasmSequentialFactory().init();
  const wasmSequentialImplicitSIMD =
    await wasmSequentialImplicitSIMDFactory().init();
  const wasmSequentialSIMD = await wasmSequentialSIMDFactory().init();
  const asmSequential = await asmSequentialFactory().init();

  const configs = [
    /*     {
      id: "sht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        sequential.SHTSimple(processedData, {
          width: imageData.width,
          ...shtOptions,
        }),
      render: renderSHTResults,
    },
    {
      id: "sht_seq_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        sequential.SHTSimpleLookup(processedData, {
          width: imageData.width,
          ...shtOptions,
        }),
      render: renderSHTResults,
    }, */
    {
      id: "cht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        sequential.CHTSimple(processedData, {
          width: imageData.width,
          ...chtOptions,
        }),
      inputImage: "/circle1.png",
      render: renderCHTResults,
    },
    /*     {
      id: "wasm_sht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequential.SHTSimple(processedData, {
          width: imageData.width,
          ...shtOptions,
        }),
      render: renderSHTResults,
    },
    {
      id: "wasm_sht_seq_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequential.SHTSimpleLookup(processedData, {
          width: imageData.width,
          ...shtOptions,
        }),
      render: renderSHTResults,
    }, */
    {
      id: "wasm_cht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequential.CHTSimple(processedData, {
          width: imageData.width,
          ...chtOptions,
        }),
      inputImage: "/circle1.png",
      render: renderCHTResults,
    },
    /*  {
      id: "wasm_implicit_simd_sht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequentialImplicitSIMD.SHTSimple(processedData, {
          width: imageData.width,
          ...shtOptions,
        }),
      render:renderSHTResults
    },
    {
      id: "wasm_implicit_simd_sht_seq_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequentialImplicitSIMD.SHTSimpleLookup(processedData, {
          width: imageData.width,
          ...shtOptions,
        }),
      render:renderSHTResults
    },*/
    {
      id: "wasm_implicit_simd_cht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequentialImplicitSIMD.CHTSimple(processedData, {
          width: imageData.width,
          ...chtOptions,
        }),
      inputImage: "/circle1.png",
      render: renderCHTResults,
    },
    /* {
      id: "wasm_simd_sht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequentialSIMD.SHTSimple(processedData, {
          width: imageData.width,
          ...shtOptions,
        }),
      render:renderSHTResults
    },
    {
      id: "wasm_simd_sht_seq_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequentialSIMD.SHTSimpleLookup(processedData, {
          width: imageData.width,
          ...shtOptions,
        }),
      render:renderSHTResults
    },*/
    {
      id: "wasm_simd_cht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequentialSIMD.CHTSimple(processedData, {
          width: imageData.width,
          ...chtOptions,
        }),
      inputImage: "/circle1.png",
      render: renderCHTResults,
    },
    /*{
      id: "asm_sht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        asmSequential.SHTSimple(processedData, {
          width: imageData.width,
          ...shtOptions,
        }),
      render:renderSHTResults
    },
    {
      id: "asm_sht_seq_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        asmSequential.SHTSimpleLookup(processedData, {
          width: imageData.width,
          ...shtOptions,
        }),
      render:renderSHTResults
    },*/
    {
      id: "asm_cht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        asmSequential.CHTSimple(processedData, {
          width: imageData.width,
          ...chtOptions,
        }),
      inputImage: "/circle1.png",
      render: renderCHTResults,
    },
    /*
    {
      id: "sht_workers",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        workers.SHTSimple(processedData, {
          width: imageData.width,
          ...shtOptions,
        }),
      render:renderSHTResults
    },
    {
      id: "sht_workers_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        workers.SHTSimpleLookup(processedData, {
          width: imageData.width,
          ...shtOptions,
        }),
      render:renderSHTResults
    },*/
    {
      id: "cht_workers",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        workers.CHTSimple(processedData, {
          width: imageData.width,
          ...chtOptions,
        }),
      inputImage: "/circle1.png",
      render: renderCHTResults,
    },
    /*  {
      id: "sht_gpu",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        gpu.SHTSimple(processedData, {
          width: imageData.width,
          ...shtOptions,
        }),
      render:renderSHTResults
    },
    {
      id: "sht_gpu_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        gpu.SHTSimpleLookup(processedData, {
          width: imageData.width,
          ...shtOptions,
        }),
      render:renderSHTResults
    }, */
    {
      id: "cht_gpu",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        gpu.CHTSimple(processedData, {
          width: imageData.width,
          ...chtOptions,
        }),
      inputImage: "/circle1.png",
      render: renderCHTResults,
    },
  ];

  for (const config of configs) {
    const { processedData, imageData, resultsCanvas, spaceCanvas } =
      await getImageData(
        config.id,
        config.inputImage || "/sudoku_threshold.jpg"
      );
    let t1 = performance.now();
    let results = await config.fn(processedData, imageData);
    let t2 = performance.now() - t1;
    console.log(t2);
    let h1 = document.querySelector("#" + config.id);
    h1.innerHTML += " - " + Math.round(t2 * 100) / 100;

    t1 = performance.now();
    results = await config.fn(processedData, imageData);
    t2 = performance.now() - t1;
    console.log(t2);
    h1 = document.querySelector("#" + config.id);
    h1.innerHTML += " - " + Math.round(t2 * 100) / 100;

    t1 = performance.now();
    results = await config.fn(processedData, imageData);
    t2 = performance.now() - t1;
    console.log(t2);
    h1 = document.querySelector("#" + config.id);
    h1.innerHTML += " - " + Math.round(t2 * 100) / 100;

    t1 = performance.now();
    results = await config.fn(processedData, imageData);
    t2 = performance.now() - t1;
    console.log(t2);
    h1 = document.querySelector("#" + config.id);
    h1.innerHTML += " - " + Math.round(t2 * 100) / 100;

    renderHSpace(results, spaceCanvas);
    console.log(results.results.map((r) => r.r));

    config.render(results, resultsCanvas);
  }
})();
