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

  double samplingThetaRad = options.sampling.theta * M_PI / 180;
  v128_t vecSamplingThetaRad = wasm_v128_load64_splat(&samplingThetaRad);
  v128_t vecSamplingRho = wasm_v128_load64_splat(&options.sampling.rho);
  double hsWidthD = (double)hsWidth;
  v128_t vecHSWidth = wasm_v128_load64_splat(&hsWidthD);

  double vDOps[2] = {0, 0};
  v128_t zeros = wasm_v128_load(vDOps);

  for (uint32_t y = 0; y < height; y++) {
    for (uint32_t x = 0; x < width; x++) {
      if (binaryImage[y * width + x] == 1) {
        for (int hx = 0; hx < hsWidth; hx += 2) {
          vDOps[0] = hx, vDOps[1] = hx + 1;
          v128_t vecHX = wasm_v128_load(vDOps);
          v128_t vecHTheta = wasm_f64x2_mul(vecHX, vecSamplingThetaRad);
          wasm_v128_store(vDOps, vecHTheta);
          vDOps[0] = x * cos(vDOps[0]) + y * sin(vDOps[0]);
          vDOps[1] = x * cos(vDOps[1]) + y * sin(vDOps[1]);
          v128_t vecYSpace = wasm_v128_load(vDOps);
          v128_t vecYSpaceValid = wasm_f64x2_ge(vecYSpace, zeros);
          vecYSpace = wasm_f64x2_div(vecYSpace, vecSamplingRho);
          vecYSpace = wasm_f64x2_nearest(vecYSpace);
          vecYSpace = wasm_f64x2_mul(vecYSpace, vecHSWidth);
          vecYSpace = wasm_f64x2_add(vecYSpace, vecHX);
          wasm_v128_store(vDOps, vecYSpace);
          uint32_t offset_1 = (uint32_t)vDOps[0], offset_2 = (uint32_t)vDOps[1];
          wasm_v128_store(vDOps, vecYSpaceValid);
          if (vDOps[0]) {
            uint32_t value = houghSpace[offset_1] + 1;
            maxValue = std::max(maxValue, value);
            houghSpace[offset_1] = value;
          }
          if (hx + 1 < hsWidth && vDOps[1]) {
            uint32_t value = houghSpace[offset_2] + 1;
            maxValue = std::max(maxValue, value);
            houghSpace[offset_2] = value;
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
              hy * options.sampling.rho,   // rho
              hx * options.sampling.theta, // theta
          });
        }
      }
    }
  }

  HSpace hSpace{houghSpace, hsWidth};
  return {results, hSpace};
}
