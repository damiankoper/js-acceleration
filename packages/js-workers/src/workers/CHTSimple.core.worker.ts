export function CHTSimpleConv2Kernel(
  yFrom: number,
  yTo: number,
  width: number,
  input: Uint8Array,
  result: Int32Array,
  kernel: number[][],
  kernelShift: number
): void {
  for (let y = yFrom; y < yTo; y++)
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
}

export function CHTSimpleGradientKernel(
  yFrom: number,
  yTo: number,
  width: number,
  height: number,
  minR: number,
  maxR: number,
  minRad2: number,
  maxRad2: number,
  gxSpace: Int32Array,
  gySpace: Int32Array,
  houghSpace: Uint32Array
): number {
  let maxValue = 0;
  let m = 0;
  for (let y = yFrom; y < yTo; y++) {
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
              if (inBounds(x, y, px, py, height, minRad2, maxRad2)) {
                //const old = Atomics.add(houghSpace, py * width + px, 1);
                //maxValue = Math.max(maxValue, old + 1);
                maxValue = Math.max(maxValue, ++houghSpace[py * width + px]);
              }
            }
        } else {
          m = gx / gy;
          const bounds = getBounds(y, height, minR, maxR);
          for (let i = 0; i < 4; i += 2)
            for (let py = bounds[i]; py < bounds[i + 1]; py++) {
              const px = Math.trunc(m * py - y * m + x);
              if (inBounds(y, x, py, px, width, minRad2, maxRad2)) {
                //const old = Atomics.add(houghSpace, py * width + px, 1);
                //maxValue = Math.max(maxValue, old + 1);
                maxValue = Math.max(maxValue, ++houghSpace[py * width + px]);
              }
            }
        }
      }
    }
  }

  return maxValue;
}

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

function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

function distance2(x1: number, y1: number, x2: number, y2: number) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx * dx + dy * dy;
}
