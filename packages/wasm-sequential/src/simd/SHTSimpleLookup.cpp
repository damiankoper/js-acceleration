#include "../include/SHTSimpleLookup.h"
#include <iostream>
#include <math.h>
#include <wasm_simd128.h>

SHTResults SHTSimpleLookup(const std::vector<uint8_t> binaryImage,
                           const SHTOptions options) {
  std::vector<SHTResult> results;
  uint32_t width = options.width;
  uint32_t height = (int)(binaryImage.size() / width);

  // Defaults handled in the structure definitions

  uint32_t hsWidth = ceil(360 / options.sampling.theta);
  uint32_t hsHeight =
      ceil(sqrt(width * width + height * height) / options.sampling.rho);

  std::vector<uint32_t> houghSpace(hsWidth * hsHeight);
  std::vector<float> sinLookup(hsWidth);
  std::vector<float> cosLookup(hsWidth);

  uint32_t maxValue = 0;

  float samplingThetaRad = options.sampling.theta * M_PI / 180;
  v128_t vecSamplingThetaRad = wasm_v128_load32_splat(&samplingThetaRad);
  float samplingRhoF = (float)options.sampling.rho;
  v128_t vecSamplingRho = wasm_v128_load32_splat(&samplingRhoF);
  float hsWidthF = (float)hsWidth;
  v128_t vecHSWidth = wasm_v128_load32_splat(&hsWidthF);

  for (uint32_t i = 0; i < hsWidth; i++) {
    sinLookup[i] = sin(i * samplingThetaRad);
    cosLookup[i] = cos(i * samplingThetaRad);
  }

  float vFOps[4] = {0, 0, 0, 0};
  v128_t zeros = wasm_v128_load(vFOps);

  for (uint32_t y = 0; y < height; y++) {
    for (uint32_t x = 0; x < width; x++) {
      if (binaryImage[y * width + x] == 1) {
        for (int hx = 0; hx < hsWidth; hx += 4) {
          vFOps[0] = hx, vFOps[1] = hx + 1;
          vFOps[2] = hx + 2, vFOps[3] = hx + 3;
          v128_t vecHX = wasm_v128_load(vFOps);

          vFOps[0] = x * cosLookup[hx] + y * sinLookup[hx];
          vFOps[1] = x * cosLookup[hx + 1] + y * sinLookup[hx + 1];
          vFOps[2] = x * cosLookup[hx + 2] + y * sinLookup[hx + 2];
          vFOps[3] = x * cosLookup[hx + 3] + y * sinLookup[hx + 3];

          v128_t vecYSpace = wasm_v128_load(vFOps);
          v128_t vecYSpaceValid = wasm_f32x4_ge(vecYSpace, zeros);
          vecYSpace = wasm_f32x4_div(vecYSpace, vecSamplingRho);
          vecYSpace = wasm_f32x4_nearest(vecYSpace);
          vecYSpace = wasm_f32x4_mul(vecYSpace, vecHSWidth);
          vecYSpace = wasm_f32x4_add(vecYSpace, vecHX);

          uint32_t ySpaceValid[4];
          wasm_v128_store(ySpaceValid, vecYSpaceValid);
          wasm_v128_store(vFOps, vecYSpace);

          for (uint32_t i = 0; i < 4 && hx + i < hsWidth; i++) {
            if ((bool)ySpaceValid[i]) {
              maxValue = std::max(maxValue, ++houghSpace[vFOps[i]]);
            }
          }
        }
      }
    }
  }

  uint32_t vIOps[4] = {0, 0, 0, 0};
  vecHSWidth = wasm_v128_load32_splat(&hsWidth);

  for (uint32_t hy = 0; hy < hsHeight; hy++) {
    v128_t vecHY = wasm_v128_load32_splat(&hy);
    vecHY = wasm_i32x4_mul(vecHY, vecHSWidth);
    for (uint32_t hx = 0; hx < hsWidth; hx += 4) {
      vIOps[0] = hx, vIOps[1] = hx + 1, vIOps[2] = hx + 2, vIOps[3] = hx + 3;
      v128_t vecHX = wasm_v128_load(vIOps);
      vecHX = wasm_i32x4_add(vecHY, vecHX);
      wasm_v128_store(vIOps, vecHX);
      vIOps[0] = houghSpace[vIOps[0]], vIOps[1] = houghSpace[vIOps[1]],
      vIOps[2] = houghSpace[vIOps[2]], vIOps[3] = houghSpace[vIOps[3]];

      for (size_t i = 0; i < 4; i++) {
        if (vIOps[i] / (double)maxValue > options.votingThreshold) {
          results.push_back({
              hy * options.sampling.rho,         // rho
              (hx + i) * options.sampling.theta, // theta
          });
        }
      }
    }
  }

  HSpace hSpace{houghSpace, hsWidth};
  return {results, hSpace};
}
