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
  const candidates: CHTResult[] = [];
  const width = options.width;
  const height = binaryImage.length / width;

  // Defaultss
  const sampling = Object.assign({ x: 1, y: 1, r: 1 }, options.sampling);
  const gradientThreshold = options.gradientThreshold || 0.75;

  /* const hsWidth = width;
  const hsHeight = binaryImage.length / width; */
  const houghSpace = new Uint32Array(width * height);
  const gxSpace = conv2(binaryImage, width, height, sobelXKernel);
  const gySpace = conv2(binaryImage, width, height, sobelYKernel);

  const maxR = 1000;
  const maxRadPw = maxR * maxR;

  const minR = 0;
  const minRadPw = minR * minR;

  let maxValue = 0;

  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const coord = y * width + x;
      if (binaryImage[coord] === 1) {
        const gx = gxSpace[coord];
        const gy = gySpace[coord];
        const d = Math.sqrt(gx * gx + gy * gy);
        if (d < 1) continue;

        let m = gy / gx;
        if (Math.abs(m) <= 1) {
          const bounds = getBounds(x, width, minR, maxR);
          bounds.forEach((bounds) => {
            for (let px = bounds[0]; px < bounds[1]; px++) {
              const py = Math.floor(m * px - x * m + y);
              if (inBounds(x, y, px, py, height, minRadPw, maxRadPw)) {
                maxValue = Math.max(maxValue, ++houghSpace[py * width + px]);
                if (houghSpace[py * width + px] === undefined) debugger;
              }
            }
          });
        } else {
          m = 1 / m;
          const bounds = getBounds(y, height, minR, maxR);
          bounds.forEach((bounds) => {
            for (let py = bounds[0]; py < bounds[1]; py++) {
              const px = Math.floor(m * py - y * m + x);
              if (inBounds(y, x, py, px, width, minRadPw, maxRadPw)) {
                maxValue = Math.max(maxValue, ++houghSpace[py * width + px]);
              }
            }
          });
        }
      }
    }

  for (let hy = 0; hy < height; hy++)
    for (let hx = 0; hx < width; hx++) {
      const offset = hy * width + hx;
      if (houghSpace[offset] / maxValue > gradientThreshold) {
        candidates.push({
          x: hx,
          y: hy,
          r: 0,
        });
      }
    }

  const rAccLength = Math.abs(maxR - minR);
  candidates.forEach((result) => {
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
    for (let i = 0; i < rAccLength; i++) {
      if (maxRadiusVotes < rAcc[i]) {
        maxRadiusVotes = rAcc[i];
        maxRadius = i + minR;
      }
    }
    result.r = maxRadius;
    // TODO: filtrowanie
    // TODO: pipe promienia do opcji
    // TODO: obsługa samplingu
  });

  return {
    results: candidates,
    hSpace: options.returnHSpace
      ? {
          data: houghSpace,
          width: width,
        }
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
  minRadPw: number,
  maxRadPw: number
) {
  const dx = Math.abs(x - px);
  const dy = Math.abs(y - py);
  const d = dx * dx + dy * dy;
  return py >= 0 && py < max && minRadPw < d && maxRadPw >= d;
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
  return result;
}

function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

export { CHTSimple };
