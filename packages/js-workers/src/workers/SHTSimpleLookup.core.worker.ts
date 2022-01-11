export function SHTSimpleLookupKernel(
  hxFrom: number,
  hxTo: number,
  width: number,
  height: number,
  binaryImage: Uint8Array,
  hsWidth: number,
  houghSpace: Uint32Array,
  samplingRho: number,
  sinLookup: Float32Array,
  cosLookup: Float32Array
): number {
  let maxValue = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (binaryImage[y * width + x] === 1) {
        for (let hx = hxFrom; hx < hxTo; hx++) {
          const hTheta = hx;
          const ySpace = x * cosLookup[hTheta] + y * sinLookup[hTheta];

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
