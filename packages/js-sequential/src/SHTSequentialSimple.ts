import { SHT, SHTOptions, SHTResult, HTResults } from "meta";

const SHTSequentialSimple: SHT = function (
  binaryImage: Uint8Array,
  options: SHTOptions
): HTResults<SHTResult> {
  const results: SHTResult[] = [];
  const width = options.width;
  const height = binaryImage.length / width;

  // Defaults
  const sampling = Object.assign({ rho: 1, theta: 1 }, options.sampling);
  const votingThreshold = options.votingThreshold || 0.75;

  const hsWidth = Math.ceil(360 / sampling.theta);
  const hsHeight = Math.ceil(
    Math.sqrt(width ** 2 + height ** 2) / sampling.rho
  );
  const houghSpace = new Uint32Array(hsWidth * hsHeight);

  let maxValue = 0;

  const samplingThetaRad = (sampling.theta * Math.PI) / 180;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (binaryImage[y * width + x] === 1)
        for (let hx = 0; hx < hsWidth; hx++) {
          const hTheta = hx * samplingThetaRad;
          const ySpace = x * Math.cos(hTheta) + y * Math.sin(hTheta);

          if (ySpace >= 0) {
            const offset = Math.round(ySpace / sampling.rho) * hsWidth + hx;
            const value = houghSpace[offset] + 1;
            maxValue = Math.max(maxValue, value);
            houghSpace[offset] = value;
          }
        }

  for (let hy = 0; hy < hsHeight; hy++)
    for (let hx = 0; hx < hsWidth; hx++) {
      const offset = hy * hsWidth + hx;
      if (houghSpace[offset] / maxValue > votingThreshold) {
        results.push({
          rho: hy * sampling.rho,
          theta: hx * sampling.theta,
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

export { SHTSequentialSimple };
