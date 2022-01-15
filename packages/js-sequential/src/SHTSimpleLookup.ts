import { SHT, SHTOptions, SHTResult, HTResults } from "meta";

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
  const houghSpace = new Uint32Array(hsWidth * hsHeight);
  const sinLookup = new Float32Array(hsWidth);
  const cosLookup = new Float32Array(hsWidth);

  const samplingThetaRad = Math.PI / 180 / samplingTheta;
  for (let i = 0; i < hsWidth; i++) {
    sinLookup[i] = Math.sin(i * samplingThetaRad);
    cosLookup[i] = Math.cos(i * samplingThetaRad);
  }

  let maxValue = 0;

  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (binaryImage[y * width + x] === 1)
        for (let hx = 0; hx < hsWidth; hx++) {
          const ySpace = x * cosLookup[hx] + y * sinLookup[hx];

          if (ySpace >= 0) {
            const offset = ((ySpace * samplingRho) << 0) * hsWidth + hx;
            maxValue =
              maxValue < ++houghSpace[offset] ? houghSpace[offset] : maxValue;
          }
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
