#pragma once
#include "HTMeta.h"
#include <cstdint>
#include <vector>

struct CHTResult {
  uint32_t x;
  uint32_t y;
  uint32_t r;
};

struct CHTResultCandidate : CHTResult {
  uint32_t acc;
};

struct CHTOptions : HTOptions {
  /** Value in range between [0, 1] */
  float gradientThreshold = 0.75;
  /** Minimum distance between centers of detected circles */
  uint32_t minDist = 100;
  /** Min radius to look for */
  uint32_t minR = 0;
  /** Max radius to look for */
  uint32_t maxR = 100;
};

struct CHTResults {
  std::vector<CHTResult> results;
  HSpace hSpace;
};
