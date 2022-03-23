#include <benchmark/benchmark.h>
#define STB_IMAGE_IMPLEMENTATION
#include "./include/stb_image.h"
#include "CHTSimple.h"
#include "SHTSimple.h"
#include "SHTSimpleLookup.h"

std::string imageNames[] = {
    //
    "../../test/threshold/1.jpg",
    "../../test/canny/1.jpg",
    "../../test/simple/1.png",
    "../../test/simple/2.png",
    "../../test/simple/3.png",
    "../../test/simple/4.png"
    //
};

uint32_t width;
uint8_t *rgb_image;
std::vector<uint8_t> binaryImage;

static void DoSetup(const benchmark::State &state) {
  int width, height, bpp;
  rgb_image = stbi_load(imageNames[0].c_str(), &width, &height, &bpp, 3);
  ::width = width;
  int length = width * height;

  binaryImage = std::vector<uint8_t>(length / 3);
  for (uint32_t i = 0; i < length; i += 3) {
    binaryImage[i / 3] =
        rgb_image[i] + rgb_image[i + 1] + rgb_image[i + 2] > 0 ? 1 : 0;
  }
}

static void DoTeardown(const benchmark::State &state) {
  stbi_image_free(rgb_image);
}

static void SHT_Simple(benchmark::State &state) {
  float f = state.range(0);
  for (auto _ : state)
    SHTSimple(binaryImage, {width, false, {1, f}, 0.75f});
}
BENCHMARK(SHT_Simple)
    ->DenseRange(1, 10, 1)
    ->Setup(DoSetup)
    ->Teardown(DoTeardown);

static void SHT_Simple_Lookup(benchmark::State &state) {
  float f = state.range(0);
  for (auto _ : state)
    SHTSimpleLookup(binaryImage, {width, false, {1.f, f}, 0.75f});
}
BENCHMARK(SHT_Simple_Lookup)
    ->DenseRange(1, 10, 1)
    ->Setup(DoSetup)
    ->Teardown(DoTeardown);

static void CHT_Simple(benchmark::State &state) {
  uint32_t f = state.range(0);
  for (auto _ : state) //{7, 0.9, 1, 1, 6, true}
    CHTSimple(binaryImage, {width, false, 0.75, 1, 10, f});
}
BENCHMARK(CHT_Simple)
    ->DenseRange(10, 100, 10)
    ->Setup(DoSetup)
    ->Teardown(DoTeardown);

BENCHMARK_MAIN();
