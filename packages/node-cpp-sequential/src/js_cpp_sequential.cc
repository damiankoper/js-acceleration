#define NAPI_DISABLE_CPP_EXCEPTIONS
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

std::vector<uint8_t> getTestImage(Napi::Uint8Array &testImageBind) {
  uint8_t *buff_data = testImageBind.Data();
  size_t element_length = testImageBind.ElementLength();
  std::vector<uint8_t> testImage;
  testImage.assign(buff_data, buff_data + element_length);

  return testImage;
}

Napi::Object getResultBind(napi_env env, SHTOptions &options,
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

  if (options.returnHSpace) {
    auto hSpaceBind = Napi::Object::New(env);
    resultBind.Set("hSpace", hSpaceBind);
    hSpaceBind.Set("width", results.hSpace.width);

    size_t size = results.hSpace.data.size();
    auto arrayBuffer = Napi::ArrayBuffer::New(env, size * 4);
    memcpy(arrayBuffer.Data(), results.hSpace.data.data(), size * 4);
    auto hSpaceDataBind = Napi::Uint32Array::New(env, size, arrayBuffer, 0);
    hSpaceBind.Set("data", hSpaceDataBind);
  } else {
    auto hSpaceBind = Napi::Env(env).Undefined();
    resultBind.Set("hSpace", hSpaceBind);
  }

  return resultBind;
}

Napi::Object SHTSimpleBind(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  auto testImageBind = info[0].As<Napi::Uint8Array>();
  auto testImage = getTestImage(testImageBind);
  auto optionsBind = info[1].As<Napi::Object>();
  SHTOptions options = getSHTOptions(optionsBind);
  SHTResults results = SHTSimple(testImage, options);

  return getResultBind(env, options, results);
}

Napi::Object SHTSimpleLookupBind(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  auto testImageBind = info[0].As<Napi::Uint8Array>();
  auto testImage = getTestImage(testImageBind);
  auto optionsBind = info[1].As<Napi::Object>();
  SHTOptions options = getSHTOptions(optionsBind);
  SHTResults results = SHTSimpleLookup(testImage, options);

  return getResultBind(env, options, results);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "SHTSimple"),
              Napi::Function::New(env, SHTSimpleBind));

  exports.Set(Napi::String::New(env, "SHTSimpleLookup"),
              Napi::Function::New(env, SHTSimpleLookupBind));
  return exports;
}

NODE_API_MODULE(addon, Init)
