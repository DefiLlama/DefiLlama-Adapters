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

const ibcChains = ['ibc', 'terra', 'terra2', 'crescent', 'osmosis', 'kujira', 'stargaze', 'juno', 'injective', 'cosmos', 'comdex', 'umee', 'orai', 'persistence', 'fxcore', 'neutron', 'quasar', 'chihuahua', 'sei', 'archway', 'migaloo', 'secret', 'aura', 'xpla']
const caseSensitiveChains = [...ibcChains, 'solana', 'tezos', 'ton', 'algorand', 'aptos', 'near', 'bitcoin', 'waves', 'tron', 'litecoin', 'polkadot', 'ripple', 'elrond', 'cardano', 'stacks', 'sui', 'ergo', 'mvc',]

const distressedAssts = new Set(Object.values({
  CRK: '0x065de42e28e42d90c2052a1b49e7f83806af0e1f',
  aBNBc: ADDRESSES.bsc.ankrBNB,
  aBNBb: ADDRESSES.bsc.aBNBb,
  XRPC: '0xd4ca5c2aff1eefb0bea9e9eab16f88db2990c183',
  FLEET: '0xfd56a3dcfc0690881a466ae432d71bb2db588083',
  YAKU: 'NGK3iHqqQkyRZUj4uhJDQqEyKKcZ7mdawWpqwMffM3s',
  JEFI: '0x80fa6d5384bdde296a28a321f73ab70977575129'
}).map(i => i.toLowerCase()))

const transformTokens = {
  // Sample Code
  // cronos: {
  //   "0x065de42e28e42d90c2052a1b49e7f83806af0e1f": "0x123", // CRK token is mispriced
  //   [ADDRESSES.cronos.TUSD]: ADDRESSES.ethereum.TUSD,
  // },
  ronin: {
    [ADDRESSES.null]: 'ronin:' + ADDRESSES.ronin.WRON,
  },

  bfc: {
    "0x6c9944674C1D2cF6c4c4999FC7290Ba105dcd70e": ADDRESSES.null,
    "0xB800EaF843F962DFe5e145A8c9D07A3e70b11d7F": 'bsc:' + ADDRESSES.null,
    "0x640952E7984f2ECedeAd8Fd97aA618Ab1210A21C": ADDRESSES.ethereum.USDC,
    "0x21ad243b81eff53482F6F6E7C76539f2CfC0B734": 'polygon:' + ADDRESSES.null,
    "0x3eA8654d5755e673599473ab37d92788B5bA12aE": ADDRESSES.ethereum.USDT,
    "0xcDB9579Db96EB5C8298dF889D915D0FF668AfF2a": ADDRESSES.ethereum.DAI,
  }
}
const ibcMappings = {
  // Sample Code
  // 'ibc/CA1261224952DF089EFD363D8DBB30A8AB6D8CD181E60EE9E68E432F8DE14FE3': { coingeckoId: 'inter-stable-token', decimals: 6, },
  // 'ibc/5A76568E079A31FA12165E4559BA9F1E9D4C97F9C2060B538C84DCD503815E30': { coingeckoId: 'injective-protocol', decimals: 18, },
}

