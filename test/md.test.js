'use strict'

const ctp = require('../lib/index')

/* SimNow测试用前置机地址 */
// eslint-disable-next-line no-unused-vars
const MD_FRONT_API = 'tcp://180.168.146.187:10031'

/* SimNow模拟用前置机地址 */
// eslint-disable-next-line no-unused-vars
const MD_FRONT_SIM = 'tcp://180.168.146.187:10010'

class Md extends ctp.CtpMd {
  async onFrontConnected () {
    console.log('My onFrontConnected')
    await this.reqUserLogin({}, 1)
  }

  async onRspUserLogin () {
    console.log('My onRspUserLogin')

    console.log(await this.getApiVersion())
    console.log(await this.getTradingDay())

    await this.subscribeMarketData(['SR709'])

    setTimeout(async() => {
      console.log('exit ...')
      await this.exit()
    }, 5000)
  }

  onRtnDepthMarketData (data) {
    console.log(data.UpdateTime)
  }
}

async function main () {
  const md = new Md(true)
  await md.createFtdcMdApi('/tmp/node_ctp_md@')
  await md.registerFront(MD_FRONT_API)
  await md.init()
}

if (require.main === module) {
  main()
}
