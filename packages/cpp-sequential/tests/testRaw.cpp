#include "../include/SHTSequentialSimpleLookup.h"
#include <iostream>

int main() {

  std::vector<unsigned char> testImage({1, 0, 0, 0, 0, 0, 0, //
                                        0, 0, 0, 0, 0, 0, 0, //
                                        0, 0, 0, 0, 0, 0, 0, //
                                        1, 1, 1, 1, 1, 1, 1, //
                                        0, 0, 0, 0, 0, 0, 0, //
                                        0, 0, 0, 0, 0, 1, 1, //
                                        0, 0, 0, 0, 0, 1, 1});

  SHTResults results = SHTSequentialSimpleLookup(testImage, {6, {0.5, 8}});

  size_t s = results.hSpace.data.size();
  size_t w = results.hSpace.width;
  for (int i = 0; i < s / w; i++)
    for (int j = 0; j < w; j++)

      std::cout << results.hSpace.data[i * w + j] << " \n"[j == w - 1];

  return 0;
}
