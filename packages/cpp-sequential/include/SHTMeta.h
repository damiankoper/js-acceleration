#pragma once
#include <cstdint>
#include <vector>

struct SHTResult {
  float rho;
  float theta;
};

struct SHTSamplingOptions {
  /** Diagonal sampling (pixels) */
  float rho = 1;
  /** Angular sampling (degrees) */
  float theta = 1;
};

struct SHTOptions {
  /** Input image width */
  uint32_t width;
  SHTSamplingOptions sampling = {1, 1};
  /** Value in range [0, 1] */
  float votingThreshold = 0.75;
  /** Wether to return hSpace buffer */
  bool returnHSpace = false;
};

struct HSpace {
  std::vector<uint32_t> data;
  uint32_t width;
};

struct SHTResults {
  std::vector<SHTResult> results;
  HSpace hSpace;
};
