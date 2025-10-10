// https://www.starknetjs.com/docs/API/contract

const { call, multiCall, parseAddress, } = require('../helper/chain/starknet')
const { getCache, setCache, } = require('../helper/cache')
const abi = require('./abi')
const { transformDexBalances } = require('../helper/portedTokens')
const factory = '0xdad44c139a476c7a17fc8141e6db680e9abc9f56fe249a105094c44382c2fd'

async function tvl() {
  let { all_pairs } = await call({ target: factory, abi: abi.factory.get_all_pairs })

  const calls = all_pairs.map(i => parseAddress(i))
  const cache = await getCache('jediswap', 'starknet') ?? {}
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
  if (cache.token0s.length > oldCacheLength) await setCache('jediswap', 'starknet', cache)


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
  isHeavyProtocol: true,
  starknet: {
    tvl,
  }
}