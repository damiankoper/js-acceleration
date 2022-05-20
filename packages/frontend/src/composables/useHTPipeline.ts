import {
  CHT,
  CHTParallelAsync,
  CHTParallelOptions,
  CHTResult,
  HTResults,
  SHT,
  SHTParallelAsync,
  SHTParallelOptions,
  SHTResult,
} from "meta";
import { computed, nextTick, ref, ShallowRef, watchEffect } from "vue";
import Image from "image-js";
import cannyEdgeDetector from "canny-edge-detector";
import { HT } from "../enums/HT.enum";
import * as seq from "js-sequential";
import * as wasm from "wasm-sequential";
import * as workers from "js-workers";
import * as gpu from "js-gpu";

export function useHTPipeline(
  resultCanvas: ShallowRef<HTMLCanvasElement | null>,
  imageCapture: ShallowRef<ImageCapture | null>
) {
  const shtOptions = ref<Partial<SHTParallelOptions>>({});
  const chtOptions = ref<Partial<CHTParallelOptions>>({});
  const shtOptionsComputed = computed<SHTParallelOptions>(() => ({
    width: resultCanvas.value?.width || 1,
    concurrency: 4,
    sampling: { rho: 1, theta: 1 },
    votingThreshold: 0.7,
    ...shtOptions.value,
  }));
  const chtOptionsComputed = computed<CHTParallelOptions>(() => ({
    width: resultCanvas.value?.width || 1,
    gradientThreshold: 0.6,
    minR: 15,
    maxR: 35,
    minDist: 50,
    concurrency: 4,
    ...chtOptions.value,
  }));

  const ht = ref(HT.SHTSimple_seq);
  const frameTime = ref(0);
  let stopLoop = false;

  let resultCtx: CanvasRenderingContext2D | null;
  let width = resultCanvas.value?.width || 1;
  let height = resultCanvas.value?.height || 1;
  watchEffect(() => {
    resultCtx = resultCanvas.value?.getContext("2d") || null;
    width = resultCanvas.value?.width || 1;
    height = resultCanvas.value?.height || 1;
  });

  let image: Image;
  watchEffect(() => {
    image = new Image(
      resultCanvas.value?.width || 1,
      resultCanvas.value?.height || 1
    );
  });

  let wasmSequantial: wasm.WasmWrapper;
  let wasmSequantialImplicitSIMD: wasm.WasmWrapper;
  let wasmSequantialSIMD: wasm.WasmWrapper;
  let asmSequantial: wasm.WasmWrapper;
  async function init() {
    stopLoop = false;
    console.log("Capture loop start");
    if (!wasmSequantial)
      wasmSequantial = await wasm.wasmSequentialFactory().init();
    if (!wasmSequantialImplicitSIMD)
      wasmSequantialImplicitSIMD = await wasm
        .wasmSequentialImplicitSIMDFactory()
        .init();
    if (!wasmSequantialSIMD)
      wasmSequantialSIMD = await wasm.wasmSequentialSIMDFactory().init();
    if (!asmSequantial)
      asmSequantial = await wasm.asmSequentialFactory().init();
    loop();
  }

  function destroy() {
    console.log("Capture loop stop");
    stopLoop = true;
  }

  async function loop() {
    const tStart = performance.now();

    if (resultCtx && imageCapture.value) {
      const imageBitmap = await imageCapture.value.grabFrame();
      resultCtx.drawImage(imageBitmap, 0, 0);
      image.data.set(resultCtx.getImageData(0, 0, width, height).data);
      const grayImage = image.grey();
      const canny = cannyEdgeDetector(grayImage, {
        lowThreshold: 50,
        highThreshold: 50,
      }) as Image;
      const inputImage = canny.data.map((v) => (v > 0 ? 1 : 0)) as Uint8Array;
      await runHT(inputImage);
    }

    if (!stopLoop) requestAnimationFrame(loop);
    else console.log("Loop stop");

    frameTime.value = performance.now() - tStart;
  }

  async function runHT(inputImage: Uint8Array) {
    let results: HTResults<unknown> = { results: [] };

    results =
      subSwitch(
        HT.SHTSimple_seq,
        HT.SHTSimpleLookup_seq,
        HT.CHTSimple_seq,
        inputImage,
        seq
      ) || results;

    results =
      subSwitch(
        HT.SHTSimple_WASM,
        HT.SHTSimpleLookup_WASM,
        HT.CHTSimple_WASM,
        inputImage,
        wasmSequantial
      ) || results;

    results =
      subSwitch(
        HT.SHTSimple_WASM_SIMD_impl,
        HT.SHTSimpleLookup_WASM_SIMD_impl,
        HT.CHTSimple_WASM_SIMD_impl,
        inputImage,
        wasmSequantialImplicitSIMD
      ) || results;

    results =
      subSwitch(
        HT.SHTSimple_WASM_SIMD_expl,
        HT.SHTSimpleLookup_WASM_SIMD_expl,
        HT.CHTSimple_WASM_SIMD_expl,
        inputImage,
        wasmSequantialSIMD
      ) || results;

    results =
      subSwitch(
        HT.SHTSimple_WASM_asm,
        HT.SHTSimpleLookup_WASM_asm,
        HT.CHTSimple_WASM_asm,
        inputImage,
        asmSequantial
      ) || results;

    results =
      (await subSwitchAsync(
        HT.SHTSimple_workers,
        HT.SHTSimpleLookup_workers,
        HT.CHTSimple_workers,
        inputImage,
        workers
      )) || results;

    results =
      (await subSwitch(
        HT.SHTSimple_gpu,
        HT.SHTSimpleLookup_gpu,
        HT.CHTSimple_gpu,
        inputImage,
        gpu
      )) || results;

    switch (ht.value) {
      case HT.SHTSimple_seq:
      case HT.SHTSimpleLookup_seq:
      case HT.SHTSimple_WASM:
      case HT.SHTSimpleLookup_WASM:
      case HT.SHTSimple_WASM_SIMD_impl:
      case HT.SHTSimpleLookup_WASM_SIMD_impl:
      case HT.SHTSimple_WASM_SIMD_expl:
      case HT.SHTSimpleLookup_WASM_SIMD_expl:
      case HT.SHTSimple_WASM_asm:
      case HT.SHTSimpleLookup_WASM_asm:
      case HT.SHTSimple_workers:
      case HT.SHTSimpleLookup_workers:
      case HT.SHTSimple_gpu:
      case HT.SHTSimpleLookup_gpu:
        renderSHTResults(results as HTResults<SHTResult>);
        break;

      case HT.CHTSimple_seq:
      case HT.CHTSimple_WASM:
      case HT.CHTSimple_WASM_SIMD_impl:
      case HT.CHTSimple_WASM_SIMD_expl:
      case HT.CHTSimple_WASM_asm:
      case HT.CHTSimple_workers:
      case HT.CHTSimple_gpu:
        renderCHTResults(results as HTResults<CHTResult>);
        break;
    }
  }

  function subSwitch(
    shtSimple: HT,
    shtSimpleLookup: HT,
    chtSimple: HT,
    inputImage: Uint8Array,
    m: { SHTSimple: SHT; SHTSimpleLookup: SHT; CHTSimple: CHT }
  ) {
    switch (ht.value) {
      case shtSimple:
        return m.SHTSimple(inputImage, shtOptionsComputed.value);
      case shtSimpleLookup:
        return m.SHTSimpleLookup(inputImage, shtOptionsComputed.value);
      case chtSimple:
        return m.CHTSimple(inputImage, chtOptionsComputed.value);
    }
  }

  async function subSwitchAsync(
    shtSimple: HT,
    shtSimpleLookup: HT,
    chtSimple: HT,
    inputImage: Uint8Array,
    m: {
      SHTSimple: SHTParallelAsync;
      SHTSimpleLookup: SHTParallelAsync;
      CHTSimple: CHTParallelAsync;
    }
  ) {
    switch (ht.value) {
      case shtSimple:
        return await m.SHTSimple(inputImage, shtOptionsComputed.value);
      case shtSimpleLookup:
        return await m.SHTSimpleLookup(inputImage, shtOptionsComputed.value);
      case chtSimple:
        return await m.CHTSimple(inputImage, chtOptionsComputed.value);
    }
  }

  function renderSHTResults(results: HTResults<SHTResult>) {
    if (resultCtx) {
      resultCtx.imageSmoothingEnabled = false;

      results.results.forEach((result: SHTResult) => {
        if (resultCtx) {
          resultCtx.strokeStyle = "red";
          const x = result.rho * Math.cos((result.theta * Math.PI) / 180);
          const y = result.rho * Math.sin((result.theta * Math.PI) / 180);

          const slope = -x / y;
          const intercept = y + (x * x) / y;

          resultCtx.lineWidth = 3;
          resultCtx.beginPath();
          if (intercept === Infinity) {
            resultCtx.moveTo(x, 0);
            resultCtx.lineTo(x, height);
          } else {
            resultCtx.moveTo(0, 0 * slope + intercept);
            resultCtx.lineTo(width, width * slope + intercept);
          }
          resultCtx.stroke();
          resultCtx.strokeStyle = "green";
        }
      });
    }
  }

  function renderCHTResults(results: HTResults<CHTResult>) {
    results.results.forEach((result: CHTResult) => {
      if (resultCtx) {
        resultCtx.strokeStyle = "red";
        resultCtx.lineWidth = 2;
        resultCtx.fillStyle = "red";

        resultCtx.beginPath();
        resultCtx.arc(result.x, result.y, 1, 0, 2 * Math.PI);
        resultCtx.fill();

        resultCtx.beginPath();
        resultCtx.arc(result.x, result.y, result.r, 0, 2 * Math.PI);
        resultCtx.stroke();
      }
    });
  }

  return { ht, frameTime, init, destroy };
}
