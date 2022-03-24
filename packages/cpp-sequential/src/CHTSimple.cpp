#include "../include/CHTSimple.h"
#include <cmath>
#include <iostream>

#define kernelSize 3
#define kernelShift 1

std::vector<int8_t> conv2(const std::vector<uint8_t> input, uint32_t width,
                          uint32_t height, int8_t kernel[3][3]) {
  std::vector<int8_t> result = std::vector<int8_t>(width * height);
  for (uint32_t y = kernelShift; y < height - kernelShift; y++)
    for (uint32_t x = kernelShift; x < width - kernelShift; x++) {
      int8_t sum = 0;
      uint32_t coord = y * width + x;
      for (uint8_t ky = 0; ky < kernelSize; ky++)
        for (uint8_t kx = 0; kx < kernelSize; kx++) {
          uint32_t sy = y - kernelShift + ky;
          uint32_t sx = x - kernelShift + kx;
          uint8_t pixel = input[sy * width + sx];
          sum += kernel[ky][kx] * pixel;
        }
      result[coord] = sum;
    }
  return result;
}

std::vector<uint32_t> getBounds(int32_t x, int32_t max, int32_t minR,
                                int32_t maxR) {
  uint32_t xMinMax = std::clamp(x - maxR, 0, max);
  uint32_t xMinMin = std::clamp(x - minR, 0, max);
  uint32_t xMaxMax = std::clamp(x + maxR, 0, max);
  uint32_t xMaxMin = std::clamp(x + minR, 0, max);
  return std::vector<uint32_t>({
      xMinMax,
      xMinMin,
      xMaxMin,
      xMaxMax,
  });
}

uint32_t distance2(int32_t x1, int32_t y1, int32_t x2, int32_t y2) {
  int32_t dx = x1 - x2;
  int32_t dy = y1 - y2;
  return dx * dx + dy * dy;
}

bool inBounds(uint32_t x, uint32_t y, int32_t px, int32_t py, uint32_t max,
              uint32_t minRad2, uint32_t maxRad2) {
  uint32_t d = distance2(x, y, px, py);
  return py >= 0 && py < max && minRad2 < d && maxRad2 >= d;
}

CHTResults CHTSimple(const std::vector<uint8_t> binaryImage,
                     const CHTOptions options) {
  int8_t sobelYKernel[3][3] = {
      {-1, -2, -1},
      {0, 0, 0},
      {1, 2, 1},
  };

  int8_t sobelXKernel[3][3] = {
      {-1, 0, 1},
      {-2, 0, 2},
      {-1, 0, 1},
  };

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

  uint32_t minDist2 = minDist * minDist;
  uint32_t maxRad2 = maxR * maxR;
  uint32_t minRad2 = minR * minR;

  uint32_t maxValue = 0;
  float m = 0;
  for (uint32_t y = 0; y < height; y++) {
    for (uint32_t x = 0; x < width; x++) {
      uint32_t coord = y * width + x;
      int8_t gx = gxSpace[coord];
      int8_t gy = gySpace[coord];
      if (gx * gx + gy * gy >= 1) {
        if (gx != 0 && std::abs(m = (float)gy / gx) <= 1) {
          std::vector<uint32_t> bounds = getBounds(x, width, minR, maxR);
          for (uint32_t i = 0; i < 4; i += 2)
            for (uint32_t px = bounds[i]; px < bounds[i + 1]; px++) {
              int32_t py = m * px - x * m + y;
              if (inBounds(x, y, px, py, height, minRad2, maxRad2))
                maxValue = std::max(maxValue, ++houghSpace[py * width + px]);
            }
        } else {
          m = gx / gy;
          std::vector<uint32_t> bounds = getBounds(y, height, minR, maxR);
          for (uint32_t i = 0; i < 4; i += 2)
            for (uint32_t py = bounds[i]; py < bounds[i + 1]; py++) {
              int32_t px = m * py - y * m + x;
              if (inBounds(y, x, py, px, width, minRad2, maxRad2))
                maxValue = std::max(maxValue, ++houghSpace[py * width + px]);
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
  for (auto &c : candidates) {
    bool distance = std::all_of(
        results.begin(), results.end(), [minDist2, c](const CHTResult &r) {
          return distance2(r.x, r.y, c.x, c.y) >= minDist2;
        });
    if (distance)
      results.push_back(c);
  }

  uint32_t rAccLength = std::abs((int32_t)maxR - (int32_t)minR) + 1;
  std::vector<uint32_t> rAcc = std::vector<uint32_t>(rAccLength);
  for (auto &result : results) {
    for (uint32_t y = 0; y < height; y++)
      for (uint32_t x = 0; x < width; x++) {
        uint32_t coord = y * width + x;
        if (binaryImage[coord] == 1) {
          uint32_t d = std::sqrt(distance2(result.x, result.y, x, y));
          if (d <= maxR && d >= minR)
            ++rAcc[d - minR];
        }
      }

    uint32_t maxRadiusVotes = 0;
    uint32_t maxRadius = 0;
    for (uint32_t i = 1; i < rAccLength - 1; i++) {
      uint32_t votes = rAcc[i - 1] + rAcc[i] + rAcc[i + 1];
      if (maxRadiusVotes <= votes) {
        maxRadiusVotes = votes;
        maxRadius = i + minR;
      }
    }
    result.r = maxRadius;
  }

  if (!options.returnHSpace)
    houghSpace.clear();

  HSpace hSpace{houghSpace, width};
  return {results, hSpace};
}
