#include "../include/CHTSimple.h"
#include <cmath>
#include <iostream>

CHTResults CHTSimple(const std::vector<uint8_t> binaryImage,
                     const CHTOptions options) {
  std::vector<CHTResult> results;
  std::vector<CHTResultCandidate> candidates;
  uint32_t width = options.width;
  uint32_t height = binaryImage.size() / width;
  uint32_t maxDimHalf = std::max(height, width) / 2;
  std::vector<uint32_t> houghSpace(width * height);
  std::vector<uint32_t> gxSpace;
  std::vector<uint32_t> gySpace;

  // Defaults
  float gradientThreshold = options.gradientThreshold || 0.75;
  uint32_t minDist = options.minDist || 1;
  uint32_t maxR = options.maxR || maxDimHalf;
  uint32_t minR = options.minR || 0;

  uint32_t minDist2 = minDist * minDist;
  uint32_t maxRad2 = maxR * maxR;
  uint32_t minRad2 = minR * minR;

  uint32_t maxValue = 0;
  /*
    const maxDimHalf = Math.floor(Math.max(height, width) / 2);

    // Defaults
    const gradientThreshold = options.gradientThreshold || 0.75;
    const minDist = options.minDist || 1;
    const maxR = options.maxR || maxDimHalf;
    const minR = options.minR || 0;

    const houghSpace = new Uint32Array(width * height);
    const gxSpace = conv2(binaryImage, width, height, sobelXKernel);
    const gySpace = conv2(binaryImage, width, height, sobelYKernel);

    const minDist2 = minDist * minDist;
    const maxRad2 = maxR * maxR;
    const minRad2 = minR * minR;

    let maxValue = 0;
     */

  if (!options.returnHSpace)
    houghSpace.clear();

  HSpace hSpace{houghSpace, width};
  return {results, hSpace};
}
