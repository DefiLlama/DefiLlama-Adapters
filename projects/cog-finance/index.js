const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  scroll: [{ factory: '0xbabd55549c266c6755b99173fe7604238d04117d', fromBlock: 85518 }, { factory: '0xCd44fecb08bb28405992358131Fd5081A0F550D0', fromBlock: 3147376 }],
}

async function _getLogs(api, factory, fromBlock,) {
  const events = ['StablePairCreated', 'LowPairCreated', 'MediumPairCreated', 'HighPairCreated']
  const logs = (await Promise.all(events.map(event => getLogs({
    api,
    target: factory,
    eventAbi: `event ${event} (address indexed asset, address indexed collateral, address indexed pair)`,
    onlyArgs: true,
    extraKey: event,
    fromBlock,
  })))).flat()
  return logs
}

Object.keys(config).forEach(chain => {
  const factories = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = []
      for (const { factory, fromBlock, } of factories) {
        const _logs = await _getLogs(api, factory, fromBlock,)
        logs.push(..._logs)
      }
      const ownerTokens = logs.map(i => [[i.asset, i.collateral], i.pair])
      return sumTokens2({ api, ownerTokens, })
    },
    borrowed: async (api) => {
      const logs = []
      for (const { factory, fromBlock, } of factories) {
        const _logs = await _getLogs(api, factory, fromBlock,)
        logs.push(..._logs)
      }
      const pairs = logs.map(i => i.pair)
      const borrows = await api.multiCall({ abi: 'function total_borrow() view returns (tuple(uint128 elastic, uint128 base))', calls: pairs })
      borrows.map((v, i) => {
        api.add(logs[i].asset, v.elastic)
        api.add(logs[i].asset, v.base)
      })
      return api.getBalances()
    }
  }
})
