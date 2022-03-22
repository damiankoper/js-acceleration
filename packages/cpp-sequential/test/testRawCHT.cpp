#include "../include/CHTSimple.h"
#include <iostream>

int main() {

  std::vector<unsigned char> testImage({
      0, 0, 0, 0, 0, 0, 0, //
      0, 0, 0, 0, 0, 0, 0, //
      0, 0, 0, 1, 0, 0, 0, //
      0, 0, 1, 0, 1, 0, 0, //
      0, 1, 0, 0, 0, 1, 0, //
      0, 0, 1, 0, 1, 0, 0, //
      0, 0, 0, 1, 0, 0, 0, //
      0, 0, 0, 0, 0, 0, 0, //
      0, 0, 0, 0, 0, 0, 0, //
  });

  CHTResults results = CHTSimple(testImage, {7, 0.5, 1, 1, 5, true});

  size_t s = results.hSpace.data.size();
  size_t w = results.hSpace.width;
  for (int i = 0; i < s / w; i++)
    for (int j = 0; j < w; j++)
      std::cout << results.hSpace.data[i * w + j] << " \n"[j == w - 1];

  return 0;
}
