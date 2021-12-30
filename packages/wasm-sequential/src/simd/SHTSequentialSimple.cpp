#include <../../cpp-sequential/include/SHTSequentialSimple.h>
#include <iostream>
#include <math.h>
#include <wasm_simd128.h>

SHTResults SHTSequentialSimple(const std::vector<uint8_t> binaryImage,
                               const SHTOptions options) {
  std::vector<SHTResult> results;
  uint32_t width = options.width;
  uint32_t height = (binaryImage.size() / width);

  // Defaults handled in the structure definitions

  uint32_t hsWidth = ceil(360 / options.sampling.theta);
  uint32_t hsHeight =
      ceil(sqrt(width * width + height * height) / options.sampling.rho);

  std::vector<uint32_t> houghSpace(hsWidth * hsHeight);

  uint32_t maxValue = 0;

  float samplingThetaRad = (float)options.sampling.theta * M_PI / 180;
  v128_t vecSamplingThetaRad = wasm_v128_load32_splat(&samplingThetaRad);
  float samplingRhoF = (float)options.sampling.rho;
  v128_t vecSamplingRho = wasm_v128_load32_splat(&samplingRhoF);
  float hsWidthF = (float)hsWidth;
  v128_t vecHSWidth = wasm_v128_load32_splat(&hsWidthF);

  float vFOps[4] = {0, 0, 0, 0};
  v128_t zeros = wasm_v128_load(vFOps);

  for (uint32_t y = 0; y < height; y++) {
    for (uint32_t x = 0; x < width; x++) {
      if (binaryImage[y * width + x] == 1) {
        for (uint32_t hx = 0; hx < hsWidth; hx += 4) {
          vFOps[0] = hx, vFOps[1] = hx + 1;
          vFOps[2] = hx + 2, vFOps[3] = hx + 3;
          v128_t vecHX = wasm_v128_load(vFOps);
          v128_t vecHTheta = wasm_f32x4_mul(vecHX, vecSamplingThetaRad);
          wasm_v128_store(vFOps, vecHTheta);

          vFOps[0] = x * cos(vFOps[0]) + y * sin(vFOps[0]);
          vFOps[1] = x * cos(vFOps[1]) + y * sin(vFOps[1]);
          vFOps[2] = x * cos(vFOps[2]) + y * sin(vFOps[2]);
          vFOps[3] = x * cos(vFOps[3]) + y * sin(vFOps[3]);

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
