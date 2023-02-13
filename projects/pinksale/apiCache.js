const sdk = require("@defillama/sdk")
const abi = require('./abi')
const config = require('./config')
const { getUniqueAddresses } = require('../helper/utils')
const { getCache, setCache, } = require("../helper/cache")
const { vestingHelper,  } = require("../helper/unknownTokens")

const project = 'bulky/pinksale'

module.exports = {}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (timestamp, _block, { [chain]: block }) => {
      const cache = await getCache(project, chain) || { vaults: {} }
      const balances = {}
      const { vaults, blacklist, log_coreAssetPrices, log_minTokenValue, } = config[chain]
      for (const vault of vaults) {
        if (!cache.vaults) cache.vaults = {}
        if (!cache.vaults[vault]) cache.vaults[vault] = { lastTotalId: 0, tokens: [], }
        const cCache = cache.vaults[vault]

        let calls = []
        const { output: size } = await sdk.api.abi.call({
          target: vault,
          abi: abi.getTotalLockCount,
          chain, block,
        })

        const isLastVault = vault === vaults[vaults.length - 1]
        const lockAbi = isLastVault ? abi.getLockAt : abi.getLock
        for (let i = cCache.lastTotalId; i < +size; i++)
          calls.push({ params: i })
        cCache.lastTotalId = +size

        let { output: tokens } = await sdk.api.abi.multiCall({
          target: vault,
          abi: lockAbi,
          calls, chain, block,
        })

        tokens.map(i => cCache.tokens.push(i.output[1]))
        cCache.tokens = getUniqueAddresses(cCache.tokens)

        const balance = await vestingHelper({
          cache,
          useDefaultCoreAssets: true,
          blacklist,
          owner: vault,
          tokens: cCache.tokens,
          block, chain,
          log_coreAssetPrices,
          log_minTokenValue,
        })
        await setCache(project, chain, cache)

        Object.entries(balance).forEach(([token, bal]) => sdk.util.sumSingleBalance(balances, token, bal))
      }

      return balances
    }

  }
})
