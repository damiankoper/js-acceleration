#include "../include/SHTSequentialSimpleLookup.h"
#include <iostream>
#include <math.h>

SHTResults SHTSequentialSimpleLookup(std::vector<unsigned char> binaryImage,
                                     SHTOptions options) {
  std::vector<SHTResult> results;
  size_t width = options.width;
  size_t height = (int)(binaryImage.size() / width);

  // Defaults handled in the structure definitions

  size_t hsWidth = round(360 / options.sampling.theta);
  size_t hsHeight =
      round(sqrt(width * width + height * height) / options.sampling.rho);

  std::vector<size_t> houghSpace(hsWidth * hsHeight);
  size_t lookupSize = hsWidth * options.sampling.theta;
  std::vector<float> sinLookup(lookupSize);
  std::vector<float> cosLookup(lookupSize);

  double samplingThetaRad = options.sampling.theta * M_PI / 180;
  for (size_t i = 0; i < lookupSize; i++) {
    sinLookup[i] = sin(i * samplingThetaRad);
    cosLookup[i] = cos(i * samplingThetaRad);
  }

  size_t maxValue = 0;

  for (size_t y = 0; y < height; y++)
    for (size_t x = 0; x < width; x++)
      if (binaryImage[y * width + x] == 1)
        for (int hx = 0; hx < hsWidth; hx++) {
          double hTheta = hx;
          double ySpace = x * cosLookup[hTheta] + y * sinLookup[hTheta];

          if (ySpace >= 0) {
            size_t offset = round(ySpace / options.sampling.rho) * hsWidth + hx;
            size_t value = houghSpace[offset] + 1;
            maxValue = std::max(maxValue, value);
            houghSpace[offset] = value;
          }
        }

  for (size_t hy = 0; hy < hsHeight; hy++)
    for (size_t hx = 0; hx < hsWidth; hx++) {
      size_t offset = hy * hsWidth + hx;
      if (houghSpace[offset] / maxValue > options.votingThreshold) {
        results.push_back({
            hy * options.sampling.rho,   // rho
            hx * options.sampling.theta, // theta
        });
      }
    }

  HSpace hSpace{houghSpace, hsWidth};
  return {results, hSpace};
}
