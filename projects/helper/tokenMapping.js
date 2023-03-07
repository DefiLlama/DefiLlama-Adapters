const whitelistedNFTs = require('./whitelistedNfts');
const coreAssets = require('./coreAssets.json')
const nullAddress = '0x0000000000000000000000000000000000000000'

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

const ibcChains = ['ibc', 'terra', 'terra2', 'crescent', 'osmosis', 'kujira', 'stargaze', 'juno', 'injective', 'cosmos', 'comdex', 'stargaze', 'umee', 'orai', 'persistence', ]
const caseSensitiveChains = [...ibcChains, 'solana', 'tezos', 'ton', 'algorand', 'aptos', 'near', 'bitcoin', 'waves', 'tron', 'litecoin', 'polkadot', 'ripple', 'elrond', 'cardano',]

const tokens = {
  null: nullAddress,
  aave: 'ethereum:0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
  matic: 'ethereum:0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
  bat: 'ethereum:0x0d8775f648430679a709e98d2b0cb6250d2887ef',
  reth: 'ethereum:0xae78736cd615f374d3085123a210448e74fc6393',
  steth: 'ethereum:0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
  solana: 'solana:So11111111111111111111111111111111111111112',
  dai: 'ethereum:0x6b175474e89094c44da98b954eedeac495271d0f',
  usdt: 'ethereum:0xdac17f958d2ee523a2206206994597c13d831ec7',
  usdc: 'ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  ethereum: 'ethereum:' + nullAddress,
  weth: 'ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  busd: 'bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56',
  bsc: 'bsc:' + nullAddress,
  bnb: 'bsc:0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  link: 'ethereum:0x514910771af9ca656af840dff83e8264ecf986ca',
  wbtc: 'ethereum:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  wsteth: 'ethereum:0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
}
const tokensBare = {}
for (const [label, value] of Object.entries(tokens))
  tokensBare[label] = value.split(':')[1]

const distressedAssts = new Set(Object.values({
  CRK: '0x065de42e28e42d90c2052a1b49e7f83806af0e1f',
  aBNBc: '0xe85afccdafbe7f2b096f268e31cce3da8da2990a',
  aBNBb: '0xbb1aa6e59e5163d8722a122cd66eba614b59df0d',
  XRPC: '0xd4ca5c2aff1eefb0bea9e9eab16f88db2990c183',
}).map(i => i.toLowerCase()))

const transformTokens = {
  // Sample Code
  // cronos: {
  //   "0x065de42e28e42d90c2052a1b49e7f83806af0e1f": "0x123", // CRK token is mispriced
  //   "0x87EFB3ec1576Dec8ED47e58B832bEdCd86eE186e": "0x0000000000085d4780B73119b644AE5ecd22b376",
  // },
}
const ibcMappings = {
  // Sample Code
  // 'ibc/CA1261224952DF089EFD363D8DBB30A8AB6D8CD181E60EE9E68E432F8DE14FE3': { coingeckoId: 'inter-stable-token', decimals: 6, },
  // 'ibc/5A76568E079A31FA12165E4559BA9F1E9D4C97F9C2060B538C84DCD503815E30': { coingeckoId: 'injective-protocol', decimals: 18, },
}

const fixBalancesTokens = {
  // Sample Code
  // arbitrum_nova: {
  //   [nullAddress]: { coingeckoId: "ethereum", decimals: 18 },
  //   '0x722E8BdD2ce80A4422E880164f2079488e115365': { coingeckoId: "ethereum", decimals: 18 },
  //   '0x52484e1ab2e2b22420a25c20fa49e173a26202cd': { coingeckoId: "tether", decimals: 6 },
  //   '0x750ba8b76187092b0d1e87e28daaf484d1b5273b': { coingeckoId: "usd-coin", decimals: 6 },
  // },
}

ibcChains.forEach(chain => fixBalancesTokens[chain] = { ...ibcMappings, ...(fixBalancesTokens[chain] || {}) })

function getUniqueAddresses(addresses, chain) {
  const toLowerCase = !caseSensitiveChains.includes(chain)
  const set = new Set()
  addresses.forEach(i => set.add(toLowerCase ? i.toLowerCase() : i))
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
  coreAssets[chain] = mapping.map(i => stripTokenHeader(i, chain))

function getCoreAssets(chain = 'ethereum') {
  const tokens = [
    coreAssets[chain] || [],
    Object.keys(transformTokens[chain] || {}),
    Object.keys(fixBalancesTokens[chain] || {}),
  ].flat()
  const addresses = getUniqueAddresses(tokens, chain)
  if (ibcChains.includes(chain)) addresses.push(...coreAssets.ibc)
  return addresses
}

function normalizeAddress(address, chain, extractChain = false) {
  if (!chain && extractChain && address.includes(':')) chain = address.split(':')[0]
  if (caseSensitiveChains.includes(chain)) return address
  return address.toLowerCase()
}

function stripTokenHeader(token, chain) {
  if (chain === 'aptos') return token.replace(/^aptos:/, '')
  token = normalizeAddress(token, chain);
  if (chain && !token.startsWith(chain)) return token;
  return token.indexOf(":") > -1 ? token.split(":")[1] : token;
}

function getWhitelistedNFTs(chain = 'ethereum') {
  return whitelistedNFTs[chain].map(i => i.toLowerCase())
}

module.exports = {
  nullAddress,
  tokens,
  tokensBare,
  caseSensitiveChains,
  transformTokens,
  fixBalancesTokens,
  normalizeAddress,
  getCoreAssets,
  ibcChains,
  stripTokenHeader,
  getUniqueAddresses,
  getWhitelistedNFTs,
  distressedAssts,
}
