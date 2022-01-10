#include <../../cpp-sequential/include/SHTSimple.h>
#include <cmath>
#include <iostream>
#include <wasm_simd128.h>

SHTResults SHTSimple(const std::vector<uint8_t> binaryImage,
                     const SHTOptions options) {
  std::vector<SHTResult> results;
  uint32_t width = options.width;
  uint32_t height = binaryImage.size() / width;

  // Defaults handled in the structure definitions

  uint32_t hsWidth = std::ceil(360 / options.sampling.theta);
  uint32_t hsHeight = std::ceil(std::sqrt(width * width + height * height) /
                                options.sampling.rho);

  std::vector<uint32_t> houghSpace(hsWidth * hsHeight);

  uint32_t maxValue = 0;

  float samplingThetaRad = options.sampling.theta * (float)M_PI / 180;
  v128_t vecSamplingThetaRad = wasm_v128_load32_splat(&samplingThetaRad);
  float samplingRhoF = options.sampling.rho;
  v128_t vecSamplingRho = wasm_v128_load32_splat(&samplingRhoF);
  float hsWidthF = hsWidth;
  v128_t vecHSWidth = wasm_v128_load32_splat(&hsWidthF);

  float vFOps[4] = {0, 0, 0, 0};
  float vFOps2[4] = {0, 0, 0, 0};
  v128_t zeros = wasm_v128_load(vFOps);

  for (uint32_t y = 0; y < height; y++) {
    const v128_t vecY = wasm_f32x4_convert_i32x4(wasm_v128_load32_splat(&y));
    for (uint32_t x = 0; x < width; x++) {
      const v128_t vecX = wasm_f32x4_convert_i32x4(wasm_v128_load32_splat(&x));
      if (binaryImage[y * width + x] == 1) {
        for (uint32_t hx = 0; hx < hsWidth; hx += 4) {
          vFOps[0] = hx, vFOps[1] = hx + 1;
          vFOps[2] = hx + 2, vFOps[3] = hx + 3;
          v128_t vecHX = wasm_v128_load(vFOps);
          v128_t vecHTheta = wasm_f32x4_mul(vecHX, vecSamplingThetaRad);
          wasm_v128_store(vFOps, vecHTheta);

          vFOps2[0] = std::sin(vFOps[0]);
          vFOps2[1] = std::sin(vFOps[1]);
          vFOps2[2] = std::sin(vFOps[2]);
          vFOps2[3] = std::sin(vFOps[3]);
          v128_t vecSin = wasm_v128_load(vFOps2);
          vFOps2[0] = std::cos(vFOps[0]);
          vFOps2[1] = std::cos(vFOps[1]);
          vFOps2[2] = std::cos(vFOps[2]);
          vFOps2[3] = std::cos(vFOps[3]);
          v128_t vecCos = wasm_v128_load(vFOps2);
          v128_t vecXCos = wasm_f32x4_mul(vecX, vecCos);
          v128_t vecYSin = wasm_f32x4_mul(vecY, vecSin);

          v128_t vecYSpace = wasm_f32x4_add(vecXCos, vecYSin);
          v128_t vecYSpaceValid = wasm_f32x4_ge(vecYSpace, zeros);
          vecYSpace = wasm_f32x4_div(vecYSpace, vecSamplingRho);
          vecYSpace = wasm_f32x4_floor(vecYSpace);
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
              hy * samplingRhoF,                 // rho
              (hx + i) * options.sampling.theta, // theta
          });
        }
      }
    }
  }

  HSpace hSpace{houghSpace, hsWidth};
  return {results, hSpace};
}
