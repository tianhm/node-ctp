#ifndef BATON_H
#define BATON_H

#include <node.h>

/**
 * 此文件中定义MD和TD中通用的Baton数据结构
 * 用于在libuv异步接口中传递相关数据
 */

namespace node_ctp {

using namespace v8;
using std::string;
using std::shared_ptr;

/**
 * API请求Baton
 */
class RequestBaton {
 public:
  RequestBaton(Local<Function> &callback, void *that, int ev)
      : RequestBaton(callback, that, ev, nullptr, -1) {}

  RequestBaton(Local<Function> &callback, void *that, int ev,
               shared_ptr<void> data)
      : RequestBaton(callback, that, ev, data, -1) {}

  RequestBaton(Local<Function> &callback, void *that, int ev,
               shared_ptr<void> data, int request_id)
      : that(that), ev(ev), data(data), request_id(request_id) {
    this->work.data = this;
    this->callback.Reset(Isolate::GetCurrent(), callback);
  }

  ~RequestBaton() {
    /* 释放Node层回调函数引用计数，以通知GC回收 */
    callback.Reset();
  }

 public:
  /* libuv相关数据 */
  uv_work_t work;

  /* Node层回调函数 */
  Persistent<Function> callback;

  /* C++类实例, 指向CtpMd或CtpTd */
  void *that;

  /* 事件类型 */
  int ev;

  /* 事件数据 */
  shared_ptr<void> data;

  /* 事件请求ID */
  int request_id;

  /* 事件返回 */
  struct {
    shared_ptr<void> s;
    int n;
  } ret;

  /* 错误信息 */
  string errmsg;
};

/**
 * SPI响应Baton
 */
class ResponseBaton {
 public:
  ResponseBaton(int ev) : ResponseBaton(ev, nullptr, nullptr, -1, true) {}

  ResponseBaton(int ev, shared_ptr<void> data)
      : ResponseBaton(ev, data, nullptr, -1, true) {}

  ResponseBaton(int ev, shared_ptr<void> data, shared_ptr<void> error)
      : ResponseBaton(ev, data, error, -1, true) {}

  ResponseBaton(int ev, shared_ptr<void> error, int rquest_id, bool last)
      : ResponseBaton(ev, nullptr, error, request_id, last) {}

  ResponseBaton(int ev, shared_ptr<void> data, shared_ptr<void> error,
                int request_id, bool last)
      : ev(ev), data(data), error(error), request_id(request_id), last(last) {}

 public:
  /* 事件类型 */
  int ev;

  /* 事件数据 */
  shared_ptr<void> data;

  /* 事件错误信息 */
  shared_ptr<void> error;

  /* 事件请求ID */
  int request_id;

  /* 事件结束标志 */
  bool last;
};

} /* namespace node_ctp */

#endif /* BATON_H */