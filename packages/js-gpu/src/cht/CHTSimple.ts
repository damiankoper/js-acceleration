import { IKernelRunShortcutBase } from "gpu.js";
import { CHT, CHTOptions, CHTResult, HTResults } from "meta";
import { createCHTSimpleKernel } from "../gpu/CHTSimpleKernel";

const CHTSimpleKernelMap = new Map<
  string,
  IKernelRunShortcutBase<Float32Array>
>();

const CHTSimple: CHT = function (
  binaryImage: Uint8Array,
  options: CHTOptions
): HTResults<CHTResult> {
  const results: CHTResult[] = [];
  const candidates: (CHTResult & { acc?: number })[] = [];
  const width = options.width;
  const height = binaryImage.length / width;
  const maxDimHalf = Math.trunc(Math.max(height, width) / 2);

  // Defaults
  const gradientThreshold = options.gradientThreshold || 0.75;
  const minDist = options.minDist || 1;
  const maxR = options.maxR || maxDimHalf;
  const minR = options.minR || 0;

  const minDist2 = minDist * minDist;
  const maxRad2 = maxR * maxR;
  const minRad2 = minR * minR;

  const kernelKey = `${width}.${height}.${minRad2}.${maxRad2}`;
  const kernelFromCache = CHTSimpleKernelMap.has(kernelKey);
  const CHTSimpleKernel = kernelFromCache
    ? CHTSimpleKernelMap.get(kernelKey)
    : createCHTSimpleKernel(width, height, minR, minRad2, maxR, maxRad2);
  if (!kernelFromCache) CHTSimpleKernelMap.set(kernelKey, CHTSimpleKernel);

  const houghSpaceFloat = CHTSimpleKernel(binaryImage) as Float32Array;
  const houghSpace = Uint32Array.from(houghSpaceFloat);

  let maxValue = 0;

  for (const v of houghSpace) {
    maxValue = maxValue < v ? v : maxValue;
  }

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

function distance2(x1: number, y1: number, x2: number, y2: number) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx * dx + dy * dy;
}

export { CHTSimple };
