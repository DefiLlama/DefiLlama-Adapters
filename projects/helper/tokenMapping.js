let coreAssets = require('./coreAssets.json')
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

const ibcChains = ['ibc', 'terra', 'terra2', 'crescent', 'osmosis', 'kujira', 'stargaze', 'juno', 'injective', 'cosmos', 'comdex', 'stargaze', 'umee', 'orai', 'persistence', 'fxcore',]
const caseSensitiveChains = [...ibcChains, 'solana', 'tezos', 'ton', 'algorand', 'aptos', 'near', 'bitcoin', 'waves', 'tron', 'litecoin', 'polkadot', 'ripple', 'elrond', 'cardano', 'stacks', 'sui']

const distressedAssts = new Set(Object.values({
  CRK: '0x065de42e28e42d90c2052a1b49e7f83806af0e1f',
  aBNBc: ADDRESSES.bsc.ankrBNB,
  aBNBb: ADDRESSES.bsc.aBNBb,
  XRPC: '0xd4ca5c2aff1eefb0bea9e9eab16f88db2990c183',
}).map(i => i.toLowerCase()))

const transformTokens = {
  ethereum: {
    '0xe0b469cb3eda0ece9e425cfeda4df986a55ea9f8': ADDRESSES.ethereum.WETH,
    [ADDRESSES.ethereum.vlCVX]: ADDRESSES.ethereum.CVX,
  },
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
  // Sample Code
  // arbitrum_nova: {
  //   [nullAddress]: { coingeckoId: "ethereum", decimals: 18 },
  //   [ADDRESSES.arbitrum_nova.WETH]: { coingeckoId: "ethereum", decimals: 18 },
  //   [ADDRESSES.arbitrum_nova.USDT]: { coingeckoId: "tether", decimals: 6 },
  //   [ADDRESSES.arbitrum_nova.USDC]: { coingeckoId: "usd-coin", decimals: 6 },
  // },
  pulse: {
    '0xa1077a294dde1b09bb078844df40758a5d0f9a27': { coingeckoId: "pulsechain", decimals: 18 },
    '0x02dcdd04e3f455d838cd1249292c58f3b79e3c3c': { coingeckoId: ADDRESSES.ethereum.WETH, decimals: 0, },
    '0xefd766ccb38eaf1dfd701853bfce31359239f305': { coingeckoId: ADDRESSES.ethereum.DAI, decimals: 0, },
  },
  evmos: {
    '0x2c68d1d6ab986ff4640b51e1f14c716a076e44c4': { coingeckoId: "evmos", decimals: 18 },//stEVMOS
    '0x50de24b3f0b3136c50fa8a3b8ebc8bd80a269ce5': { coingeckoId: "axlweth", decimals: 18 },//axlWETH
    '0xb5124fa2b2cf92b2d469b249433ba1c96bdf536d': { coingeckoId: "stride-staked-atom", decimals: 6 },
    '0xc5e00d3b04563950941f7137b5afa3a534f0d6d6': { coingeckoId: "cosmos", decimals: 6 },
    '0x8fa78ceb7f04118ec6d06aac37ca854691d8e963': { coingeckoId: "stride", decimals: 6 },
    '0xe60ce2dfa6d4ad37ade1dcb7ac4d6c3a093b3a7e': { coingeckoId: "rocket-pool-eth", decimals: 18 },//axlRETH
    '0xb72a7567847aba28a2819b855d7fe679d4f59846': { coingeckoId: "tether-usd-celer", decimals: 6 },
  },
  era: {
    '0x2039bb4116B4EFc145Ec4f0e2eA75012D6C0f181': { coingeckoId: "binance-usd", decimals: 18 },
  },
  fxcore: {
    'FX': { coingeckoId: "fx-coin", decimals: 18 },
    'usdt': { coingeckoId: "tether", decimals: 6 },
  },
  xpla: {
    'axpla': { coingeckoId: "xpla", decimals: 18 },
  },
  kava: {
    'bnb': { coingeckoId: "binancecoin", decimals: 8 },
    'btcb': { coingeckoId: "bitcoin", decimals: 8  },
    'busd': { coingeckoId: "binance-usd", decimals: 8 },
    'hard': { coingeckoId: "kava-lend", decimals: 6 },
    'swp': { coingeckoId: "kava-swap", decimals: 6 },
    'ukava': { coingeckoId: "kava", decimals: 6 },
    'bkava': { coingeckoId: "kava", decimals: 6 },
    'xrpb': { coingeckoId: "ripple", decimals: 8 },
    'usdx': { coingeckoId: "usdx", decimals: 6 },
    'hbtc': { coingeckoId: "huobi-btc", decimals: 8 },
    'erc20:axelar:usdc': { coingeckoId: "usd-coin", decimals: 6 },
    'erc20:multichain:usdc': { coingeckoId: "usd-coin", decimals: 6 },
    'erc20:multichain:usdt': { coingeckoId: "tether", decimals: 6 },
    'erc20:multichain:wbtc': { coingeckoId: "wrapped-bitcoin", decimals: 8 },
    'erc20:multichain:dai': { coingeckoId: "dai", decimals: 18 },
    'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2': { coingeckoId: "cosmos", decimals: 6 },
    'ibc/799FDD409719A1122586A629AE8FCA17380351A51C1F47A80A1B8E7F2A491098': { coingeckoId: "akash-network", decimals: 6 },
    'ibc/B8AF5D92165F35AB31F3FC7C7B444B9D240760FA5D406C49D24862BD0284E395': { coingeckoId: "terra-luna", decimals: 6 },
    'ibc/0471F1C4E7AFD3F07702BEF6DC365268D64570F7C1FDC98EA6098DD6DE59817B': { coingeckoId: "osmosis", decimals: 6 },
    'ibc/B448C0CA358B958301D328CCDC5D5AD642FC30A6D3AE106FF721DB315F3DDE5C': { coingeckoId: "terrausd", decimals: 6 },
  }
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
  coreAssets[chain] = Object.values(mapping).map(i => stripTokenHeader(i, chain))

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

const eulerTokens = [
  "0x1b808f49add4b8c6b5117d9681cf7312fcf0dc1d",
  "0xe025e3ca2be02316033184551d4d3aa22024d9dc",
  "0xeb91861f8a4e1c12333f42dce8fb0ecdc28da716",
  "0x4d19f33948b99800b6113ff3e83bec9b537c85d2",
  "0x5484451a88a35cd0878a1be177435ca8a0e4054e",
  "0x64ad6d2472de5ddd3801fb4027c96c3ee7a7ee82",
  // 4626 wrapped eTokens
  "0x60897720aa966452e8706e74296b018990aec527",
  "0x3c66B18F67CA6C1A71F829E2F6a0c987f97462d0",
  "0x4169Df1B7820702f566cc10938DA51F6F597d264",
  "0xbd1bd5c956684f7eb79da40f582cbe1373a1d593",
]

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
  distressedAssts,
  eulerTokens,
}
