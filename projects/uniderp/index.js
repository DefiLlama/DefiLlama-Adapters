const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs2 } = require('../helper/cache/getLogs');
const ADDRESSES = require('../helper/coreAssets.json')

// from https://docs.uniswap.org/contracts/v4/deployments
const config = {
  unichain: {
    factory: "0x1F98400000000000000000000000000000000004", 
    uniderpHook: "0xcc2efb167503f2d7df0eae906600066aec9e8444", 
    fromBlock: 17670688,
    supportedTokens: [
      ADDRESSES.null, // ETH
      "0xbde8a5331e8ac4831cf8ea9e42e229219eafab97", // Wrapped SOL: https://uniscan.xyz/token/0xbde8a5331e8ac4831cf8ea9e42e229219eafab97
      ADDRESSES.unichain.UNI, // UNI: https://uniscan.xyz/token/0x8f187aA05619a017077f5308904739877ce9eA21
    ]
  },
}

const eventAbi = "event Initialize(bytes32 indexed id, address indexed currency0, address indexed currency1, uint24 fee, int24 tickSpacing, address hooks, uint160 sqrtPriceX96, int24 tick)"

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, uniderpHook, supportedTokens } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const logs = await getLogs2({ api, factory, eventAbi, fromBlock, })
      const tokenSet = new Set()
      const ownerTokens = []
      logs.forEach(log => {
        if (log.hooks.toLowerCase() === uniderpHook) {
          if (supportedTokens.includes(log.currency0.toLowerCase())) {
            tokenSet.add(log.currency1)
          } else if (supportedTokens.includes(log.currency1.toLowerCase())) {
            tokenSet.add(log.currency0)
          }
        }
      })
      ownerTokens.push([Array.from(tokenSet), factory])
      return sumTokens2({ api, ownerTokens, permitFailure: true, })
    }
  }
})