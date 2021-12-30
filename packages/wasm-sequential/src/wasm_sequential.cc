#pragma GCC diagnostic ignored "-Wreturn-type-c-linkage"
#include "SHTSequentialSimple.h"
#include "SHTSequentialSimpleLookup.h"
#include <emscripten.h>
#include <emscripten/bind.h>
#include <stdio.h>

extern "C" {

EMSCRIPTEN_KEEPALIVE
SHTResults SHTSequentialSimpleBind(const emscripten::val &binaryImageBind,
                                   const SHTOptions &options) {
  auto testImage =
      emscripten::convertJSArrayToNumberVector<uint8_t>(binaryImageBind);
  return SHTSequentialSimple(testImage, options);
}

EMSCRIPTEN_KEEPALIVE
SHTResults SHTSequentialSimpleLookupBind(const emscripten::val &binaryImageBind,
                                         const SHTOptions &options) {
  auto testImage =
      emscripten::convertJSArrayToNumberVector<uint8_t>(binaryImageBind);
  return SHTSequentialSimpleLookup(testImage, options);
}
}

EMSCRIPTEN_BINDINGS(wasm_sequential) {
  emscripten::register_vector<uint32_t>("VectorUint32");
  emscripten::register_vector<uint8_t>("VectorUint8");
  emscripten::value_object<SHTSamplingOptions>("SHTSamplingOptions")
      .field("rho", &SHTSamplingOptions::rho)
      .field("theta", &SHTSamplingOptions::theta);
  emscripten::value_object<SHTOptions>("SHTOptions")
      .field("width", &SHTOptions::width)
      .field("sampling", &SHTOptions::sampling)
      .field("votingThreshold", &SHTOptions::votingThreshold);
  emscripten::value_object<HSpace>("HSpace")
      .field("data", &HSpace::data)
      .field("width", &HSpace::width);
  emscripten::value_object<SHTResult>("SHTResult")
      .field("rho", &SHTResult::rho)
      .field("theta", &SHTResult::theta);
  emscripten::register_vector<SHTResult>("VectorSHTResult");
  emscripten::value_object<SHTResults>("SHTResults")
      .field("results", &SHTResults::results)
      .field("hSpace", &SHTResults::hSpace);
  emscripten::function("SHTSequentialSimple", &SHTSequentialSimpleBind);
  emscripten::function("SHTSequentialSimpleLookup",
                       &SHTSequentialSimpleLookupBind);
}
