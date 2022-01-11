#include "../include/SHTSimpleLookup.h"
#define _USE_MATH_DEFINES
#include <cmath>

SHTResults SHTSimpleLookup(const std::vector<uint8_t> binaryImage,
                           const SHTOptions options) {
  std::vector<SHTResult> results;
  uint32_t width = options.width;
  uint32_t height = binaryImage.size() / width;

  // Defaults handled in the structure definitions
  float samplingRho = options.sampling.rho;
  float samplingTheta = options.sampling.theta;

  uint32_t hsWidth = std::ceil(360 * samplingTheta);
  uint32_t hsHeight =
      std::ceil(std::sqrt(width * width + height * height) * samplingRho);

  std::vector<uint32_t> houghSpace(hsWidth * hsHeight);
  std::vector<float> sinLookup(hsWidth);
  std::vector<float> cosLookup(hsWidth);

  float samplingThetaRad = M_PI / 180. / samplingTheta;
  for (uint32_t i = 0; i < hsWidth; i++) {
    sinLookup[i] = std::sin(i * samplingThetaRad);
    cosLookup[i] = std::cos(i * samplingThetaRad);
  }

  uint32_t maxValue = 0;

  for (uint32_t y = 0; y < height; y++)
    for (uint32_t x = 0; x < width; x++)
      if (binaryImage[y * width + x] == 1)
        for (int hx = 0; hx < hsWidth; hx++) {
          float hTheta = hx;
          float ySpace = x * cosLookup[hTheta] + y * sinLookup[hTheta];

          if (ySpace >= 0) {
            uint32_t offset = std::round(ySpace * samplingRho) * hsWidth + hx;
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

  HSpace hSpace{houghSpace, hsWidth};
  return {results, hSpace};
}
