#include "../include/CHTSimple.h"
#include <iomanip>
#include <iostream>

int main() {

  std::vector<unsigned char> testImage({
      0, 0, 0, 0, 0, 0, 0, //
      0, 0, 0, 0, 0, 0, 0, //
      0, 0, 1, 1, 1, 0, 0, //
      0, 1, 1, 0, 1, 1, 0, //
      0, 1, 0, 0, 0, 1, 0, //
      0, 1, 1, 0, 1, 1, 0, //
      0, 0, 1, 1, 1, 0, 0, //
      0, 0, 0, 0, 0, 0, 0, //
      0, 0, 0, 0, 0, 0, 0, //
  });

  CHTResults results = CHTSimple(testImage, {7, true, 0.9, 1, 1, 6});

  size_t s = results.hSpace.data.size();
  size_t w = results.hSpace.width;
  for (int i = 0; i < s / w; i++)
    for (int j = 0; j < w; j++)
      std::cout << std::setfill(' ') << std::setw(2)
                << results.hSpace.data[i * w + j] << " \n"[j == w - 1];

  for (auto result : results.results) {
    std::cout << "x: " << result.x << " y: " << result.y << " r: " << result.r
              << std::endl;
  }

  return 0;
}
