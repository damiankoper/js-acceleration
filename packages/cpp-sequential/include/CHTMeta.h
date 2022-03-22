#pragma once
#include <cstdint>
#include <vector>

struct CHTResult {
  uint32_t x;
  uint32_t y;
  uint32_t r;
};

struct CHTResultCandidate {
  uint32_t x;
  uint32_t y;
  uint32_t r;
  uint32_t acc;
};

struct CHTOptions {
  /** Input image width */
  uint32_t width;
  /** Value in range between [0, 1] */
  float gradientThreshold = 0.75;
  /** Minimum distance between centers of detected circles */
  uint32_t minDist = 100;
  /** Min radius to look for */
  uint32_t minR = 0;
  /** Max radius to look for */
  uint32_t maxR = 100;
  /** Wether to return hSpace buffer */
  bool returnHSpace = false;
};

struct HSpace {
  std::vector<uint32_t> data;
  uint32_t width;
};

struct CHTResults {
  std::vector<CHTResult> results;
  HSpace hSpace;
};
