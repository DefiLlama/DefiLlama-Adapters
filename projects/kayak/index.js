const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  avax: { factory: '0x4df3038C2C7e13F46F0d63eC3AF5728F75Be3775', fromBlock: 46950081, },
  scroll: { factory: '0xA218beD0C2b487599A3799Bc318428e5219A7978', fromBlock: 8563591, },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({
        api,
        factory,
        eventAbi: 'event NewStableSwapPair(address indexed swapContract, address indexed tokenA, address indexed tokenB)',
        fromBlock,
      })

      const ownerTokens = logs.map(i => [[i.tokenA, i.tokenB], i.swapContract])
      return sumTokens2({ api, ownerTokens })
    }
  }
})