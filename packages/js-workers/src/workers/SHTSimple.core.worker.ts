export function SHTSimpleKernel(
  hxFrom: number,
  hxTo: number,
  width: number,
  height: number,
  binaryImage: Uint8Array,
  hsWidth: number,
  houghSpace: Uint32Array,
  samplingThetaRad: number,
  samplingRho: number
): number {
  let maxValue = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (binaryImage[y * width + x] === 1) {
        for (let hx = hxFrom; hx < hxTo; hx++) {
          const hTheta = hx * samplingThetaRad;
          const ySpace = x * Math.cos(hTheta) + y * Math.sin(hTheta);

          if (ySpace >= 0) {
            const offset = ((ySpace * samplingRho + 0.5) << 0) * hsWidth + hx;
            maxValue =
              maxValue < ++houghSpace[offset] ? houghSpace[offset] : maxValue;
          }
        }
      }
    }
  }
  return maxValue;
}
