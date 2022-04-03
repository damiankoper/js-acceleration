import { GPU, IKernelRunShortcutBase } from "gpu.js";

export const gpu = new GPU({ mode: "cpu" });
export function createCHTSimpleKernel(
  width: number,
  height: number,
  minR: number,
  minRad2: number,
  maxR: number,
  maxRad2: number
) {
  const sobelXKernel = gpu.createKernel<
    [number[]],
    { width: number; height: number }
  >(
    function (input: number[]) {
      const w = this.constants.width;
      const h = this.constants.height;
      const x = Math.trunc(this.thread.x % this.constants.width);
      const y = Math.trunc(this.thread.x / this.constants.width);
      if (x == 0 || x == w - 1 || y == 0 || y == h - 1) return 0;

      return (
        -input[(y - 1) * w + x - 1] + //
        input[(y - 1) * w + x + 1] + //
        -2 * input[y * w + x - 1] + //
        2 * input[y * w + x + 1] + //
        -input[(y + 1) * w + x - 1] + //
        input[(y + 1) * w + x + 1]
      );
    },
    { output: [width * height], constants: { width, height }, pipeline: true }
  );

  const sobelYKernel = gpu.createKernel<
    [number[]],
    { width: number; height: number }
  >(
    function (input: number[]) {
      const w = this.constants.width;
      const h = this.constants.height;
      const x = Math.trunc(this.thread.x % this.constants.width);
      const y = Math.trunc(this.thread.x / this.constants.width);
      if (x == 0 || x == w - 1 || y == 0 || y == h - 1) return 0;

      return (
        -input[(y - 1) * w + x - 1] + //
        -2 * input[(y - 1) * w + x] + //
        -input[(y - 1) * w + x + 1] + //
        input[(y + 1) * w + x - 1] + //
        2 * input[(y + 1) * w + x] + //
        input[(y + 1) * w + x + 1]
      );
    },
    { output: [width * height], constants: { width, height }, pipeline: true }
  );

  const gradientKernel = gpu
    .createKernel<
      [number[], number[]],
      {
        width: number;
        height: number;
        minR: number;
        minRad2: number;
        maxR: number;
        maxRad2: number;
      }
    >(
      function (gxSpace: number[], gySpace: number[]) {
        const w = this.constants.width;
        const h = this.constants.height;
        const x = Math.trunc(this.thread.x % w);
        const y = Math.trunc(this.thread.x / w);

        let result = 0;
        for (let gpy = 0; gpy < h; gpy++) {
          const dy = Math.abs(y - gpy);
          for (let gpx = 0; gpx < w; gpx++) {
            const dx = Math.abs(x - gpx);
            if (
              (dx > this.constants.minR && dx <= this.constants.maxR) ||
              (dy > this.constants.minR && dy <= this.constants.maxR)
            ) {
              const d = dx * dx + dy * dy;
              if (d > this.constants.minRad2 && d <= this.constants.maxRad2) {
                const coord = w * gpy + gpx;
                const gx = gxSpace[coord];
                const gy = gySpace[coord];
                if (gx * gx + gy * gy >= 1) {
                  let m = 0;
                  if (gx != 0 && Math.abs((m = gy / gx)) <= 1) {
                    if (m == 0)
                      if (y == Math.trunc(m * x + gpy - m * gpx)) result++;
                  } else {
                    m = gx / gy;
                    if (m == 0)
                      if (x == Math.trunc(m * y + gpx - m * gpy)) result++;
                  }
                }
              }
            }
          }
        }
        return result;
      },
      {
        output: [width * height],
        constants: { width, height, minRad2, maxRad2, minR, maxR },
        optimizeFloatMemory: true,
      }
    )
    .setLoopMaxIterations(width * height);

  return function (binaryImage: Uint8Array) {
    return gradientKernel(sobelXKernel(binaryImage), sobelYKernel(binaryImage));
  } as IKernelRunShortcutBase<Float32Array>;
}