const fixBalancesTokens = {
  // Sample Code
  ozone: {
    // '0x83048f0bf34feed8ced419455a4320a735a92e9d': { coingeckoId: "ozonechain", decimals: 18 }, // was mapped to wrong chain
  },
  radixdlt: {
    [ADDRESSES.radixdlt.XRD]: { coingeckoId: 'radix', decimals: 0},
    [ADDRESSES.radixdlt.WETH]: { coingeckoId: 'ethereum', decimals: 0},
  },
  mvc: {
    [ADDRESSES.mvc.SPACE]: { coingeckoId: "microvisionchain", decimals: 8 },
  },
  darwinia: {
    '0xe7578598aac020abfb918f33a20fad5b71d670b4': { coingeckoId: "darwinia-network-native-token", decimals: 18 },
  },
  pg: {
    '0x0cf4071940782b640d0b595cb17bdf3e90869d70': { coingeckoId: 'pego-network-2', decimals: 18 },
  },
  shimmer_evm: {
    '0x1074010000000000000000000000000000000000': { coingeckoId: 'shimmer', decimals: 6 },
    [ADDRESSES.shimmer_evm.WSMR]: { coingeckoId: 'shimmer', decimals: 18 },
    '0x6c890075406c5df08b427609e3a2ead1851ad68d': { coingeckoId: 'shimmer', decimals: 18 },
    '0x3C844FB5AD27A078d945dDDA8076A4084A76E513': { coingeckoId: 'soonaverse', decimals: 6 },
    [ADDRESSES.shimmer_evm.USDT]: { coingeckoId: 'tether', decimals: 18 },
    '0xa158a39d00c79019a01a6e86c56e96c461334eb0': { coingeckoId: 'ethereum', decimals: 18 },
    '0x1cdf3f46dbf8cf099d218cf96a769cea82f75316': { coingeckoId: 'wrapped-bitcoin', decimals: 8 },
  },
  manta: {
    '0x0Dc808adcE2099A9F62AA87D9670745AbA741746': { coingeckoId: 'ethereum', decimals: 18 },
    '0xb73603c5d87fa094b7314c74ace2e64d165016fb': { coingeckoId: 'usd-coin', decimals: 6 },
    '0xf417f5a458ec102b90352f697d6e2ac3a3d2851f': { coingeckoId: 'tether', decimals: 6 },
  },
  scroll: {
    '0x5300000000000000000000000000000000000004': { coingeckoId: 'ethereum', decimals: 18 },
    [ADDRESSES.null]: { coingeckoId: 'ethereum', decimals: 18 },
    '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4': { coingeckoId: 'usd-coin', decimals: 6 }
  },
  nos: {
    [ADDRESSES.nos.BTC]: { coingeckoId: 'bitcoin', decimals: 18 },
  },
  ton: {
    'EQBq4d4GPyBoh-Pjnf3wxUyQSS28WY2Yt-7cPAG8FHpWpNRX': { coingeckoId: 'matic-network', decimals: 18 },
    'EQDCIEo0HUUYsAV-lTMviOd-GkSXfVPsNZMGjRaNOA_6--FD': { coingeckoId: 'orbit-chain', decimals: 18 },
    'EQBf6-YoR9xylol_NwjHrLkrTFAZJCX-bsd-Xx_902OaPaBf': { coingeckoId: 'megaton-finance', decimals: 9 },
    'EQCajaUU1XXSAjTD-xOV7pE49fGtg4q8kF3ELCOJtGvQFQ2C': { coingeckoId: 'the-open-network', decimals: 9 },
    'EQCf7Nb341dxOE3N0jimngRxGEV8T3zo-eU2EZVs_nchNhhZ': { coingeckoId: 'wemix-token', decimals: 18 }
  },
  beam: {
    [ADDRESSES.beam.WMC]: { coingeckoId: 'merit-circle', decimals: 18 },
    [ADDRESSES.beam.USDC]: { coingeckoId: 'usd-coin', decimals: 6 },
    [ADDRESSES.beam.USDT]: { coingeckoId: 'tether', decimals: 18 },
  },
  bfc: {
    [ADDRESSES.null]: { coingeckoId: 'bifrost', decimals: 18 },
  },
  renec: {
    [ADDRESSES.renec.RENEC]: { coingeckoId: "renec", decimals: 9 },
    [ADDRESSES.renec.REUSD]: { coingeckoId: "tether", decimals: 9 }, // reUSD pegged USDT || bridge: https://remitano.com/swap/vn/usdt_reusd
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
  let addresses = getUniqueAddresses(tokens, chain)
  if (ibcChains.includes(chain)) addresses.push(...coreAssets.ibc.map(i => 'ibc/' + i))
  if (anyswapTokenBlacklist[chain]) addresses = addresses.filter(i => !anyswapTokenBlacklist[chain].includes(i))
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

const anyswapTokenBlacklist = {
  ethereum: [ADDRESSES.ethereum.FTM],
  fantom: [
    ADDRESSES.fantom.anyUSDC,
    ADDRESSES.fantom.fUSDT,
    ADDRESSES.fantom.USDC,
    ADDRESSES.fantom.fUSDT,
    ADDRESSES.fantom.DAI,
    ADDRESSES.fantom.MIM,
    ADDRESSES.fantom.nICE
  ],
  harmony: [ADDRESSES.harmony.AVAX],
  kcc: [
    ADDRESSES.moonriver.USDC,
    ADDRESSES.moonriver.ETH,
    ADDRESSES.kcc.DAI,
    ADDRESSES.kcc.WBTC
  ],
  moonriver: [
    ADDRESSES.moonriver.USDT,
    ADDRESSES.moonriver.USDC,
    ADDRESSES.moonriver.ETH
  ],
  arbitrum: [ADDRESSES.arbitrum.MIM],
  shiden: [
    ADDRESSES.telos.ETH,
    ADDRESSES.telos.USDC,
    ADDRESSES.shiden.JPYC,
    ADDRESSES.shiden.ETH,
    ADDRESSES.dogechain.BUSD,
    ADDRESSES.shiden.BUSD
  ],
  telos: [
    ADDRESSES.telos.ETH,
    ADDRESSES.telos.WBTC,
    ADDRESSES.telos.USDC,
    ADDRESSES.telos.USDT
  ],
  syscoin: [
    ADDRESSES.syscoin.USDC,
    ADDRESSES.syscoin.ETH,
    ADDRESSES.syscoin.USDT
  ],
  boba: [ADDRESSES.boba.BUSD],
  velas: [
    ADDRESSES.moonriver.ETH,
    ADDRESSES.moonriver.USDC
  ],
  dogechain: [
    ADDRESSES.moonriver.USDT,
    ADDRESSES.dogechain.BUSD,
    ADDRESSES.dogechain.MATIC
  ],
  kava: [
    ADDRESSES.telos.ETH,
    ADDRESSES.moonriver.USDT,
    ADDRESSES.telos.USDC,
    ADDRESSES.shiden.ETH,
    ADDRESSES.syscoin.ETH,
    ADDRESSES.moonriver.USDC,
    ADDRESSES.dogechain.BUSD
  ],
  step: [
    ADDRESSES.moonriver.USDC,
    ADDRESSES.telos.ETH,
    ADDRESSES.telos.USDC,
    ADDRESSES.telos.USDT
  ],
  godwoken_v1: [
    ADDRESSES.moonriver.USDC,
    ADDRESSES.shiden.ETH,
    ADDRESSES.telos.ETH,
    ADDRESSES.moonriver.USDT
  ],
  milkomeda_a1: [ADDRESSES.telos.ETH],
  wemix: [
    ADDRESSES.boba.BUSD,
    ADDRESSES.shiden.ETH,
    ADDRESSES.moonriver.USDC
  ],
  eos_evm: [
    ADDRESSES.syscoin.USDT,
    ADDRESSES.shiden.ETH,
    ADDRESSES.telos.ETH,
    ADDRESSES.telos.USDT
  ]
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
  distressedAssts,
  eulerTokens,
}
