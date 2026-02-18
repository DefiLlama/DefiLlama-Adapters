const uniswapAbi = require('../abis/uniswap')
const { getCache, setCache } = require('../cache')
const { transformDexBalances } = require('../portedTokens')
const { getCoreAssets, normalizeAddress } = require('../tokenMapping')
const { sliceIntoChunks } = require('../utils')
const sdk = require('@defillama/sdk')

const cacheFolder = 'uniswap-forks'

function getUniTVLLarge({
  factory,
  useDefaultCoreAssets = true,
  coreAssets,
  blacklistedTokens = [],
  abis = {},
  queryBatchSize = 2000,
  pairFetchBatchSize = 5000,
}) {
  const abi = { ...uniswapAbi, ...abis }

  return async (api) => {
    const chain = api.chain
    factory = normalizeAddress(factory, chain)
    const blacklist = blacklistedTokens.map(i => normalizeAddress(i, chain))
    const key = `${factory}-${chain}`

    if (!coreAssets && useDefaultCoreAssets)
      coreAssets = getCoreAssets(chain)

    // Load cached pair metadata
    const cache = await getCache(cacheFolder, key)
    if (!cache.pairs) {
      cache.pairs = []
      cache.token0s = []
      cache.token1s = []
    }

    const oldLength = cache.pairs.length
    const totalPairs = await api.call({ abi: abi.allPairsLength, target: factory })

    if (cache.pairs.length > totalPairs) {
      cache.pairs.length = totalPairs
      cache.token0s.length = totalPairs
      cache.token1s.length = totalPairs
    }

    sdk.log(chain, 'Total pairs:', totalPairs, 'Cached:', oldLength)

    // Fetch new pairs in batches
    const newPairCount = totalPairs - oldLength
    if (newPairCount > 0) {
      const indices = []
      for (let i = oldLength; i < totalPairs; i++) indices.push(i)
      const batches = sliceIntoChunks(indices, pairFetchBatchSize)

      for (const batch of batches) {
        const newPairs = await api.multiCall({ abi: abi.allPairs, calls: batch, target: factory })
        const [newToken0s, newToken1s] = await Promise.all([
          api.multiCall({ abi: abi.token0, calls: newPairs }),
          api.multiCall({ abi: abi.token1, calls: newPairs }),
        ])
        for (let i = 0; i < newPairs.length; i++) {
          cache.pairs.push(newPairs[i])
          cache.token0s.push(newToken0s[i])
          cache.token1s.push(newToken1s[i])
        }
      }

      await setCache(cacheFolder, key, cache)
    }

    const blacklistSet = new Set(blacklist)

    // Query getReserves on ALL pairs in batches
    const validPairs = []
    const validIndices = []
    for (let i = 0; i < cache.pairs.length; i++) {
      if (!cache.pairs[i] || !cache.token0s[i] || !cache.token1s[i]) continue
      validPairs.push(cache.pairs[i])
      validIndices.push(i)
    }

    sdk.log(chain, 'Valid pairs:', validPairs.length, 'of', cache.pairs.length)

    const reserveBatches = sliceIntoChunks(validPairs, queryBatchSize)
    const allReserves = []
    for (const batch of reserveBatches) {
      const res = await api.multiCall({ abi: abi.getReserves, calls: batch, permitFailure: true })
      for (const r of res) allReserves.push(r)
    }

    // Build data for transformDexBalances
    const data = []
    for (let j = 0; j < validIndices.length; j++) {
      const reserve = allReserves[j]
      if (!reserve) continue
      const idx = validIndices[j]
      const token0 = cache.token0s[idx]
      const token1 = cache.token1s[idx]
      if (blacklistSet.has(normalizeAddress(token0, chain))) continue
      if (blacklistSet.has(normalizeAddress(token1, chain))) continue
      data.push({ token0, token1, token0Bal: reserve._reserve0, token1Bal: reserve._reserve1 })
    }

    return transformDexBalances({ chain, data, coreAssets, blacklistedTokens: blacklist })
  }
}

module.exports = { getUniTVLLarge }
