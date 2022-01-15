#include "../include/SHTSimple.h"
#include <cmath>
#include <iostream>

SHTResults SHTSimple(const std::vector<uint8_t> binaryImage,
                     const SHTOptions options) {
  std::vector<SHTResult> results;
  uint32_t width = options.width;
  uint32_t height = binaryImage.size() / width;

  // Defaults handled in the structure definitions and/or bindings
  float samplingRho = options.sampling.rho;
  float samplingTheta = options.sampling.theta;

  uint32_t hsWidth = std::trunc(360 * samplingTheta);
  uint32_t hsHeight =
      std::trunc(std::sqrt(width * width + height * height) * samplingRho);

  std::vector<uint32_t> houghSpace(hsWidth * hsHeight);

  uint32_t maxValue = 0;
  float samplingThetaRad = M_PI / 180. / samplingTheta;

  for (uint32_t y = 0; y < height; y++)
    for (uint32_t x = 0; x < width; x++)
      if (binaryImage[y * width + x] == 1)
        for (uint32_t hx = 0; hx < hsWidth; hx++) {
          float hTheta = hx * samplingThetaRad;
          float ySpace = x * std::cos(hTheta) + y * std::sin(hTheta);

          if (ySpace >= 0) {
            uint32_t offset =
                ((uint32_t)std::trunc(ySpace * samplingRho)) * hsWidth + hx;
            maxValue = std::max(maxValue, ++houghSpace[offset]);
          }
        }

  for (uint32_t hy = 0; hy < hsHeight; hy++)
    for (uint32_t hx = 0; hx < hsWidth; hx++) {
      uint32_t offset = hy * hsWidth + hx;
      if (houghSpace[offset] / (float)maxValue > options.votingThreshold) {
        results.push_back({
            hy / samplingRho,   // rho
            hx / samplingTheta, // theta
        });
      }
    }

  if (!options.returnHSpace)
    houghSpace.clear();

  HSpace hSpace{houghSpace, hsWidth};
  return {results, hSpace};
}
