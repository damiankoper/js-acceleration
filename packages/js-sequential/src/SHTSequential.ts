import { SHT, SHTOptions, SHTResult, HTResults } from "meta";

// TODO: rename resolution -> sampling

const SHTSequential: SHT = function (
  binaryImage: Int8Array,
  options: SHTOptions
): HTResults<SHTResult> {
  const results: SHTResult[] = [];
  const width = options.width;
  const height = binaryImage.length / width;

  // Defaults
  const resolution = Object.assign({ rho: 1, theta: 0.5 }, options.resolution);
  const votingThreshold = Object.assign(
    { rho: 1, theta: 1 },
    options.votingThreshold
  );

  const hsWidth = Math.round(180 / resolution.theta);
  const hsHeight = Math.sqrt(width ** 2 + height ** 2) / resolution.rho;
  const houghSpace = new Uint32Array(hsWidth * hsHeight);

  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (binaryImage[y * width + x] === 1)
        for (let hx = 0; hx < hsWidth; hx++) {
          const hTheta = (hx * resolution.theta * Math.PI) / 180;
          const ySpace = x * Math.cos(hTheta) + y * Math.sin(hTheta);

          houghSpace[Math.round(ySpace) * hsWidth + hx]++;
        }

  // Simple voting
  /* 
  for (let hy = 0; hy < hsHeight; hy++)
    for (let hx = 0; hx < hsWidth; hx++) {
      houghSpace[hy * hsHeight + hx];
    }
 */

  console.log(houghSpace);

  return {
    results,
    hSpace: {
      data: houghSpace,
      width: hsWidth,
    },
  };
};

export { SHTSequential };
