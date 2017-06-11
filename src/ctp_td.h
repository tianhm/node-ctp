#ifndef CTP_TD_H
#define CTP_TD_H

#include <node.h>
#include <node_object_wrap.h>
#include <uv.h>
#include <unordered_map>
#include "ThostFtdcTraderApi.h"
#include "baton.h"
#include "queue.h"

/* 此文件中代码大部分使用misc/code_generator生成, 不要手动修改 */

namespace node_ctp {

using namespace v8;
using std::string;
using std::unordered_map;

class CtpTd : public node::ObjectWrap, public CThostFtdcTraderSpi {
 public:
  /**
   * 初始化C++类到Node模块
   */
  static void InitNodeClass(Local<Object> exports);

 private:
  CtpTd();
  virtual ~CtpTd();

  /**
   * Node层构造函数
   */
  static void New(const FunctionCallbackInfo<Value> &args);

  /* ---------------------------------------------------------------------------
   * API接口
   * ---------------------------------------------------------------------------
   */

  /**
   * 创建TraderApi
   * @param pszFlowPath 存贮订阅信息文件的目录, 默认为当前目录
   * @return 创建出的UserApi
   */
  static void CreateFtdcTraderApi(const FunctionCallbackInfo<Value> &args);

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
   * *127.0.0.1:17001"
   * @remark "tcp"代表传输协议, "127.0.0.1"代表服务器地址.
   * "17001"代表服务器端口号
   */
  static void RegisterFront(const FunctionCallbackInfo<Value> &args);

  /**
   * 注册名字服务器网络地址
   * @param pszNsAddress: 名字服务器网络地址
   * @remark 网络地址的格式为: "protocol: *ipaddress:port", 如: "tcp:
   * *127.0.0.1:12001"
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
   * 订阅私有流
   * @param nResumeType 私有流重传方式
   *         THOST_TERT_RESTART:从本交易日开始重传
   *         THOST_TERT_RESUME:从上次收到的续传
   *         THOST_TERT_QUICK:只传送登录后私有流的内容
   * @remark 该方法要在Init方法前调用. 若不调用则不会收到私有流的数据
   */
  static void SubscribePrivateTopic(const FunctionCallbackInfo<Value> &args);

  /**
   * 订阅公共流
   * @param nResumeType 公共流重传方式
   *         THOST_TERT_RESTART:从本交易日开始重传
   *         THOST_TERT_RESUME:从上次收到的续传
   *         THOST_TERT_QUICK:只传送登录后公共流的内容
   * @remark 该方法要在Init方法前调用. 若不调用则不会收到公共流的数据
   */
  static void SubscribePublicTopic(const FunctionCallbackInfo<Value> &args);

  /**
   * 客户端认证请求
   */
  static void ReqAuthenticate(const FunctionCallbackInfo<Value> &args);

  /**
   * 用户登录请求
   */
  static void ReqUserLogin(const FunctionCallbackInfo<Value> &args);

  /**
   * 登出请求
   */
  static void ReqUserLogout(const FunctionCallbackInfo<Value> &args);

  /**
   * 用户口令更新请求
   */
  static void ReqUserPasswordUpdate(const FunctionCallbackInfo<Value> &args);

