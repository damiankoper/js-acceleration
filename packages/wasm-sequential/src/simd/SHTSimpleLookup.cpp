#include "../include/SHTSimpleLookup.h"
#include <cmath>
#include <iostream>
#include <wasm_simd128.h>

SHTResults SHTSimpleLookup(const std::vector<uint8_t> binaryImage,
                           const SHTOptions options) {
  std::vector<SHTResult> results;
  uint32_t width = options.width;
  uint32_t height = (int)(binaryImage.size() / width);

  // Defaults handled in the structure definitions

  uint32_t hsWidth = std::trunc(360 * options.sampling.theta);
  uint32_t hsHeight = std::trunc(std::sqrt(width * width + height * height) *
                                 options.sampling.rho);

  std::vector<uint32_t> houghSpace(hsWidth * hsHeight);
  std::vector<float> sinLookup(hsWidth);
  std::vector<float> cosLookup(hsWidth);

  uint32_t maxValue = 0;

  float samplingThetaRad = M_PI / 180. / options.sampling.theta;
  v128_t vecSamplingThetaRad = wasm_v128_load32_splat(&samplingThetaRad);
  float samplingRhoF = options.sampling.rho;
  v128_t vecSamplingRho = wasm_v128_load32_splat(&samplingRhoF);
  v128_t vecHSWidth = wasm_v128_load32_splat(&hsWidth);

  for (uint32_t i = 0; i < hsWidth; i++) {
    sinLookup[i] = std::sin(i * samplingThetaRad);
    cosLookup[i] = std::cos(i * samplingThetaRad);
  }

  float vFOps[4] = {0, 0, 0, 0};
  uint32_t vIOps[4] = {0, 0, 0, 0};
  uint32_t ySpaceValid[4];
  v128_t zeros = wasm_f32x4_const_splat(0);

  for (uint32_t y = 0; y < height; y++) {
    const v128_t vecY = wasm_f32x4_convert_i32x4(wasm_v128_load32_splat(&y));
    for (uint32_t x = 0; x < width; x++) {
      const v128_t vecX = wasm_f32x4_convert_i32x4(wasm_v128_load32_splat(&x));
      if (binaryImage[y * width + x] == 1) {
        for (int hx = 0; hx < hsWidth; hx += 4) {
          vFOps[0] = hx, vFOps[1] = hx + 1;
          vFOps[2] = hx + 2, vFOps[3] = hx + 3;
          vIOps[0] = hx, vIOps[1] = hx + 1;
          vIOps[2] = hx + 2, vIOps[3] = hx + 3;
          v128_t vecHX = wasm_v128_load(vFOps);
          v128_t vecHXI = wasm_v128_load(vIOps);

          vFOps[0] = sinLookup[hx];
          vFOps[1] = sinLookup[hx + 1];
          vFOps[2] = sinLookup[hx + 2];
          vFOps[3] = sinLookup[hx + 3];
          v128_t vecYSin = wasm_v128_load(vFOps);
          vecYSin = wasm_f32x4_mul(vecY, vecYSin);

          vFOps[0] = cosLookup[hx];
          vFOps[1] = cosLookup[hx + 1];
          vFOps[2] = cosLookup[hx + 2];
          vFOps[3] = cosLookup[hx + 3];
          v128_t vecXCos = wasm_v128_load(vFOps);
          vecXCos = wasm_f32x4_mul(vecX, vecXCos);

          v128_t &vecYSpace = vecYSin;
          v128_t &vecYSpaceValid = vecXCos;
          vecYSpace = wasm_f32x4_add(vecXCos, vecYSin);
          vecYSpace = wasm_f32x4_mul(vecYSpace, vecSamplingRho);
          vecYSpaceValid = wasm_f32x4_ge(vecYSpace, zeros);
          vecYSpace = wasm_i32x4_trunc_sat_f32x4(vecYSpace);
          vecYSpace = wasm_i32x4_mul(vecYSpace, vecHSWidth);
          vecYSpace = wasm_i32x4_add(vecYSpace, vecHXI);

          wasm_v128_store(vIOps, vecYSpace);
          wasm_v128_store(ySpaceValid, vecYSpaceValid);

          for (uint32_t i = 0; i < 4 && hx + i < hsWidth; i++) {
            if ((bool)ySpaceValid[i]) {
              maxValue = std::max(maxValue, ++houghSpace[vIOps[i]]);
            }
          }
        }
      }
    }
  }

  vecHSWidth = wasm_v128_load32_splat(&hsWidth);
  float maxValueF = (float)maxValue;

  for (uint32_t hy = 0; hy < hsHeight; hy++) {
    v128_t vecHY = wasm_v128_load32_splat(&hy);
    vecHY = wasm_i32x4_mul(vecHY, vecHSWidth);
    for (uint32_t hx = 0; hx < hsWidth; hx += 4) {
      vIOps[0] = hx, vIOps[1] = hx + 1, vIOps[2] = hx + 2, vIOps[3] = hx + 3;
      v128_t vecHX = wasm_v128_load(vIOps);
      vecHX = wasm_i32x4_add(vecHY, vecHX);
      wasm_v128_store(vIOps, vecHX);
      for (size_t i = 0; i < 4 && hx + i < hsWidth; i++) {
        uint32_t v = houghSpace[vIOps[i]];
        if (v / maxValueF > options.votingThreshold) {
          results.push_back({
              hy / samplingRhoF,                 // rho
              (hx + i) / options.sampling.theta, // theta
          });
        }
      }
    }
  }

  if (!options.returnHSpace)
    houghSpace.clear();

  HSpace hSpace{houghSpace, hsWidth};
  return {results, hSpace};
}
