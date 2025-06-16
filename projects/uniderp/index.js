const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs2 } = require('../helper/cache/getLogs');

// from https://docs.uniswap.org/contracts/v4/deployments
const config = {
  unichain: {
    factory: "0x1F98400000000000000000000000000000000004", uniderpHook: "0xcc2efb167503f2d7df0eae906600066aec9e8444", fromBlock: 17670688
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