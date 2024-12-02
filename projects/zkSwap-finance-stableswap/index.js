const { getLogs2 } = require('../helper/cache/getLogs')

module.exports = {
  methodology:
    "TVL accounts for the liquidity on all StableSwap pools.",
}

const config = {
  era: [{ target: '0xc93397F26886daB0d752C86612C78dbd2C1d5a59', fromBlock: 48190039, token3: true, },],
}

Object.keys(config).forEach(chain => {
  const factories = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const configs = await Promise.all(factories.map(getTvlConfig))
      return api.sumTokens({ ownerTokens: configs.flat() })

      async function getTvlConfig({ target, fromBlock, token3 }) {
        let topic = '0xa9551fb056fc743efe2a0a34e39f9769ad10166520df7843c09a66f82e148b97'
        let eventAbi = 'event NewStableSwapPair(address indexed swapContract, address indexed tokenA, address indexed tokenB)'
        let getOwnTokens = logs => logs.map(i => ([[i.tokenA, i.tokenB], i.swapContract]))

        if (token3) {
          topic = '0x48dc7a1b156fe3e70ed5ed0afcb307661905edf536f15bb5786e327ea1933532'
          eventAbi = 'event NewStableSwapPair(address indexed swapContract, address tokenA, address tokenB, address tokenC, address LP)'
          getOwnTokens = logs => logs.map(i => ([[i.tokenA, i.tokenB, i.tokenC], i.swapContract]))
        }

        const logs = await getLogs2({ api, target, fromBlock, eventAbi })
        return getOwnTokens(logs)
      }
    }
  }
})