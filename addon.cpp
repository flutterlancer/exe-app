#include <napi.h>
#include <windows.h>

Napi::Value EnableAffinity(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  auto buffer = info[0].As<Napi::Buffer<char>>();
  HWND hwnd = *(HWND*)buffer.Data();

  BOOL ok = SetWindowDisplayAffinity(hwnd, WDA_MONITOR);
  return Napi::Boolean::New(env, ok);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("enableAffinity", Napi::Function::New(env, EnableAffinity));
  return exports;
}

NODE_API_MODULE(addon, Init)
