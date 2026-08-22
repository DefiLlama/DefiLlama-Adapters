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
  'kopi', 'elys', "pryzm", "mantra", 'agoric', 'band', 'axiome', 'allora',
  'celestia', 'dydx', 'dungeon', 'carbon', 'milkyway', 'regen', 'sommelier', 'stride', 'prom', 'babylon', 'xion', 'zigchain',
  'akash'
]
const caseSensitiveChains = [...ibcChains, ...svmChains, 'tezos', 'ton', 'algorand', 'aptos', 'near', 'bitcoin', 'waves', 'tron', 'litecoin', 'polkadot', 'ripple', 'elrond', 'cardano', 'stacks', 'sui', 'ergo', 'mvc', 'renec', 'doge', 'stellar', 'massa', 'aleo',
  'eclipse', 'acala', 'aelf', 'aeternity', 'alephium', 'bifrost', 'bittensor', 'verus', 'dash', 'qubic', 'constellation', 'supra',
  'kaspa', 'bsv', 'arweave', 'pi',
]

const transformTokens = {
  // Sample Code
  // cronos: {
  //   "0x065de42e28e42d90c2052a1b49e7f83806af0e1f": "0x123", // CRK token is mispriced
  //   [ADDRESSES.cronos.TUSD]: ADDRESSES.ethereum.TUSD,
  // },

  linea: {
    // ZeroLend aTokens are rebasing tokens denominated 1:1 in their underlyings.
    '0xb4ffef15daf4c02787bc5332580b838ce39805f5': `linea:${ADDRESSES.linea.WETH}`, // z0ETH
    '0x77e305b4d4d3b9da4e82cefd564f5b948366a44b': 'linea:0x1Bf74C010E6320bab11e2e5A532b5AC15e0b8aA6', // z0weETH → weETH
    '0x0684fc172a0b8e6a65cf4684edb2082272fe9050': 'linea:0x2416092f143378750bb29b79eD961ab195CcEea5', // z0ezETH → ezETH
    '0x8d8b70a576113feedd7e3810ce61f5e243b01264': 'linea:0xD2671165570f41BBB3B0097893300b6EB6101E6C', // z0rsETH → wrsETH
    '0x508c39cd02736535d5cb85f3925218e5e0e8f07a': `linea:${ADDRESSES.linea.USDT}`, // z0USDT
  },
}
const ibcMappings = {
  // Sample Code
  // 'ibc/CA1261224952DF089EFD363D8DBB30A8AB6D8CD181E60EE9E68E432F8DE14FE3': { coingeckoId: 'inter-stable-token', decimals: 6, },
  // 'ibc/5A76568E079A31FA12165E4559BA9F1E9D4C97F9C2060B538C84DCD503815E30': { coingeckoId: 'injective-protocol', decimals: 18, },
}

const fixBalancesTokens = {
  provenance: {
    'ueurc.figure.se': { coingeckoId: 'euro-coin', decimals: 6 },
    'pm.pool.asset.3hjz8rcr3pejdc3msntlvy': { coingeckoId: 'usd-coin', decimals: 0 },
    'pm.pool.asset.1y3flutqcyuf8duew1vj2g': { coingeckoId: 'usd-coin', decimals: 0 },
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
