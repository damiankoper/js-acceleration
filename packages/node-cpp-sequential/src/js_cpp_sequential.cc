#define NAPI_DISABLE_CPP_EXCEPTIONS
#include "CHTSimple.h"
#include "SHTSimple.h"
#include "SHTSimpleLookup.h"
#include "napi.h"
#include <cstdint>

using namespace Napi;

SHTOptions getSHTOptions(Napi::Object &optionsBind) {
  SHTOptions options = SHTOptions();

  options.width = optionsBind.Get("width").As<Napi::Number>().Uint32Value();
  auto sampling = optionsBind.Get("sampling").As<Napi::Object>();
  if (!sampling.IsUndefined()) {
    auto rho = sampling.Get("rho");
    if (!rho.IsUndefined())
      options.sampling.rho = rho.As<Napi::Number>();
    auto theta = sampling.Get("theta");
    if (!theta.IsUndefined())
      options.sampling.theta = theta.As<Napi::Number>();
  }
  auto votingThreshold = optionsBind.Get("votingThreshold");
  if (!votingThreshold.IsUndefined())
    options.votingThreshold = votingThreshold.As<Napi::Number>();

  auto returnHSpace = optionsBind.Get("returnHSpace");
  if (!returnHSpace.IsUndefined())
    options.returnHSpace = returnHSpace.As<Napi::Boolean>();

  return options;
}

CHTOptions getCHTOptions(Napi::Object &optionsBind) {
  CHTOptions options = CHTOptions();

  auto gradientThreshold = optionsBind.Get("gradientThreshold");
  if (!gradientThreshold.IsUndefined())
    options.gradientThreshold = gradientThreshold.As<Napi::Number>();
  auto minDist = optionsBind.Get("minDist");
  if (!minDist.IsUndefined())
    options.minDist = minDist.As<Napi::Number>();
  auto minR = optionsBind.Get("minR");
  if (!minR.IsUndefined())
    options.minR = minR.As<Napi::Number>();
  auto maxR = optionsBind.Get("maxR");
  if (!maxR.IsUndefined())
    options.maxR = maxR.As<Napi::Number>();

  options.width = optionsBind.Get("width").As<Napi::Number>().Uint32Value();
  auto returnHSpace = optionsBind.Get("returnHSpace");
  if (!returnHSpace.IsUndefined())
    options.returnHSpace = returnHSpace.As<Napi::Boolean>();

  return options;
}

std::vector<uint8_t> getTestImage(Napi::Uint8Array &testImageBind) {
  uint8_t *buff_data = testImageBind.Data();
  size_t element_length = testImageBind.ElementLength();
  std::vector<uint8_t> testImage;
  testImage.assign(buff_data, buff_data + element_length);

  return testImage;
}

void bindHoughSpace(napi_env env, HTOptions &options, Napi::Object &resultBind,
                    HSpace &hSpace) {
  if (options.returnHSpace) {
    auto hSpaceBind = Napi::Object::New(env);
    resultBind.Set("hSpace", hSpaceBind);
    hSpaceBind.Set("width", hSpace.width);

    size_t size = hSpace.data.size();
    auto arrayBuffer = Napi::ArrayBuffer::New(env, size * 4);
    memcpy(arrayBuffer.Data(), hSpace.data.data(), size * 4);
    auto hSpaceDataBind = Napi::Uint32Array::New(env, size, arrayBuffer, 0);
    hSpaceBind.Set("data", hSpaceDataBind);
  } else {
    auto hSpaceBind = Napi::Env(env).Undefined();
    resultBind.Set("hSpace", hSpaceBind);
  }
}

Napi::Object getSHTResultBind(napi_env env, SHTOptions &options,
                              SHTResults &results) {
  auto resultBind = Napi::Object::New(env);
  auto resultsBind = Napi::Array::New(env);
  resultBind.Set("results", resultsBind);

  size_t c = 0;
  for (auto &&i : results.results) {
    auto resultBind = Napi::Object::New(env);
    resultBind.Set("rho", i.rho);
    resultBind.Set("theta", i.theta);
    resultsBind[c++] = resultBind;
  }
  bindHoughSpace(env, options, resultBind, results.hSpace);
  return resultBind;
}

Napi::Object getCHTResultBind(napi_env env, HTOptions &options,
                              CHTResults &results) {
  auto resultBind = Napi::Object::New(env);
  auto resultsBind = Napi::Array::New(env);
  resultBind.Set("results", resultsBind);

  size_t c = 0;
  for (auto &&i : results.results) {
    auto resultBind = Napi::Object::New(env);
    resultBind.Set("x", i.x);
    resultBind.Set("y", i.y);
    resultBind.Set("r", i.r);
    resultsBind[c++] = resultBind;
  }
  bindHoughSpace(env, options, resultBind, results.hSpace);
  return resultBind;
}

Napi::Object CHTSimpleBind(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  auto testImageBind = info[0].As<Napi::Uint8Array>();
  auto testImage = getTestImage(testImageBind);
  auto optionsBind = info[1].As<Napi::Object>();
  CHTOptions options = getCHTOptions(optionsBind);
  CHTResults results = CHTSimple(testImage, options);

  return getCHTResultBind(env, options, results);
}

Napi::Object SHTSimpleBind(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  auto testImageBind = info[0].As<Napi::Uint8Array>();
  auto testImage = getTestImage(testImageBind);
  auto optionsBind = info[1].As<Napi::Object>();
  SHTOptions options = getSHTOptions(optionsBind);
  SHTResults results = SHTSimple(testImage, options);

  return getSHTResultBind(env, options, results);
}

Napi::Object SHTSimpleLookupBind(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  auto testImageBind = info[0].As<Napi::Uint8Array>();
  auto testImage = getTestImage(testImageBind);
  auto optionsBind = info[1].As<Napi::Object>();
  SHTOptions options = getSHTOptions(optionsBind);
  SHTResults results = SHTSimpleLookup(testImage, options);

  return getSHTResultBind(env, options, results);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "SHTSimple"),
              Napi::Function::New(env, SHTSimpleBind));

  exports.Set(Napi::String::New(env, "SHTSimpleLookup"),
              Napi::Function::New(env, SHTSimpleLookupBind));

  exports.Set(Napi::String::New(env, "CHTSimple"),
              Napi::Function::New(env, CHTSimpleBind));
  return exports;
}

NODE_API_MODULE(addon, Init)
