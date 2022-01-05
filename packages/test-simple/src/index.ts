/* eslint-disable @typescript-eslint/no-unused-vars */
import * as sequential from "js-sequential";
import * as workers from "js-workers";
import {
  wasmSequential,
  wasmSequentialImplicitSIMD,
  wasmSequentialSIMD,
  asmSequential,
} from "wasm-sequential";
import { getImageData, renderSHTResults } from "./utils";
import "./style.scss";

(async () => {
  const sampling = { rho: 1, theta: 1 };
  const votingThreshold = 0.75;

  const options = {
    sampling,
    votingThreshold,
    concurrency: 4,
  };
  await wasmSequential.init();
  await wasmSequentialImplicitSIMD.init();
  await wasmSequentialSIMD.init();
  await asmSequential.init();

  // TODO: node workers
  // TODO: deno workers

  const configs = [
    {
      id: "sht_workers_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        workers.SHTSimpleLookup(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "sht_workers_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        workers.SHTSimpleLookup(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "sht_workers_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        workers.SHTSimpleLookup(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "sht_workers",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        workers.SHTSimple(processedData, {
          width: imageData.width,
          ...options,
        }),
    },

    {
      id: "sht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        sequential.SHTSimple(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "sht_seq_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        sequential.SHTSimpleLookup(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "wasm_sht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequential.SHTSimple(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "wasm_sht_seq_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequential.SHTSimpleLookup(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "wasm_implicit_simd_sht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequentialImplicitSIMD.SHTSimple(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "wasm_implicit_simd_sht_seq_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequentialImplicitSIMD.SHTSimpleLookup(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "wasm_simd_sht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequentialSIMD.SHTSimple(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "wasm_simd_sht_seq_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequentialSIMD.SHTSimpleLookup(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "wasm_simd_sht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequentialSIMD.SHTSimple(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "wasm_simd_sht_seq_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequentialSIMD.SHTSimpleLookup(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "wasm_simd_sht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequentialSIMD.SHTSimple(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "wasm_simd_sht_seq_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        wasmSequentialSIMD.SHTSimpleLookup(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "asm_sht_seq",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        asmSequential.SHTSimple(processedData, {
          width: imageData.width,
          ...options,
        }),
    },
    {
      id: "asm_sht_seq_lookup",
      fn: (processedData: Uint8Array, imageData: ImageData) =>
        asmSequential.SHTSimpleLookup(processedData, {
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
