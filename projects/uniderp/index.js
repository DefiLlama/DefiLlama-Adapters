const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs2 } = require('../helper/cache/getLogs');

// from https://docs.uniswap.org/contracts/v4/deployments
const config = {
  unichain: {
    factory: "0x1F98400000000000000000000000000000000004", uniderpHook: "0xb4960cd4f9147f9e37a7aa9005df7156f61e4444", fromBlock:
      14569098
  },
}

const eventAbi = "event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)"

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, uniderpHook } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi, fromBlock, })
      const tokenSet = new Set()
      const ownerTokens = []
      logs.forEach(log => {
        if (log.hooks.toLowerCase() === uniderpHook) {
          tokenSet.add(log.currency1)
        }
      })
      ownerTokens.push([Array.from(tokenSet), factory])
      return sumTokens2({ api, ownerTokens, permitFailure: true, })
    }
  }
})