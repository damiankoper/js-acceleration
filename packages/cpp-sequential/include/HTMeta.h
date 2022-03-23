#pragma once
#include <cstdint>
#include <vector>

struct HTOptions {
  /** Input image width */
  uint32_t width;
  /** Wether to return hSpace buffer */
  bool returnHSpace = false;
};

struct HSpace {
  std::vector<uint32_t> data;
  uint32_t width;
};
