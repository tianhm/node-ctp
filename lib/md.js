'use strict'

const nodeCtp = require('../build/Release/node_ctp.node')
const iconv = require('iconv-lite')
iconv.skipDecodeWarning = true

/**
 * 封装C++层CtpMd类, 实现:
 *  1. API相关函数的Promise封装
 *  2. SPI相关函数的注册
 *
 * @class CtpMd
 * @extends {nodeCtp.CtpMd}
 */
class CtpMd extends nodeCtp.CtpMd {
  /**
   * CtpMd构造函数
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
   * 创建MdApi
   * @param flowPath 存贮订阅信息文件的目录, 默认为当前目录
   * @return 创建出的UserApi
   */
  async createFtdcMdApi (flowPath) {
    return new Promise((resolve, reject) => {
      super.createFtdcMdApi(flowPath, (err) => {
        err ? reject(err) : resolve()
      })
    })
  }

  /**
   * 获取API的版本信息
   * @return 获取到的版本号
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
   * @remark 初始化运行环境, 只有调用后, 接口才开始工作
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
   * @return 获取到的交易日
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
   * @param pFensUserInfo 用户信息
   */
  async registerFensUserInfo (fensUserInfo) {
    return new Promise((resolve, reject) => {
      super.registerFensUserInfo(fensUserInfo, (err) => {
        err ? reject(err) : resolve()
      })
    })
  }

  /**
   * 订阅行情
   * @param instrumentIDs 合约ID数组
   */
  async subscribeMarketData (instrumentIDs) {
    return new Promise((resolve, reject) => {
      super.subscribeMarketData(instrumentIDs, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 退订行情
   * @param instrumentIDs 合约ID数组
   */
  async unSubscribeMarketData (instrumentIDs) {
    return new Promise((resolve, reject) => {
      super.unSubscribeMarketData(instrumentIDs, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 订阅询价
   * @param instrumentIDs 合约ID数组
   */
  async subscribeForQuoteRsp (instrumentIDs) {
    return new Promise((resolve, reject) => {
      super.subscribeForQuoteRsp(instrumentIDs, (err, data) => {
        err ? reject(err) : resolve(data)
      })
    })
  }

  /**
   * 退订询价
   * @param instrumentIDs 合约ID数组
   */
  async unSubscribeForQuoteRsp (instrumentIDs) {
    return new Promise((resolve, reject) => {
      super.unSubscribeForQuoteRsp(instrumentIDs, (err, data) => {
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
    super.on('RspUserLogin', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspUserLogin(data, info, requestId, isLast)
    })
    super.on('RspUserLogout', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspUserLogout(data, info, requestId, isLast)
    })
    super.on('RspError', (info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspError(info, requestId, isLast)
    })
    super.on('RspSubMarketData', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspSubMarketData(data, info, requestId, isLast)
    })
    super.on('RspUnSubMarketData', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspUnSubMarketData(data, info, requestId, isLast)
    })
    super.on('RspSubForQuoteRsp', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspSubForQuoteRsp(data, info, requestId, isLast)
    })
    super.on('RspUnSubForQuoteRsp', (data, info, requestId, isLast) => {
      if (info.ErrorMsg) info.ErrorMsg = iconv.decode(info.ErrorMsg, 'gbk')
      this.onRspUnSubForQuoteRsp(data, info, requestId, isLast)
    })
    super.on('RtnDepthMarketData', (data) => {
      this.onRtnDepthMarketData(data)
    })
    super.on('RtnForQuoteRsp', (data) => {
      this.onRtnForQuoteRsp(data)
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
   * 错误应答
   */
  onRspError (info, requestId, isLast) {
    this._emitLog('OnRspError', info, requestId, isLast)
  }

  /**
   * 订阅行情应答
   */
  onRspSubMarketData (data, info, requestId, isLast) {
    this._emitLog('OnRspSubMarketData', data, info, requestId, isLast)
  }

  /**
   * 取消订阅行情应答
   */
  onRspUnSubMarketData (data, info, requestId, isLast) {
    this._emitLog('OnRspUnSubMarketData', data, info, requestId, isLast)
  }

  /**
   * 订阅询价应答
   */
  onRspSubForQuoteRsp (data, info, requestId, isLast) {
    this._emitLog('OnRspSubForQuoteRsp', data, info, requestId, isLast)
  }

  /**
   * 取消订阅询价应答
   */
  onRspUnSubForQuoteRsp (data, info, requestId, isLast) {
    this._emitLog('OnRspUnSubForQuoteRsp', data, info, requestId, isLast)
  }

  /**
   * 深度行情通知
   */
  onRtnDepthMarketData (data) {
    this._emitLog('OnRtnDepthMarketData', data)
  }

  /**
   * 询价通知
   */
  onRtnForQuoteRsp (data) {
    this._emitLog('OnRtnForQuoteRsp', data)
  }
}

module.exports = {
  CtpMd
}
