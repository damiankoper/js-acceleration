import { GPU, IKernelRunShortcutBase } from "gpu.js";

export const gpu = new GPU();
export function createSHTSimpleKernel(
  hsWidth: number,
  hsHeight: number,
  width: number,
  height: number,
  samplingRho: number,
  samplingTheta: number
) {
  return gpu
    .createKernel<
      [number[]],
      {
        hsWidth: number;
        width: number;
        height: number;
        samplingRho: number;
        samplingTheta: number;
      }
    >(
      // !Prevents minification of kernel for correct transpilation
      new Function(`return function (testImage/* : number[] */) {
        const rho =
          Math.trunc(this.thread.x / this.constants.hsWidth) /
          this.constants.samplingRho;
        const theta =
          Math.trunc(this.thread.x % this.constants.hsWidth) /
          this.constants.samplingTheta;

        const thetaRad = (theta * Math.PI) / 180;
        const cosTheta = Math.cos(thetaRad);
        const sinTheta = Math.sin(thetaRad);
        let acc = 0;

        if ((theta >= 45 && theta < 135) || (theta >= 225 && theta < 315)) {
          let xc = 0;
          for (let x = 0; x < this.constants.width; x++) {
            const y = Math.trunc((rho - xc * cosTheta) / sinTheta);
            if (y < this.constants.height && y >= 0) {
              const offset = y * this.constants.width + xc;
              if (
                offset < this.constants.width * this.constants.height &&
                testImage[offset] == 1
              ) {
                //
                acc += 1;
                //
              }
            }
            xc += 1;
          }
        } else {
          let yc = 0;
          for (let y = 0; y < this.constants.height; y++) {
            const x = Math.trunc((rho - yc * sinTheta) / cosTheta);
            if (x < this.constants.width && x >= 0) {
              const offset = yc * this.constants.width + x;
              if (
                offset < this.constants.width * this.constants.height &&
                testImage[offset] == 1
              ) {
                //
                acc += 1;
                //
              }
            }
            yc += 1;
          }
        }
        return acc;
      }`)(),
      {
        output: [hsWidth * hsHeight],
        constants: {
          hsWidth,
          width,
          height,
          samplingRho,
          samplingTheta,
        },
      }
    )
    .setLoopMaxIterations(Math.max(width, height))
    .setOptimizeFloatMemory(true) as IKernelRunShortcutBase<Float32Array>;
}
