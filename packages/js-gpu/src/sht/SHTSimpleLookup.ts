import { IKernelRunShortcutBase } from "gpu.js";
import { SHT, SHTOptions, SHTResult, HTResults } from "meta";
import { createSHTSimpleLookupKernel } from "../gpu/SHTSimpleLookupKernel";

const SHTSimpleLookupKernelMap = new Map<
  string,
  IKernelRunShortcutBase<Float32Array>
>();

const SHTSimpleLookup: SHT = function (
  binaryImage: Uint8Array,
  options: SHTOptions
): HTResults<SHTResult> {
  const results: SHTResult[] = [];
  const width = options.width;
  const height = binaryImage.length / width;

  // Defaults
  const sampling = Object.assign({ rho: 1, theta: 1 }, options.sampling);
  const samplingRho = sampling.rho;
  const samplingTheta = sampling.theta;
  const votingThreshold = options.votingThreshold || 0.75;

  const hsWidth = Math.trunc(360 * samplingTheta);
  const hsHeight = Math.trunc(
    Math.sqrt(width ** 2 + height ** 2) * samplingRho
  );
  const sinLookup = new Float32Array(hsWidth);
  const cosLookup = new Float32Array(hsWidth);

  const samplingThetaRad = Math.PI / 180 / sampling.theta;
  for (let i = 0; i < hsWidth; i++) {
    sinLookup[i] = Math.sin(i * samplingThetaRad);
    cosLookup[i] = Math.cos(i * samplingThetaRad);
  }

  let maxValue = 0;

  const kernelKey = `${hsWidth}.${hsHeight}.${width}.${height}`;
  const kernelFromCache = SHTSimpleLookupKernelMap.has(kernelKey);
  const SHTSimpleKernel = kernelFromCache
    ? SHTSimpleLookupKernelMap.get(kernelKey)
    : createSHTSimpleLookupKernel(
        hsWidth,
        hsHeight,
        width,
        height,
        samplingRho,
        samplingTheta
      );
  if (!kernelFromCache)
    SHTSimpleLookupKernelMap.set(kernelKey, SHTSimpleKernel);

  const houghSpaceFloat = SHTSimpleKernel(
    binaryImage,
    sinLookup,
    cosLookup
  ) as Float32Array;
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
    hSpace: options.returnHSpace
      ? {
          data: houghSpace,
          width: hsWidth,
        }
      : undefined,
  };
};

export { SHTSimpleLookup };
