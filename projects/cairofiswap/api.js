// https://www.starknetjs.com/docs/API/contract

const { call, multiCall, parseAddress, } = require('../helper/chain/starknet')
const { getCache, setCache, } = require('../helper/cache')
const abi = require('./abi')
const { transformDexBalances } = require('../helper/portedTokens')
const factory = '0x75c43221d5da7fd4bf77e128083363fc42f8d89c810935e08a83d376fae2689'

async function tvl() {
  let { all_pairs } = await call({ target: factory, abi: abi.factory.get_all_pairs })

  const calls = all_pairs.map(i => parseAddress(i))
  const cache = await getCache('cairofiswap', 'starknet') ?? {}
  if (!cache.token0s) {
    cache.token0s = []
    cache.token1s = []
  }
  const oldCacheLength = cache.token0s.length
  const newCalls = calls.slice(oldCacheLength)
  
  const _token0s = await multiCall({ abi: abi.pair.token0, calls: newCalls })
  const _token1s = await multiCall({ abi: abi.pair.token1, calls: newCalls })
  const reserves = await multiCall({ abi: abi.pair.get_reserves, calls })

  cache.token0s.push(..._token0s)
  cache.token1s.push(..._token1s)
  if (cache.token0s.length > oldCacheLength) await setCache('cairofiswap', 'starknet', cache)


  const data = []
  reserves.forEach((reserve, i) => {
    data.push({
      token0: cache.token0s[i],
      token1: cache.token1s[i],
      token0Bal: +reserve.reserve0,
      token1Bal: +reserve.reserve1,
    })
  })

  return transformDexBalances({ chain: 'starknet', data })
}

module.exports = {
  timetravel: false,
  starknet: {
    tvl,
  }
}