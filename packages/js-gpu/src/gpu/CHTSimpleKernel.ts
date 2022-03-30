import { GPU, IKernelRunShortcutBase } from "gpu.js";

export const gpu = new GPU();
export function createCHTSimpleKernel(width: number, height: number) {
  return gpu
    .createKernel(
      function () {
        return 1;
      },
      {
        output: [width * height],
        constants: {},
      }
    )
    .setLoopMaxIterations(Math.max(width, height))
    .setOptimizeFloatMemory(true) as IKernelRunShortcutBase<Float32Array>;
}
