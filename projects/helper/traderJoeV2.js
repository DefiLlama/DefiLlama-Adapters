const { sumTokens2 } = require("./unwrapLPs")
const abis = {
  v1: {
    getLBPairAtIndex: 'getLBPairAtIndex',
    getTokenX: 'address:getTokenX',
    getTokenY: 'address:getTokenY',
  },
  lb: {
    getLBPairAtIndex: 'allLBPairs',
    getTokenX: 'address:tokenX',
    getTokenY: 'address:tokenY',
  }
}

function joeV2Export(config) {
  const exports = {
    methodology: 'We count the token balances in in different liquidity book contracts',
  }

  Object.keys(config).forEach(chain => {
    let factory = config[chain]
    let factories = []
    if (typeof factory !== 'string') {
      if (factory.factories)
        factories = factory.factories
    }

    const getFactoryTvl = async (api, factory) => {

      let abi = abis.v1
      let blacklistedTokens = []

      if (typeof factory !== 'string') {
        blacklistedTokens = factory.blacklistedTokens || []
        if (factory.isLb) abi = abis.lb
        factory = factory.factory
      }

      const pools = await api.fetchList({ target: factory, itemAbi: abi.getLBPairAtIndex, lengthAbi: 'getNumberOfLBPairs', })
      const tokenA = await api.multiCall({ abi: abi.getTokenX, calls: pools, })
      const tokenB = await api.multiCall({ abi: abi.getTokenY, calls: pools, })

      const toa = []
      tokenA.map((_, i) => {
        toa.push([tokenA[i], pools[i]])
        toa.push([tokenB[i], pools[i]])
      })
      return sumTokens2({ api, tokensAndOwners: toa, blacklistedTokens, permitFailure: true, })
    }


    exports[chain] = {
      tvl: async (api) => {
        if (Array.isArray(factories) && factories.length > 0) {
          for (const f of factories) {
            await getFactoryTvl(api, f)
          }
        } else {
          await getFactoryTvl(api, factory)
        }
      }
    }
  })

  return exports
}


module.exports = {
  joeV2Export,
}
