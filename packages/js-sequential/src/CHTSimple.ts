import { CHT, CHTOptions, CHTResult } from "meta";

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
const kernelShift = Math.floor(kernelSize / 2);

const CHTSimple: CHT = function (binaryImage: Uint8Array, options: CHTOptions) {
  const results: CHTResult[] = [];
  const candidates: (CHTResult & { acc?: number })[] = [];
  const width = options.width;
  const height = binaryImage.length / width;
  const maxDimHalf = Math.floor(Math.max(height, width) / 2);

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

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const coord = y * width + x;
      if (binaryImage[coord] === 1) {
        let m = gySpace[coord] / gxSpace[coord];
        if (Math.abs(m) <= 1) {
          const bounds = getBounds(x, width, minR, maxR);
          bounds.forEach((bounds) => {
            for (let px = bounds[0]; px < bounds[1]; px++) {
              const py = Math.floor(m * px - x * m + y);
              if (inBounds(x, y, px, py, height, minRad2, maxRad2)) {
                maxValue = Math.max(maxValue, ++houghSpace[py * width + px]);
              }
            }
          });
        } else {
          m = 1 / m;
          const bounds = getBounds(y, height, minR, maxR);
          bounds.forEach((bounds) => {
            for (let py = bounds[0]; py < bounds[1]; py++) {
              const px = Math.floor(m * py - y * m + x);
              if (inBounds(y, x, py, px, width, minRad2, maxRad2)) {
                maxValue = Math.max(maxValue, ++houghSpace[py * width + px]);
              }
            }
          });
        }
      }
    }
  }

  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const value = houghSpace[y * width + x];
      if (value / maxValue > gradientThreshold) {
        candidates.push({ x: x, y: y, r: 0, acc: value });
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

  const rAccLength = Math.abs(maxR - minR) + 1;
  results.forEach((result) => {
    const rAcc = new Uint32Array(rAccLength);
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const coord = y * width + x;
        if (binaryImage[coord] === 1) {
          const dx = result.x - x;
          const dy = result.y - y;
          const d = Math.floor(Math.sqrt(dx * dx + dy * dy));
          if (d <= maxR && d >= minR)
            maxValue = Math.max(maxValue, ++rAcc[d - minR]);
        }
      }

    let maxRadiusVotes = 0;
    let maxRadius = 0;
    for (let i = 1; i < rAccLength; i++) {
      const votes = rAcc[i] + rAcc[i + 1] + rAcc[i - 1];
      if (maxRadiusVotes < votes) {
        maxRadiusVotes = votes;
        maxRadius = i + minR;
      }
    }
    result.r = maxRadius;
  });

  return {
    results,
    hSpace: options.returnHSpace
      ? { data: houghSpace, width: width }
      : undefined,
  };
};

function getBounds(x: number, max: number, minR: number, maxR: number) {
  const xMinMax = clamp(x - maxR, 0, max);
  const xMinMin = clamp(x - minR, 0, max);
  const xMaxMax = clamp(x + maxR, 0, max);
  const xMaxMin = clamp(x + minR, 0, max);
  const bounds = [
    [xMinMax, xMinMin],
    [xMaxMin, xMaxMax],
  ];
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
  const dx = Math.abs(x1 - x2);
  const dy = Math.abs(y1 - y2);
  return dx * dx + dy * dy;
}

function conv2(
  input: Uint8Array,
  width: number,
  height: number,
  kernel: number[][]
): Int32Array {
  const result = new Int32Array(width * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const coord = clamp(y - 1, 0, height) * width + clamp(x - 1, 0, width);
      if (input[coord] === 1) {
        let sum = 0;
        for (let ky = 0; ky < kernelSize; ky++)
          for (let kx = 0; kx < kernelSize; kx++) {
            const sy = clamp(y - kernelShift + ky, 0, height);
            const sx = clamp(x - kernelShift + kx, 0, width);
            const pixel = input[sy * width + sx];
            sum += kernel[ky][kx] * pixel;
          }
        result[coord] = sum;
      }
    }
  return result;
}

function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

export { CHTSimple };