  /**
   * 资金账户口令更新请求
   */
  static void ReqTradingAccountPasswordUpdate(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 报单录入请求
   */
  static void ReqOrderInsert(const FunctionCallbackInfo<Value> &args);

  /**
   * 预埋单录入请求
   */
  static void ReqParkedOrderInsert(const FunctionCallbackInfo<Value> &args);

  /**
   * 预埋撤单录入请求
   */
  static void ReqParkedOrderAction(const FunctionCallbackInfo<Value> &args);

  /**
   * 报单操作请求
   */
  static void ReqOrderAction(const FunctionCallbackInfo<Value> &args);

  /**
   * 查询最大报单数量请求
   */
  static void ReqQueryMaxOrderVolume(const FunctionCallbackInfo<Value> &args);

  /**
   * 投资者结算结果确认
   */
  static void ReqSettlementInfoConfirm(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求删除预埋单
   */
  static void ReqRemoveParkedOrder(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求删除预埋撤单
   */
  static void ReqRemoveParkedOrderAction(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 执行宣告录入请求
   */
  static void ReqExecOrderInsert(const FunctionCallbackInfo<Value> &args);

  /**
   * 执行宣告操作请求
   */
  static void ReqExecOrderAction(const FunctionCallbackInfo<Value> &args);

  /**
   * 询价录入请求
   */
  static void ReqForQuoteInsert(const FunctionCallbackInfo<Value> &args);

  /**
   * 报价录入请求
   */
  static void ReqQuoteInsert(const FunctionCallbackInfo<Value> &args);

  /**
   * 报价操作请求
   */
  static void ReqQuoteAction(const FunctionCallbackInfo<Value> &args);

  /**
   * 锁定请求
   */
  static void ReqLockInsert(const FunctionCallbackInfo<Value> &args);

  /**
   * 批量报单操作请求
   */
  static void ReqBatchOrderAction(const FunctionCallbackInfo<Value> &args);

  /**
   * 申请组合录入请求
   */
  static void ReqCombActionInsert(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询报单
   */
  static void ReqQryOrder(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询成交
   */
  static void ReqQryTrade(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询投资者持仓
   */
  static void ReqQryInvestorPosition(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询资金账户
   */
  static void ReqQryTradingAccount(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询投资者
   */
  static void ReqQryInvestor(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询交易编码
   */
  static void ReqQryTradingCode(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询合约保证金率
   */
  static void ReqQryInstrumentMarginRate(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询合约手续费率
   */
  static void ReqQryInstrumentCommissionRate(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询交易所
   */
  static void ReqQryExchange(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询产品
   */
  static void ReqQryProduct(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询合约
   */
  static void ReqQryInstrument(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询行情
   */
  static void ReqQryDepthMarketData(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询投资者结算结果
   */
  static void ReqQrySettlementInfo(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询转帐银行
   */
  static void ReqQryTransferBank(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询投资者持仓明细
   */
  static void ReqQryInvestorPositionDetail(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询客户通知
   */
  static void ReqQryNotice(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询结算信息确认
   */
  static void ReqQrySettlementInfoConfirm(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询投资者持仓明细
   */
  static void ReqQryInvestorPositionCombineDetail(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询保证金监管系统经纪公司资金账户密钥
   */
  static void ReqQryCFMMCTradingAccountKey(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询仓单折抵信息
   */
  static void ReqQryEWarrantOffset(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询投资者品种/跨品种保证金
   */
  static void ReqQryInvestorProductGroupMargin(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询交易所保证金率
   */
  static void ReqQryExchangeMarginRate(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询交易所调整保证金率
   */
  static void ReqQryExchangeMarginRateAdjust(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询汇率
   */
  static void ReqQryExchangeRate(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询二级代理操作员银期权限
   */
  static void ReqQrySecAgentACIDMap(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询产品报价汇率
   */
  static void ReqQryProductExchRate(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询产品组
   */
  static void ReqQryProductGroup(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询做市商合约手续费率
   */
  static void ReqQryMMInstrumentCommissionRate(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询做市商期权合约手续费
   */
  static void ReqQryMMOptionInstrCommRate(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询报单手续费
   */
  static void ReqQryInstrumentOrderCommRate(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询期权交易成本
   */
  static void ReqQryOptionInstrTradeCost(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询期权合约手续费
   */
  static void ReqQryOptionInstrCommRate(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询执行宣告
   */
  static void ReqQryExecOrder(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询询价
   */
  static void ReqQryForQuote(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询报价
   */
  static void ReqQryQuote(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询锁定
   */
  static void ReqQryLock(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询锁定证券仓位
   */
  static void ReqQryLockPosition(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询ETF期权合约手续费
   */
  static void ReqQryETFOptionInstrCommRate(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询投资者分级
   */
  static void ReqQryInvestorLevel(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询E+1日行权冻结
   */
  static void ReqQryExecFreeze(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询组合合约安全系数
   */
  static void ReqQryCombInstrumentGuard(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询申请组合
   */
  static void ReqQryCombAction(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询转帐流水
   */
  static void ReqQryTransferSerial(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询银期签约关系
   */
  static void ReqQryAccountregister(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询签约银行
   */
  static void ReqQryContractBank(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询预埋单
   */
  static void ReqQryParkedOrder(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询预埋撤单
   */
  static void ReqQryParkedOrderAction(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询交易通知
   */
  static void ReqQryTradingNotice(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询经纪公司交易参数
   */
  static void ReqQryBrokerTradingParams(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询经纪公司交易算法
   */
  static void ReqQryBrokerTradingAlgos(const FunctionCallbackInfo<Value> &args);

  /**
   * 请求查询监控中心用户令牌
   */
  static void ReqQueryCFMMCTradingAccountToken(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 期货发起银行资金转期货请求
   */
  static void ReqFromBankToFutureByFuture(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 期货发起期货资金转银行请求
   */
  static void ReqFromFutureToBankByFuture(
      const FunctionCallbackInfo<Value> &args);

  /**
   * 期货发起查询银行余额请求
   */
  static void ReqQueryBankAccountMoneyByFuture(
      const FunctionCallbackInfo<Value> &args);

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
   * 客户端认证响应
   */
  virtual void OnRspAuthenticate(CThostFtdcRspAuthenticateField *data,
                                 CThostFtdcRspInfoField *error, int request_id,
                                 bool last);

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
   * 用户口令更新请求响应
   */
  virtual void OnRspUserPasswordUpdate(CThostFtdcUserPasswordUpdateField *data,
                                       CThostFtdcRspInfoField *error,
                                       int request_id, bool last);

  /**
   * 资金账户口令更新请求响应
   */
  virtual void OnRspTradingAccountPasswordUpdate(
      CThostFtdcTradingAccountPasswordUpdateField *data,
      CThostFtdcRspInfoField *error, int request_id, bool last);

  /**
   * 报单录入请求响应
   */
  virtual void OnRspOrderInsert(CThostFtdcInputOrderField *data,
                                CThostFtdcRspInfoField *error, int request_id,
                                bool last);

  /**
   * 预埋单录入请求响应
   */
  virtual void OnRspParkedOrderInsert(CThostFtdcParkedOrderField *data,
                                      CThostFtdcRspInfoField *error,
                                      int request_id, bool last);

  /**
   * 预埋撤单录入请求响应
   */
  virtual void OnRspParkedOrderAction(CThostFtdcParkedOrderActionField *data,
                                      CThostFtdcRspInfoField *error,
                                      int request_id, bool last);

  /**
   * 报单操作请求响应
   */
  virtual void OnRspOrderAction(CThostFtdcInputOrderActionField *data,
                                CThostFtdcRspInfoField *error, int request_id,
                                bool last);

  /**
   * 查询最大报单数量响应
   */
  virtual void OnRspQueryMaxOrderVolume(
      CThostFtdcQueryMaxOrderVolumeField *data, CThostFtdcRspInfoField *error,
      int request_id, bool last);

  /**
   * 投资者结算结果确认响应
   */
  virtual void OnRspSettlementInfoConfirm(
      CThostFtdcSettlementInfoConfirmField *data, CThostFtdcRspInfoField *error,
      int request_id, bool last);

  /**
   * 删除预埋单响应
   */
  virtual void OnRspRemoveParkedOrder(CThostFtdcRemoveParkedOrderField *data,
                                      CThostFtdcRspInfoField *error,
                                      int request_id, bool last);

  /**
   * 删除预埋撤单响应
   */
  virtual void OnRspRemoveParkedOrderAction(
      CThostFtdcRemoveParkedOrderActionField *data,
      CThostFtdcRspInfoField *error, int request_id, bool last);

  /**
   * 执行宣告录入请求响应
   */
  virtual void OnRspExecOrderInsert(CThostFtdcInputExecOrderField *data,
                                    CThostFtdcRspInfoField *error,
                                    int request_id, bool last);

  /**
   * 执行宣告操作请求响应
   */
  virtual void OnRspExecOrderAction(CThostFtdcInputExecOrderActionField *data,
                                    CThostFtdcRspInfoField *error,
                                    int request_id, bool last);

  /**
   * 询价录入请求响应
   */
  virtual void OnRspForQuoteInsert(CThostFtdcInputForQuoteField *data,
                                   CThostFtdcRspInfoField *error,
                                   int request_id, bool last);

  /**
   * 报价录入请求响应
   */
  virtual void OnRspQuoteInsert(CThostFtdcInputQuoteField *data,
                                CThostFtdcRspInfoField *error, int request_id,
                                bool last);

  /**
   * 报价操作请求响应
   */
  virtual void OnRspQuoteAction(CThostFtdcInputQuoteActionField *data,
                                CThostFtdcRspInfoField *error, int request_id,
                                bool last);

  /**
   * 锁定应答
   */
  virtual void OnRspLockInsert(CThostFtdcInputLockField *data,
                               CThostFtdcRspInfoField *error, int request_id,
                               bool last);

  /**
   * 批量报单操作请求响应
   */
  virtual void OnRspBatchOrderAction(CThostFtdcInputBatchOrderActionField *data,
                                     CThostFtdcRspInfoField *error,
                                     int request_id, bool last);

  /**
   * 申请组合录入请求响应
   */
  virtual void OnRspCombActionInsert(CThostFtdcInputCombActionField *data,
                                     CThostFtdcRspInfoField *error,
                                     int request_id, bool last);

  /**
   * 请求查询报单响应
   */
  virtual void OnRspQryOrder(CThostFtdcOrderField *data,
                             CThostFtdcRspInfoField *error, int request_id,
                             bool last);

  /**
   * 请求查询成交响应
   */
  virtual void OnRspQryTrade(CThostFtdcTradeField *data,
                             CThostFtdcRspInfoField *error, int request_id,
                             bool last);

  /**
   * 请求查询投资者持仓响应
   */
  virtual void OnRspQryInvestorPosition(CThostFtdcInvestorPositionField *data,
                                        CThostFtdcRspInfoField *error,
                                        int request_id, bool last);

  /**
   * 请求查询资金账户响应
   */
  virtual void OnRspQryTradingAccount(CThostFtdcTradingAccountField *data,
                                      CThostFtdcRspInfoField *error,
                                      int request_id, bool last);

  /**
   * 请求查询投资者响应
   */
  virtual void OnRspQryInvestor(CThostFtdcInvestorField *data,
                                CThostFtdcRspInfoField *error, int request_id,
                                bool last);

  /**
   * 请求查询交易编码响应
   */
  virtual void OnRspQryTradingCode(CThostFtdcTradingCodeField *data,
                                   CThostFtdcRspInfoField *error,
                                   int request_id, bool last);

  /**
   * 请求查询合约保证金率响应
   */
  virtual void OnRspQryInstrumentMarginRate(
      CThostFtdcInstrumentMarginRateField *data, CThostFtdcRspInfoField *error,
      int request_id, bool last);

  /**
   * 请求查询合约手续费率响应
   */
  virtual void OnRspQryInstrumentCommissionRate(
      CThostFtdcInstrumentCommissionRateField *data,
      CThostFtdcRspInfoField *error, int request_id, bool last);

  /**
   * 请求查询交易所响应
   */
  virtual void OnRspQryExchange(CThostFtdcExchangeField *data,
                                CThostFtdcRspInfoField *error, int request_id,
                                bool last);

  /**
   * 请求查询产品响应
   */
  virtual void OnRspQryProduct(CThostFtdcProductField *data,
                               CThostFtdcRspInfoField *error, int request_id,
                               bool last);

  /**
   * 请求查询合约响应
   */
  virtual void OnRspQryInstrument(CThostFtdcInstrumentField *data,
                                  CThostFtdcRspInfoField *error, int request_id,
                                  bool last);

  /**
   * 请求查询行情响应
   */
  virtual void OnRspQryDepthMarketData(CThostFtdcDepthMarketDataField *data,
                                       CThostFtdcRspInfoField *error,
                                       int request_id, bool last);

  /**
   * 请求查询投资者结算结果响应
   */
  virtual void OnRspQrySettlementInfo(CThostFtdcSettlementInfoField *data,
                                      CThostFtdcRspInfoField *error,
                                      int request_id, bool last);

  /**
   * 请求查询转帐银行响应
   */
  virtual void OnRspQryTransferBank(CThostFtdcTransferBankField *data,
                                    CThostFtdcRspInfoField *error,
                                    int request_id, bool last);

  /**
   * 请求查询投资者持仓明细响应
   */
  virtual void OnRspQryInvestorPositionDetail(
      CThostFtdcInvestorPositionDetailField *data,
      CThostFtdcRspInfoField *error, int request_id, bool last);

  /**
   * 请求查询客户通知响应
   */
  virtual void OnRspQryNotice(CThostFtdcNoticeField *data,
                              CThostFtdcRspInfoField *error, int request_id,
                              bool last);

  /**
   * 请求查询结算信息确认响应
   */
  virtual void OnRspQrySettlementInfoConfirm(
      CThostFtdcSettlementInfoConfirmField *data, CThostFtdcRspInfoField *error,
      int request_id, bool last);

  /**
   * 请求查询投资者持仓明细响应
   */
  virtual void OnRspQryInvestorPositionCombineDetail(
      CThostFtdcInvestorPositionCombineDetailField *data,
      CThostFtdcRspInfoField *error, int request_id, bool last);

  /**
   * 查询保证金监管系统经纪公司资金账户密钥响应
   */
  virtual void OnRspQryCFMMCTradingAccountKey(
      CThostFtdcCFMMCTradingAccountKeyField *data,
      CThostFtdcRspInfoField *error, int request_id, bool last);

  /**
   * 请求查询仓单折抵信息响应
   */
  virtual void OnRspQryEWarrantOffset(CThostFtdcEWarrantOffsetField *data,
                                      CThostFtdcRspInfoField *error,
                                      int request_id, bool last);

  /**
   * 请求查询投资者品种/跨品种保证金响应
   */
  virtual void OnRspQryInvestorProductGroupMargin(
      CThostFtdcInvestorProductGroupMarginField *data,
      CThostFtdcRspInfoField *error, int request_id, bool last);

  /**
   * 请求查询交易所保证金率响应
   */
  virtual void OnRspQryExchangeMarginRate(
      CThostFtdcExchangeMarginRateField *data, CThostFtdcRspInfoField *error,
      int request_id, bool last);

  /**
   * 请求查询交易所调整保证金率响应
   */
  virtual void OnRspQryExchangeMarginRateAdjust(
      CThostFtdcExchangeMarginRateAdjustField *data,
      CThostFtdcRspInfoField *error, int request_id, bool last);

  /**
   * 请求查询汇率响应
   */
  virtual void OnRspQryExchangeRate(CThostFtdcExchangeRateField *data,
                                    CThostFtdcRspInfoField *error,
                                    int request_id, bool last);

  /**
   * 请求查询二级代理操作员银期权限响应
   */
  virtual void OnRspQrySecAgentACIDMap(CThostFtdcSecAgentACIDMapField *data,
                                       CThostFtdcRspInfoField *error,
                                       int request_id, bool last);

  /**
   * 请求查询产品报价汇率
   */
  virtual void OnRspQryProductExchRate(CThostFtdcProductExchRateField *data,
                                       CThostFtdcRspInfoField *error,
                                       int request_id, bool last);

  /**
   * 请求查询产品组
   */
  virtual void OnRspQryProductGroup(CThostFtdcProductGroupField *data,
                                    CThostFtdcRspInfoField *error,
                                    int request_id, bool last);

  /**
   * 请求查询做市商合约手续费率响应
   */
  virtual void OnRspQryMMInstrumentCommissionRate(
      CThostFtdcMMInstrumentCommissionRateField *data,
      CThostFtdcRspInfoField *error, int request_id, bool last);

  /**
   * 请求查询做市商期权合约手续费响应
   */
  virtual void OnRspQryMMOptionInstrCommRate(
      CThostFtdcMMOptionInstrCommRateField *data, CThostFtdcRspInfoField *error,
      int request_id, bool last);

  /**
   * 请求查询报单手续费响应
   */
  virtual void OnRspQryInstrumentOrderCommRate(
      CThostFtdcInstrumentOrderCommRateField *data,
      CThostFtdcRspInfoField *error, int request_id, bool last);

  /**
   * 请求查询期权交易成本响应
   */
  virtual void OnRspQryOptionInstrTradeCost(
      CThostFtdcOptionInstrTradeCostField *data, CThostFtdcRspInfoField *error,
      int request_id, bool last);

  /**
   * 请求查询期权合约手续费响应
   */
  virtual void OnRspQryOptionInstrCommRate(
      CThostFtdcOptionInstrCommRateField *data, CThostFtdcRspInfoField *error,
      int request_id, bool last);

  /**
   * 请求查询执行宣告响应
   */
  virtual void OnRspQryExecOrder(CThostFtdcExecOrderField *data,
                                 CThostFtdcRspInfoField *error, int request_id,
                                 bool last);

  /**
   * 请求查询询价响应
   */
  virtual void OnRspQryForQuote(CThostFtdcForQuoteField *data,
                                CThostFtdcRspInfoField *error, int request_id,
                                bool last);

  /**
   * 请求查询报价响应
   */
  virtual void OnRspQryQuote(CThostFtdcQuoteField *data,
                             CThostFtdcRspInfoField *error, int request_id,
                             bool last);

  /**
   * 请求查询锁定应答
   */
  virtual void OnRspQryLock(CThostFtdcLockField *data,
                            CThostFtdcRspInfoField *error, int request_id,
                            bool last);

  /**
   * 请求查询锁定证券仓位应答
   */
  virtual void OnRspQryLockPosition(CThostFtdcLockPositionField *data,
                                    CThostFtdcRspInfoField *error,
                                    int request_id, bool last);

  /**
   * 请求查询ETF期权合约手续费响应
   */
  virtual void OnRspQryETFOptionInstrCommRate(
      CThostFtdcETFOptionInstrCommRateField *data,
      CThostFtdcRspInfoField *error, int request_id, bool last);

  /**
   * 请求查询投资者分级
   */
  virtual void OnRspQryInvestorLevel(CThostFtdcInvestorLevelField *data,
                                     CThostFtdcRspInfoField *error,
                                     int request_id, bool last);

  /**
   * 请求查询E+1日行权冻结响应
   */
  virtual void OnRspQryExecFreeze(CThostFtdcExecFreezeField *data,
                                  CThostFtdcRspInfoField *error, int request_id,
                                  bool last);

  /**
   * 请求查询组合合约安全系数响应
   */
  virtual void OnRspQryCombInstrumentGuard(
      CThostFtdcCombInstrumentGuardField *data, CThostFtdcRspInfoField *error,
      int request_id, bool last);

  /**
   * 请求查询申请组合响应
   */
  virtual void OnRspQryCombAction(CThostFtdcCombActionField *data,
                                  CThostFtdcRspInfoField *error, int request_id,
                                  bool last);

  /**
   * 请求查询转帐流水响应
   */
  virtual void OnRspQryTransferSerial(CThostFtdcTransferSerialField *data,
                                      CThostFtdcRspInfoField *error,
                                      int request_id, bool last);

  /**
   * 请求查询银期签约关系响应
   */
  virtual void OnRspQryAccountregister(CThostFtdcAccountregisterField *data,
                                       CThostFtdcRspInfoField *error,
                                       int request_id, bool last);

  /**
   * 错误应答
   */
  virtual void OnRspError(CThostFtdcRspInfoField *error, int request_id,
                          bool last);

  /**
   * 报单通知
   */
  virtual void OnRtnOrder(CThostFtdcOrderField *data);

  /**
   * 成交通知
   */
  virtual void OnRtnTrade(CThostFtdcTradeField *data);

  /**
   * 报单录入错误回报
   */
  virtual void OnErrRtnOrderInsert(CThostFtdcInputOrderField *data,
                                   CThostFtdcRspInfoField *error);

  /**
   * 报单操作错误回报
   */
  virtual void OnErrRtnOrderAction(CThostFtdcOrderActionField *data,
                                   CThostFtdcRspInfoField *error);

  /**
   * 合约交易状态通知
   */
  virtual void OnRtnInstrumentStatus(CThostFtdcInstrumentStatusField *data);

  /**
   * 交易所公告通知
   */
  virtual void OnRtnBulletin(CThostFtdcBulletinField *data);

  /**
   * 交易通知
   */
  virtual void OnRtnTradingNotice(CThostFtdcTradingNoticeInfoField *data);

  /**
   * 提示条件单校验错误
   */
  virtual void OnRtnErrorConditionalOrder(
      CThostFtdcErrorConditionalOrderField *data);

  /**
   * 执行宣告通知
   */
  virtual void OnRtnExecOrder(CThostFtdcExecOrderField *data);

  /**
   * 执行宣告录入错误回报
   */
  virtual void OnErrRtnExecOrderInsert(CThostFtdcInputExecOrderField *data,
                                       CThostFtdcRspInfoField *error);

  /**
   * 执行宣告操作错误回报
   */
  virtual void OnErrRtnExecOrderAction(CThostFtdcExecOrderActionField *data,
                                       CThostFtdcRspInfoField *error);

  /**
   * 询价录入错误回报
   */
  virtual void OnErrRtnForQuoteInsert(CThostFtdcInputForQuoteField *data,
                                      CThostFtdcRspInfoField *error);

  /**
   * 报价通知
   */
  virtual void OnRtnQuote(CThostFtdcQuoteField *data);

  /**
   * 报价录入错误回报
   */
  virtual void OnErrRtnQuoteInsert(CThostFtdcInputQuoteField *data,
                                   CThostFtdcRspInfoField *error);

  /**
   * 报价操作错误回报
   */
  virtual void OnErrRtnQuoteAction(CThostFtdcQuoteActionField *data,
                                   CThostFtdcRspInfoField *error);

  /**
   * 询价通知
   */
  virtual void OnRtnForQuoteRsp(CThostFtdcForQuoteRspField *data);

  /**
   * 保证金监控中心用户令牌
   */
  virtual void OnRtnCFMMCTradingAccountToken(
      CThostFtdcCFMMCTradingAccountTokenField *data);

  /**
   * 锁定通知
   */
  virtual void OnRtnLock(CThostFtdcLockField *data);

  /**
   * 锁定错误通知
   */
  virtual void OnErrRtnLockInsert(CThostFtdcInputLockField *data,
                                  CThostFtdcRspInfoField *error);

  /**
   * 批量报单操作错误回报
   */
  virtual void OnErrRtnBatchOrderAction(CThostFtdcBatchOrderActionField *data,
                                        CThostFtdcRspInfoField *error);

  /**
   * 申请组合通知
   */
  virtual void OnRtnCombAction(CThostFtdcCombActionField *data);

  /**
   * 申请组合录入错误回报
   */
  virtual void OnErrRtnCombActionInsert(CThostFtdcInputCombActionField *data,
                                        CThostFtdcRspInfoField *error);

  /**
   * 请求查询签约银行响应
   */
  virtual void OnRspQryContractBank(CThostFtdcContractBankField *data,
                                    CThostFtdcRspInfoField *error,
                                    int request_id, bool last);

  /**
   * 请求查询预埋单响应
   */
  virtual void OnRspQryParkedOrder(CThostFtdcParkedOrderField *data,
                                   CThostFtdcRspInfoField *error,
                                   int request_id, bool last);

  /**
   * 请求查询预埋撤单响应
   */
  virtual void OnRspQryParkedOrderAction(CThostFtdcParkedOrderActionField *data,
                                         CThostFtdcRspInfoField *error,
                                         int request_id, bool last);

  /**
   * 请求查询交易通知响应
   */
  virtual void OnRspQryTradingNotice(CThostFtdcTradingNoticeField *data,
                                     CThostFtdcRspInfoField *error,
                                     int request_id, bool last);

  /**
   * 请求查询经纪公司交易参数响应
   */
  virtual void OnRspQryBrokerTradingParams(
      CThostFtdcBrokerTradingParamsField *data, CThostFtdcRspInfoField *error,
      int request_id, bool last);

  /**
   * 请求查询经纪公司交易算法响应
   */
  virtual void OnRspQryBrokerTradingAlgos(
      CThostFtdcBrokerTradingAlgosField *data, CThostFtdcRspInfoField *error,
      int request_id, bool last);

  /**
   * 请求查询监控中心用户令牌
   */
  virtual void OnRspQueryCFMMCTradingAccountToken(
      CThostFtdcQueryCFMMCTradingAccountTokenField *data,
      CThostFtdcRspInfoField *error, int request_id, bool last);

  /**
   * 银行发起银行资金转期货通知
   */
  virtual void OnRtnFromBankToFutureByBank(CThostFtdcRspTransferField *data);

  /**
   * 银行发起期货资金转银行通知
   */
  virtual void OnRtnFromFutureToBankByBank(CThostFtdcRspTransferField *data);

  /**
   * 银行发起冲正银行转期货通知
   */
  virtual void OnRtnRepealFromBankToFutureByBank(
      CThostFtdcRspRepealField *data);

  /**
   * 银行发起冲正期货转银行通知
   */
  virtual void OnRtnRepealFromFutureToBankByBank(
      CThostFtdcRspRepealField *data);

  /**
   * 期货发起银行资金转期货通知
   */
  virtual void OnRtnFromBankToFutureByFuture(CThostFtdcRspTransferField *data);

  /**
   * 期货发起期货资金转银行通知
   */
  virtual void OnRtnFromFutureToBankByFuture(CThostFtdcRspTransferField *data);

  /**
   * 系统运行时期货端手工发起冲正银行转期货请求, 银行处理完毕后报盘发回的通知
   */
  virtual void OnRtnRepealFromBankToFutureByFutureManual(
      CThostFtdcRspRepealField *data);

  /**
   * 系统运行时期货端手工发起冲正期货转银行请求, 银行处理完毕后报盘发回的通知
   */
  virtual void OnRtnRepealFromFutureToBankByFutureManual(
      CThostFtdcRspRepealField *data);

  /**
   * 期货发起查询银行余额通知
   */
  virtual void OnRtnQueryBankBalanceByFuture(
      CThostFtdcNotifyQueryAccountField *data);

  /**
   * 期货发起银行资金转期货错误回报
   */
  virtual void OnErrRtnBankToFutureByFuture(CThostFtdcReqTransferField *data,
                                            CThostFtdcRspInfoField *error);

  /**
   * 期货发起期货资金转银行错误回报
   */
  virtual void OnErrRtnFutureToBankByFuture(CThostFtdcReqTransferField *data,
                                            CThostFtdcRspInfoField *error);

  /**
   * 系统运行时期货端手工发起冲正银行转期货错误回报
   */
  virtual void OnErrRtnRepealBankToFutureByFutureManual(
      CThostFtdcReqRepealField *data, CThostFtdcRspInfoField *error);

  /**
   * 系统运行时期货端手工发起冲正期货转银行错误回报
   */
  virtual void OnErrRtnRepealFutureToBankByFutureManual(
      CThostFtdcReqRepealField *data, CThostFtdcRspInfoField *error);

  /**
   * 期货发起查询银行余额错误回报
   */
  virtual void OnErrRtnQueryBankBalanceByFuture(
      CThostFtdcReqQueryAccountField *data, CThostFtdcRspInfoField *error);

  /**
   * 期货发起冲正银行转期货请求, 银行处理完毕后报盘发回的通知
   */
  virtual void OnRtnRepealFromBankToFutureByFuture(
      CThostFtdcRspRepealField *data);

  /**
   * 期货发起冲正期货转银行请求, 银行处理完毕后报盘发回的通知
   */
  virtual void OnRtnRepealFromFutureToBankByFuture(
      CThostFtdcRspRepealField *data);

  /**
   * 期货发起银行资金转期货应答
   */
  virtual void OnRspFromBankToFutureByFuture(CThostFtdcReqTransferField *data,
                                             CThostFtdcRspInfoField *error,
                                             int request_id, bool last);

  /**
   * 期货发起期货资金转银行应答
   */
  virtual void OnRspFromFutureToBankByFuture(CThostFtdcReqTransferField *data,
                                             CThostFtdcRspInfoField *error,
                                             int request_id, bool last);

  /**
   * 期货发起查询银行余额应答
   */
  virtual void OnRspQueryBankAccountMoneyByFuture(
      CThostFtdcReqQueryAccountField *data, CThostFtdcRspInfoField *error,
      int request_id, bool last);

  /**
   * 银行发起银期开户通知
   */
  virtual void OnRtnOpenAccountByBank(CThostFtdcOpenAccountField *data);

  /**
   * 银行发起银期销户通知
   */
  virtual void OnRtnCancelAccountByBank(CThostFtdcCancelAccountField *data);

  /**
   * 银行发起变更银行账号通知
   */
  virtual void OnRtnChangeAccountByBank(CThostFtdcChangeAccountField *data);

  /* ---------------------------------------------------------------------------
   * 异步相关
   * ---------------------------------------------------------------------------
   */

  /**
   * Node层注册SPI事件回调
   * Example:
   *   ```
   *   let md = new CtpTd()
   *   md.on('FrontConnected', () => {...})
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
  CThostFtdcTraderApi *api_;

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

#endif /* CTP_TD_H */