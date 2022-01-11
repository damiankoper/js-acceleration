import { IKernelRunShortcutBase } from "gpu.js";
import { SHT, SHTOptions, SHTResult, HTResults } from "meta";
import { createSHTSimpleKernel } from "../gpu/SHTSimpleKernel";

const SHTSimpleKernelMap = new Map<
  string,
  IKernelRunShortcutBase<Float32Array>
>();

const SHTSimple: SHT = function (
  binaryImage: Uint8Array,
  options: SHTOptions
): HTResults<SHTResult> {
  const results: SHTResult[] = [];
  const width = options.width;
  const height = binaryImage.length / width;

  // Defaults
  const sampling = Object.assign({ rho: 1, theta: 1 }, options.sampling);
  const votingThreshold = options.votingThreshold || 0.75;
  const samplingRho = sampling.rho;
  const samplingTheta = sampling.theta;

  const hsWidth = Math.ceil(360 * samplingTheta);
  const hsHeight = Math.ceil(Math.sqrt(width ** 2 + height ** 2) * samplingRho);

  let maxValue = 0;

  const kernelKey = `${hsWidth}.${hsHeight}.${width}.${height}`;
  const kernelFromCache = SHTSimpleKernelMap.has(kernelKey);
  const SHTSimpleKernel = kernelFromCache
    ? SHTSimpleKernelMap.get(kernelKey)
    : createSHTSimpleKernel(
        hsWidth,
        hsHeight,
        width,
        height,
        samplingRho,
        samplingTheta
      );
  if (kernelFromCache) SHTSimpleKernelMap.set(kernelKey, SHTSimpleKernel);

  const houghSpaceFloat = SHTSimpleKernel(binaryImage) as Float32Array;
  const houghSpace = Uint32Array.from(houghSpaceFloat);

  for (const v of houghSpace) {
    maxValue = maxValue < v ? v : maxValue;
  }

  for (let hy = 0; hy < hsHeight; hy++)
    for (let hx = 0; hx < hsWidth; hx++) {
      const offset = hy * hsWidth + hx;
      if (houghSpace[offset] / maxValue > votingThreshold) {
        results.push({
          rho: hy / samplingRho,
          theta: hx / samplingTheta,
        });
      }
    }

  return {
    results,
    hSpace: {
      data: houghSpace,
      width: hsWidth,
    },
  };
};

export { SHTSimple };
