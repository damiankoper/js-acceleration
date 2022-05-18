import { GPU, IKernelRunShortcutBase } from "gpu.js";

export const gpu = new GPU();
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
    new Function(`return function (input/* : number[] */) {
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
    }`)(),
    { output: [width * height], constants: { width, height }, pipeline: true }
  );

  const sobelYKernel = gpu.createKernel<
    [number[]],
    { width: number; height: number }
  >(
    // !Prevents minification of kernel for correct transpilation
    new Function(`return function (input/* : number[] */) {
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
    }`)(),
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
      // !Prevents minification of kernel for correct transpilation
      new Function(`return function (gxSpace/* : number[] */, gySpace/* : number[] */) {
        const w = this.constants.width;
        const h = this.constants.height;
        const x = Math.trunc(this.thread.x % w);
        const y = Math.trunc(this.thread.x / w);

        const minY = Math.max(y - this.constants.maxR, 0);
        const maxY = Math.min(y + this.constants.maxR, h);
        const minX = Math.max(x - this.constants.maxR, 0);
        const maxX = Math.min(x + this.constants.maxR, w);

        let result = 0.0;
        for (let gpy = minY; gpy < maxY; gpy++) {
          const dy = y - gpy;
          for (let gpx = minX; gpx < maxX; gpx++) {
            const dx = x - gpx;

            const d = dx * dx + dy * dy;
            if (d > this.constants.minRad2 && d <= this.constants.maxRad2) {
              const coord = w * gpy + gpx;
              const gx = gxSpace[coord];
              const gy = gySpace[coord];
              if (gx * gx + gy * gy >= 1) {
                let m = 0;
                if (gx != 0 && Math.abs((m = gy / gx)) <= 1) {
                  if (
                    (m !== 0 && y == Math.trunc(m * x + gpy - m * gpx)) ||
                    (m == 0 && y == gpy && gy == 0)
                  )
                    result += 1;
                } else {
                  m = gx / gy;
                  if (
                    (m !== 0 && x == Math.trunc(m * y + gpx - m * gpy)) ||
                    (m == 0 && x == gpx && gx == 0)
                  )
                    result += 1;
                }
              }
            }
          }
        }
        return result;
      }`)(),
      {
        output: [width * height],
        constants: { width, height, minRad2, maxRad2, minR, maxR },
      }
    )
    .setOptimizeFloatMemory(true);

  return function (binaryImage: Uint8Array) {
    return gradientKernel(sobelXKernel(binaryImage), sobelYKernel(binaryImage));
  } as IKernelRunShortcutBase<Float32Array>;
}
