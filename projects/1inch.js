const { sumTokens2, } = require('./helper/unwrapLPs')
const { getLogs } = require('./helper/cache/getLogs')

const config = require("./1inch/config");

module.exports = {}

Object.keys(config).forEach(chain => {
  const { blacklistedTokens = [], factories } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = []
      for (const { MooniswapFactory, fromBlock} of factories) {
        const logs = await getLogs({
          api,
          target: MooniswapFactory,
          topic: 'Deployed(address,address,address)',
          eventAbi: 'event Deployed(address indexed mooniswap, address indexed token1, address indexed token2)',
          onlyArgs: true,
          fromBlock,
        })
        logs.forEach(i => ownerTokens.push([[i.token1, i.token2], i.mooniswap]))
      }
      return sumTokens2({ api, ownerTokens, blacklistedTokens, sumChunkSize: 50, })
    }
  }
})