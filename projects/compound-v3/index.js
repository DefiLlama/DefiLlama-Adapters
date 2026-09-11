const sdk = require('@defillama/sdk')
const { compoundV3Exports } = require('../helper/compoundV3')
const { getConfig, getCache } = require('../helper/cache')
const { get } = require('../helper/http')

const MARKETS_API = 'https://v3-api.compound.xyz/market/all-networks/all-contracts/summary'
const CACHE_PROJECT = 'compound-v3/markets'

// Markets come from MARKETS_API (append-only, cached). Only list a market here if the API misses it.
// Chains must be listed so the adapter can export them; a new chain in the API is logged as a warning.
const config = {
  ethereum: { markets: [] },
  arbitrum: { markets: [] },
  polygon: { markets: [] },
  base: { markets: [] },
  scroll: { markets: [] },
  optimism: { markets: [] },
  mantle: { markets: [] },
  ronin: { markets: [] },
  unichain: { markets: [] },
  linea: { markets: [] },
}

// chainId -> adapter chain name, preferring names already present in config
const chainIdToName = {}
Object.entries(sdk.providerListJSON ?? {}).forEach(([name, { chainId }]) => {
  if (!chainId) return
  if (!chainIdToName[chainId] || config[name]) chainIdToName[chainId] = name
})

// Append-only: previously cached markets + static list + whatever the API returns now
async function fetchMarkets() {
  const merged = {}
  const add = (chain, m) => {
    m = m.toLowerCase()
    if (!merged[chain]) merged[chain] = []
    if (!merged[chain].includes(m)) merged[chain].push(m)
  }

  Object.entries(config).forEach(([chain, { markets }]) => markets.forEach(m => add(chain, m)))
  const cached = await getCache('config-cache', CACHE_PROJECT)
  Object.entries(cached ?? {}).forEach(([chain, markets]) => Array.isArray(markets) && markets.forEach(m => add(chain, m)))

  const res = await get(MARKETS_API)
  res.forEach(({ chain_id, comet }) => {
    const chain = chainIdToName[chain_id]
    if (!chain) return sdk.log(`compound-v3: unknown chain id ${chain_id} in markets API`)
    if (!config[chain]) sdk.log(`compound-v3: chain "${chain}" is in the markets API but not in the adapter config, add it`)
    add(chain, comet.address)
  })
  return merged
}

// Resolve once per process: getConfig's in-memory cache resets every 30s, and this is called for every chain's tvl + borrowed
let marketsPromise
const getMarkets = () => {
  if (!marketsPromise) marketsPromise = getConfig(CACHE_PROJECT, undefined, { fetcher: fetchMarkets })
  return marketsPromise
}

module.exports = compoundV3Exports(config, { getMarkets })
