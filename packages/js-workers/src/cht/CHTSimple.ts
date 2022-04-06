import {
  CHTParallelAsync,
  CHTParallelOptions,
  CHTResult,
  HTResults,
} from "meta";
import { CHTSimpleKernel } from "../workers/CHTSimple.types";
import * as Comlink from "comlink";

const sobelYKernel = [
  [-1, -2, -1],
  [0, 0, 0],
  [1, 2, 1],
];

const sobelXKernel = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1],
];

const kernelSize = 3;
const kernelShift = Math.trunc(kernelSize / 2);

const pool: Comlink.Remote<CHTSimpleKernel>[] = [];
const CHTSimpleFactory = (createWorker: () => Worker) => {
  const CHTSimple: CHTParallelAsync = async function (
    binaryImage: Uint8Array,
    options: CHTParallelOptions
  ): Promise<HTResults<CHTResult>> {
    const results: CHTResult[] = [];
    const candidates: (CHTResult & { acc?: number })[] = [];
    const width = options.width;
    const height = binaryImage.length / width;
    const maxDimHalf = Math.trunc(Math.max(height, width) / 2);

    const houghSpaceBuffer = new SharedArrayBuffer(4 * width * height);
    const houghSpace = new Uint32Array(houghSpaceBuffer);
    const sharedImageBuffer = new SharedArrayBuffer(binaryImage.byteLength);
    const sharedImage = new Uint8Array(sharedImageBuffer);
    sharedImage.set(binaryImage);

    const concurrency = Math.max(options.concurrency || 1, 1);
    const missingWorkers = Math.max(concurrency - pool.length, 0);
    for (let i = 0; i < missingWorkers; i++) {
      pool.push(Comlink.wrap(createWorker()));
    }

    // Defaults
    const gradientThreshold = options.gradientThreshold || 0.75;
    const minDist = options.minDist || 1;
    const maxR = options.maxR || maxDimHalf;
    const minR = options.minR || 0;

    const gxSpace = await conv2(
      sharedImage,
      width,
      height,
      sobelXKernel,
      options.concurrency
    );
    const gySpace = await conv2(
      sharedImage,
      width,
      height,
      sobelYKernel,
      options.concurrency
    );

    const minDist2 = minDist * minDist;
    const maxRad2 = maxR * maxR;
    const minRad2 = minR * minR;

    const jobsGradient: Promise<number>[] = [];
    const batchGradient = Math.ceil((height - 2 * kernelShift) / concurrency);
    for (let i = 0; i < concurrency; i++) {
      const yFrom = i * batchGradient;
      const yTo = i + 1 == concurrency ? height : (i + 1) * batchGradient;
      jobsGradient.push(
        pool[i].runGradient(
          yFrom,
          yTo,
          width,
          height,
          minR,
          maxR,
          minRad2,
          maxRad2,
          gxSpace,
          gySpace,
          houghSpace
        )
      );
    }
    const maxValue = Math.max(...(await Promise.all(jobsGradient)));

    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const value = houghSpace[y * width + x];
        if (value / maxValue > gradientThreshold) {
          candidates.push({ x, y, r: 0, acc: value });
        }
      }

    candidates
      .sort((a, b) => b.acc - a.acc)
      .forEach((c) => {
        const distance = results.every(
          (r) => distance2(r.x, r.y, c.x, c.y) >= minDist2
        );
        if (distance) results.push(c);
      });

    const rAccLength = Math.abs(maxR - minR);
    const rAcc = new Uint32Array(rAccLength);
    const pixels: { x: number; y: number }[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const coord = y * width + x;
        if (binaryImage[coord] == 1) pixels.push({ x, y });
      }
    }

    results.forEach((result) => {
      rAcc.fill(0);
      pixels.forEach((pixel) => {
        const d = Math.trunc(
          Math.sqrt(distance2(result.x, result.y, pixel.x, pixel.y))
        );
        if (d <= maxR && d >= minR) ++rAcc[d - minR];
      });

      let bestRadiusVotes = 0;
      let bestRadius = 0;
      for (let i = 1; i < rAccLength - 1; i++) {
        const votes = rAcc[i - 1] + rAcc[i] + rAcc[i + 1];
        if (bestRadiusVotes <= votes) {
          bestRadiusVotes = votes;
          bestRadius = i + minR;
        }
      }
      result.r = bestRadius;
    });

    return {
      results,
      hSpace: options.returnHSpace
        ? { data: houghSpace, width: width }
        : undefined,
    };
  };
  return CHTSimple;
};

function distance2(x1: number, y1: number, x2: number, y2: number) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx * dx + dy * dy;
}

async function conv2(
  input: Uint8Array,
  width: number,
  height: number,
  kernel: number[][],
  concurrency: number
): Promise<Int32Array> {
  const resultBuffer = new SharedArrayBuffer(4 * width * height);
  const result = new Int32Array(resultBuffer);

  const jobs: Promise<void>[] = [];
  const batch = Math.ceil((height - 2 * kernelShift) / concurrency);
  for (let i = 0; i < concurrency; i++) {
    const yFrom = i == 0 ? kernelShift : i * batch;
    const yTo = i + 1 == concurrency ? height - kernelShift : (i + 1) * batch;
    jobs.push(
      pool[i].runConv2(yFrom, yTo, width, input, result, kernel, kernelShift)
    );
  }
  await Promise.all(jobs);

  return result;
}

export { CHTSimpleFactory };
