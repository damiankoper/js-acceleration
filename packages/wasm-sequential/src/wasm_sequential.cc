#pragma GCC diagnostic ignored "-Wreturn-type-c-linkage"
#include "CHTSimple.h"
#include "SHTSimple.h"
#include "SHTSimpleLookup.h"
#include <emscripten.h>
#include <emscripten/bind.h>
#include <stdio.h>

extern "C" {

EMSCRIPTEN_KEEPALIVE
CHTResults CHTSimpleBind(emscripten::val binaryImageBind, CHTOptions options) {
  auto testImage =
      emscripten::convertJSArrayToNumberVector<uint8_t>(binaryImageBind);
  return CHTSimple(testImage, options);
}

EMSCRIPTEN_KEEPALIVE
SHTResults SHTSimpleBind(emscripten::val binaryImageBind, SHTOptions options) {
  auto testImage =
      emscripten::convertJSArrayToNumberVector<uint8_t>(binaryImageBind);
  return SHTSimple(testImage, options);
}

EMSCRIPTEN_KEEPALIVE
SHTResults SHTSimpleLookupBind(emscripten::val binaryImageBind,
                               SHTOptions options) {
  auto testImage =
      emscripten::convertJSArrayToNumberVector<uint8_t>(binaryImageBind);
  return SHTSimpleLookup(testImage, options);
}
}

EMSCRIPTEN_BINDINGS(wasm_sequential) {
  emscripten::register_vector<uint32_t>("VectorUint32");
  emscripten::register_vector<uint8_t>("VectorUint8");
  emscripten::value_object<SHTSamplingOptions>("SHTSamplingOptions")
      .field("rho", &SHTSamplingOptions::rho)
      .field("theta", &SHTSamplingOptions::theta);
  emscripten::value_object<CHTOptions>("CHTOptions")
      .field("width", &CHTOptions::width)
      .field("returnHSpace", &CHTOptions::returnHSpace)
      .field("gradientThreshold", &CHTOptions::gradientThreshold)
      .field("minDist", &CHTOptions::minDist)
      .field("minR", &CHTOptions::minR)
      .field("maxR", &CHTOptions::maxR);
  emscripten::value_object<SHTOptions>("SHTOptions")
      .field("width", &SHTOptions::width)
      .field("sampling", &SHTOptions::sampling)
      .field("votingThreshold", &SHTOptions::votingThreshold)
      .field("returnHSpace", &SHTOptions::returnHSpace);
  emscripten::value_object<HSpace>("HSpace")
      .field("data", &HSpace::data)
      .field("width", &HSpace::width);
  emscripten::value_object<CHTResult>("CHTResult")
      .field("x", &CHTResult::x)
      .field("y", &CHTResult::y)
      .field("r", &CHTResult::r);
  emscripten::value_object<SHTResult>("SHTResult")
      .field("rho", &SHTResult::rho)
      .field("theta", &SHTResult::theta);
  emscripten::register_vector<SHTResult>("VectorSHTResult");
  emscripten::register_vector<CHTResult>("VectorCHTResult");
  emscripten::value_object<CHTResults>("CHTResults")
      .field("results", &CHTResults::results)
      .field("hSpace", &CHTResults::hSpace);
  emscripten::value_object<SHTResults>("SHTResults")
      .field("results", &SHTResults::results)
      .field("hSpace", &SHTResults::hSpace);
  emscripten::function("CHTSimple", &CHTSimpleBind);
  emscripten::function("SHTSimple", &SHTSimpleBind);
  emscripten::function("SHTSimpleLookup", &SHTSimpleLookupBind);
}
