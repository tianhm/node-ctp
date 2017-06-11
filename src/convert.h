#ifndef CONVERT_H
#define CONVERT_H

#include <cstring>

namespace node_ctp {

using std::string;

inline void GetNodeObjectInt(Isolate *isolate, Local<Object> obj,
                             const char *key, int &out) {
  Local<String> key_ = String::NewFromUtf8(isolate, key);
  if (obj->Has(key_)) {
    Local<Value> value =
        obj->Get(isolate->GetCurrentContext(), key_).ToLocalChecked();
    if (value->IsInt32()) {
      out = value->Int32Value();
    }
  }
}

inline void GetNodeObjectDouble(Isolate *isolate, Local<Object> obj,
                                const char *key, double &out) {
  Local<String> key_ = String::NewFromUtf8(isolate, key);
  if (obj->Has(key_)) {
    Local<Value> value =
        obj->Get(isolate->GetCurrentContext(), key_).ToLocalChecked();
    if (value->IsNumber()) {
      out = value->NumberValue();
    }
  }
}

inline void GetNodeObjectChar(Isolate *isolate, Local<Object> obj,
                              const char *key, char &out) {
  Local<String> key_ = String::NewFromUtf8(isolate, key);
  if (obj->Has(key_)) {
    Local<Value> value =
        obj->Get(isolate->GetCurrentContext(), key_).ToLocalChecked();
    if (value->IsString()) {
      String::Utf8Value str(value);
      if (str.length() == 1) {
        out = (*str)[0];
      }
    }
  }
}

inline void GetNodeObjectString(Isolate *isolate, Local<Object> obj,
                                const char *key, char *out) {
  Local<String> key_ = String::NewFromUtf8(isolate, key);
  if (obj->Has(key_)) {
    Local<Value> value =
        obj->Get(isolate->GetCurrentContext(), key_).ToLocalChecked();
    if (value->IsString()) {
      String::Utf8Value str(value);
      strncpy(out, *str, str.length());
    }
  }
}

} /* node_ctp */

#endif /* CONVERT_H */