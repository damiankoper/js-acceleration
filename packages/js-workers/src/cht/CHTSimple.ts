import { CHTAsync, CHTParallelOptions, CHTResult, HTResults } from "meta";
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
  const CHTSimple: CHTAsync = async function (
    binaryImage: Uint8Array,
    options: CHTParallelOptions
  ): Promise<HTResults<CHTResult>> {
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

    const houghSpace = new Uint32Array(width * height);
    const gxSpace = conv2(binaryImage, width, height, sobelXKernel);
    const gySpace = conv2(binaryImage, width, height, sobelYKernel);

    const minDist2 = minDist * minDist;
    const maxRad2 = maxR * maxR;
    const minRad2 = minR * minR;

    let maxValue = 0;
    let m = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const coord = y * width + x;
        const gx = gxSpace[coord];
        const gy = gySpace[coord];
        if (gx * gx + gy * gy >= 1) {
          if (gx != 0 && Math.abs((m = gy / gx)) <= 1) {
            const bounds = getBounds(x, width, minR, maxR);
            for (let i = 0; i < 4; i += 2)
              for (let px = bounds[i]; px < bounds[i + 1]; px++) {
                const py = Math.trunc(m * px - x * m + y);
                if (inBounds(x, y, px, py, height, minRad2, maxRad2))
                  maxValue = Math.max(maxValue, ++houghSpace[py * width + px]);
              }
          } else {
            m = gx / gy;
            const bounds = getBounds(y, height, minR, maxR);
            for (let i = 0; i < 4; i += 2)
              for (let py = bounds[i]; py < bounds[i + 1]; py++) {
                const px = Math.trunc(m * py - y * m + x);
                if (inBounds(y, x, py, px, width, minRad2, maxRad2))
                  maxValue = Math.max(maxValue, ++houghSpace[py * width + px]);
              }
          }
        }
      }
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
  return CHTSimple;
};

function getBounds(x: number, max: number, minR: number, maxR: number) {
  const xMinMin = clamp(x - minR, 0, max);
  const xMinMax = clamp(x - maxR, 0, max);
  const xMaxMax = clamp(x + maxR, 0, max);
  const xMaxMin = clamp(x + minR, 0, max);
  const bounds = [xMinMax, xMinMin, xMaxMin, xMaxMax];
  return bounds;
}

function inBounds(
  x: number,
  y: number,
  px: number,
  py: number,
  max: number,
  minRad2: number,
  maxRad2: number
) {
  const d = distance2(x, y, px, py);
  return py >= 0 && py < max && minRad2 < d && maxRad2 >= d;
}

function distance2(x1: number, y1: number, x2: number, y2: number) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx * dx + dy * dy;
}

function conv2(
  input: Uint8Array,
  width: number,
  height: number,
  kernel: number[][]
): Int32Array {
  const result = new Int32Array(width * height);
  for (let y = kernelShift; y < height - kernelShift; y++)
    for (let x = kernelShift; x < width - kernelShift; x++) {
      const coord = y * width + x;
      result[coord] =
        input[(y - 1) * width + x - 1] * kernel[0][0] + //
        input[(y - 1) * width + x] * kernel[0][1] + //
        input[(y - 1) * width + x + 1] * kernel[0][2] + //
        input[y * width + x - 1] * kernel[1][0] + //
        input[y * width + x + 1] * kernel[1][2] + //
        input[(y + 1) * width + x - 1] * kernel[2][0] + //
        input[(y + 1) * width + x] * kernel[2][1] + //
        input[(y + 1) * width + x + 1] * kernel[2][2];
    }
  return result;
}

function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

export { CHTSimpleFactory };
