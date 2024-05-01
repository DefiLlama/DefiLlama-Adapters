
const uniswapAbi = require('../abis/uniswap')
const { getCache, setCache, } = require('../cache');
const { transformBalances, transformDexBalances, } = require('../portedTokens')
const { getCoreAssets, normalizeAddress, } = require('../tokenMapping')
const { sliceIntoChunks, sleep } = require('../utils')
const sdk = require('@defillama/sdk')

const cacheFolder = 'uniswap-forks'

function getUniTVL({ coreAssets, blacklist = [], factory, blacklistedTokens,
  useDefaultCoreAssets = false,
  fetchBalances = false,
  abis = {},
  chain: _chain = 'ethereum',
  queryBatched = 0,
  waitBetweenCalls,
  hasStablePools = false,
  stablePoolSymbol = 'sAMM',
  permitFailure = false,
}) {

  let updateCache = false

  const abi = { ...uniswapAbi, ...abis }

  return async (api) => {
    let chain = api?.chain
    if (!chain)
      chain = _chain
    // const supply = await api.call({ abi: 'erc20:totalSupply', target: '0x1d1bc800e71576a59f9ef88bb679fa13c2e10abf' })
    // console.log(await sdk.api.eth.getBalance({ target: '0x1d1bc800e71576a59f9ef88bb679fa13c2e10abf', chain: api.chain }), supply)
    factory = normalizeAddress(factory, chain)
    blacklist = (blacklistedTokens || blacklist).map(i => normalizeAddress(i, chain))
    const key = `${factory}-${chain}`

    if (!coreAssets && useDefaultCoreAssets)
      coreAssets = getCoreAssets(chain)

    let cache = await _getCache(cacheFolder, key, api)

    const _oldPairInfoLength = cache.pairs.length
    const length = await api.call({ abi: abi.allPairsLength, target: factory, })

    sdk.log(chain, ' No. of pairs: ', length)
    sdk.log('cached info', cache.pairs.length)
    const pairCalls = []
    for (let i = _oldPairInfoLength; i < length; i++)
      pairCalls.push(i)

    const calls = await api.multiCall({ abi: abi.allPairs, calls: pairCalls, target: factory })

    const [
      token0s, token1s
    ] = await Promise.all([
      api.multiCall({ abi: abi.token0, calls }),
      api.multiCall({ abi: abi.token1, calls }),
    ])
    let symbols
    if (hasStablePools) {
      symbols = await api.multiCall({ abi: 'erc20:symbol', calls, })
      cache.symbols.push(...symbols)
    }

    cache.pairs.push(...calls)
    cache.token0s.push(...token0s)
    cache.token1s.push(...token1s)

    updateCache = updateCache || cache.pairs.length > _oldPairInfoLength

    if (updateCache)
      await setCache(cacheFolder, key, cache)

    if (cache.pairs.length > length)
      cache.pairs = cache.pairs.slice(0, length)

    let reserves = []
    if (queryBatched) {
      const batchedCalls = sliceIntoChunks(cache.pairs, queryBatched)
      for (const calls of batchedCalls) {
        reserves.push(...await api.multiCall({ abi: abi.getReserves, calls, permitFailure, }))
        if (waitBetweenCalls) await sleep(waitBetweenCalls)
      }
    } else if (fetchBalances) {
      const calls = []
      cache.pairs.forEach((owner, i) => {
        calls.push({ target: cache.token0s[i], params: owner })
        calls.push({ target: cache.token1s[i], params: owner })
      })
      const bals = await api.multiCall({ abi: abi.balanceOf ?? 'erc20:balanceOf', calls, permitFailure, })
      for (let i = 0; i < bals.length; i++) {
        reserves.push({ _reserve0: bals[i] ?? 0, _reserve1: bals[i + 1] ?? 0 })
        i++
      }
    } else
      reserves = await api.multiCall({ abi: abi.getReserves, calls: cache.pairs, permitFailure })


    const balances = {}
    if (coreAssets) {
      const data = []
      reserves.forEach((dat, i) => {
        if (!dat) return;
        const { _reserve0, _reserve1 } = dat
        if (hasStablePools && cache.symbols[i].startsWith(stablePoolSymbol)) {
          sdk.log('found stable pool: ', stablePoolSymbol)
          sdk.util.sumSingleBalance(balances, cache.token0s[i], _reserve0)
          sdk.util.sumSingleBalance(balances, cache.token1s[i], _reserve1)
        } else {
          data.push({
            token0: cache.token0s[i],
            token1: cache.token1s[i],
            token1Bal: _reserve1,
            token0Bal: _reserve0,
          })
        }
      })
      return transformDexBalances({ balances, chain, data, coreAssets, blacklistedTokens: blacklist })
    }

    const blacklistedSet = new Set(blacklist)
    reserves.forEach(({ _reserve0, _reserve1 }, i) => {
      if (!blacklistedSet.has(cache.token0s[i].toLowerCase())) sdk.util.sumSingleBalance(balances, cache.token0s[i], _reserve0)
      if (!blacklistedSet.has(cache.token1s[i].toLowerCase())) sdk.util.sumSingleBalance(balances, cache.token1s[i], _reserve1)
    })

    return transformBalances(chain, balances)
  }

  async function _getCache(cacheFolder, key, api) {
    let cache = await getCache(cacheFolder, key)
    if (cache.pairs) {
      for (let i = 0; i < cache.pairs.length; i++) {
        if (!cache.pairs[i]) {
          cache.pairs[i] = await api.call({ abi: abi.allPairs, target: factory, params: i })
          updateCache = true
        }
        let pair = cache.pairs[i]
        if (!cache.token0s[i]) {
          cache.token0s[i] = await api.call({ abi: abi.token0, target: pair })
          updateCache = true
        }
        if (!cache.token1s[i]) {
          cache.token1s[i] = await api.call({ abi: abi.token1, target: pair })
          updateCache = true
        }
      }
      // if (cache.pairs.includes(null) || cache.token0s.includes(null) || cache.token1s.includes(null))
      //   cache.pairs = undefined
    }

    if (!cache.pairs || (hasStablePools && (!cache.symbols || !cache.symbols.length))) {
      cache = {
        pairs: [],
        token0s: [],
        token1s: [],
        symbols: [],
      }
    }
    return cache
  }
}

module.exports = {
  getUniTVL
}