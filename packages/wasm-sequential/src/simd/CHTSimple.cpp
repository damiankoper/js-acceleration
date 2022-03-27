#include <../../cpp-sequential/include/CHTSimple.h>
#include <cmath>
#include <iostream>
#include <wasm_simd128.h>

#define kernelSize 3
#define kernelShift 1

std::vector<int8_t> conv2(const std::vector<uint8_t> input, uint32_t width,
                          uint32_t height, int16_t kernel[8]) {
  v128_t vKernel = wasm_v128_load(kernel);
  std::vector<int8_t> result = std::vector<int8_t>(width * height, 0);
  for (uint32_t y = kernelShift; y < height - kernelShift; y++) {
    for (uint32_t x = kernelShift; x < width - kernelShift; x++) {
      int16_t pixels[8] = {input[(y - 1) * width + x - 1],  //
                           input[(y - 1) * width + x],      //
                           input[(y - 1) * width + x + 1],  //
                           input[y * width + x - 1],        //
                           input[y * width + x + 1],        //
                           input[(y + 1) * width + x - 1],  //
                           input[(y + 1) * width + x],      //
                           input[(y + 1) * width + x + 1]}; //

      v128_t vPixels = wasm_v128_load(pixels);
      vPixels = wasm_i16x8_mul(vKernel, vPixels);
      wasm_v128_store(pixels, vPixels);

      uint32_t coord = y * width + x;
      for (uint32_t i = 0; i < 8; i++)
        result[coord] += pixels[i];
    }
  }
  return result;
}

void getBounds(int32_t x, int32_t max, v128_t vRBounds, int32_t *out) {
  v128_t vZero = wasm_i32x4_const_splat(0);
  v128_t vMax = wasm_i32x4_splat(max);
  v128_t vX = wasm_i32x4_splat(x);
  vX = wasm_i32x4_add(vRBounds, vX);
  vX = wasm_i32x4_max(vX, vZero);
  vX = wasm_i32x4_min(vX, vMax);
  wasm_v128_store(out, vX);
}

uint32_t distance2(int32_t x1, int32_t y1, int32_t x2, int32_t y2) {
  v128_t vD1 = wasm_v128_load((const int32_t[]){x1, y1});
  v128_t vD2 = wasm_v128_load((const int32_t[]){x2, y2});
  vD1 = wasm_i32x4_sub(vD1, vD2);
  vD1 = wasm_i32x4_mul(vD1, vD1);
  uint32_t d[4];
  wasm_v128_store(d, vD1);
  return d[0] + d[1];
}

bool inBounds(uint32_t x, uint32_t y, int32_t px, int32_t py, uint32_t max,
              uint32_t minRad2, uint32_t maxRad2) {
  uint32_t d = distance2(x, y, px, py);
  return py >= 0 && py < max && minRad2 < d && maxRad2 >= d;
}

