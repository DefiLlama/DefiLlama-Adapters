const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  scroll: { factory: '0xbabd55549c266c6755b99173fe7604238d04117d', fromBlock: 85518}
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: factory,
        eventAbi: 'event MediumPairCreated (address indexed asset, address indexed collateral, address indexed pair)',
        onlyArgs: true,
        fromBlock,
      })
      const ownerTokens = logs.map(i => [[i.asset, i.collateral], i.pair])
      return sumTokens2({ api, ownerTokens, })
    },
    borrowed: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: factory,
        eventAbi: 'event MediumPairCreated (address indexed asset, address indexed collateral, address indexed pair)',
        onlyArgs: true,
        fromBlock,
      })
      const pairs = logs.map(i => i.pair)
      const borrows = await api.multiCall({  abi: 'function total_borrow() view returns (tuple(uint128 elastic, uint128 base))', calls: pairs})
      borrows.map((v, i) => {
        api.add(logs[i].asset, v.elastic)
        api.add(logs[i].asset, v.base)
      })
      return api.getBalances()
    }
  }
})