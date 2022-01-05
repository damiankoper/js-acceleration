/* eslint-disable @typescript-eslint/no-unused-vars */
import { SHTSequentialSimple, SHTSequentialSimpleLookup } from "js-sequential";
import { SHTSimple, SHTSimpleLookup } from "js-workers";
import {
  wasmSequential,
  wasmSequentialImplicitSIMD,
  wasmSequentialSIMD,
} from "wasm-sequential";
import { getImageData, renderSHTResults } from "./utils";
import "./style.scss";

(async () => {
  const sampling = { rho: 1, theta: 1 };
  const votingThreshold = 0.75;

  const options = {
    sampling,
    votingThreshold, 
    concurrency: 1,
  };
  await wasmSequential.init();
  await wasmSequentialImplicitSIMD.init();
  await wasmSequentialSIMD.init();

  // TODO: refactor remove sequential
  // TODO: node workers
  // TODO: deno workers

  const configs = [
    {
      id: "sht_workers_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        SHTSimpleLookup(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "sht_workers_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        SHTSimpleLookup(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "sht_workers_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        SHTSimpleLookup(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "sht_workers",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        SHTSimple(processedData, {
          width: imageData.width,
          ...options,
        }),
    },

    {
      id: "sht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        SHTSequentialSimple(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "sht_seq_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        SHTSequentialSimpleLookup(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "wasm_sht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequential.SHTSequentialSimple(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "wasm_sht_seq_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequential.SHTSequentialSimpleLookup(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "wasm_implicit_simd_sht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequentialImplicitSIMD.SHTSequentialSimple(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "wasm_implicit_simd_sht_seq_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequentialImplicitSIMD.SHTSequentialSimpleLookup(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "wasm_simd_sht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequentialSIMD.SHTSequentialSimple(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "wasm_simd_sht_seq_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequentialSIMD.SHTSequentialSimpleLookup(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
  ];

  for (const config of configs) {
    const { processedData, imageData, resultsCanvas, spaceCanvas } =
      await getImageData(config.id, "/sudoku_threshold.jpg");
    const t1 = performance.now();

    const results = await config.fn(processedData, imageData);
    const t2 = performance.now() - t1;
    console.log(t2);
    const h1 = document.querySelector("#" + config.id);
    h1.innerHTML += " - " + t2;

    renderSHTResults(
      results,
      resultsCanvas,
      spaceCanvas,
      imageData.width,
      imageData.height
    );
  }
})();
