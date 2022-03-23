#pragma once
#include "HTMeta.h"
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

struct SHTOptions : HTOptions {
  SHTSamplingOptions sampling = {1, 1};
  /** Value in range [0, 1] */
  float votingThreshold = 0.75;
};

struct SHTResults {
  std::vector<SHTResult> results;
  HSpace hSpace;
};

struct HSpace;
