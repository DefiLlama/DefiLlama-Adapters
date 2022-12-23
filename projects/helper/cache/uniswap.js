
const uniswapAbi = require('../abis/uniswap')
const { getCache, setCache, } = require('../cache');
const { transformBalances, transformDexBalances, } = require('../portedTokens')
const { getCoreAssets, } = require('../tokenMapping')
const sdk = require('@defillama/sdk')

const cacheFolder = 'uniswap-forks'

function getUniTVL({ chain = 'ethereum', coreAssets, blacklist = [], factory, blacklistedTokens,
  useDefaultCoreAssets = false,
  abis = {},
}) {

  if (!coreAssets && useDefaultCoreAssets)
    coreAssets = getCoreAssets(chain)
  blacklist = (blacklistedTokens || blacklist).map(i => i.toLowerCase())

  const abi = { ...uniswapAbi, ...abis }
  factory = factory.toLowerCase()
  const key = `${factory}-${chain}`

  return async (ts, _block, { [chain]: block }) => {
    let cache = await _getCache(cacheFolder, key)

    const _oldPairInfoLength = cache.pairs.length
    const length = await sdk.api2.abi.call({ abi: abi.allPairsLength, target: factory, chain, block, })
    sdk.log(chain, ' No. of pairs: ', length)
    sdk.log('cached info', cache.pairs.length)
    const pairCalls = []
    for (let i = _oldPairInfoLength; i < length; i++)
      pairCalls.push(i)

    const calls = await sdk.api2.abi.multiCall({ block, chain, abi: abi.allPairs, calls: pairCalls, target: factory })
    const token0s = await sdk.api2.abi.multiCall({ abi: abi.token0, chain, block, calls })
    const token1s = await sdk.api2.abi.multiCall({ abi: abi.token1, chain, block, calls })

    cache.pairs.push(...calls)
    cache.token0s.push(...token0s)
    cache.token1s.push(...token1s)

    const reserves = await sdk.api2.abi.multiCall({ abi: abi.getReserves, chain, block, calls: cache.pairs })


    if (cache.pairs.length > _oldPairInfoLength)
      await setCache(cacheFolder, key, cache)

    if (coreAssets) {
      const data = []
      reserves.forEach(({ _reserve0, _reserve1 }, i) => {
        data.push({
          token0: cache.token0s[i],
          token1: cache.token1s[i],
          token1Bal: _reserve1,
          token0Bal: _reserve0,
        })
      })
      return transformDexBalances({ chain, data, coreAssets, blacklistedTokens: blacklist })
    }

    const balances = {}
    const blacklistedSet = new Set(blacklist)
    reserves.forEach(({ _reserve0, _reserve1 }, i) => {
      if (!blacklistedSet.has(cache.token0s[i].toLowerCase())) sdk.util.sumSingleBalance(balances, cache.token0s[i], _reserve0)
      if (!blacklistedSet.has(cache.token1s[i].toLowerCase())) sdk.util.sumSingleBalance(balances, cache.token1s[i], _reserve1)
    })

    return transformBalances(chain, balances)
  }

  async function _getCache(cacheFolder, key) {
    let cache = await getCache(cacheFolder, key)
    if (cache.pairs) {
      if (cache.pairs.includes(null) || cache.token0s.includes(null) || cache.token1s.includes(null))
        cache.pairs = undefined
    }
    if (!cache.pairs) {
      cache = {
        pairs: [],
        token0s: [],
        token1s: [],
      }
    }
    return cache
  }
}

module.exports = {
  getUniTVL
}