const { graphQuery } = require('../helper/http')
const { getCache, setCache } = require('../helper/cache')
const { log } = require('../helper/utils')

const SUBGRAPH = 'https://graph.pulsechain.com/subgraphs/name/pulsechain/pulsexv2'
const FACTORY = '0x29ea7545def87022badc76323f373ea1e707c523'
const CACHE_KEY = 'pulsex-v2'
const MIN_RESERVE = 1e-3 // filter dust-reserve spam pairs

async function tvl(api) {
  const cache = await getCache(CACHE_KEY, 'pairs') || { pairs: [], totalPairs: 0 }

  // Check on-chain pair count to decide if we need to re-fetch
  const totalPairs = await api.call({ abi: 'uint256:allPairsLength', target: FACTORY })

  let pairs
  if (cache?.pairs?.length > 0 && Number(totalPairs) === cache.totalPairs) {
    log("Pulsex-v2: Using cached", cache.pairs.length, "pairs")
    pairs = cache.pairs
  } else {
    log("Pulsex-v2: Fetching pairs from subgraph (total:", totalPairs, "cached:", cache.totalPairs, ")")
    let skip = 0
    const freshPairs = []
    while (true) {
      const { pairs } = await graphQuery(SUBGRAPH, `{
        pairs(first: 1000, skip: ${skip}, orderBy: reserveUSD, orderDirection: desc, where: { reserveUSD_gt: "100" }) {
          id
          token0 { id decimals }
          token1 { id decimals }
          reserve0
          reserve1
        }
      }`)
      if (!pairs || pairs.length === 0) break
      freshPairs.push(...pairs)
      if (pairs.length < 1000) break
      skip += 1000
    }

    if (freshPairs.length > 0) {
      cache.pairs = freshPairs
      cache.totalPairs = Number(totalPairs)
      await setCache(CACHE_KEY, 'pairs', cache)
    }

    pairs = freshPairs.length > 0 ? freshPairs : cache.pairs
  }

  for (const pair of pairs) {
    const r0 = Number(pair.reserve0)
    const r1 = Number(pair.reserve1)
    if (r0 < MIN_RESERVE || r1 < MIN_RESERVE) continue
    api.add(pair.token0.id, BigInt(Math.floor(r0 * (10 ** pair.token0.decimals))))
    api.add(pair.token1.id, BigInt(Math.floor(r1 * (10 ** pair.token1.decimals))))
  }
}

module.exports = {
  misrepresentedTokens: true,
  pulse: {
    tvl,
  },
};
