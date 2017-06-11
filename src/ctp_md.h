#ifndef CTP_MD_H
#define CTP_MD_H

#include <node.h>
#include <node_object_wrap.h>
#include <uv.h>
#include <unordered_map>
#include "ThostFtdcMdApi.h"
#include "baton.h"
#include "queue.h"

/* 此文件中代码大部分使用misc/code_generator生成, 不要手动修改 */

namespace node_ctp {

using namespace v8;
using std::string;
using std::unordered_map;

class CtpMd : public node::ObjectWrap, public CThostFtdcMdSpi {
 public:
  /**
   * 初始化C++类到Node模块
   */
  static void InitNodeClass(Local<Object> exports);

 private:
  CtpMd();
  virtual ~CtpMd();

  /**
   * Node层构造函数
   */
  static void New(const FunctionCallbackInfo<Value> &args);

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
  static void CreateFtdcMdApi(const FunctionCallbackInfo<Value> &args);

  /**
   * 获取API的版本信息
   * @retrun 获取到的版本号
   */
  static void GetApiVersion(const FunctionCallbackInfo<Value> &args);

  /**
   * 删除接口对象本身
   * @remark 不再使用本接口对象时,调用该函数删除接口对象
   */
  static void Release(const FunctionCallbackInfo<Value> &args);

  /**
   * 初始化
   * @remark 初始化运行环境,只有调用后,接口才开始工作
   */
  static void Init(const FunctionCallbackInfo<Value> &args);

  /**
   * 等待接口线程结束运行
   * @return 线程退出代码
   */
  static void Join(const FunctionCallbackInfo<Value> &args);

  /**
   * 获取当前交易日
   * @retrun 获取到的交易日
   * @remark 只有登录成功后,才能得到正确的交易日
   */
  static void GetTradingDay(const FunctionCallbackInfo<Value> &args);

  /**
   * 注册前置机网络地址
   * @param pszFrontAddress: 前置机网络地址
   * @remark 网络地址的格式为: "protocol: *ipaddress:port", 如: "tcp:
   * 127.0.0.1:17001"
   * @remark "tcp"代表传输协议, "127.0.0.1"代表服务器地址.
   * "17001"代表服务器端口号
   */
  static void RegisterFront(const FunctionCallbackInfo<Value> &args);

  /**
   * 注册名字服务器网络地址
   * @param pszNsAddress: 名字服务器网络地址
   * @remark 网络地址的格式为: "protocol: *ipaddress:port", 如: "tcp:
   * 127.0.0.1:12001"
   * @remark "tcp"代表传输协议, "127.0.0.1"代表服务器地址.
   * "12001"代表服务器端口号
   * @remark RegisterNameServer优先于RegisterFront
   */
  static void RegisterNameServer(const FunctionCallbackInfo<Value> &args);

  /**
   * 注册名字服务器用户信息
   * @param pFensUserInfo: 用户信息
   */
  static void RegisterFensUserInfo(const FunctionCallbackInfo<Value> &args);

  /**
   * 注册回调接口
   * @param pSpi 派生自回调接口类的实例
   */
  static void RegisterSpi(const FunctionCallbackInfo<Value> &args);

  /**
   * 订阅行情
   * @param ppInstrumentID 合约ID
   * @param nCount 要订阅/退订行情的合约个数
   * @remark
   */
  static void SubscribeMarketData(const FunctionCallbackInfo<Value> &args);

  /**
   * 退订行情
   * @param ppInstrumentID 合约ID
   * @param nCount 要订阅/退订行情的合约个数
   * @remark
   */
  static void UnSubscribeMarketData(const FunctionCallbackInfo<Value> &args);

  /**
   * 订阅询价
   * @param ppInstrumentID 合约ID
   * @param nCount 要订阅/退订行情的合约个数
   * @remark
   */
  static void SubscribeForQuoteRsp(const FunctionCallbackInfo<Value> &args);

  /**
   * 退订询价
   * @param ppInstrumentID 合约ID
   * @param nCount 要订阅/退订行情的合约个数
   * @remark
   */
  static void UnSubscribeForQuoteRsp(const FunctionCallbackInfo<Value> &args);

  /**
   * 用户登录请求
   */
  static void ReqUserLogin(const FunctionCallbackInfo<Value> &args);

  /**
   * 登出请求
   */
  static void ReqUserLogout(const FunctionCallbackInfo<Value> &args);

