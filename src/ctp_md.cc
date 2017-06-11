#include "ctp_md.h"
#include "baton.h"
#include "convert.h"

namespace node_ctp {

using namespace v8;
using namespace node;

using std::string;
using std::unordered_map;
using std::shared_ptr;
using std::vector;

/* -----------------------------------------------------------------------------
 * 事件枚举
 * -----------------------------------------------------------------------------
 */

/**
 * API请求事件类型
 * @remark CTP自身的EV_RELEASE和EV_JOIN不稳定, 使用自定义EV_EXIT安全退出
 */
enum RequestEvent {
  EV_CREATE_FTDC_MD_API = 0,
  EV_GET_API_VERSION = 1,
  EV_RELEASE = 2,
  EV_INIT = 3,
  EV_JOIN = 4,
  EV_GET_TRADING_DAY = 5,
  EV_REGISTER_FRONT = 6,
  EV_REGISTER_NAME_SERVER = 7,
  EV_REGISTER_FENS_USER_INFO = 8,
  EV_REGISTER_SPI = 9,
  EV_SUBSCRIBE_MARKET_DATA = 10,
  EV_UN_SUBSCRIBE_MARKET_DATA = 11,
  EV_SUBSCRIBE_FOR_QUOTE_RSP = 12,
  EV_UN_SUBSCRIBE_FOR_QUOTE_RSP = 13,
  EV_REQ_USER_LOGIN = 14,
  EV_REQ_USER_LOGOUT = 15,
  EV_EXIT = 16,
};

/**
 * SPI响应事件类型
 */
enum ResponseEvent {
  EV_ON_FRONT_CONNECTED = 0,
  EV_ON_FRONT_DISCONNECTED = 1,
  EV_ON_HEART_BEAT_WARNING = 2,
  EV_ON_RSP_USER_LOGIN = 3,
  EV_ON_RSP_USER_LOGOUT = 4,
  EV_ON_RSP_ERROR = 5,
  EV_ON_RSP_SUB_MARKET_DATA = 6,
  EV_ON_RSP_UN_SUB_MARKET_DATA = 7,
  EV_ON_RSP_SUB_FOR_QUOTE_RSP = 8,
  EV_ON_RSP_UN_SUB_FOR_QUOTE_RSP = 9,
  EV_ON_RTN_DEPTH_MARKET_DATA = 10,
  EV_ON_RTN_FOR_QUOTE_RSP = 11,
};

/* -----------------------------------------------------------------------------
 * 静态成员初始化
 * -----------------------------------------------------------------------------
 */

Persistent<Function> CtpMd::constructor_;

/* 定义Node层事件字符串->C++层枚举的映射 */
unordered_map<string, int> CtpMd::event_map_ = {
    {"FrontConnected", EV_ON_FRONT_CONNECTED},
    {"FrontDisconnected", EV_ON_FRONT_DISCONNECTED},
    {"HeartBeatWarning", EV_ON_HEART_BEAT_WARNING},
    {"RspUserLogin", EV_ON_RSP_USER_LOGIN},
    {"RspUserLogout", EV_ON_RSP_USER_LOGOUT},
    {"RspError", EV_ON_RSP_ERROR},
    {"RspSubMarketData", EV_ON_RSP_SUB_MARKET_DATA},
    {"RspUnSubMarketData", EV_ON_RSP_UN_SUB_MARKET_DATA},
    {"RspSubForQuoteRsp", EV_ON_RSP_SUB_FOR_QUOTE_RSP},
    {"RspUnSubForQuoteRsp", EV_ON_RSP_UN_SUB_FOR_QUOTE_RSP},
    {"RtnDepthMarketData", EV_ON_RTN_DEPTH_MARKET_DATA},
    {"RtnForQuoteRsp", EV_ON_RTN_FOR_QUOTE_RSP},
};

/* -----------------------------------------------------------------------------
 * CtpMd类函数
 * -----------------------------------------------------------------------------
 */

CtpMd::CtpMd() : api_(NULL) {
  uv_async_init(uv_default_loop(), &async_, ResponseAsyncAfter);
}

CtpMd::~CtpMd() { uv_close(reinterpret_cast<uv_handle_t *>(&async_), NULL); }

/**
 * 初始化C++类到Node模块
 */
void CtpMd::InitNodeClass(Local<Object> exports) {
  Isolate *isolate = exports->GetIsolate();

  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
  tpl->SetClassName(String::NewFromUtf8(isolate, "CtpMd"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  NODE_SET_PROTOTYPE_METHOD(tpl, "createFtdcMdApi", CreateFtdcMdApi);
  NODE_SET_PROTOTYPE_METHOD(tpl, "getApiVersion", GetApiVersion);
  NODE_SET_PROTOTYPE_METHOD(tpl, "release", Release);
  NODE_SET_PROTOTYPE_METHOD(tpl, "init", Init);
  NODE_SET_PROTOTYPE_METHOD(tpl, "join", Join);
  NODE_SET_PROTOTYPE_METHOD(tpl, "getTradingDay", GetTradingDay);
  NODE_SET_PROTOTYPE_METHOD(tpl, "registerFront", RegisterFront);
  NODE_SET_PROTOTYPE_METHOD(tpl, "registerNameServer", RegisterNameServer);
  NODE_SET_PROTOTYPE_METHOD(tpl, "registerFensUserInfo", RegisterFensUserInfo);
  NODE_SET_PROTOTYPE_METHOD(tpl, "registerSpi", RegisterSpi);
  NODE_SET_PROTOTYPE_METHOD(tpl, "subscribeMarketData", SubscribeMarketData);
  NODE_SET_PROTOTYPE_METHOD(tpl, "unSubscribeMarketData",
                            UnSubscribeMarketData);
  NODE_SET_PROTOTYPE_METHOD(tpl, "subscribeForQuoteRsp", SubscribeForQuoteRsp);
  NODE_SET_PROTOTYPE_METHOD(tpl, "unSubscribeForQuoteRsp",
                            UnSubscribeForQuoteRsp);
  NODE_SET_PROTOTYPE_METHOD(tpl, "reqUserLogin", ReqUserLogin);
  NODE_SET_PROTOTYPE_METHOD(tpl, "reqUserLogout", ReqUserLogout);
  NODE_SET_PROTOTYPE_METHOD(tpl, "exit", Exit);
  NODE_SET_PROTOTYPE_METHOD(tpl, "on", On);

  constructor_.Reset(isolate, tpl->GetFunction());
  exports->Set(String::NewFromUtf8(isolate, "CtpMd"), tpl->GetFunction());
}

/**
 * Node层构造函数
 */
void CtpMd::New(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();

  if (args.IsConstructCall()) {
    /* Invoked as constructor: `new CtpMd(...)` */
    CtpMd *that = new CtpMd();
    that->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
  } else {
    /* Invoked as plain function `CtpMd()`, turn into constructor call */
    Local<Context> ctx = isolate->GetCurrentContext();
    Local<Function> cons = Local<Function>::New(isolate, constructor_);
    Local<Object> ret = cons->NewInstance(ctx).ToLocalChecked();
    args.GetReturnValue().Set(ret);
  }
}

/* ---------------------------------------------------------------------------
 * API接口
 * ---------------------------------------------------------------------------
 */

/**
 * 创建MdApi
 * @param pszFlowPath 存贮订阅信息文件的目录, 默认为当前目录
 * @return 创建出的UserApi
 * modify for udp marketdata
 */
void CtpMd::CreateFtdcMdApi(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();

  if (!args[0]->IsString() || !args[1]->IsFunction()) {
    isolate->ThrowException(
        Exception::TypeError(String::NewFromUtf8(isolate, "Wrong arguments")));
    return;
  }

  CtpMd *that = ObjectWrap::Unwrap<CtpMd>(args.Holder());
  String::Utf8Value flow_path(args[0]);
  Local<Function> cb = Local<Function>::Cast(args[1]);

  RequestBaton *baton =
      new RequestBaton(cb, that, EV_CREATE_FTDC_MD_API,
                       shared_ptr<void>(new string(*flow_path)));
  uv_queue_work(uv_default_loop(), &baton->work, RequestAsync,
                RequestAsyncAfter);
}

/**
 * 获取API的版本信息
 * @retrun 获取到的版本号
 */
void CtpMd::GetApiVersion(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();

  if (!args[0]->IsFunction()) {
    isolate->ThrowException(
        Exception::TypeError(String::NewFromUtf8(isolate, "Wrong arguments")));
    return;
  }

  CtpMd *that = ObjectWrap::Unwrap<CtpMd>(args.Holder());
  Local<Function> cb = Local<Function>::Cast(args[0]);

  RequestBaton *baton = new RequestBaton(cb, that, EV_GET_API_VERSION);
  uv_queue_work(uv_default_loop(), &baton->work, RequestAsync,
                RequestAsyncAfter);
}

/**
 * 删除接口对象本身
 * @remark 不再使用本接口对象时,调用该函数删除接口对象
 */
void CtpMd::Release(const FunctionCallbackInfo<Value> &args) { /* 未用 */
}

/**
 * 初始化
 * @remark 初始化运行环境,只有调用后,接口才开始工作
 */
void CtpMd::Init(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();

  if (!args[0]->IsFunction()) {
    isolate->ThrowException(
        Exception::TypeError(String::NewFromUtf8(isolate, "Wrong arguments")));
    return;
  }

  CtpMd *that = ObjectWrap::Unwrap<CtpMd>(args.Holder());
  Local<Function> cb = Local<Function>::Cast(args[0]);

  RequestBaton *baton = new RequestBaton(cb, that, EV_INIT);
  uv_queue_work(uv_default_loop(), &baton->work, RequestAsync,
                RequestAsyncAfter);
}

/**
 * 等待接口线程结束运行
 * @return 线程退出代码
 */
void CtpMd::Join(const FunctionCallbackInfo<Value> &args) { /* 未用 */
}

/**
 * 获取当前交易日
 * @retrun 获取到的交易日
 * @remark 只有登录成功后,才能得到正确的交易日
 */
void CtpMd::GetTradingDay(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();

  if (!args[0]->IsFunction()) {
    isolate->ThrowException(
        Exception::TypeError(String::NewFromUtf8(isolate, "Wrong arguments")));
    return;
  }

  CtpMd *that = ObjectWrap::Unwrap<CtpMd>(args.Holder());
  Local<Function> cb = Local<Function>::Cast(args[0]);

  RequestBaton *baton = new RequestBaton(cb, that, EV_GET_TRADING_DAY);
  uv_queue_work(uv_default_loop(), &baton->work, RequestAsync,
                RequestAsyncAfter);
}

/**
 * 注册前置机网络地址
 * @param pszFrontAddress: 前置机网络地址
 * @remark 网络地址的格式为: "protocol: *ipaddress:port", 如: "tcp:
 * 127.0.0.1:17001"
 * @remark "tcp"代表传输协议, "127.0.0.1"代表服务器地址.
 * "17001"代表服务器端口号
 */
void CtpMd::RegisterFront(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();

  if (!args[0]->IsString() || !args[1]->IsFunction()) {
    isolate->ThrowException(
        Exception::TypeError(String::NewFromUtf8(isolate, "Wrong arguments")));
    return;
  }

  CtpMd *that = ObjectWrap::Unwrap<CtpMd>(args.Holder());
  String::Utf8Value addr(args[0]);
  Local<Function> cb = Local<Function>::Cast(args[1]);

  RequestBaton *baton = new RequestBaton(cb, that, EV_REGISTER_FRONT,
                                         shared_ptr<void>(new string(*addr)));
  uv_queue_work(uv_default_loop(), &baton->work, RequestAsync,
                RequestAsyncAfter);
}

/**
 * 注册名字服务器网络地址
 * @param pszNsAddress: 名字服务器网络地址
 * @remark 网络地址的格式为: "protocol: *ipaddress:port", 如: "tcp:
 * 127.0.0.1:12001"
 * @remark "tcp"代表传输协议, "127.0.0.1"代表服务器地址.
 * "12001"代表服务器端口号
 * @remark RegisterNameServer优先于RegisterFront
 */
void CtpMd::RegisterNameServer(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();

  if (!args[0]->IsString() || !args[1]->IsFunction()) {
    isolate->ThrowException(
        Exception::TypeError(String::NewFromUtf8(isolate, "Wrong arguments")));
    return;
  }

  CtpMd *that = ObjectWrap::Unwrap<CtpMd>(args.Holder());
  String::Utf8Value addr(args[0]);
  Local<Function> cb = Local<Function>::Cast(args[1]);

  RequestBaton *baton = new RequestBaton(cb, that, EV_REGISTER_NAME_SERVER,
                                         shared_ptr<void>(new string(*addr)));
  uv_queue_work(uv_default_loop(), &baton->work, RequestAsync,
                RequestAsyncAfter);
}

/**
 * 注册名字服务器用户信息
 * @param pFensUserInfo: 用户信息
 */
void CtpMd::RegisterFensUserInfo(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();

  if (!args[0]->IsObject() || !args[1]->IsFunction()) {
    isolate->ThrowException(
        Exception::TypeError(String::NewFromUtf8(isolate, "Wrong arguments")));
    return;
  }

  CtpMd *that = ObjectWrap::Unwrap<CtpMd>(args.Holder());
  Local<Object> obj = args[0]->ToObject();
  Local<Function> cb = Local<Function>::Cast(args[1]);

  CThostFtdcFensUserInfoField *data = new CThostFtdcFensUserInfoField;
  memset(data, 0x0, sizeof(*data));
  /* 经纪公司代码 */
  GetNodeObjectString(isolate, obj, "BrokerID", data->BrokerID);
  /* 用户代码 */
  GetNodeObjectString(isolate, obj, "UserID", data->UserID);
  /* 登录模式 */
  GetNodeObjectChar(isolate, obj, "LoginMode", data->LoginMode);

  RequestBaton *baton = new RequestBaton(cb, that, EV_REGISTER_FENS_USER_INFO,
                                         shared_ptr<void>(data));
  uv_queue_work(uv_default_loop(), &baton->work, RequestAsync,
                RequestAsyncAfter);
}

/**
 * 注册回调接口
 * @param pSpi 派生自回调接口类的实例
 */
void CtpMd::RegisterSpi(const FunctionCallbackInfo<Value> &args) { /* 未用 */
}

/**
 * 订阅行情
 * @param ppInstrumentID 合约ID
 * @param nCount 要订阅/退订行情的合约个数
 * @remark
 */
void CtpMd::SubscribeMarketData(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();

  if (!args[0]->IsArray() || !args[1]->IsFunction()) {
    isolate->ThrowException(
        Exception::TypeError(String::NewFromUtf8(isolate, "Wrong arguments")));
    return;
  }

  CtpMd *that = ObjectWrap::Unwrap<CtpMd>(args.Holder());
  Local<Array> array = Local<Array>::Cast(args[0]);
  Local<Function> cb = Local<Function>::Cast(args[1]);

  vector<string> *data = new vector<string>;
  for (unsigned int i = 0; i < array->Length(); ++i) {
    Local<Value> v = array->Get(i);
    if (v->IsString()) {
      data->push_back(string(*String::Utf8Value(v)));
    }
  }

  RequestBaton *baton = new RequestBaton(cb, that, EV_SUBSCRIBE_MARKET_DATA,
                                         shared_ptr<void>(data));
  uv_queue_work(uv_default_loop(), &baton->work, RequestAsync,
                RequestAsyncAfter);
}

/**
 * 退订行情
 * @param ppInstrumentID 合约ID
 * @param nCount 要订阅/退订行情的合约个数
 * @remark
 */
void CtpMd::UnSubscribeMarketData(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();

  if (!args[0]->IsArray() || !args[1]->IsFunction()) {
    isolate->ThrowException(
        Exception::TypeError(String::NewFromUtf8(isolate, "Wrong arguments")));
    return;
  }

  CtpMd *that = ObjectWrap::Unwrap<CtpMd>(args.Holder());
  Local<Array> array = Local<Array>::Cast(args[0]);
  Local<Function> cb = Local<Function>::Cast(args[1]);

  vector<string> *data = new vector<string>;
  for (unsigned int i = 0; i < array->Length(); ++i) {
    Local<Value> v = array->Get(i);
    if (v->IsString()) {
      data->push_back(string(*String::Utf8Value(v)));
    }
  }

  RequestBaton *baton = new RequestBaton(cb, that, EV_UN_SUBSCRIBE_MARKET_DATA,
                                         shared_ptr<void>(data));
  uv_queue_work(uv_default_loop(), &baton->work, RequestAsync,
                RequestAsyncAfter);
}

/**
 * 订阅询价
 * @param ppInstrumentID 合约ID
 * @param nCount 要订阅/退订行情的合约个数
 * @remark
 */
void CtpMd::SubscribeForQuoteRsp(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();

  if (!args[0]->IsArray() || !args[1]->IsFunction()) {
    isolate->ThrowException(
        Exception::TypeError(String::NewFromUtf8(isolate, "Wrong arguments")));
    return;
  }

  CtpMd *that = ObjectWrap::Unwrap<CtpMd>(args.Holder());
  Local<Array> array = Local<Array>::Cast(args[0]);
  Local<Function> cb = Local<Function>::Cast(args[1]);

  vector<string> *data = new vector<string>;
  for (unsigned int i = 0; i < array->Length(); ++i) {
    Local<Value> v = array->Get(i);
    if (v->IsString()) {
      data->push_back(string(*String::Utf8Value(v)));
    }
  }

  RequestBaton *baton = new RequestBaton(cb, that, EV_SUBSCRIBE_FOR_QUOTE_RSP,
                                         shared_ptr<void>(data));
  uv_queue_work(uv_default_loop(), &baton->work, RequestAsync,
                RequestAsyncAfter);
}

/**
 * 退订询价
 * @param ppInstrumentID 合约ID
 * @param nCount 要订阅/退订行情的合约个数
 * @remark
 */
void CtpMd::UnSubscribeForQuoteRsp(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();

  if (!args[0]->IsArray() || !args[1]->IsFunction()) {
    isolate->ThrowException(
        Exception::TypeError(String::NewFromUtf8(isolate, "Wrong arguments")));
    return;
  }

  CtpMd *that = ObjectWrap::Unwrap<CtpMd>(args.Holder());
  Local<Array> array = Local<Array>::Cast(args[0]);
  Local<Function> cb = Local<Function>::Cast(args[1]);

  vector<string> *data = new vector<string>;
  for (unsigned int i = 0; i < array->Length(); ++i) {
    Local<Value> v = array->Get(i);
    if (v->IsString()) {
      data->push_back(string(*String::Utf8Value(v)));
    }
  }

  RequestBaton *baton = new RequestBaton(
      cb, that, EV_UN_SUBSCRIBE_FOR_QUOTE_RSP, shared_ptr<void>(data));
  uv_queue_work(uv_default_loop(), &baton->work, RequestAsync,
                RequestAsyncAfter);
}

/**
 * 用户登录请求
 */
void CtpMd::ReqUserLogin(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();

  if (!args[0]->IsObject() || !args[1]->IsInt32() || !args[2]->IsFunction()) {
    isolate->ThrowException(
        Exception::TypeError(String::NewFromUtf8(isolate, "Wrong arguments")));
    return;
  }

  CtpMd *that = ObjectWrap::Unwrap<CtpMd>(args.Holder());
  Local<Object> obj = args[0]->ToObject();
  int request_id = args[1]->Int32Value();
  Local<Function> cb = Local<Function>::Cast(args[2]);

  CThostFtdcReqUserLoginField *data = new CThostFtdcReqUserLoginField;
  memset(data, 0x0, sizeof(*data));

  /* 交易日 */
  GetNodeObjectString(isolate, obj, "TradingDay", data->TradingDay);
  /* 经纪公司代码 */
  GetNodeObjectString(isolate, obj, "BrokerID", data->BrokerID);
  /* 用户代码 */
  GetNodeObjectString(isolate, obj, "UserID", data->UserID);
  /* 密码 */
  GetNodeObjectString(isolate, obj, "Password", data->Password);
  /* 用户端产品信息 */
  GetNodeObjectString(isolate, obj, "UserProductInfo", data->UserProductInfo);
  /* 接口端产品信息 */
  GetNodeObjectString(isolate, obj, "InterfaceProductInfo",
                      data->InterfaceProductInfo);
  /* 协议信息 */
  GetNodeObjectString(isolate, obj, "ProtocolInfo", data->ProtocolInfo);
  /* Mac地址 */
  GetNodeObjectString(isolate, obj, "MacAddress", data->MacAddress);
  /* 动态密码 */
  GetNodeObjectString(isolate, obj, "OneTimePassword", data->OneTimePassword);
  /* 终端IP地址 */
  GetNodeObjectString(isolate, obj, "ClientIPAddress", data->ClientIPAddress);
  /* 登录备注 */
  GetNodeObjectString(isolate, obj, "LoginRemark", data->LoginRemark);

  RequestBaton *baton = new RequestBaton(cb, that, EV_REQ_USER_LOGIN,
                                         shared_ptr<void>(data), request_id);
  uv_queue_work(uv_default_loop(), &baton->work, RequestAsync,
                RequestAsyncAfter);
}

/**
 * 登出请求
 */
void CtpMd::ReqUserLogout(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();

  if (!args[0]->IsObject() || !args[1]->IsInt32() || !args[2]->IsFunction()) {
    isolate->ThrowException(
        Exception::TypeError(String::NewFromUtf8(isolate, "Wrong arguments")));
    return;
  }

  CtpMd *that = ObjectWrap::Unwrap<CtpMd>(args.Holder());
  Local<Object> obj = args[0]->ToObject();
  int request_id = args[1]->Int32Value();
  Local<Function> cb = Local<Function>::Cast(args[2]);

  CThostFtdcUserLogoutField *data = new CThostFtdcUserLogoutField;
  memset(data, 0x0, sizeof(*data));

  /* 经纪公司代码 */
  GetNodeObjectString(isolate, obj, "BrokerID", data->BrokerID);
  /* 用户代码 */
  GetNodeObjectString(isolate, obj, "UserID", data->UserID);

  RequestBaton *baton = new RequestBaton(cb, that, EV_REQ_USER_LOGOUT,
                                         shared_ptr<void>(data), request_id);
  uv_queue_work(uv_default_loop(), &baton->work, RequestAsync,
                RequestAsyncAfter);
}

/**
 * 安全退出
 */
void CtpMd::Exit(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();

  if (!args[0]->IsFunction()) {
    isolate->ThrowException(
        Exception::TypeError(String::NewFromUtf8(isolate, "Wrong arguments")));
    return;
  }

  CtpMd *that = ObjectWrap::Unwrap<CtpMd>(args.Holder());
  Local<Function> cb = Local<Function>::Cast(args[0]);

  RequestBaton *baton = new RequestBaton(cb, that, EV_EXIT);
  uv_queue_work(uv_default_loop(), &baton->work, RequestAsync,
                RequestAsyncAfter);
}

/* ---------------------------------------------------------------------------
 * SPI接口
 * ---------------------------------------------------------------------------
 */

/**
 * 当客户端与交易后台建立起通信连接时(还未登录前), 该方法被调用
 */
void CtpMd::OnFrontConnected() {
  ResponseAsyncSend(new ResponseBaton(EV_ON_FRONT_CONNECTED));
}

/**
 * 当客户端与交易后台通信连接断开时, 该方法被调用. 当发生这个情况后,
 * API会自动重新连接, 客户端可不做处理
 * @param nReason 错误原因
 *         0x1001 网络读失败
 *         0x1002 网络写失败
 *         0x2001 接收心跳超时
 *         0x2002 发送心跳失败
 *         0x2003 收到错误报文
 */
void CtpMd::OnFrontDisconnected(int reason) {
  ResponseAsyncSend(new ResponseBaton(EV_ON_FRONT_DISCONNECTED,
                                      shared_ptr<void>(new int(reason))));
}

/**
 * 心跳超时警告. 当长时间未收到报文时, 该方法被调用
 * @param nTimeLapse 距离上次接收报文的时间
 */
void CtpMd::OnHeartBeatWarning(int time_lapse) {
  ResponseAsyncSend(new ResponseBaton(EV_ON_HEART_BEAT_WARNING,
                                      shared_ptr<void>(new int(time_lapse))));
}

/**
 * 登录请求响应
 */
void CtpMd::OnRspUserLogin(CThostFtdcRspUserLoginField *data,
                           CThostFtdcRspInfoField *error, int request_id,
                           bool last) {
  ResponseAsyncSend(new ResponseBaton(
      EV_ON_RSP_USER_LOGIN,
      shared_ptr<void>(data ? new CThostFtdcRspUserLoginField(*data) : NULL),
      shared_ptr<void>(error ? new CThostFtdcRspInfoField(*error) : NULL),
      request_id, last));
}

/**
 * 登出请求响应
 */
void CtpMd::OnRspUserLogout(CThostFtdcUserLogoutField *data,
                            CThostFtdcRspInfoField *error, int request_id,
                            bool last) {
  ResponseAsyncSend(new ResponseBaton(
      EV_ON_RSP_USER_LOGOUT,
      shared_ptr<void>(data ? new CThostFtdcUserLogoutField(*data) : NULL),
      shared_ptr<void>(error ? new CThostFtdcRspInfoField(*error) : NULL),
      request_id, last));
}

/**
 * 错误应答
 */
void CtpMd::OnRspError(CThostFtdcRspInfoField *error, int request_id,
                       bool last) {
  ResponseAsyncSend(new ResponseBaton(
      EV_ON_RSP_ERROR,
      shared_ptr<void>(error ? new CThostFtdcRspInfoField(*error) : NULL),
      request_id, last));
}

/**
 * 订阅行情应答
 */
void CtpMd::OnRspSubMarketData(CThostFtdcSpecificInstrumentField *data,
                               CThostFtdcRspInfoField *error, int request_id,
                               bool last) {
  ResponseAsyncSend(new ResponseBaton(
      EV_ON_RSP_SUB_MARKET_DATA,
      shared_ptr<void>(data ? new CThostFtdcSpecificInstrumentField(*data)
                            : NULL),
      shared_ptr<void>(error ? new CThostFtdcRspInfoField(*error) : NULL),
      request_id, last));
}

/**
 * 取消订阅行情应答
 */
void CtpMd::OnRspUnSubMarketData(CThostFtdcSpecificInstrumentField *data,
                                 CThostFtdcRspInfoField *error, int request_id,
                                 bool last) {
  ResponseAsyncSend(new ResponseBaton(
      EV_ON_RSP_UN_SUB_MARKET_DATA,
      shared_ptr<void>(data ? new CThostFtdcSpecificInstrumentField(*data)
                            : NULL),
      shared_ptr<void>(error ? new CThostFtdcRspInfoField(*error) : NULL),
      request_id, last));
}

/**
 * 订阅询价应答
 */
void CtpMd::OnRspSubForQuoteRsp(CThostFtdcSpecificInstrumentField *data,
                                CThostFtdcRspInfoField *error, int request_id,
                                bool last) {
  ResponseAsyncSend(new ResponseBaton(
      EV_ON_RSP_SUB_FOR_QUOTE_RSP,
      shared_ptr<void>(data ? new CThostFtdcSpecificInstrumentField(*data)
                            : NULL),
      shared_ptr<void>(error ? new CThostFtdcRspInfoField(*error) : NULL),
      request_id, last));
}

/**
 * 取消订阅询价应答
 */
void CtpMd::OnRspUnSubForQuoteRsp(CThostFtdcSpecificInstrumentField *data,
                                  CThostFtdcRspInfoField *error, int request_id,
                                  bool last) {
  ResponseAsyncSend(new ResponseBaton(
      EV_ON_RSP_UN_SUB_FOR_QUOTE_RSP,
      shared_ptr<void>(data ? new CThostFtdcSpecificInstrumentField(*data)
                            : NULL),
      shared_ptr<void>(error ? new CThostFtdcRspInfoField(*error) : NULL),
      request_id, last));
}

/**
 * 深度行情通知
 */
void CtpMd::OnRtnDepthMarketData(CThostFtdcDepthMarketDataField *data) {
  ResponseAsyncSend(new ResponseBaton(
      EV_ON_RTN_DEPTH_MARKET_DATA,
      shared_ptr<void>(data ? new CThostFtdcDepthMarketDataField(*data)
                            : NULL)));
}

/**
 * 询价通知
 */
void CtpMd::OnRtnForQuoteRsp(CThostFtdcForQuoteRspField *data) {
  ResponseAsyncSend(new ResponseBaton(
      EV_ON_RTN_FOR_QUOTE_RSP,
      shared_ptr<void>(data ? new CThostFtdcForQuoteRspField(*data) : NULL)));
}

/* ---------------------------------------------------------------------------
 * 异步相关
 * ---------------------------------------------------------------------------
 */

/**
 * Node层注册SPI事件回调
 */
void CtpMd::On(const FunctionCallbackInfo<Value> &args) {
  Isolate *isolate = args.GetIsolate();

  if (!args[0]->IsString() || !args[1]->IsFunction()) {
    isolate->ThrowException(
        Exception::TypeError(String::NewFromUtf8(isolate, "Wrong arguments")));
    return;
  }

  CtpMd *that = ObjectWrap::Unwrap<CtpMd>(args.Holder());
  String::Utf8Value ev(args[0]);
  Local<Function> cb = Local<Function>::Cast(args[1]);

  unordered_map<string, int>::iterator eIt = event_map_.find(*ev);
  if (eIt == event_map_.end()) {
    isolate->ThrowException(
        Exception::Error(String::NewFromUtf8(isolate, "Unknown event")));
    return;
  }

/* C++层每个事件只保存一个Node层回调函数, 如果事件已经注册则直接覆盖 */
#if 0
  unordered_map<int, Persistent<Function>>::iterator cIt =
      that->callback_map_.find(eIt->second);
  if (cIt != that->callback_map_.end()) {
    isolate->ThrowException(
        Exception::Error(String::NewFromUtf8(isolate, "Duplicate event")));
    return;
  }
#endif

  that->callback_map_[eIt->second].Reset(isolate, cb);
}

/**
 * API请求异步执行时调用
 */
void CtpMd::RequestAsync(uv_work_t *work) {
  RequestBaton *baton = static_cast<RequestBaton *>(work->data);
  CtpMd *that = static_cast<CtpMd *>(baton->that);

  switch (baton->ev) {
    case EV_CREATE_FTDC_MD_API: {
      string *flow_path = static_cast<string *>(baton->data.get());
      that->api_ = CThostFtdcMdApi::CreateFtdcMdApi(flow_path->c_str());
      that->api_->RegisterSpi(that);
      break;
    }
    case EV_GET_API_VERSION: {
      baton->ret.s = shared_ptr<void>(new string(that->api_->GetApiVersion()));
      break;
    }
    case EV_RELEASE: {
      /* 未用 */
      break;
    }
    case EV_INIT: {
      that->api_->Init();
      break;
    }
    case EV_JOIN: {
      /* 未用 */
      break;
    }
    case EV_GET_TRADING_DAY: {
      baton->ret.s = shared_ptr<void>(new string(that->api_->GetTradingDay()));
      break;
    }
    case EV_REGISTER_FRONT: {
      string *addr = static_cast<string *>(baton->data.get());
      that->api_->RegisterFront(const_cast<char *>(addr->c_str()));
      break;
    }
    case EV_REGISTER_NAME_SERVER: {
      string *addr = static_cast<string *>(baton->data.get());
      that->api_->RegisterNameServer(const_cast<char *>(addr->c_str()));
      break;
    }
    case EV_REGISTER_FENS_USER_INFO: {
      CThostFtdcFensUserInfoField *data =
          static_cast<CThostFtdcFensUserInfoField *>(baton->data.get());
      that->api_->RegisterFensUserInfo(data);
      break;
    }
    case EV_REGISTER_SPI: {
      /* 未用 */
      break;
    }
    case EV_SUBSCRIBE_MARKET_DATA: {
      vector<string> *data = static_cast<vector<string> *>(baton->data.get());
      vector<char *> vec;

      for (const auto &str : *data) {
        vec.push_back(const_cast<char *>(str.c_str()));
      }

      baton->ret.n = that->api_->SubscribeMarketData(&vec[0], vec.size());
      break;
    }
    case EV_UN_SUBSCRIBE_MARKET_DATA: {
      vector<string> *data = static_cast<vector<string> *>(baton->data.get());
      vector<char *> vec;

      for (const auto &str : *data) {
        vec.push_back(const_cast<char *>(str.c_str()));
      }

      baton->ret.n = that->api_->UnSubscribeMarketData(&vec[0], vec.size());
      break;
    }
    case EV_SUBSCRIBE_FOR_QUOTE_RSP: {
      vector<string> *data = static_cast<vector<string> *>(baton->data.get());
      vector<char *> vec;

      for (const auto &str : *data) {
        vec.push_back(const_cast<char *>(str.c_str()));
      }

      baton->ret.n = that->api_->SubscribeForQuoteRsp(&vec[0], vec.size());
      break;
    }
    case EV_UN_SUBSCRIBE_FOR_QUOTE_RSP: {
      vector<string> *data = static_cast<vector<string> *>(baton->data.get());
      vector<char *> vec;

      for (const auto &str : *data) {
        vec.push_back(const_cast<char *>(str.c_str()));
      }

      baton->ret.n = that->api_->UnSubscribeForQuoteRsp(&vec[0], vec.size());
      break;
    }
    case EV_REQ_USER_LOGIN: {
      CThostFtdcReqUserLoginField *data =
          static_cast<CThostFtdcReqUserLoginField *>(baton->data.get());
      baton->ret.n = that->api_->ReqUserLogin(data, baton->request_id);
      break;
    }
    case EV_REQ_USER_LOGOUT: {
      CThostFtdcUserLogoutField *data =
          static_cast<CThostFtdcUserLogoutField *>(baton->data.get());
      baton->ret.n = that->api_->ReqUserLogout(data, baton->request_id);
      break;
    }
    case EV_EXIT: {
      if (that->api_) {
        that->api_->RegisterSpi(NULL);
        that->api_->Release();
        that->api_ = NULL;
      }
      /* 释放Node默认循环的引用计数, 使其可以在没有其它事件时可以正常退出 */
      uv_unref(reinterpret_cast<uv_handle_t *>(&that->async_));
      break;
    }
    default: {
      baton->errmsg = "Unknown request event";
      break;
    }
  }
}

/**
 * API请求异步执行完成时调用
 */
void CtpMd::RequestAsyncAfter(uv_work_t *work, int status) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Local<Object> ctx = isolate->GetCurrentContext()->Global();
  RequestBaton *baton = static_cast<RequestBaton *>(work->data);
  Local<Function> cb = Local<Function>::New(isolate, baton->callback);

  /* 如果异步执行时出现错误，则将Node层回调函数第一个参数置为对应错误信息
   */
  if (!baton->errmsg.empty()) {
    Local<Value> argv[] = {
        Exception::Error(String::NewFromUtf8(isolate, baton->errmsg.c_str()))};
    MakeCallback(isolate, ctx, cb, 1, argv);
    return;
  }

  switch (baton->ev) {
    /* 以下事件无返回 */
    case EV_CREATE_FTDC_MD_API:
    case EV_RELEASE:
    case EV_INIT:
    case EV_JOIN:
    case EV_REGISTER_FRONT:
    case EV_REGISTER_NAME_SERVER:
    case EV_REGISTER_FENS_USER_INFO:
    case EV_REGISTER_SPI:
    case EV_EXIT: {
      MakeCallback(isolate, ctx, cb, 0, NULL);
      break;
    }

    /* 以下事件返回String */
    case EV_GET_API_VERSION:
    case EV_GET_TRADING_DAY: {
      string *ret = static_cast<string *>(baton->ret.s.get());
      Local<Value> argv[] = {Null(isolate),
                             String::NewFromUtf8(isolate, ret->c_str())};
      MakeCallback(isolate, ctx, cb, 2, argv);
      break;
    }

    /* 以下事件返回Number */
    case EV_SUBSCRIBE_MARKET_DATA:
    case EV_UN_SUBSCRIBE_MARKET_DATA:
    case EV_SUBSCRIBE_FOR_QUOTE_RSP:
    case EV_UN_SUBSCRIBE_FOR_QUOTE_RSP:
    case EV_REQ_USER_LOGIN:
    case EV_REQ_USER_LOGOUT: {
      Local<Value> argv[] = {Null(isolate), Number::New(isolate, baton->ret.n)};
      MakeCallback(isolate, ctx, cb, 2, argv);
      break;
    }
    default: { break; }
  }

  delete baton;
}

/**
 * 从其它线程向主线程中发送事件
 */
void CtpMd::ResponseAsyncSend(ResponseBaton *baton) {
  queue_.Push(baton);
  async_.data = this;
  uv_async_send(&async_);
}

/**
 * 主线程中SPI事件处理函数
 */
void CtpMd::ResponseAsyncAfter(uv_async_t *async) {
  Isolate *isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  Local<Object> ctx = isolate->GetCurrentContext()->Global();
  CtpMd *that = static_cast<CtpMd *>(async->data);
  ResponseBaton *baton = NULL;

  while (that->queue_.TryPop(baton)) {
    /* 检测Node层是否注册了此事件的回调函数 */
    unordered_map<int, Persistent<Function>>::iterator it =
        that->callback_map_.find(baton->ev);
    if (it == that->callback_map_.end()) {
      return;
    }
    Local<Function> cb = Local<Function>::New(isolate, it->second);

    switch (baton->ev) {
      case EV_ON_FRONT_CONNECTED: {
        MakeCallback(isolate, ctx, cb, 0, NULL);
        break;
      }
      case EV_ON_FRONT_DISCONNECTED: {
        Local<Value> argv[] = {
            Number::New(isolate, *static_cast<int *>(baton->data.get()))};
        MakeCallback(isolate, ctx, cb, 1, argv);
        break;
      }
      case EV_ON_HEART_BEAT_WARNING: {
        Local<Value> argv[] = {
            Number::New(isolate, *static_cast<int *>(baton->data.get()))};
        MakeCallback(isolate, ctx, cb, 1, argv);
        break;
      }
      case EV_ON_RSP_USER_LOGIN: {
        CThostFtdcRspUserLoginField *data =
            static_cast<CThostFtdcRspUserLoginField *>(baton->data.get());
        CThostFtdcRspInfoField *error =
            static_cast<CThostFtdcRspInfoField *>(baton->error.get());

        Local<Object> obj_data = Object::New(isolate);
        Local<Object> obj_error = Object::New(isolate);

        if (data) {
          /* 交易日 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "TradingDay"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->TradingDay),
                  NewStringType::kNormal)
                  .ToLocalChecked());
          /* 登录成功时间 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "LoginTime"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->LoginTime),
                  NewStringType::kNormal)
                  .ToLocalChecked());
          /* 经纪公司代码 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "BrokerID"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->BrokerID),
                  NewStringType::kNormal)
                  .ToLocalChecked());
          /* 用户代码 */
          obj_data->Set(String::NewFromUtf8(isolate, "UserID"),
                        String::NewFromOneByte(
                            isolate, reinterpret_cast<uint8_t *>(data->UserID),
                            NewStringType::kNormal)
                            .ToLocalChecked());
          /* 交易系统名称 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "SystemName"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->SystemName),
                  NewStringType::kNormal)
                  .ToLocalChecked());
          /* 前置编号 */
          obj_data->Set(String::NewFromUtf8(isolate, "FrontID"),
                        Number::New(isolate, data->FrontID));
          /* 会话编号 */
          obj_data->Set(String::NewFromUtf8(isolate, "SessionID"),
                        Number::New(isolate, data->SessionID));
          /* 最大报单引用 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "MaxOrderRef"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->MaxOrderRef),
                  NewStringType::kNormal)
                  .ToLocalChecked());
          /* 上期所时间 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "SHFETime"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->SHFETime),
                  NewStringType::kNormal)
                  .ToLocalChecked());
          /* 大商所时间 */
          obj_data->Set(String::NewFromUtf8(isolate, "DCETime"),
                        String::NewFromOneByte(
                            isolate, reinterpret_cast<uint8_t *>(data->DCETime),
                            NewStringType::kNormal)
                            .ToLocalChecked());
          /* 郑商所时间 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "CZCETime"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->CZCETime),
                  NewStringType::kNormal)
                  .ToLocalChecked());
          /* 中金所时间 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "FFEXTime"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->FFEXTime),
                  NewStringType::kNormal)
                  .ToLocalChecked());
          /* 能源中心时间 */
          obj_data->Set(String::NewFromUtf8(isolate, "INETime"),
                        String::NewFromOneByte(
                            isolate, reinterpret_cast<uint8_t *>(data->INETime),
                            NewStringType::kNormal)
                            .ToLocalChecked());
        }

        if (error) {
          /* 错误代码 */
          obj_error->Set(String::NewFromUtf8(isolate, "ErrorID"),
                         Number::New(isolate, error->ErrorID));
          /* 错误信息 */
          obj_error->Set(
              String::NewFromUtf8(isolate, "ErrorMsg"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(error->ErrorMsg),
                  NewStringType::kNormal)
                  .ToLocalChecked());
        }

        Local<Value> argv[] = {obj_data, obj_error,
                               Number::New(isolate, baton->request_id),
                               Boolean::New(isolate, baton->last)};
        MakeCallback(isolate, ctx, cb, 4, argv);
        break;
      }
      case EV_ON_RSP_USER_LOGOUT: {
        CThostFtdcUserLogoutField *data =
            static_cast<CThostFtdcUserLogoutField *>(baton->data.get());
        CThostFtdcRspInfoField *error =
            static_cast<CThostFtdcRspInfoField *>(baton->error.get());

        Local<Object> obj_data = Object::New(isolate);
        Local<Object> obj_error = Object::New(isolate);

        if (data) {
          /* 经纪公司代码 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "BrokerID"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->BrokerID),
                  NewStringType::kNormal)
                  .ToLocalChecked());
          /* 用户代码 */
          obj_data->Set(String::NewFromUtf8(isolate, "UserID"),
                        String::NewFromOneByte(
                            isolate, reinterpret_cast<uint8_t *>(data->UserID),
                            NewStringType::kNormal)
                            .ToLocalChecked());
        }

        if (error) {
          /* 错误代码 */
          obj_error->Set(String::NewFromUtf8(isolate, "ErrorID"),
                         Number::New(isolate, error->ErrorID));
          /* 错误信息 */
          obj_error->Set(
              String::NewFromUtf8(isolate, "ErrorMsg"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(error->ErrorMsg),
                  NewStringType::kNormal)
                  .ToLocalChecked());
        }

        Local<Value> argv[] = {obj_data, obj_error,
                               Number::New(isolate, baton->request_id),
                               Boolean::New(isolate, baton->last)};
        MakeCallback(isolate, ctx, cb, 4, argv);
        break;
      }
      case EV_ON_RSP_ERROR: {
        CThostFtdcRspInfoField *error =
            static_cast<CThostFtdcRspInfoField *>(baton->error.get());

        Local<Object> obj_error = Object::New(isolate);

        if (error) {
          /* 错误代码 */
          obj_error->Set(String::NewFromUtf8(isolate, "ErrorID"),
                         Number::New(isolate, error->ErrorID));
          /* 错误信息 */
          obj_error->Set(
              String::NewFromUtf8(isolate, "ErrorMsg"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(error->ErrorMsg),
                  NewStringType::kNormal)
                  .ToLocalChecked());
        }

        Local<Value> argv[] = {obj_error,
                               Number::New(isolate, baton->request_id),
                               Boolean::New(isolate, baton->last)};
        MakeCallback(isolate, ctx, cb, 3, argv);
        break;
      }
      case EV_ON_RSP_SUB_MARKET_DATA: {
        CThostFtdcSpecificInstrumentField *data =
            static_cast<CThostFtdcSpecificInstrumentField *>(baton->data.get());
        CThostFtdcRspInfoField *error =
            static_cast<CThostFtdcRspInfoField *>(baton->error.get());

        Local<Object> obj_data = Object::New(isolate);
        Local<Object> obj_error = Object::New(isolate);

        if (data) {
          /* 合约代码 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "InstrumentID"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->InstrumentID),
                  NewStringType::kNormal)
                  .ToLocalChecked());
        }

        if (error) {
          /* 错误代码 */
          obj_error->Set(String::NewFromUtf8(isolate, "ErrorID"),
                         Number::New(isolate, error->ErrorID));
          /* 错误信息 */
          obj_error->Set(
              String::NewFromUtf8(isolate, "ErrorMsg"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(error->ErrorMsg),
                  NewStringType::kNormal)
                  .ToLocalChecked());
        }

        Local<Value> argv[] = {obj_data, obj_error,
                               Number::New(isolate, baton->request_id),
                               Boolean::New(isolate, baton->last)};
        MakeCallback(isolate, ctx, cb, 4, argv);
        break;
      }
      case EV_ON_RSP_UN_SUB_MARKET_DATA: {
        CThostFtdcSpecificInstrumentField *data =
            static_cast<CThostFtdcSpecificInstrumentField *>(baton->data.get());
        CThostFtdcRspInfoField *error =
            static_cast<CThostFtdcRspInfoField *>(baton->error.get());

        Local<Object> obj_data = Object::New(isolate);
        Local<Object> obj_error = Object::New(isolate);

        if (data) {
          /* 合约代码 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "InstrumentID"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->InstrumentID),
                  NewStringType::kNormal)
                  .ToLocalChecked());
        }

        if (error) {
          /* 错误代码 */
          obj_error->Set(String::NewFromUtf8(isolate, "ErrorID"),
                         Number::New(isolate, error->ErrorID));
          /* 错误信息 */
          obj_error->Set(
              String::NewFromUtf8(isolate, "ErrorMsg"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(error->ErrorMsg),
                  NewStringType::kNormal)
                  .ToLocalChecked());
        }

        Local<Value> argv[] = {obj_data, obj_error,
                               Number::New(isolate, baton->request_id),
                               Boolean::New(isolate, baton->last)};
        MakeCallback(isolate, ctx, cb, 4, argv);
        break;
      }
      case EV_ON_RSP_SUB_FOR_QUOTE_RSP: {
        CThostFtdcSpecificInstrumentField *data =
            static_cast<CThostFtdcSpecificInstrumentField *>(baton->data.get());
        CThostFtdcRspInfoField *error =
            static_cast<CThostFtdcRspInfoField *>(baton->error.get());

        Local<Object> obj_data = Object::New(isolate);
        Local<Object> obj_error = Object::New(isolate);

        if (data) {
          /* 合约代码 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "InstrumentID"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->InstrumentID),
                  NewStringType::kNormal)
                  .ToLocalChecked());
        }

        if (error) {
          /* 错误代码 */
          obj_error->Set(String::NewFromUtf8(isolate, "ErrorID"),
                         Number::New(isolate, error->ErrorID));
          /* 错误信息 */
          obj_error->Set(
              String::NewFromUtf8(isolate, "ErrorMsg"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(error->ErrorMsg),
                  NewStringType::kNormal)
                  .ToLocalChecked());
        }

        Local<Value> argv[] = {obj_data, obj_error,
                               Number::New(isolate, baton->request_id),
                               Boolean::New(isolate, baton->last)};
        MakeCallback(isolate, ctx, cb, 4, argv);
        break;
      }
      case EV_ON_RSP_UN_SUB_FOR_QUOTE_RSP: {
        CThostFtdcSpecificInstrumentField *data =
            static_cast<CThostFtdcSpecificInstrumentField *>(baton->data.get());
        CThostFtdcRspInfoField *error =
            static_cast<CThostFtdcRspInfoField *>(baton->error.get());

        Local<Object> obj_data = Object::New(isolate);
        Local<Object> obj_error = Object::New(isolate);

        if (data) {
          /* 合约代码 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "InstrumentID"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->InstrumentID),
                  NewStringType::kNormal)
                  .ToLocalChecked());
        }

        if (error) {
          /* 错误代码 */
          obj_error->Set(String::NewFromUtf8(isolate, "ErrorID"),
                         Number::New(isolate, error->ErrorID));
          /* 错误信息 */
          obj_error->Set(
              String::NewFromUtf8(isolate, "ErrorMsg"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(error->ErrorMsg),
                  NewStringType::kNormal)
                  .ToLocalChecked());
        }

        Local<Value> argv[] = {obj_data, obj_error,
                               Number::New(isolate, baton->request_id),
                               Boolean::New(isolate, baton->last)};
        MakeCallback(isolate, ctx, cb, 4, argv);
        break;
      }
      case EV_ON_RTN_DEPTH_MARKET_DATA: {
        CThostFtdcDepthMarketDataField *data =
            static_cast<CThostFtdcDepthMarketDataField *>(baton->data.get());

        Local<Object> obj_data = Object::New(isolate);

        if (data) {
          /* 交易日 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "TradingDay"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->TradingDay),
                  NewStringType::kNormal)
                  .ToLocalChecked());
          /* 合约代码 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "InstrumentID"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->InstrumentID),
                  NewStringType::kNormal)
                  .ToLocalChecked());
          /* 交易所代码 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "ExchangeID"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->ExchangeID),
                  NewStringType::kNormal)
                  .ToLocalChecked());
          /* 合约在交易所的代码 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "ExchangeInstID"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->ExchangeInstID),
                  NewStringType::kNormal)
                  .ToLocalChecked());
          /* 最新价 */
          obj_data->Set(String::NewFromUtf8(isolate, "LastPrice"),
                        Number::New(isolate, data->LastPrice));
          /* 上次结算价 */
          obj_data->Set(String::NewFromUtf8(isolate, "PreSettlementPrice"),
                        Number::New(isolate, data->PreSettlementPrice));
          /* 昨收盘 */
          obj_data->Set(String::NewFromUtf8(isolate, "PreClosePrice"),
                        Number::New(isolate, data->PreClosePrice));
          /* 昨持仓量 */
          obj_data->Set(String::NewFromUtf8(isolate, "PreOpenInterest"),
                        Number::New(isolate, data->PreOpenInterest));
          /* 今开盘 */
          obj_data->Set(String::NewFromUtf8(isolate, "OpenPrice"),
                        Number::New(isolate, data->OpenPrice));
          /* 最高价 */
          obj_data->Set(String::NewFromUtf8(isolate, "HighestPrice"),
                        Number::New(isolate, data->HighestPrice));
          /* 最低价 */
          obj_data->Set(String::NewFromUtf8(isolate, "LowestPrice"),
                        Number::New(isolate, data->LowestPrice));
          /* 数量 */
          obj_data->Set(String::NewFromUtf8(isolate, "Volume"),
                        Number::New(isolate, data->Volume));
          /* 成交金额 */
          obj_data->Set(String::NewFromUtf8(isolate, "Turnover"),
                        Number::New(isolate, data->Turnover));
          /* 持仓量 */
          obj_data->Set(String::NewFromUtf8(isolate, "OpenInterest"),
                        Number::New(isolate, data->OpenInterest));
          /* 今收盘 */
          obj_data->Set(String::NewFromUtf8(isolate, "ClosePrice"),
                        Number::New(isolate, data->ClosePrice));
          /* 本次结算价 */
          obj_data->Set(String::NewFromUtf8(isolate, "SettlementPrice"),
                        Number::New(isolate, data->SettlementPrice));
          /* 涨停板价 */
          obj_data->Set(String::NewFromUtf8(isolate, "UpperLimitPrice"),
                        Number::New(isolate, data->UpperLimitPrice));
          /* 跌停板价 */
          obj_data->Set(String::NewFromUtf8(isolate, "LowerLimitPrice"),
                        Number::New(isolate, data->LowerLimitPrice));
          /* 昨虚实度 */
          obj_data->Set(String::NewFromUtf8(isolate, "PreDelta"),
                        Number::New(isolate, data->PreDelta));
          /* 今虚实度 */
          obj_data->Set(String::NewFromUtf8(isolate, "CurrDelta"),
                        Number::New(isolate, data->CurrDelta));
          /* 最后修改时间 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "UpdateTime"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->UpdateTime),
                  NewStringType::kNormal)
                  .ToLocalChecked());
          /* 最后修改毫秒 */
          obj_data->Set(String::NewFromUtf8(isolate, "UpdateMillisec"),
                        Number::New(isolate, data->UpdateMillisec));
          /* 申买价一 */
          obj_data->Set(String::NewFromUtf8(isolate, "BidPrice1"),
                        Number::New(isolate, data->BidPrice1));
          /* 申买量一 */
          obj_data->Set(String::NewFromUtf8(isolate, "BidVolume1"),
                        Number::New(isolate, data->BidVolume1));
          /* 申卖价一 */
          obj_data->Set(String::NewFromUtf8(isolate, "AskPrice1"),
                        Number::New(isolate, data->AskPrice1));
          /* 申卖量一 */
          obj_data->Set(String::NewFromUtf8(isolate, "AskVolume1"),
                        Number::New(isolate, data->AskVolume1));
          /* 申买价二 */
          obj_data->Set(String::NewFromUtf8(isolate, "BidPrice2"),
                        Number::New(isolate, data->BidPrice2));
          /* 申买量二 */
          obj_data->Set(String::NewFromUtf8(isolate, "BidVolume2"),
                        Number::New(isolate, data->BidVolume2));
          /* 申卖价二 */
          obj_data->Set(String::NewFromUtf8(isolate, "AskPrice2"),
                        Number::New(isolate, data->AskPrice2));
          /* 申卖量二 */
          obj_data->Set(String::NewFromUtf8(isolate, "AskVolume2"),
                        Number::New(isolate, data->AskVolume2));
          /* 申买价三 */
          obj_data->Set(String::NewFromUtf8(isolate, "BidPrice3"),
                        Number::New(isolate, data->BidPrice3));
          /* 申买量三 */
          obj_data->Set(String::NewFromUtf8(isolate, "BidVolume3"),
                        Number::New(isolate, data->BidVolume3));
          /* 申卖价三 */
          obj_data->Set(String::NewFromUtf8(isolate, "AskPrice3"),
                        Number::New(isolate, data->AskPrice3));
          /* 申卖量三 */
          obj_data->Set(String::NewFromUtf8(isolate, "AskVolume3"),
                        Number::New(isolate, data->AskVolume3));
          /* 申买价四 */
          obj_data->Set(String::NewFromUtf8(isolate, "BidPrice4"),
                        Number::New(isolate, data->BidPrice4));
          /* 申买量四 */
          obj_data->Set(String::NewFromUtf8(isolate, "BidVolume4"),
                        Number::New(isolate, data->BidVolume4));
          /* 申卖价四 */
          obj_data->Set(String::NewFromUtf8(isolate, "AskPrice4"),
                        Number::New(isolate, data->AskPrice4));
          /* 申卖量四 */
          obj_data->Set(String::NewFromUtf8(isolate, "AskVolume4"),
                        Number::New(isolate, data->AskVolume4));
          /* 申买价五 */
          obj_data->Set(String::NewFromUtf8(isolate, "BidPrice5"),
                        Number::New(isolate, data->BidPrice5));
          /* 申买量五 */
          obj_data->Set(String::NewFromUtf8(isolate, "BidVolume5"),
                        Number::New(isolate, data->BidVolume5));
          /* 申卖价五 */
          obj_data->Set(String::NewFromUtf8(isolate, "AskPrice5"),
                        Number::New(isolate, data->AskPrice5));
          /* 申卖量五 */
          obj_data->Set(String::NewFromUtf8(isolate, "AskVolume5"),
                        Number::New(isolate, data->AskVolume5));
          /* 当日均价 */
          obj_data->Set(String::NewFromUtf8(isolate, "AveragePrice"),
                        Number::New(isolate, data->AveragePrice));
          /* 业务日期 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "ActionDay"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->ActionDay),
                  NewStringType::kNormal)
                  .ToLocalChecked());
        }

        Local<Value> argv[] = {obj_data};
        MakeCallback(isolate, ctx, cb, 1, argv);
        break;
      }
      case EV_ON_RTN_FOR_QUOTE_RSP: {
        CThostFtdcForQuoteRspField *data =
            static_cast<CThostFtdcForQuoteRspField *>(baton->data.get());

        Local<Object> obj_data = Object::New(isolate);

        if (data) {
          /* 交易日 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "TradingDay"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->TradingDay),
                  NewStringType::kNormal)
                  .ToLocalChecked());
          /* 合约代码 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "InstrumentID"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->InstrumentID),
                  NewStringType::kNormal)
                  .ToLocalChecked());
          /* 询价编号 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "ForQuoteSysID"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->ForQuoteSysID),
                  NewStringType::kNormal)
                  .ToLocalChecked());
          /* 询价时间 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "ForQuoteTime"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->ForQuoteTime),
                  NewStringType::kNormal)
                  .ToLocalChecked());
          /* 业务日期 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "ActionDay"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->ActionDay),
                  NewStringType::kNormal)
                  .ToLocalChecked());
          /* 交易所代码 */
          obj_data->Set(
              String::NewFromUtf8(isolate, "ExchangeID"),
              String::NewFromOneByte(
                  isolate, reinterpret_cast<uint8_t *>(data->ExchangeID),
                  NewStringType::kNormal)
                  .ToLocalChecked());
        }

        Local<Value> argv[] = {obj_data};
        MakeCallback(isolate, ctx, cb, 1, argv);
        break;
      }
      default: { break; }
    }

    delete baton;
  }
}

} /* namespace node_ctp */