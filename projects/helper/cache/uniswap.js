const ADDRESSES = require('../coreAssets.json')

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
    // console.log(await api.call({ target: factory, abi: 'address:factory' }))
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

    let calls
    if (queryBatched && pairCalls.length > queryBatched) {
      calls = []
      const batchedPairCalls = sliceIntoChunks(pairCalls, queryBatched)
      for (const batch of batchedPairCalls) {
        const res = await api.multiCall({ abi: abi.allPairs, calls: batch, target: factory })
        calls.push(...res)
        sdk.log(`fetched pairs ${calls.length}/${pairCalls.length}`)
        if (waitBetweenCalls) await sleep(waitBetweenCalls)
      }
    } else {
      calls = await api.multiCall({ abi: abi.allPairs, calls: pairCalls, target: factory })
    }

    let token0s, token1s
    if (queryBatched && calls.length > queryBatched) {
      token0s = []
      token1s = []
      const batchedCalls = sliceIntoChunks(calls, queryBatched)
      let done = 0
      for (const batch of batchedCalls) {
        const [t0, t1] = await Promise.all([
          api.multiCall({ abi: abi.token0, calls: batch }),
          api.multiCall({ abi: abi.token1, calls: batch }),
        ])
        token0s.push(...t0)
        token1s.push(...t1)
        done += batch.length
        sdk.log(`fetched token info ${done}/${calls.length}`)
        if (waitBetweenCalls) await sleep(waitBetweenCalls)
      }
    } else {
      ;[token0s, token1s] = await Promise.all([
        api.multiCall({ abi: abi.token0, calls }),
        api.multiCall({ abi: abi.token1, calls }),
      ])
    }

    let symbols
    if (hasStablePools) {
      if (queryBatched && calls.length > queryBatched) {
        symbols = []
        const batchedCalls = sliceIntoChunks(calls, queryBatched)
        for (const batch of batchedCalls) {
          symbols.push(...await api.multiCall({ abi: 'erc20:symbol', calls: batch }))
          if (waitBetweenCalls) await sleep(waitBetweenCalls)
        }
      } else {
        symbols = await api.multiCall({ abi: 'erc20:symbol', calls, })
      }
      cache.symbols = cache.symbols.concat(symbols)
    }

    cache.pairs = cache.pairs.concat(calls)
    cache.token0s = cache.token0s.concat(token0s)
    cache.token1s = cache.token1s.concat(token1s)

    updateCache = updateCache || cache.pairs.length > _oldPairInfoLength

    if (updateCache)
      await setCache(cacheFolder, key, cache)

    if (cache.pairs.length > length)
      cache.pairs = cache.pairs.slice(0, length)

    let reserves = []
    if (queryBatched) {
      const batchedCalls = sliceIntoChunks(cache.pairs, queryBatched)
      let batchIdx = 0
      for (const calls of batchedCalls) {
        const res = await api.multiCall({ abi: abi.getReserves, calls, permitFailure, })
        reserves = reserves.concat(res)
        batchIdx++
        sdk.log(`fetched reserves batch ${batchIdx}/${batchedCalls.length}`)
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