  /**
   * 安全退出
   */
  static void Exit(const FunctionCallbackInfo<Value> &args);

  /* ---------------------------------------------------------------------------
   * SPI接口
   * ---------------------------------------------------------------------------
   */

  /**
   * 当客户端与交易后台建立起通信连接时(还未登录前), 该方法被调用
   */
  virtual void OnFrontConnected();

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
  virtual void OnFrontDisconnected(int reason);

  /**
   * 心跳超时警告. 当长时间未收到报文时, 该方法被调用
   * @param nTimeLapse 距离上次接收报文的时间
   */
  virtual void OnHeartBeatWarning(int time_lapse);

  /**
   * 登录请求响应
   */
  virtual void OnRspUserLogin(CThostFtdcRspUserLoginField *data,
                              CThostFtdcRspInfoField *error, int request_id,
                              bool last);

  /**
   * 登出请求响应
   */
  virtual void OnRspUserLogout(CThostFtdcUserLogoutField *data,
                               CThostFtdcRspInfoField *error, int request_id,
                               bool last);

  /**
   * 错误应答
   */
  virtual void OnRspError(CThostFtdcRspInfoField *error, int request_id,
                          bool last);

  /**
   * 订阅行情应答
   */
  virtual void OnRspSubMarketData(CThostFtdcSpecificInstrumentField *data,
                                  CThostFtdcRspInfoField *error, int request_id,
                                  bool last);

  /**
   * 取消订阅行情应答
   */
  virtual void OnRspUnSubMarketData(CThostFtdcSpecificInstrumentField *data,
                                    CThostFtdcRspInfoField *error,
                                    int request_id, bool last);

  /**
   * 订阅询价应答
   */
  virtual void OnRspSubForQuoteRsp(CThostFtdcSpecificInstrumentField *data,
                                   CThostFtdcRspInfoField *error,
                                   int request_id, bool last);

  /**
   * 取消订阅询价应答
   */
  virtual void OnRspUnSubForQuoteRsp(CThostFtdcSpecificInstrumentField *data,
                                     CThostFtdcRspInfoField *error,
                                     int request_id, bool last);

  /**
   * 深度行情通知
   */
  virtual void OnRtnDepthMarketData(CThostFtdcDepthMarketDataField *data);

  /**
   * 询价通知
   */
  virtual void OnRtnForQuoteRsp(CThostFtdcForQuoteRspField *data);

  /* ---------------------------------------------------------------------------
   * 异步相关
   * ---------------------------------------------------------------------------
   */

  /**
   * Node层注册SPI事件回调
   * Example:
   *   ```
   *   let md = new CtpMd()
   *   md.on('FrontConnected', (err) => {...})
   *   ```
   */
  static void On(const FunctionCallbackInfo<Value> &args);

  /**
   * libuv异步执行时调用
   * @remark
   * 此函数在其它线程中执行, 访问V8相关函数和数据是不安全的,
   * 仅可访问this指向的数据
   */
  static void RequestAsync(uv_work_t *work);

  /**
   * libuv异步执行完成时调用
   * @remark 此函数在主事件循环中执行, 可访问V8相关函数
   */
  static void RequestAsyncAfter(uv_work_t *work, int status);

  /**
   * 从其它线程向主线程中发送事件
   */
  void ResponseAsyncSend(ResponseBaton *baton);

  /**
   * 主线程中SPI事件处理函数
   */
  static void ResponseAsyncAfter(uv_async_t *async);

 private:
  /* Ctp API实例 */
  CThostFtdcMdApi *api_;

  /* Node层构造函数持久对象 */
  static Persistent<Function> constructor_;

  /* Node层注册SPI事件回调函数时使用字符串标识事件,
   * 此Map保存字符串->响应事件类型的映射
   */
  static unordered_map<string, int> event_map_;

  /* SPI响应事件类型->Node层注册的回调函数 */
  unordered_map<int, Persistent<Function>> callback_map_;

  /* CTP的SPI是在一个独立线程中运行的, libuv的大部分接口都不是线程安全的,
   * 想要与主线程通信
   * 需要借助uv_async_send接口完成, 根据libuv的文档描述,
   * 某些时候(比如短时间内频繁调用此
   * 接口)会出现调用次数与回调触发次数不一致的情况,
   * 所以需要维护一个并发队列来缓存事件.
   */
  uv_async_t async_;
  ConcurrentQueue<ResponseBaton *> queue_;
};

} /* namespace node_ctp */

#endif /* CTP_MD_H */