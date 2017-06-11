'use strict'

const ctp = require('../lib/index')

/* SimNow测试用前置机地址 */
// eslint-disable-next-line no-unused-vars
const TD_FRONT_API = 'tcp://180.168.146.187:10030'

/* SimNow模拟用前置机地址 */
// eslint-disable-next-line no-unused-vars
const TD_FRONT_SIM = 'tcp://180.168.146.187:10000'

class Td extends ctp.CtpTd {
  async onFrontConnected () {
    console.log('My onFrontConnected')
    await this.reqUserLogin({
      UserID: '080743',
      Password: 'long24fen33446',
      BrokerID: '9999'
    }, 1)
  }

  async onRspUserLogin () {
    console.log('My onRspUserLogin')

    console.log(await this.getApiVersion())
    console.log(await this.getTradingDay())

    await this.reqQryInstrument({}, 2)

    setTimeout(async() => {
      console.log('exit ...')
      await this.exit()
    }, 5000)
  }

  async onRtnInstrumentStatus () {}

  onRspQryInstrument (data) {
    console.log(data.InstrumentName)
  }
}

async function main () {
  const td = new Td(true)
  await td.createFtdcTraderApi('/tmp/node_ctp_td@')
  await td.registerFront(TD_FRONT_API)
  await td.subscribePrivateTopic(ctp.DEFINE_MAP.THOST_TERT_RESTART)
  await td.subscribePublicTopic(ctp.DEFINE_MAP.THOST_TERT_RESTART)
  await td.init()
}

if (require.main === module) {
  main()
}
