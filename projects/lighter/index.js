const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: '0x35642792abc96fa1e9ffe5f2f62a539bb80a8af4',
    topic: 'OrderBookCreated(uint8,address,address,address,uint8,uint8)',
    fromBlock: 65833710,
    eventAbi: 'event OrderBookCreated (uint8 orderBookId, address orderBookAddress, address token0, address token1, uint8 logSizeTick, uint8 logPriceTick)',
    onlyArgs: true,
  })
  
  return sumTokens2({ api, ownerTokens: logs.map(i => [[i.token0, i.token1], i.orderBookAddress]) })
}

module.exports = {
  arbitrum: { tvl, }
}