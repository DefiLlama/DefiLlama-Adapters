const sdk = require('@defillama/sdk')
const ADDRESSES = require('../helper/coreAssets.json')
const { getCache, setCache } = require('../helper/cache')

const project = 'liquidcore'

const chainConfig = {
  hyperliquid: {
    router: '0x625aC1D165c776121A52ff158e76e3544B4a0b8B',
    fromBlock: 28736539,
    lastGoodBlock: 50662125, // 2026-11-07, last block where getTokens() worked on every pool (they started reverting one by one after it)
    legacyPools: [
      '0xA7478A5ff7cB27A8008D6D90785db10223bc6087',
      '0xD3994A6CF46cA91536376f89aCDadf92eD289a9F',
    ],
  },
  robinhood: {
    router: '0x322F277BfB7Ba9c196194ad18011377A0fF55Fb3',
    fromBlock: 11400065,
    lastGoodBlock: 108868678, // 2026-11-08, last block where the router/pool view calls worked
  }
}

async function getTokensAndOwners(api) {
  const { router, legacyPools = [], fromBlock } = chainConfig[api.chain]
  const pools = [...legacyPools]
  if (await api.getBlock() >= fromBlock) {
    const registered = await api.call({ target: router, abi: 'address[]:getPools' })
    for (const pool of registered)
      if (pool !== ADDRESSES.null && !pools.includes(pool)) pools.push(pool)
  }
  const tokens = await api.multiCall({
    abi: 'function getTokens() view returns (address token0, address token1)',
    calls: pools,
  })
  const tokensAndOwners = []
  pools.forEach((pool, i) => {
    if (!tokens[i]) return
    tokensAndOwners.push([tokens[i].token0, pool], [tokens[i].token1, pool])
  })
  return tokensAndOwners
}

// pool.getTokens() and then router.getPools() started reverting on 2026-11-07/08.
// Every successful live pull is cached; when the live calls fail, the list from the last
// successful run is used. lastGoodBlock only seeds the cache if it is still empty
async function getCachedTokensAndOwners(api) {
  const { lastGoodBlock } = chainConfig[api.chain]
  const cache = await getCache(project, api.chain)
  if (cache.tokensAndOwners?.length) return cache.tokensAndOwners
  const pastApi = new sdk.ChainApi({ chain: api.chain, block: lastGoodBlock })
  const tokensAndOwners = await getTokensAndOwners(pastApi)
  await setCache(project, api.chain, { tokensAndOwners })
  return tokensAndOwners
}

async function tvl(api) {
  let tokensAndOwners
  try {
    tokensAndOwners = await getTokensAndOwners(api)
    // historical refills must not overwrite the cache with an older list
    const isCurrentRun = !api.timestamp || Date.now() / 1e3 - api.timestamp < 3600
    if (isCurrentRun) await setCache(project, api.chain, { tokensAndOwners })
  } catch (e) {
    tokensAndOwners = await getCachedTokensAndOwners(api)
  }
  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  methodology: 'Total value of all coins held in the LiquidCore pool contracts.',
  hyperliquid: {
    tvl,
    start: '2025-11-09', // first LiquidCore pool (USD₮0/WHYPE) deployment
  },
  robinhood: {
    tvl,
    start: '2026-07-16',
  },
}
