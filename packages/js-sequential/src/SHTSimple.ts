import { SHT, SHTOptions, SHTResult, HTResults } from "meta";

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
  const samplingThetaRad = Math.PI / 180 / samplingTheta;

  const hsWidth = Math.trunc(360 * samplingTheta);
  const hsHeight = Math.trunc(
    Math.sqrt(width ** 2 + height ** 2) * samplingRho
  );
  const houghSpace = new Uint32Array(hsWidth * hsHeight);

  let maxValue = 0;

  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (binaryImage[y * width + x] === 1)
        for (let hx = 0; hx < hsWidth; hx++) {
          const hTheta = hx * samplingThetaRad;
          const ySpace = x * Math.cos(hTheta) + y * Math.sin(hTheta);

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
    hSpace: {
      data: houghSpace,
      width: hsWidth,
    },
  };
};

export { SHTSimple };
