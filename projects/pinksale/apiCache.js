const sdk = require("@defillama/sdk")
const abi = require('./abi')
const config = require('./config')
const { getUniqueAddresses } = require('../helper/utils')
const { getCache, setCache, } = require("../helper/cache")
const { vestingHelper, } = require("../helper/unknownTokens")

const project = 'bulky/pinksale'

module.exports = {}

async function runInBatches(items, batchSize, fn) {
  for (let i = 0; i < items.length; i += batchSize) {
    await Promise.all(items.slice(i, i + batchSize).map(fn))
  }
}

const tvl = async (api) => {
  const balances = {}
  const cache = await getCache(project, api.chain || { vaults: {} })
  const { vaults, blacklist, log_coreAssetPrices, log_minTokenValue, } = config[api.chain]

  await Promise.all(
    vaults.map(async (vault, idx) => {
      if (!cache.vaults) cache.vaults = {}
      if (!cache.vaults[vault]) cache.vaults[vault] = { lastTotalId: 0, tokens: [] }
      const cCache = cache.vaults[vault]

      const size = await api.call({ target: vault, abi: abi.getTotalLockCount })
      const isLastVault = idx === vaults.length - 1
      const lockAbi = isLastVault ? abi.getLockAt : abi.getLock

      const calls = Array.from({ length: +size - cCache.lastTotalId }, (_, i) => ({ target: vault, params: i + cCache.lastTotalId }))
      cCache.lastTotalId = +size

      const tokens = await api.multiCall({ abi: lockAbi, calls, permitFailure: true })
      tokens.forEach(({ token } = {}) => token && cCache.tokens.push(token))
      cCache.tokens = getUniqueAddresses(cCache.tokens.filter(i => i))
    })
  )

  await runInBatches(vaults, 5, async (vault) => {
    const cCache = cache.vaults[vault]

    const balance = await vestingHelper({
      cache,
      useDefaultCoreAssets: true,
      blacklist,
      owner: vault,
      tokens: cCache.tokens,
      block: api.block,
      chain: api.chain,
      log_coreAssetPrices,
      log_minTokenValue,
    })

    Object.entries(balance).forEach(([token, bal]) =>
      sdk.util.sumSingleBalance(balances, token, bal)
    )
  })

  await setCache(project, api.chain, cache)
  return balances
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})