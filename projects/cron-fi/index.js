const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  ethereum: { factory: '0xD64c9CD98949C07F3C85730a37c13f4e78f35E77', fromBlock: 17008730, }
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0xaeff84bd0403e2418c457955d4258f28133c5b304b671114fc854725bb098bee'],
        eventAbi: 'event CronV1PoolCreated (address indexed pool, address indexed token0, address indexed token1, uint8 poolType)',
        onlyArgs: true,
        fromBlock,
      })
      return sumTokens2({ api, ownerTokens: logs.map(i => [[i.token0, i.token1], i.pool]) })
    }
  }
})