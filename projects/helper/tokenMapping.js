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
  'akash', 'fetchhub'
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
}
const ibcMappings = {
  // Sample Code
  // 'ibc/CA1261224952DF089EFD363D8DBB30A8AB6D8CD181E60EE9E68E432F8DE14FE3': { coingeckoId: 'inter-stable-token', decimals: 6, },
  // 'ibc/5A76568E079A31FA12165E4559BA9F1E9D4C97F9C2060B538C84DCD503815E30': { coingeckoId: 'injective-protocol', decimals: 18, },
}

const fixBalancesTokens = {
  // Arc USDC is one token with two interfaces (native 18-dec gas + ERC-20 6-dec at 0x3600…).
  // Native balances are folded into the ERC-20 address in portedTokens before this mapping runs.
  arc: {
    '0x3600000000000000000000000000000000000000': { coingeckoId: 'usd-coin', decimals: 6 },
    '0xbEf5f6d51CB62b58e6A8f77868681825C6fe21c1': { coingeckoId: 'euro-coin', decimals: 6 },
    '0x128cC466B61f542da60c70e3aA11c10e19B84EDB': { coingeckoId: 'weth', decimals: 18 },
    '0x171A4217b86A807A64eB94757Db6849fb4bDbAA0': { coingeckoId: 'bitcoin', decimals: 8 },
    '0xF197FFC28c23E0309B5559e7a166f2c6164C80aA': { coingeckoId: 'mxnb', decimals: 6 },
    '0x75700e137c05B2beb2b3A436cCB551652E3D8B11': { coingeckoId: 'brla-digital-brla', decimals: 18 },
    '0xd2a530170D71a9Cfe1651Fb468E2B98F7Ed7456b': { coingeckoId: 'forte-aud', decimals: 6 },
    '0xd70C2FA4232e054B373eFAEa98E4138511c2a309': { coingeckoId: 'stablecorp-qcad', decimals: 6 },
    '0xE205b4e7Ac03E3f7b2060C3EDf2171AA7126C0d5': { coingeckoId: 'zar-universal', decimals: 18 },
    '0x303dBB88BA14626c7a927E983b73267C575315f7': { coingeckoId: 'krw1', decimals: 18 },
    '0xbBe6aAB0Ed76e90AeA0d1cd978EC231c8AdCDF8b': { coingeckoId: 'agant-gbp', decimals: 6 },
    '0x4933A85b5b5466Fbaf179F72D3DE273c287EC2c2': { coingeckoId: 'allunity-eur', decimals: 6 },
    '0xc6df1B92a6ae61a27059C41e541A91CE8DCb1605': { coingeckoId: 'allunity-chf', decimals: 6 },
  },
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
