const { sumTokens2 } = require("./unwrapLPs")

function joeV2Export(config) {
  const exports = {
    methodology: 'We count the token balances in in different liquidity book contracts',
  }

  Object.keys(config).forEach(chain => {
    let factory = config[chain]
    let blacklistedTokens = []
    if (typeof factory !== 'string' && typeof factory.factory === 'string') {
      blacklistedTokens = factory.blacklistedTokens || []
      factory = factory.factory
    }

    exports[chain] = {
      tvl: async (api) => {
        const pools = await api.fetchList({ target: factory, itemAbi: 'getLBPairAtIndex', lengthAbi: 'getNumberOfLBPairs', })
        const tokenA = await api.multiCall({ abi: 'address:getTokenX', calls: pools, })
        const tokenB = await api.multiCall({ abi: 'address:getTokenY', calls: pools, })

        const toa = []
        tokenA.map((_, i) => {
          toa.push([tokenA[i], pools[i]])
          toa.push([tokenB[i], pools[i]])
        })
        return sumTokens2({ api, tokensAndOwners: toa, blacklistedTokens, permitFailure: true, })
      }
    }
  })

  return exports
}


module.exports = {
  joeV2Export,
}
