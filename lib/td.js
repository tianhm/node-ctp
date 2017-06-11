'use strict'

const nodeCtp = require('../build/Release/node_ctp.node')
const iconv = require('iconv-lite')
iconv.skipDecodeWarning = true

/**
 * 封装C++层CtpTd类, 实现:
 *  1. API相关函数的Promise封装
 *  2. SPI相关函数的注册
 *
 * @class CtpTd
 * @extends {nodeCtp.CtpTd}
 */
class CtpTd extends nodeCtp.CtpTd {
  /**
   * CtpTd构造函数
   * @param {bool} enableLog 是否输出SPI函数日志
   */
  constructor (enableLog = false) {
    super()

    this._initEvent()
    this._enableLog = enableLog
  }

  /* ---------------------------------------------------------------------------
   * API函数
   * ---------------------------------------------------------------------------
   */

  /**
   * 创建TraderApi
   * @param flowPath 存贮订阅信息文件的目录, 默认为当前目录
   * @return 创建出的UserApi
   */
  async createFtdcTraderApi (flowPath) {
    return new Promise((resolve, reject) => {
      super.createFtdcTraderApi(flowPath, (err) => {
        err ? reject(err) : resolve()
      })
    })
  }

  /**
   * 获取API的版本信息
   * @retrun 获取到的版本号
   */
  async getApiVersion () {
    return new Promise((resolve, reject) => {
      super.getApiVersion((err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 初始化
   * @remark 初始化运行环境, 只有调用后,接口才开始工作
   */
  async init () {
    return new Promise((resolve, reject) => {
      super.init((err) => {
        err ? reject(err) : resolve()
      })
    })
  }

  /**
   * 安全退出
   */
  async exit () {
    return new Promise((resolve, reject) => {
      super.exit((err) => {
        err ? reject(err) : resolve()
      })
    })
  }

  /**
   * 获取当前交易日
   * @retrun 获取到的交易日
   * @remark 只有登录成功后, 才能得到正确的交易日
   */
  async getTradingDay () {
    return new Promise((resolve, reject) => {
      super.getTradingDay((err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 注册前置机网络地址
   * @param frontAddress 前置机网络地址
   * @remark 网络地址的格式为: "protocol: *ipaddress:port", 如: "tcp: *127.0.0.1:17001"
   * @remark "tcp"代表传输协议, "127.0.0.1"代表服务器地址, "17001"代表服务器端口号
   */
  async registerFront (frontAddress) {
    return new Promise((resolve, reject) => {
      super.registerFront(frontAddress, (err) => {
        err ? reject(err) : resolve()
      })
    })
  }

  /**
   * 注册名字服务器网络地址
   * @param nsAddress 名字服务器网络地址
   * @remark 网络地址的格式为: "protocol: *ipaddress:port", 如: "tcp: *127.0.0.1:12001"
   * @remark "tcp"代表传输协议, "127.0.0.1"代表服务器地址, "12001"代表服务器端口号
   * @remark RegisterNameServer优先于RegisterFront
   */
  async registerNameServer (nsAddress) {
    return new Promise((resolve, reject) => {
      super.registerNameServer(nsAddress, (err) => {
        err ? reject(err) : resolve()
      })
    })
  }

  /**
   * 注册名字服务器用户信息
   * @param fensUserInfo 用户信息
   */
  async registerFensUserInfo (fensUserInfo) {
    return new Promise((resolve, reject) => {
      super.registerFensUserInfo(fensUserInfo, (err) => {
        err ? reject(err) : resolve()
      })
    })
  }

  /**
   * 订阅私有流
   * @param resumeType 私有流重传方式
   *         THOST_TERT_RESTART: 从本交易日开始重传
   *         THOST_TERT_RESUME: 从上次收到的续传
   *         THOST_TERT_QUICK: 只传送登录后私有流的内容
   * @remark 该方法要在Init方法前调用. 若不调用则不会收到私有流的数据
   */
  async subscribePrivateTopic (resumeType) {
    return new Promise((resolve, reject) => {
      super.subscribePrivateTopic(resumeType, (err) => {
        err ? reject(err) : resolve()
      })
    })
  }

  /**
   * 订阅公共流
   * @param resumeType 公共流重传方式
   *         THOST_TERT_RESTART: 从本交易日开始重传
   *         THOST_TERT_RESUME: 从上次收到的续传
   *         THOST_TERT_QUICK: 只传送登录后公共流的内容
   * @remark 该方法要在Init方法前调用. 若不调用则不会收到公共流的数据
   */
  async subscribePublicTopic (resumeType) {
    return new Promise((resolve, reject) => {
      super.subscribePublicTopic(resumeType, (err) => {
        err ? reject(err) : resolve()
      })
    })
  }

  /**
   * 客户端认证请求
   */
  async reqAuthenticate (reqAuthenticateField, requestID) {
    return new Promise((resolve, reject) => {
      super.reqAuthenticate(reqAuthenticateField, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 用户登录请求
   */
  async reqUserLogin (reqUserLoginField, requestID) {
    return new Promise((resolve, reject) => {
      super.reqUserLogin(reqUserLoginField, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 登出请求
   */
  async reqUserLogout (userLogout, requestID) {
    return new Promise((resolve, reject) => {
      super.reqUserLogout(userLogout, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 用户口令更新请求
   */
  async reqUserPasswordUpdate (userPasswordUpdate, requestID) {
    return new Promise((resolve, reject) => {
      super.reqUserPasswordUpdate(userPasswordUpdate, requestID, (err,
        data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 资金账户口令更新请求
   */
  async reqTradingAccountPasswordUpdate (tradingAccountPasswordUpdate,
    requestID) {
    return new Promise((resolve, reject) => {
      super.reqTradingAccountPasswordUpdate(
        tradingAccountPasswordUpdate, requestID, (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 报单录入请求
   */
  async reqOrderInsert (inputOrder, requestID) {
    return new Promise((resolve, reject) => {
      super.reqOrderInsert(inputOrder, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 预埋单录入请求
   */
  async reqParkedOrderInsert (parkedOrder, requestID) {
    return new Promise((resolve, reject) => {
      super.reqParkedOrderInsert(parkedOrder, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 预埋撤单录入请求
   */
  async reqParkedOrderAction (parkedOrderAction, requestID) {
    return new Promise((resolve, reject) => {
      super.reqParkedOrderAction(parkedOrderAction, requestID, (err,
        data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 报单操作请求
   */
  async reqOrderAction (inputOrderAction, requestID) {
    return new Promise((resolve, reject) => {
      super.reqOrderAction(inputOrderAction, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 查询最大报单数量请求
   */
  async reqQueryMaxOrderVolume (queryMaxOrderVolume, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQueryMaxOrderVolume(queryMaxOrderVolume, requestID, (err,
        data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 投资者结算结果确认
   */
  async reqSettlementInfoConfirm (settlementInfoConfirm, requestID) {
    return new Promise((resolve, reject) => {
      super.reqSettlementInfoConfirm(settlementInfoConfirm, requestID,
        (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 请求删除预埋单
   */
  async reqRemoveParkedOrder (removeParkedOrder, requestID) {
    return new Promise((resolve, reject) => {
      super.reqRemoveParkedOrder(removeParkedOrder, requestID, (err,
        data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求删除预埋撤单
   */
  async reqRemoveParkedOrderAction (removeParkedOrderAction, requestID) {
    return new Promise((resolve, reject) => {
      super.reqRemoveParkedOrderAction(removeParkedOrderAction,
        requestID, (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 执行宣告录入请求
   */
  async reqExecOrderInsert (inputExecOrder, requestID) {
    return new Promise((resolve, reject) => {
      super.reqExecOrderInsert(inputExecOrder, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 执行宣告操作请求
   */
  async reqExecOrderAction (inputExecOrderAction, requestID) {
    return new Promise((resolve, reject) => {
      super.reqExecOrderAction(inputExecOrderAction, requestID, (err,
        data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 询价录入请求
   */
  async reqForQuoteInsert (inputForQuote, requestID) {
    return new Promise((resolve, reject) => {
      super.reqForQuoteInsert(inputForQuote, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 报价录入请求
   */
  async reqQuoteInsert (inputQuote, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQuoteInsert(inputQuote, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 报价操作请求
   */
  async reqQuoteAction (inputQuoteAction, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQuoteAction(inputQuoteAction, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 锁定请求
   */
  async reqLockInsert (inputLock, requestID) {
    return new Promise((resolve, reject) => {
      super.reqLockInsert(inputLock, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 批量报单操作请求
   */
  async reqBatchOrderAction (inputBatchOrderAction, requestID) {
    return new Promise((resolve, reject) => {
      super.reqBatchOrderAction(inputBatchOrderAction, requestID, (err,
        data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 申请组合录入请求
   */
  async reqCombActionInsert (inputCombAction, requestID) {
    return new Promise((resolve, reject) => {
      super.reqCombActionInsert(inputCombAction, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询报单
   */
  async reqQryOrder (qryOrder, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryOrder(qryOrder, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询成交
   */
  async reqQryTrade (qryTrade, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryTrade(qryTrade, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询投资者持仓
   */
  async reqQryInvestorPosition (qryInvestorPosition, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryInvestorPosition(qryInvestorPosition, requestID, (err,
        data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询资金账户
   */
  async reqQryTradingAccount (qryTradingAccount, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryTradingAccount(qryTradingAccount, requestID, (err,
        data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询投资者
   */
  async reqQryInvestor (qryInvestor, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryInvestor(qryInvestor, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询交易编码
   */
  async reqQryTradingCode (qryTradingCode, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryTradingCode(qryTradingCode, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询合约保证金率
   */
  async reqQryInstrumentMarginRate (qryInstrumentMarginRate, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryInstrumentMarginRate(qryInstrumentMarginRate,
        requestID, (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 请求查询合约手续费率
   */
  async reqQryInstrumentCommissionRate (qryInstrumentCommissionRate, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryInstrumentCommissionRate(qryInstrumentCommissionRate,
        requestID, (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 请求查询交易所
   */
  async reqQryExchange (qryExchange, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryExchange(qryExchange, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询产品
   */
  async reqQryProduct (qryProduct, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryProduct(qryProduct, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询合约
   */
  async reqQryInstrument (qryInstrument, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryInstrument(qryInstrument, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询行情
   */
  async reqQryDepthMarketData (qryDepthMarketData, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryDepthMarketData(qryDepthMarketData, requestID, (err,
        data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询投资者结算结果
   */
  async reqQrySettlementInfo (qrySettlementInfo, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQrySettlementInfo(qrySettlementInfo, requestID, (err,
        data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询转帐银行
   */
  async reqQryTransferBank (qryTransferBank, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryTransferBank(qryTransferBank, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询投资者持仓明细
   */
  async reqQryInvestorPositionDetail (qryInvestorPositionDetail, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryInvestorPositionDetail(qryInvestorPositionDetail,
        requestID, (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 请求查询客户通知
   */
  async reqQryNotice (qryNotice, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryNotice(qryNotice, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询结算信息确认
   */
  async reqQrySettlementInfoConfirm (qrySettlementInfoConfirm, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQrySettlementInfoConfirm(qrySettlementInfoConfirm,
        requestID, (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 请求查询投资者持仓明细
   */
  async reqQryInvestorPositionCombineDetail (qryInvestorPositionCombineDetail,
    requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryInvestorPositionCombineDetail(
        qryInvestorPositionCombineDetail, requestID, (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 请求查询保证金监管系统经纪公司资金账户密钥
   */
  async reqQryCFMMCTradingAccountKey (qryCFMMCTradingAccountKey, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryCFMMCTradingAccountKey(qryCFMMCTradingAccountKey,
        requestID, (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 请求查询仓单折抵信息
   */
  async reqQryEWarrantOffset (qryEWarrantOffset, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryEWarrantOffset(qryEWarrantOffset, requestID, (err,
        data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询投资者品种/跨品种保证金
   */
  async reqQryInvestorProductGroupMargin (qryInvestorProductGroupMargin,
    requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryInvestorProductGroupMargin(
        qryInvestorProductGroupMargin, requestID, (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 请求查询交易所保证金率
   */
  async reqQryExchangeMarginRate (qryExchangeMarginRate, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryExchangeMarginRate(qryExchangeMarginRate, requestID,
        (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 请求查询交易所调整保证金率
   */
  async reqQryExchangeMarginRateAdjust (qryExchangeMarginRateAdjust, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryExchangeMarginRateAdjust(qryExchangeMarginRateAdjust,
        requestID, (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 请求查询汇率
   */
  async reqQryExchangeRate (qryExchangeRate, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryExchangeRate(qryExchangeRate, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询二级代理操作员银期权限
   */
  async reqQrySecAgentACIDMap (qrySecAgentACIDMap, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQrySecAgentACIDMap(qrySecAgentACIDMap, requestID, (err,
        data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询产品报价汇率
   */
  async reqQryProductExchRate (qryProductExchRate, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryProductExchRate(qryProductExchRate, requestID, (err,
        data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询产品组
   */
  async reqQryProductGroup (qryProductGroup, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryProductGroup(qryProductGroup, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询做市商合约手续费率
   */
  async reqQryMMInstrumentCommissionRate (qryMMInstrumentCommissionRate,
    requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryMMInstrumentCommissionRate(
        qryMMInstrumentCommissionRate, requestID, (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 请求查询做市商期权合约手续费
   */
  async reqQryMMOptionInstrCommRate (qryMMOptionInstrCommRate, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryMMOptionInstrCommRate(qryMMOptionInstrCommRate,
        requestID, (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 请求查询报单手续费
   */
  async reqQryInstrumentOrderCommRate (qryInstrumentOrderCommRate, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryInstrumentOrderCommRate(qryInstrumentOrderCommRate,
        requestID, (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 请求查询期权交易成本
   */
  async reqQryOptionInstrTradeCost (qryOptionInstrTradeCost, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryOptionInstrTradeCost(qryOptionInstrTradeCost,
        requestID, (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 请求查询期权合约手续费
   */
  async reqQryOptionInstrCommRate (qryOptionInstrCommRate, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryOptionInstrCommRate(qryOptionInstrCommRate, requestID,
        (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 请求查询执行宣告
   */
  async reqQryExecOrder (qryExecOrder, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryExecOrder(qryExecOrder, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询询价
   */
  async reqQryForQuote (qryForQuote, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryForQuote(qryForQuote, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询报价
   */
  async reqQryQuote (qryQuote, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryQuote(qryQuote, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询锁定
   */
  async reqQryLock (qryLock, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryLock(qryLock, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询锁定证券仓位
   */
  async reqQryLockPosition (qryLockPosition, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryLockPosition(qryLockPosition, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询ETF期权合约手续费
   */
  async reqQryETFOptionInstrCommRate (qryETFOptionInstrCommRate, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryETFOptionInstrCommRate(qryETFOptionInstrCommRate,
        requestID, (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 请求查询投资者分级
   */
  async reqQryInvestorLevel (qryInvestorLevel, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryInvestorLevel(qryInvestorLevel, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询E+1日行权冻结
   */
  async reqQryExecFreeze (qryExecFreeze, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryExecFreeze(qryExecFreeze, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询组合合约安全系数
   */
  async reqQryCombInstrumentGuard (qryCombInstrumentGuard, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryCombInstrumentGuard(qryCombInstrumentGuard, requestID,
        (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 请求查询申请组合
   */
  async reqQryCombAction (qryCombAction, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryCombAction(qryCombAction, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询转帐流水
   */
  async reqQryTransferSerial (qryTransferSerial, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryTransferSerial(qryTransferSerial, requestID, (err,
        data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询银期签约关系
   */
  async reqQryAccountregister (qryAccountregister, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryAccountregister(qryAccountregister, requestID, (err,
        data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询签约银行
   */
  async reqQryContractBank (qryContractBank, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryContractBank(qryContractBank, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询预埋单
   */
  async reqQryParkedOrder (qryParkedOrder, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryParkedOrder(qryParkedOrder, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询预埋撤单
   */
  async reqQryParkedOrderAction (qryParkedOrderAction, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryParkedOrderAction(qryParkedOrderAction, requestID, (
        err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询交易通知
   */
  async reqQryTradingNotice (qryTradingNotice, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryTradingNotice(qryTradingNotice, requestID, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 请求查询经纪公司交易参数
   */
  async reqQryBrokerTradingParams (qryBrokerTradingParams, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryBrokerTradingParams(qryBrokerTradingParams, requestID,
        (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 请求查询经纪公司交易算法
   */
  async reqQryBrokerTradingAlgos (qryBrokerTradingAlgos, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQryBrokerTradingAlgos(qryBrokerTradingAlgos, requestID,
        (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 请求查询监控中心用户令牌
   */
  async reqQueryCFMMCTradingAccountToken (queryCFMMCTradingAccountToken,
    requestID) {
    return new Promise((resolve, reject) => {
      super.reqQueryCFMMCTradingAccountToken(
        queryCFMMCTradingAccountToken, requestID, (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /**
   * 期货发起银行资金转期货请求
   */
  async reqFromBankToFutureByFuture (reqTransfer, requestID) {
    return new Promise((resolve, reject) => {
      super.reqFromBankToFutureByFuture(reqTransfer, requestID, (err,
        data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 期货发起期货资金转银行请求
   */
  async reqFromFutureToBankByFuture (reqTransfer, requestID) {
    return new Promise((resolve, reject) => {
      super.reqFromFutureToBankByFuture(reqTransfer, requestID, (err,
        data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 期货发起查询银行余额请求
   */
  async reqQueryBankAccountMoneyByFuture (reqQueryAccount, requestID) {
    return new Promise((resolve, reject) => {
      super.reqQueryBankAccountMoneyByFuture(reqQueryAccount, requestID,
        (err, data) => {
          err ? reject(err) : resolve(data)
        })
    })
  }

  /* ---------------------------------------------------------------------------
   * SPI函数
   * ---------------------------------------------------------------------------
   */

  _initEvent () {
    super.on('FrontConnected', () => {
      this.onFrontConnected()
    })
    super.on('FrontDisconnected', (reason) => {
      this.onFrontDisconnected(reason)
    })
    super.on('HeartBeatWarning', (timeLapse) => {
      this.onHeartBeatWarning(timeLapse)
    })
    super.on('RspAuthenticate', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspAuthenticate(data, info, requestId, isLast)
    })
    super.on('RspUserLogin', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspUserLogin(data, info, requestId, isLast)
    })
    super.on('RspUserLogout', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspUserLogout(data, info, requestId, isLast)
    })
    super.on('RspUserPasswordUpdate', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspUserPasswordUpdate(data, info, requestId, isLast)
    })
    super.on('RspTradingAccountPasswordUpdate', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspTradingAccountPasswordUpdate(data, info, requestId, isLast)
    })
    super.on('RspOrderInsert', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspOrderInsert(data, info, requestId, isLast)
    })
    super.on('RspParkedOrderInsert', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspParkedOrderInsert(data, info, requestId, isLast)
    })
    super.on('RspParkedOrderAction', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspParkedOrderAction(data, info, requestId, isLast)
    })
    super.on('RspOrderAction', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspOrderAction(data, info, requestId, isLast)
    })
    super.on('RspQueryMaxOrderVolume', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQueryMaxOrderVolume(data, info, requestId, isLast)
    })
    super.on('RspSettlementInfoConfirm', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspSettlementInfoConfirm(data, info, requestId, isLast)
    })
    super.on('RspRemoveParkedOrder', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspRemoveParkedOrder(data, info, requestId, isLast)
    })
    super.on('RspRemoveParkedOrderAction', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspRemoveParkedOrderAction(data, info, requestId, isLast)
    })
    super.on('RspExecOrderInsert', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspExecOrderInsert(data, info, requestId, isLast)
    })
    super.on('RspExecOrderAction', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspExecOrderAction(data, info, requestId, isLast)
    })
    super.on('RspForQuoteInsert', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspForQuoteInsert(data, info, requestId, isLast)
    })
    super.on('RspQuoteInsert', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQuoteInsert(data, info, requestId, isLast)
    })
    super.on('RspQuoteAction', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQuoteAction(data, info, requestId, isLast)
    })
    super.on('RspLockInsert', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspLockInsert(data, info, requestId, isLast)
    })
    super.on('RspBatchOrderAction', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspBatchOrderAction(data, info, requestId, isLast)
    })
    super.on('RspCombActionInsert', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspCombActionInsert(data, info, requestId, isLast)
    })
    super.on('RspQryOrder', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryOrder(data, info, requestId, isLast)
    })
    super.on('RspQryTrade', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryTrade(data, info, requestId, isLast)
    })
    super.on('RspQryInvestorPosition', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryInvestorPosition(data, info, requestId, isLast)
    })
    super.on('RspQryTradingAccount', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryTradingAccount(data, info, requestId, isLast)
    })
    super.on('RspQryInvestor', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryInvestor(data, info, requestId, isLast)
    })
    super.on('RspQryTradingCode', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryTradingCode(data, info, requestId, isLast)
    })
    super.on('RspQryInstrumentMarginRate', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryInstrumentMarginRate(data, info, requestId, isLast)
    })
    super.on('RspQryInstrumentCommissionRate', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryInstrumentCommissionRate(data, info, requestId, isLast)
    })
    super.on('RspQryExchange', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryExchange(data, info, requestId, isLast)
    })
    super.on('RspQryProduct', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryProduct(data, info, requestId, isLast)
    })
    super.on('RspQryInstrument', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      data.InstrumentName = iconv.decode(data.InstrumentName, 'gbk')
      this.onRspQryInstrument(data, info, requestId, isLast)
    })
    super.on('RspQryDepthMarketData', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryDepthMarketData(data, info, requestId, isLast)
    })
    super.on('RspQrySettlementInfo', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQrySettlementInfo(data, info, requestId, isLast)
    })
    super.on('RspQryTransferBank', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryTransferBank(data, info, requestId, isLast)
    })
    super.on('RspQryInvestorPositionDetail', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryInvestorPositionDetail(data, info, requestId, isLast)
    })
    super.on('RspQryNotice', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryNotice(data, info, requestId, isLast)
    })
    super.on('RspQrySettlementInfoConfirm', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQrySettlementInfoConfirm(data, info, requestId, isLast)
    })
    super.on('RspQryInvestorPositionCombineDetail', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryInvestorPositionCombineDetail(data, info, requestId, isLast)
    })
    super.on('RspQryCFMMCTradingAccountKey', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryCFMMCTradingAccountKey(data, info, requestId, isLast)
    })
    super.on('RspQryEWarrantOffset', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryEWarrantOffset(data, info, requestId, isLast)
    })
    super.on('RspQryInvestorProductGroupMargin', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryInvestorProductGroupMargin(data, info, requestId, isLast)
    })
    super.on('RspQryExchangeMarginRate', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryExchangeMarginRate(data, info, requestId, isLast)
    })
    super.on('RspQryExchangeMarginRateAdjust', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryExchangeMarginRateAdjust(data, info, requestId, isLast)
    })
    super.on('RspQryExchangeRate', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryExchangeRate(data, info, requestId, isLast)
    })
    super.on('RspQrySecAgentACIDMap', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQrySecAgentACIDMap(data, info, requestId, isLast)
    })
    super.on('RspQryProductExchRate', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryProductExchRate(data, info, requestId, isLast)
    })
    super.on('RspQryProductGroup', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryProductGroup(data, info, requestId, isLast)
    })
    super.on('RspQryMMInstrumentCommissionRate', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryMMInstrumentCommissionRate(data, info, requestId, isLast)
    })
    super.on('RspQryMMOptionInstrCommRate', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryMMOptionInstrCommRate(data, info, requestId, isLast)
    })
    super.on('RspQryInstrumentOrderCommRate', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryInstrumentOrderCommRate(data, info, requestId, isLast)
    })
    super.on('RspQryOptionInstrTradeCost', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryOptionInstrTradeCost(data, info, requestId, isLast)
    })
    super.on('RspQryOptionInstrCommRate', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryOptionInstrCommRate(data, info, requestId, isLast)
    })
    super.on('RspQryExecOrder', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryExecOrder(data, info, requestId, isLast)
    })
    super.on('RspQryForQuote', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryForQuote(data, info, requestId, isLast)
    })
    super.on('RspQryQuote', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryQuote(data, info, requestId, isLast)
    })
    super.on('RspQryLock', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryLock(data, info, requestId, isLast)
    })
    super.on('RspQryLockPosition', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryLockPosition(data, info, requestId, isLast)
    })
    super.on('RspQryETFOptionInstrCommRate', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryETFOptionInstrCommRate(data, info, requestId, isLast)
    })
    super.on('RspQryInvestorLevel', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryInvestorLevel(data, info, requestId, isLast)
    })
    super.on('RspQryExecFreeze', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryExecFreeze(data, info, requestId, isLast)
    })
    super.on('RspQryCombInstrumentGuard', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryCombInstrumentGuard(data, info, requestId, isLast)
    })
    super.on('RspQryCombAction', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryCombAction(data, info, requestId, isLast)
    })
    super.on('RspQryTransferSerial', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryTransferSerial(data, info, requestId, isLast)
    })
    super.on('RspQryAccountregister', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryAccountregister(data, info, requestId, isLast)
    })
    super.on('RspError', (info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspError(info, requestId, isLast)
    })
    super.on('RtnOrder', (data) => {
      this.onRtnOrder(data)
    })
    super.on('RtnTrade', (data) => {
      this.onRtnTrade(data)
    })
    super.on('ErrRtnOrderInsert', (data, info) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onErrRtnOrderInsert(data, info)
    })
    super.on('ErrRtnOrderAction', (data, info) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onErrRtnOrderAction(data, info)
    })
    super.on('RtnInstrumentStatus', (data) => {
      this.onRtnInstrumentStatus(data)
    })
    super.on('RtnBulletin', (data) => {
      this.onRtnBulletin(data)
    })
    super.on('RtnTradingNotice', (data) => {
      this.onRtnTradingNotice(data)
    })
    super.on('RtnErrorConditionalOrder', (data) => {
      this.onRtnErrorConditionalOrder(data)
    })
    super.on('RtnExecOrder', (data) => {
      this.onRtnExecOrder(data)
    })
    super.on('ErrRtnExecOrderInsert', (data, info) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onErrRtnExecOrderInsert(data, info)
    })
    super.on('ErrRtnExecOrderAction', (data, info) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onErrRtnExecOrderAction(data, info)
    })
    super.on('ErrRtnForQuoteInsert', (data, info) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onErrRtnForQuoteInsert(data, info)
    })
    super.on('RtnQuote', (data) => {
      this.onRtnQuote(data)
    })
    super.on('ErrRtnQuoteInsert', (data, info) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onErrRtnQuoteInsert(data, info)
    })
    super.on('ErrRtnQuoteAction', (data, info) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onErrRtnQuoteAction(data, info)
    })
    super.on('RtnForQuoteRsp', (data) => {
      this.onRtnForQuoteRsp(data)
    })
    super.on('RtnCFMMCTradingAccountToken', (data) => {
      this.onRtnCFMMCTradingAccountToken(data)
    })
    super.on('RtnLock', (data) => {
      this.onRtnLock(data)
    })
    super.on('ErrRtnLockInsert', (data, info) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onErrRtnLockInsert(data, info)
    })
    super.on('ErrRtnBatchOrderAction', (data, info) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onErrRtnBatchOrderAction(data, info)
    })
    super.on('RtnCombAction', (data) => {
      this.onRtnCombAction(data)
    })
    super.on('ErrRtnCombActionInsert', (data, info) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onErrRtnCombActionInsert(data, info)
    })
    super.on('RspQryContractBank', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryContractBank(data, info, requestId, isLast)
    })
    super.on('RspQryParkedOrder', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryParkedOrder(data, info, requestId, isLast)
    })
    super.on('RspQryParkedOrderAction', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryParkedOrderAction(data, info, requestId, isLast)
    })
    super.on('RspQryTradingNotice', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryTradingNotice(data, info, requestId, isLast)
    })
    super.on('RspQryBrokerTradingParams', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryBrokerTradingParams(data, info, requestId, isLast)
    })
    super.on('RspQryBrokerTradingAlgos', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQryBrokerTradingAlgos(data, info, requestId, isLast)
    })
    super.on('RspQueryCFMMCTradingAccountToken', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQueryCFMMCTradingAccountToken(data, info, requestId, isLast)
    })
    super.on('RtnFromBankToFutureByBank', (data) => {
      this.onRtnFromBankToFutureByBank(data)
    })
    super.on('RtnFromFutureToBankByBank', (data) => {
      this.onRtnFromFutureToBankByBank(data)
    })
    super.on('RtnRepealFromBankToFutureByBank', (data) => {
      this.onRtnRepealFromBankToFutureByBank(data)
    })
    super.on('RtnRepealFromFutureToBankByBank', (data) => {
      this.onRtnRepealFromFutureToBankByBank(data)
    })
    super.on('RtnFromBankToFutureByFuture', (data) => {
      this.onRtnFromBankToFutureByFuture(data)
    })
    super.on('RtnFromFutureToBankByFuture', (data) => {
      this.onRtnFromFutureToBankByFuture(data)
    })
    super.on('RtnRepealFromBankToFutureByFutureManual', (data) => {
      this.onRtnRepealFromBankToFutureByFutureManual(data)
    })
    super.on('RtnRepealFromFutureToBankByFutureManual', (data) => {
      this.onRtnRepealFromFutureToBankByFutureManual(data)
    })
    super.on('RtnQueryBankBalanceByFuture', (data) => {
      this.onRtnQueryBankBalanceByFuture(data)
    })
    super.on('ErrRtnBankToFutureByFuture', (data, info) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onErrRtnBankToFutureByFuture(data, info)
    })
    super.on('ErrRtnFutureToBankByFuture', (data, info) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onErrRtnFutureToBankByFuture(data, info)
    })
    super.on('ErrRtnRepealBankToFutureByFutureManual', (data, info) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onErrRtnRepealBankToFutureByFutureManual(data, info)
    })
    super.on('ErrRtnRepealFutureToBankByFutureManual', (data, info) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onErrRtnRepealFutureToBankByFutureManual(data, info)
    })
    super.on('ErrRtnQueryBankBalanceByFuture', (data, info) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onErrRtnQueryBankBalanceByFuture(data, info)
    })
    super.on('RtnRepealFromBankToFutureByFuture', (data) => {
      this.onRtnRepealFromBankToFutureByFuture(data)
    })
    super.on('RtnRepealFromFutureToBankByFuture', (data) => {
      this.onRtnRepealFromFutureToBankByFuture(data)
    })
    super.on('RspFromBankToFutureByFuture', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspFromBankToFutureByFuture(data, info, requestId, isLast)
    })
    super.on('RspFromFutureToBankByFuture', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspFromFutureToBankByFuture(data, info, requestId, isLast)
    })
    super.on('RspQueryBankAccountMoneyByFuture', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspQueryBankAccountMoneyByFuture(data, info, requestId, isLast)
    })
    super.on('RtnOpenAccountByBank', (data) => {
      this.onRtnOpenAccountByBank(data)
    })
    super.on('RtnCancelAccountByBank', (data) => {
      this.onRtnCancelAccountByBank(data)
    })
    super.on('RtnChangeAccountByBank', (data) => {
      this.onRtnChangeAccountByBank(data)
    })
  }

  _emitLog (...message) {
    if (this._enableLog) {
      console.log(message)
    }
  }

  /**
   * 当客户端与交易后台建立起通信连接时(还未登录前), 该方法被调用
   */
  onFrontConnected () {
    this._emitLog('OnFrontConnected')
  }

  /**
   * 当客户端与交易后台通信连接断开时, 该方法被调用. 当发生这个情况后, API会自动重新连接, 客户端可不做处理
   * @param reason 错误原因
   *         0x1001 网络读失败
   *         0x1002 网络写失败
   *         0x2001 接收心跳超时
   *         0x2002 发送心跳失败
   *         0x2003 收到错误报文
   */
  onFrontDisconnected (reason) {
    this._emitLog('OnFrontDisconnected', reason)
  }

  /**
   * 心跳超时警告. 当长时间未收到报文时, 该方法被调用
   * @param timeLapse 距离上次接收报文的时间
   */
  onHeartBeatWarning (timeLapse) {
    this._emitLog('OnHeartBeatWarning', timeLapse)
  }

  /**
   * 客户端认证响应
   */
  onRspAuthenticate (data, info, requestId, isLast) {
    this._emitLog('OnRspAuthenticate', data, info, requestId, isLast)
  }

  /**
   * 登录请求响应
   */
  onRspUserLogin (data, info, requestId, isLast) {
    this._emitLog('OnRspUserLogin', data, info, requestId, isLast)
  }

  /**
   * 登出请求响应
   */
  onRspUserLogout (data, info, requestId, isLast) {
    this._emitLog('OnRspUserLogout', data, info, requestId, isLast)
  }

  /**
   * 用户口令更新请求响应
   */
  onRspUserPasswordUpdate (data, info, requestId, isLast) {
    this._emitLog('OnRspUserPasswordUpdate', data, info, requestId,
      isLast)
  }

  /**
   * 资金账户口令更新请求响应
   */
  onRspTradingAccountPasswordUpdate (data, info, requestId, isLast) {
    this._emitLog('OnRspTradingAccountPasswordUpdate', data, info,
      requestId, isLast)
  }

  /**
   * 报单录入请求响应
   */
  onRspOrderInsert (data, info, requestId, isLast) {
    this._emitLog('OnRspOrderInsert', data, info, requestId, isLast)
  }

  /**
   * 预埋单录入请求响应
   */
  onRspParkedOrderInsert (data, info, requestId, isLast) {
    this._emitLog('OnRspParkedOrderInsert', data, info, requestId,
      isLast)
  }

  /**
   * 预埋撤单录入请求响应
   */
  onRspParkedOrderAction (data, info, requestId, isLast) {
    this._emitLog('OnRspParkedOrderAction', data, info, requestId,
      isLast)
  }

  /**
   * 报单操作请求响应
   */
  onRspOrderAction (data, info, requestId, isLast) {
    this._emitLog('OnRspOrderAction', data, info, requestId, isLast)
  }

  /**
   * 查询最大报单数量响应
   */
  onRspQueryMaxOrderVolume (data, info, requestId, isLast) {
    this._emitLog('OnRspQueryMaxOrderVolume', data, info, requestId,
      isLast)
  }

  /**
   * 投资者结算结果确认响应
   */
  onRspSettlementInfoConfirm (data, info, requestId, isLast) {
    this._emitLog('OnRspSettlementInfoConfirm', data, info, requestId,
      isLast)
  }

  /**
   * 删除预埋单响应
   */
  onRspRemoveParkedOrder (data, info, requestId, isLast) {
    this._emitLog('OnRspRemoveParkedOrder', data, info, requestId,
      isLast)
  }

  /**
   * 删除预埋撤单响应
   */
  onRspRemoveParkedOrderAction (data, info, requestId, isLast) {
    this._emitLog('OnRspRemoveParkedOrderAction', data, info, requestId,
      isLast)
  }

  /**
   * 执行宣告录入请求响应
   */
  onRspExecOrderInsert (data, info, requestId, isLast) {
    this._emitLog('OnRspExecOrderInsert', data, info, requestId, isLast)
  }

  /**
   * 执行宣告操作请求响应
   */
  onRspExecOrderAction (data, info, requestId, isLast) {
    this._emitLog('OnRspExecOrderAction', data, info, requestId, isLast)
  }

  /**
   * 询价录入请求响应
   */
  onRspForQuoteInsert (data, info, requestId, isLast) {
    this._emitLog('OnRspForQuoteInsert', data, info, requestId, isLast)
  }

  /**
   * 报价录入请求响应
   */
  onRspQuoteInsert (data, info, requestId, isLast) {
    this._emitLog('OnRspQuoteInsert', data, info, requestId, isLast)
  }

  /**
   * 报价操作请求响应
   */
  onRspQuoteAction (data, info, requestId, isLast) {
    this._emitLog('OnRspQuoteAction', data, info, requestId, isLast)
  }

  /**
   * 锁定应答
   */
  onRspLockInsert (data, info, requestId, isLast) {
    this._emitLog('OnRspLockInsert', data, info, requestId, isLast)
  }

  /**
   * 批量报单操作请求响应
   */
  onRspBatchOrderAction (data, info, requestId, isLast) {
    this._emitLog('OnRspBatchOrderAction', data, info, requestId, isLast)
  }

  /**
   * 申请组合录入请求响应
   */
  onRspCombActionInsert (data, info, requestId, isLast) {
    this._emitLog('OnRspCombActionInsert', data, info, requestId, isLast)
  }

  /**
   * 请求查询报单响应
   */
  onRspQryOrder (data, info, requestId, isLast) {
    this._emitLog('OnRspQryOrder', data, info, requestId, isLast)
  }

  /**
   * 请求查询成交响应
   */
  onRspQryTrade (data, info, requestId, isLast) {
    this._emitLog('OnRspQryTrade', data, info, requestId, isLast)
  }

  /**
   * 请求查询投资者持仓响应
   */
  onRspQryInvestorPosition (data, info, requestId, isLast) {
    this._emitLog('OnRspQryInvestorPosition', data, info, requestId,
      isLast)
  }

  /**
   * 请求查询资金账户响应
   */
  onRspQryTradingAccount (data, info, requestId, isLast) {
    this._emitLog('OnRspQryTradingAccount', data, info, requestId,
      isLast)
  }

  /**
   * 请求查询投资者响应
   */
  onRspQryInvestor (data, info, requestId, isLast) {
    this._emitLog('OnRspQryInvestor', data, info, requestId, isLast)
  }

  /**
   * 请求查询交易编码响应
   */
  onRspQryTradingCode (data, info, requestId, isLast) {
    this._emitLog('OnRspQryTradingCode', data, info, requestId, isLast)
  }

  /**
   * 请求查询合约保证金率响应
   */
  onRspQryInstrumentMarginRate (data, info, requestId, isLast) {
    this._emitLog('OnRspQryInstrumentMarginRate', data, info, requestId,
      isLast)
  }

  /**
   * 请求查询合约手续费率响应
   */
  onRspQryInstrumentCommissionRate (data, info, requestId, isLast) {
    this._emitLog('OnRspQryInstrumentCommissionRate', data, info,
      requestId, isLast)
  }

  /**
   * 请求查询交易所响应
   */
  onRspQryExchange (data, info, requestId, isLast) {
    this._emitLog('OnRspQryExchange', data, info, requestId, isLast)
  }

  /**
   * 请求查询产品响应
   */
  onRspQryProduct (data, info, requestId, isLast) {
    this._emitLog('OnRspQryProduct', data, info, requestId, isLast)
  }

  /**
   * 请求查询合约响应
   */
  onRspQryInstrument (data, info, requestId, isLast) {
    this._emitLog('OnRspQryInstrument', data, info, requestId, isLast)
  }

  /**
   * 请求查询行情响应
   */
  onRspQryDepthMarketData (data, info, requestId, isLast) {
    this._emitLog('OnRspQryDepthMarketData', data, info, requestId,
      isLast)
  }

  /**
   * 请求查询投资者结算结果响应
   */
  onRspQrySettlementInfo (data, info, requestId, isLast) {
    this._emitLog('OnRspQrySettlementInfo', data, info, requestId,
      isLast)
  }

  /**
   * 请求查询转帐银行响应
   */
  onRspQryTransferBank (data, info, requestId, isLast) {
    this._emitLog('OnRspQryTransferBank', data, info, requestId, isLast)
  }

  /**
   * 请求查询投资者持仓明细响应
   */
  onRspQryInvestorPositionDetail (data, info, requestId, isLast) {
    this._emitLog('OnRspQryInvestorPositionDetail', data, info,
      requestId, isLast)
  }

  /**
   * 请求查询客户通知响应
   */
  onRspQryNotice (data, info, requestId, isLast) {
    this._emitLog('OnRspQryNotice', data, info, requestId, isLast)
  }

  /**
   * 请求查询结算信息确认响应
   */
  onRspQrySettlementInfoConfirm (data, info, requestId, isLast) {
    this._emitLog('OnRspQrySettlementInfoConfirm', data, info, requestId,
      isLast)
  }

  /**
   * 请求查询投资者持仓明细响应
   */
  onRspQryInvestorPositionCombineDetail (data, info, requestId, isLast) {
    this._emitLog('OnRspQryInvestorPositionCombineDetail', data, info,
      requestId, isLast)
  }

  /**
   * 查询保证金监管系统经纪公司资金账户密钥响应
   */
  onRspQryCFMMCTradingAccountKey (data, info, requestId, isLast) {
    this._emitLog('OnRspQryCFMMCTradingAccountKey', data, info,
      requestId, isLast)
  }

  /**
   * 请求查询仓单折抵信息响应
   */
  onRspQryEWarrantOffset (data, info, requestId, isLast) {
    this._emitLog('OnRspQryEWarrantOffset', data, info, requestId,
      isLast)
  }

  /**
   * 请求查询投资者品种/跨品种保证金响应
   */
  onRspQryInvestorProductGroupMargin (data, info, requestId, isLast) {
    this._emitLog('OnRspQryInvestorProductGroupMargin', data, info,
      requestId, isLast)
  }

  /**
   * 请求查询交易所保证金率响应
   */
  onRspQryExchangeMarginRate (data, info, requestId, isLast) {
    this._emitLog('OnRspQryExchangeMarginRate', data, info, requestId,
      isLast)
  }

  /**
   * 请求查询交易所调整保证金率响应
   */
  onRspQryExchangeMarginRateAdjust (data, info, requestId, isLast) {
    this._emitLog('OnRspQryExchangeMarginRateAdjust', data, info,
      requestId, isLast)
  }

  /**
   * 请求查询汇率响应
   */
  onRspQryExchangeRate (data, info, requestId, isLast) {
    this._emitLog('OnRspQryExchangeRate', data, info, requestId, isLast)
  }

  /**
   * 请求查询二级代理操作员银期权限响应
   */
  onRspQrySecAgentACIDMap (data, info, requestId, isLast) {
    this._emitLog('OnRspQrySecAgentACIDMap', data, info, requestId,
      isLast)
  }

  /**
   * 请求查询产品报价汇率
   */
  onRspQryProductExchRate (data, info, requestId, isLast) {
    this._emitLog('OnRspQryProductExchRate', data, info, requestId,
      isLast)
  }

  /**
   * 请求查询产品组
   */
  onRspQryProductGroup (data, info, requestId, isLast) {
    this._emitLog('OnRspQryProductGroup', data, info, requestId, isLast)
  }

  /**
   * 请求查询做市商合约手续费率响应
   */
  onRspQryMMInstrumentCommissionRate (data, info, requestId, isLast) {
    this._emitLog('OnRspQryMMInstrumentCommissionRate', data, info,
      requestId, isLast)
  }

  /**
   * 请求查询做市商期权合约手续费响应
   */
  onRspQryMMOptionInstrCommRate (data, info, requestId, isLast) {
    this._emitLog('OnRspQryMMOptionInstrCommRate', data, info, requestId,
      isLast)
  }

  /**
   * 请求查询报单手续费响应
   */
  onRspQryInstrumentOrderCommRate (data, info, requestId, isLast) {
    this._emitLog('OnRspQryInstrumentOrderCommRate', data, info,
      requestId, isLast)
  }

  /**
   * 请求查询期权交易成本响应
   */
  onRspQryOptionInstrTradeCost (data, info, requestId, isLast) {
    this._emitLog('OnRspQryOptionInstrTradeCost', data, info, requestId,
      isLast)
  }

  /**
   * 请求查询期权合约手续费响应
   */
  onRspQryOptionInstrCommRate (data, info, requestId, isLast) {
    this._emitLog('OnRspQryOptionInstrCommRate', data, info, requestId,
      isLast)
  }

  /**
   * 请求查询执行宣告响应
   */
  onRspQryExecOrder (data, info, requestId, isLast) {
    this._emitLog('OnRspQryExecOrder', data, info, requestId, isLast)
  }

  /**
   * 请求查询询价响应
   */
  onRspQryForQuote (data, info, requestId, isLast) {
    this._emitLog('OnRspQryForQuote', data, info, requestId, isLast)
  }

  /**
   * 请求查询报价响应
   */
  onRspQryQuote (data, info, requestId, isLast) {
    this._emitLog('OnRspQryQuote', data, info, requestId, isLast)
  }

  /**
   * 请求查询锁定应答
   */
  onRspQryLock (data, info, requestId, isLast) {
    this._emitLog('OnRspQryLock', data, info, requestId, isLast)
  }

  /**
   * 请求查询锁定证券仓位应答
   */
  onRspQryLockPosition (data, info, requestId, isLast) {
    this._emitLog('OnRspQryLockPosition', data, info, requestId, isLast)
  }

  /**
   * 请求查询ETF期权合约手续费响应
   */
  onRspQryETFOptionInstrCommRate (data, info, requestId, isLast) {
    this._emitLog('OnRspQryETFOptionInstrCommRate', data, info,
      requestId, isLast)
  }

  /**
   * 请求查询投资者分级
   */
  onRspQryInvestorLevel (data, info, requestId, isLast) {
    this._emitLog('OnRspQryInvestorLevel', data, info, requestId, isLast)
  }

  /**
   * 请求查询E+1日行权冻结响应
   */
  onRspQryExecFreeze (data, info, requestId, isLast) {
    this._emitLog('OnRspQryExecFreeze', data, info, requestId, isLast)
  }

  /**
   * 请求查询组合合约安全系数响应
   */
  onRspQryCombInstrumentGuard (data, info, requestId, isLast) {
    this._emitLog('OnRspQryCombInstrumentGuard', data, info, requestId,
      isLast)
  }

  /**
   * 请求查询申请组合响应
   */
  onRspQryCombAction (data, info, requestId, isLast) {
    this._emitLog('OnRspQryCombAction', data, info, requestId, isLast)
  }

  /**
   * 请求查询转帐流水响应
   */
  onRspQryTransferSerial (data, info, requestId, isLast) {
    this._emitLog('OnRspQryTransferSerial', data, info, requestId,
      isLast)
  }

  /**
   * 请求查询银期签约关系响应
   */
  onRspQryAccountregister (data, info, requestId, isLast) {
    this._emitLog('OnRspQryAccountregister', data, info, requestId,
      isLast)
  }

  /**
   * 错误应答
   */
  onRspError (info, requestId, isLast) {
    this._emitLog('OnRspError', info, requestId, isLast)
  }

  /**
   * 报单通知
   */
  onRtnOrder (data) {
    this._emitLog('OnRtnOrder', data)
  }

  /**
   * 成交通知
   */
  onRtnTrade (data) {
    this._emitLog('OnRtnTrade', data)
  }

  /**
   * 报单录入错误回报
   */
  onErrRtnOrderInsert (data, info) {
    this._emitLog('OnErrRtnOrderInsert', data, info)
  }

  /**
   * 报单操作错误回报
   */
  onErrRtnOrderAction (data, info) {
    this._emitLog('OnErrRtnOrderAction', data, info)
  }

  /**
   * 合约交易状态通知
   */
  onRtnInstrumentStatus (data) {
    this._emitLog('OnRtnInstrumentStatus', data)
  }

  /**
   * 交易所公告通知
   */
  onRtnBulletin (data) {
    this._emitLog('OnRtnBulletin', data)
  }

  /**
   * 交易通知
   */
  onRtnTradingNotice (data) {
    this._emitLog('OnRtnTradingNotice', data)
  }

  /**
   * 提示条件单校验错误
   */
  onRtnErrorConditionalOrder (data) {
    this._emitLog('OnRtnErrorConditionalOrder', data)
  }

  /**
   * 执行宣告通知
   */
  onRtnExecOrder (data) {
    this._emitLog('OnRtnExecOrder', data)
  }

  /**
   * 执行宣告录入错误回报
   */
  onErrRtnExecOrderInsert (data, info) {
    this._emitLog('OnErrRtnExecOrderInsert', data, info)
  }

  /**
   * 执行宣告操作错误回报
   */
  onErrRtnExecOrderAction (data, info) {
    this._emitLog('OnErrRtnExecOrderAction', data, info)
  }

  /**
   * 询价录入错误回报
   */
  onErrRtnForQuoteInsert (data, info) {
    this._emitLog('OnErrRtnForQuoteInsert', data, info)
  }

  /**
   * 报价通知
   */
  onRtnQuote (data) {
    this._emitLog('OnRtnQuote', data)
  }

  /**
   * 报价录入错误回报
   */
  onErrRtnQuoteInsert (data, info) {
    this._emitLog('OnErrRtnQuoteInsert', data, info)
  }

  /**
   * 报价操作错误回报
   */
  onErrRtnQuoteAction (data, info) {
    this._emitLog('OnErrRtnQuoteAction', data, info)
  }

  /**
   * 询价通知
   */
  onRtnForQuoteRsp (data) {
    this._emitLog('OnRtnForQuoteRsp', data)
  }

  /**
   * 保证金监控中心用户令牌
   */
  onRtnCFMMCTradingAccountToken (data) {
    this._emitLog('OnRtnCFMMCTradingAccountToken', data)
  }

  /**
   * 锁定通知
   */
  onRtnLock (data) {
    this._emitLog('OnRtnLock', data)
  }

  /**
   * 锁定错误通知
   */
  onErrRtnLockInsert (data, info) {
    this._emitLog('OnErrRtnLockInsert', data, info)
  }

  /**
   * 批量报单操作错误回报
   */
  onErrRtnBatchOrderAction (data, info) {
    this._emitLog('OnErrRtnBatchOrderAction', data, info)
  }

  /**
   * 申请组合通知
   */
  onRtnCombAction (data) {
    this._emitLog('OnRtnCombAction', data)
  }

  /**
   * 申请组合录入错误回报
   */
  onErrRtnCombActionInsert (data, info) {
    this._emitLog('OnErrRtnCombActionInsert', data, info)
  }

  /**
   * 请求查询签约银行响应
   */
  onRspQryContractBank (data, info, requestId, isLast) {
    this._emitLog('OnRspQryContractBank', data, info, requestId, isLast)
  }

  /**
   * 请求查询预埋单响应
   */
  onRspQryParkedOrder (data, info, requestId, isLast) {
    this._emitLog('OnRspQryParkedOrder', data, info, requestId, isLast)
  }

  /**
   * 请求查询预埋撤单响应
   */
  onRspQryParkedOrderAction (data, info, requestId, isLast) {
    this._emitLog('OnRspQryParkedOrderAction', data, info, requestId,
      isLast)
  }

  /**
   * 请求查询交易通知响应
   */
  onRspQryTradingNotice (data, info, requestId, isLast) {
    this._emitLog('OnRspQryTradingNotice', data, info, requestId, isLast)
  }

  /**
   * 请求查询经纪公司交易参数响应
   */
  onRspQryBrokerTradingParams (data, info, requestId, isLast) {
    this._emitLog('OnRspQryBrokerTradingParams', data, info, requestId,
      isLast)
  }

  /**
   * 请求查询经纪公司交易算法响应
   */
  onRspQryBrokerTradingAlgos (data, info, requestId, isLast) {
    this._emitLog('OnRspQryBrokerTradingAlgos', data, info, requestId,
      isLast)
  }

  /**
   * 请求查询监控中心用户令牌
   */
  onRspQueryCFMMCTradingAccountToken (data, info, requestId, isLast) {
    this._emitLog('OnRspQueryCFMMCTradingAccountToken', data, info,
      requestId, isLast)
  }

  /**
   * 银行发起银行资金转期货通知
   */
  onRtnFromBankToFutureByBank (data) {
    this._emitLog('OnRtnFromBankToFutureByBank', data)
  }

  /**
   * 银行发起期货资金转银行通知
   */
  onRtnFromFutureToBankByBank (data) {
    this._emitLog('OnRtnFromFutureToBankByBank', data)
  }

  /**
   * 银行发起冲正银行转期货通知
   */
  onRtnRepealFromBankToFutureByBank (data) {
    this._emitLog('OnRtnRepealFromBankToFutureByBank', data)
  }

  /**
   * 银行发起冲正期货转银行通知
   */
  onRtnRepealFromFutureToBankByBank (data) {
    this._emitLog('OnRtnRepealFromFutureToBankByBank', data)
  }

  /**
   * 期货发起银行资金转期货通知
   */
  onRtnFromBankToFutureByFuture (data) {
    this._emitLog('OnRtnFromBankToFutureByFuture', data)
  }

  /**
   * 期货发起期货资金转银行通知
   */
  onRtnFromFutureToBankByFuture (data) {
    this._emitLog('OnRtnFromFutureToBankByFuture', data)
  }

  /**
   * 系统运行时期货端手工发起冲正银行转期货请求, 银行处理完毕后报盘发回的通知
   */
  onRtnRepealFromBankToFutureByFutureManual (data) {
    this._emitLog('OnRtnRepealFromBankToFutureByFutureManual', data)
  }

  /**
   * 系统运行时期货端手工发起冲正期货转银行请求, 银行处理完毕后报盘发回的通知
   */
  onRtnRepealFromFutureToBankByFutureManual (data) {
    this._emitLog('OnRtnRepealFromFutureToBankByFutureManual', data)
  }

  /**
   * 期货发起查询银行余额通知
   */
  onRtnQueryBankBalanceByFuture (data) {
    this._emitLog('OnRtnQueryBankBalanceByFuture', data)
  }

  /**
   * 期货发起银行资金转期货错误回报
   */
  onErrRtnBankToFutureByFuture (data, info) {
    this._emitLog('OnErrRtnBankToFutureByFuture', data, info)
  }

  /**
   * 期货发起期货资金转银行错误回报
   */
  onErrRtnFutureToBankByFuture (data, info) {
    this._emitLog('OnErrRtnFutureToBankByFuture', data, info)
  }

  /**
   * 系统运行时期货端手工发起冲正银行转期货错误回报
   */
  onErrRtnRepealBankToFutureByFutureManual (data, info) {
    this._emitLog('OnErrRtnRepealBankToFutureByFutureManual', data, info)
  }

  /**
   * 系统运行时期货端手工发起冲正期货转银行错误回报
   */
  onErrRtnRepealFutureToBankByFutureManual (data, info) {
    this._emitLog('OnErrRtnRepealFutureToBankByFutureManual', data, info)
  }

  /**
   * 期货发起查询银行余额错误回报
   */
  onErrRtnQueryBankBalanceByFuture (data, info) {
    this._emitLog('OnErrRtnQueryBankBalanceByFuture', data, info)
  }

  /**
   * 期货发起冲正银行转期货请求, 银行处理完毕后报盘发回的通知
   */
  onRtnRepealFromBankToFutureByFuture (data) {
    this._emitLog('OnRtnRepealFromBankToFutureByFuture', data)
  }

  /**
   * 期货发起冲正期货转银行请求, 银行处理完毕后报盘发回的通知
   */
  onRtnRepealFromFutureToBankByFuture (data) {
    this._emitLog('OnRtnRepealFromFutureToBankByFuture', data)
  }

  /**
   * 期货发起银行资金转期货应答
   */
  onRspFromBankToFutureByFuture (data, info, requestId, isLast) {
    this._emitLog('OnRspFromBankToFutureByFuture', data, info, requestId,
      isLast)
  }

  /**
   * 期货发起期货资金转银行应答
   */
  onRspFromFutureToBankByFuture (data, info, requestId, isLast) {
    this._emitLog('OnRspFromFutureToBankByFuture', data, info, requestId,
      isLast)
  }

  /**
   * 期货发起查询银行余额应答
   */
  onRspQueryBankAccountMoneyByFuture (data, info, requestId, isLast) {
    this._emitLog('OnRspQueryBankAccountMoneyByFuture', data, info,
      requestId, isLast)
  }

  /**
   * 银行发起银期开户通知
   */
  onRtnOpenAccountByBank (data) {
    this._emitLog('OnRtnOpenAccountByBank', data)
  }

  /**
   * 银行发起银期销户通知
   */
  onRtnCancelAccountByBank (data) {
    this._emitLog('OnRtnCancelAccountByBank', data)
  }

  /**
   * 银行发起变更银行账号通知
   */
  onRtnChangeAccountByBank (data) {
    this._emitLog('OnRtnChangeAccountByBank', data)
  }
}

module.exports = {
  CtpTd
}
