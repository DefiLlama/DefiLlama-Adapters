let coreAssets = require('./coreAssets.json')
const { svmChains } = require('./svmChainConfig')
const ADDRESSES = coreAssets
const nullAddress = ADDRESSES.null

coreAssets = JSON.parse(JSON.stringify(coreAssets))

// Multichain bridge info: https://bridgeapi.anyswap.exchange/v2/serverInfo/all
// IBC info - https://github.com/PulsarDefi/IBC-Cosmos/blob/main/ibc_data.json
// O3swap - https://agg.o3swap.com/v1/tokens_all
// wanchain - https://wanscan.org/tokens
// chainge - https://openapi.chainge.finance/open/v1/base/getSupportTokens,https://openapi.chainge.finance/open/v1/base/getSupportChains
// TODO: get celer info
// Alexar info: https://api.axelarscan.io/cross-chain/tvl
// coingecko coins: https://api.coingecko.com/api/v3/coins/list?include_platform=true
// gravity bridge for IBC: https://api.mintscan.io/v2/assets/gravity-bridge
// carbon: https://api-insights.carbon.network/info/denom_gecko_map
// orbit brige: https://bridge.orbitchain.io/open/v1/api/monitor/rawTokenList


const ibcChains = ['ibc', 'terra', 'terra2', 'crescent', 'osmosis', 'kujira', 'stargaze', 'juno', 'injective', 'cosmos', 'provenance', 'comdex', 'umee', 'orai', 'persistence', 'fxcore', 'neutron', 'quasar', 'chihuahua', 'sei', 'archway', 'migaloo', 'secret', 'aura', 'xpla', 'bostrom', 'joltify', 'nibiru',
  'kopi', 'elys', "pryzm", "mantra", 'agoric', 'band', 'axiome',
  'celestia', 'dydx', 'carbon', 'milkyway', 'regen', 'sommelier', 'stride', 'prom', 'babylon', 'xion', 'zigchain'
]
const caseSensitiveChains = [...ibcChains, ...svmChains, 'tezos', 'ton', 'algorand', 'aptos', 'near', 'bitcoin', 'waves', 'tron', 'litecoin', 'polkadot', 'ripple', 'elrond', 'cardano', 'stacks', 'sui', 'ergo', 'mvc', 'renec', 'doge', 'stellar', 'massa', 'aleo',
  'eclipse', 'acala', 'aelf', 'aeternity', 'alephium', 'bifrost', 'bittensor', 'verus', 'dash',
]

const transformTokens = {
  // Sample Code
  // cronos: {
  //   "0x065de42e28e42d90c2052a1b49e7f83806af0e1f": "0x123", // CRK token is mispriced
  //   [ADDRESSES.cronos.TUSD]: ADDRESSES.ethereum.TUSD,
  // },
}
const ibcMappings = {
  // Sample Code
  // 'ibc/CA1261224952DF089EFD363D8DBB30A8AB6D8CD181E60EE9E68E432F8DE14FE3': { coingeckoId: 'inter-stable-token', decimals: 6, },
  // 'ibc/5A76568E079A31FA12165E4559BA9F1E9D4C97F9C2060B538C84DCD503815E30': { coingeckoId: 'injective-protocol', decimals: 18, },
}

const fixBalancesTokens = {
  inri: {
    '0x116b2ff23e062a52e2c0ea12df7e2638b62fa0fc': {
      coingeckoId: 'tether',
      decimals: 6,
    },
  },
  ozone: {
    // '0x83048f0bf34feed8ced419455a4320a735a92e9d': { coingeckoId: "ozonechain", decimals: 18 }, // was mapped to wrong chain
  },
  provenance: {
    'ueurc.figure.se': { coingeckoId: 'euro-coin', decimals: 6 },
    'pm.pool.asset.3hjz8rcr3pejdc3msntlvy': { coingeckoId: 'usd-coin', decimals: 0 },
    'pm.pool.asset.1y3flutqcyuf8duew1vj2g': { coingeckoId: 'usd-coin', decimals: 0 },
  },
  bitkub: {
    // KUB-chain stablecoins are $1-pegged but have no CoinGecko price feed, so map them to the canonical priced ids
    '0x7d984c24d2499d840eb3b7016077164e15e5faa6': { coingeckoId: 'tether', decimals: 18 }, // KUSDT (Bitkub-Peg USDT)
    '0x21cdc3706b8c7b1836df0e533dd884069521350b': { coingeckoId: 'tether', decimals: 6 }, // USDT (Bridged Tether USD)
    '0x31929a0fd776f971c5dd14bf03e1f9ff69d9c91c': { coingeckoId: 'usd-coin', decimals: 6 }, // USDC.e (Bridged USDC)
  },
}

ibcChains.forEach(chain => fixBalancesTokens[chain] = { ...ibcMappings, ...(fixBalancesTokens[chain] || {}) })

function getUniqueAddresses(addresses, chain = 'ethereum') {

  const toLowerCase = !caseSensitiveChains.includes(chain)
  const set = new Set()
  addresses.forEach(i => {
    if (typeof i !== 'string') i = i.toString()
    set.add(toLowerCase ? i.toLowerCase() : i)
  })
  return [...set]
}

function normalizeMapping(mapping, chain) {
  if (caseSensitiveChains.includes(chain)) return;
  Object.keys(mapping).forEach(
    key => (mapping[key.toLowerCase()] = mapping[key])
  );
}

for (const [chain, mapping] of Object.entries(transformTokens))
  normalizeMapping(mapping, chain)

for (const [chain, mapping] of Object.entries(fixBalancesTokens))
  normalizeMapping(mapping, chain)

for (const [chain, mapping] of Object.entries(coreAssets))
  coreAssets[chain] = Object.values(mapping).map(i => stripTokenHeader(i, chain))

function getCoreAssets(chain = 'ethereum') {
  const tokens = [
    coreAssets[chain] || [],
    Object.keys(transformTokens[chain] || {}),
    Object.keys(fixBalancesTokens[chain] || {}),
  ].flat()
  let addresses = getUniqueAddresses(tokens, chain)
  if (ibcChains.includes(chain)) addresses.push(...coreAssets.ibc.map(i => 'ibc/' + i))
  return addresses
}

function normalizeAddress(address, chain, extractChain = false) {
  if (!chain && extractChain && address.includes(':')) chain = address.split(':')[0]
  if (chain === 'sei' && address?.startsWith('0x')) return address.toLowerCase()
  if (caseSensitiveChains.includes(chain)) return address
  return address.toLowerCase()
}

function stripTokenHeader(token, chain) {
  if (chain === 'aptos') return token.replace(/^aptos:/, '')
  token = normalizeAddress(token, chain);
  if (chain && !token.startsWith(chain)) return token;
  return token.indexOf(":") > -1 ? token.split(":").slice(1).join(':') : token;
}

module.exports = {
  nullAddress,
  caseSensitiveChains,
  transformTokens,
  fixBalancesTokens,
  normalizeAddress,
  getCoreAssets,
  ibcChains,
  stripTokenHeader,
  getUniqueAddresses,
}