CHTResults CHTSimple(const std::vector<uint8_t> binaryImage,
                     const CHTOptions options) {
  int16_t sobelYKernel[8] = {-1, -2, -1, 0, 0, 1, 2, 1};
  int16_t sobelXKernel[8] = {-1, 0, 1, -2, 2, -1, 0, 1};

  std::vector<CHTResult> results;
  std::vector<CHTResultCandidate> candidates;
  uint32_t width = options.width;
  uint32_t height = binaryImage.size() / width;
  uint32_t maxDimHalf = std::max(height, width) / 2;
  std::vector<uint32_t> houghSpace(width * height);
  std::vector<int8_t> gxSpace = conv2(binaryImage, width, height, sobelXKernel);
  std::vector<int8_t> gySpace = conv2(binaryImage, width, height, sobelYKernel);

  // Defaults
  float gradientThreshold = options.gradientThreshold;
  uint32_t minDist = options.minDist;
  uint32_t maxR = options.maxR;
  uint32_t minR = options.minR;
  int32_t rBounds[4] = {(int32_t)-maxR, (int32_t)-minR, (int32_t)minR,
                        (int32_t)maxR};
  v128_t vRBounds = wasm_v128_load(rBounds);

  uint32_t minDist2 = minDist * minDist;
  uint32_t maxRad2 = maxR * maxR;
  uint32_t minRad2 = minR * minR;

  uint32_t maxValue = 0;

  int32_t vIOps[4];

  float m = 0;
  for (uint32_t y = 0; y < height; y++) {
    v128_t vY = wasm_f32x4_splat(y);
    for (uint32_t x = 0; x < width; x++) {
      v128_t vX = wasm_f32x4_splat(x);
      uint32_t coord = y * width + x;
      int8_t gx = gxSpace[coord];
      int8_t gy = gySpace[coord];
      if (gx * gx + gy * gy >= 1) {
        if (gx != 0 && std::abs(m = (float)gy / gx) <= 1) {
          v128_t vM = wasm_f32x4_splat(m);
          v128_t vXM = wasm_f32x4_mul(vX, vM);

          int32_t bounds[4];
          getBounds(x, width, vRBounds, bounds);
          for (uint32_t i = 0; i < 4; i += 2)
            for (uint32_t px = bounds[i]; px < bounds[i + 1]; px += 4) {
              v128_t vPY = wasm_v128_load((const float[]){
                  (float)px, (float)px + 1, (float)px + 2, (float)px + 3});
              vPY = wasm_f32x4_mul(vPY, vM);
              vPY = wasm_f32x4_sub(vPY, vXM);
              vPY = wasm_f32x4_add(vPY, vY);
              vPY = wasm_i32x4_trunc_sat_f32x4(vPY);
              wasm_v128_store(vIOps, vPY);
              for (uint32_t j = 0; j < 4 && px + j < bounds[i + 1]; j++) {
                if (inBounds(x, y, px + j, vIOps[j], height, minRad2, maxRad2))
                  maxValue = std::max(maxValue,
                                      ++houghSpace[vIOps[j] * width + px + j]);
              }
            }
        } else {
          m = (float)gx / gy;
          v128_t vM = wasm_f32x4_splat(m);
          v128_t vYM = wasm_f32x4_mul(vY, vM);

          int32_t bounds[4];
          getBounds(y, height, vRBounds, bounds);
          for (uint32_t i = 0; i < 4; i += 2)
            for (uint32_t py = bounds[i]; py < bounds[i + 1]; py += 4) {
              v128_t vPX = wasm_v128_load((const float[]){
                  (float)py, (float)py + 1, (float)py + 2, (float)py + 3});
              vPX = wasm_f32x4_mul(vPX, vM);
              vPX = wasm_f32x4_sub(vPX, vYM);
              vPX = wasm_f32x4_add(vPX, vX);
              vPX = wasm_i32x4_trunc_sat_f32x4(vPX);
              wasm_v128_store(vIOps, vPX);
              for (uint32_t j = 0; j < 4 && py + j < bounds[i + 1]; j++) {
                if (inBounds(y, x, py + j, vIOps[j], width, minRad2, maxRad2))
                  maxValue = std::max(
                      maxValue, ++houghSpace[(py + j) * width + vIOps[j]]);
              }
            }
        }
      }
    }
  }

  for (uint32_t y = 0; y < height; y++)
    for (uint32_t x = 0; x < width; x++) {
      uint32_t value = houghSpace[y * width + x];
      if (value / (float)maxValue >= gradientThreshold) {
        candidates.push_back({x, y, 0, value});
      }
    }

  std::sort(candidates.begin(), candidates.end(),
            [](const CHTResultCandidate &a, const CHTResultCandidate &b) {
              return a.acc > b.acc;
            });
  for (const CHTResultCandidate &c : candidates) {
    bool distance = std::all_of(
        results.begin(), results.end(), [minDist2, c](const CHTResult &r) {
          return distance2(r.x, r.y, c.x, c.y) >= minDist2;
        });
    if (distance)
      results.push_back(c);
  }

  uint32_t rAccLength = std::abs((int32_t)maxR - (int32_t)minR);
  std::vector<uint32_t> rAcc = std::vector<uint32_t>(rAccLength);
  std::vector<std::pair<float, float>> pixels;
  for (uint32_t y = 0; y < height; y++) {
    for (uint32_t x = 0; x < width; x++) {
      uint32_t coord = y * width + x;
      if (binaryImage[coord] == 1)
        pixels.push_back(std::make_pair((float)x, (float)y));
    }
  }

  for (CHTResult &result : results) {
    std::fill(rAcc.begin(), rAcc.end(), 0);
    v128_t vX = wasm_f32x4_splat(result.x);
    v128_t vY = wasm_f32x4_splat(result.y);
    for (uint32_t p = 0; p < pixels.size(); p += 4) {
      v128_t vPX = wasm_v128_load(
          (const float[]){pixels[p].first, pixels[p + 1].first,
                          pixels[p + 2].first, pixels[p + 3].first});
      v128_t vPY = wasm_v128_load(
          (const float[]){pixels[p].second, pixels[p + 1].second,
                          pixels[p + 2].second, pixels[p + 3].second});
      v128_t vDX = wasm_f32x4_sub(vX, vPX);
      v128_t vDY = wasm_f32x4_sub(vY, vPY);
      vDX = wasm_f32x4_mul(vDX, vDX);
      vDY = wasm_f32x4_mul(vDY, vDY);
      v128_t vD = wasm_f32x4_add(vDX, vDY);
      vD = wasm_f32x4_sqrt(vD);
      vD = wasm_i32x4_trunc_sat_f32x4(vD);
      wasm_v128_store(vIOps, vD);

      for (int i = 0; i < 4 && p + i < pixels.size(); i++) {
        if (vIOps[i] <= maxR && vIOps[i] >= minR)
          ++rAcc[vIOps[i] - minR];
      }
    }

    uint32_t bestRadiusVotes = 0;
    uint32_t bestRadius = 0;
    for (uint32_t i = 1; i < rAccLength - 1; i++) {
      uint32_t votes = rAcc[i - 1] + rAcc[i] + rAcc[i + 1];
      if (bestRadiusVotes <= votes) {
        bestRadiusVotes = votes;
        bestRadius = i + minR;
      }
    }
    result.r = bestRadius;
  }

  if (!options.returnHSpace)
    houghSpace.clear();

  HSpace hSpace{houghSpace, width};
  return {results, hSpace};
}
