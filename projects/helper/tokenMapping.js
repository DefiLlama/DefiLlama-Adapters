const { decimals } = require('@defillama/sdk/build/erc20')
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

const ibcChains = ['ibc', 'terra', 'terra2', 'crescent', 'osmosis', 'kujira', 'stargaze', 'juno', 'injective', 'cosmos', 'comdex', 'umee', 'orai', 'persistence', 'fxcore', 'neutron', 'quasar', 'chihuahua', 'sei', 'archway', 'migaloo', 'secret', 'aura', 'xpla', 'bostrom']
const caseSensitiveChains = [...ibcChains, 'solana', 'tezos', 'ton', 'algorand', 'aptos', 'near', 'bitcoin', 'waves', 'tron', 'litecoin', 'polkadot', 'ripple', 'elrond', 'cardano', 'stacks', 'sui', 'ergo', 'mvc', 'renec',]

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
  ancient8: {
    [ADDRESSES.nul]: { coingeckoId: "ethereum", decimals: 18, },
    '0x4200000000000000000000000000000000000006': { coingeckoId: "ethereum", decimals: 18, },
  },
  area: {
    '0x1d1bc800e71576a59f9ef88bb679fa13c2e10abf': { coingeckoId: 'areon-network', decimals: 18, },
  },
  // Sample Code
  ozone: {
    // '0x83048f0bf34feed8ced419455a4320a735a92e9d': { coingeckoId: "ozonechain", decimals: 18 }, // was mapped to wrong chain
  },

  karak: {
    '0xa415021bc5c4c3b5b989116dc35ae95d9c962c8d': { coingeckoId: 'usd-coin', decimals: 6, },
    '0xf948aacec00289fc33d8226391f7e04bb457ad49': { coingeckoId: 'restaked-swell-eth', decimals: 18, },
    [ADDRESSES.optimism.WETH_1]: { coingeckoId: 'ethereum', decimals: 18, },
  },
  linea: {
    '0x894134a25a5fac1c2c26f1d8fbf05111a3cb9487': { coingeckoId: 'grai', decimals: 18, },
    '0x023617babed6cef5da825bea8363a5a9862e120f': { coingeckoId: "savings-dai", decimals: 18, },
  },
  arbitrum: {
    '0xe46C5eA6Da584507eAF8dB2F3F57d7F578192e13': { coingeckoId: 'zeepr', decimals: 18, },
  },
  core: {
    '0x1281E326C6e4413A98DafBd0D174a4Ae07ff4223': { coingeckoId: "zeepr", decimals: 18, },
    '0x8034ab88c3512246bf7894f57c834dddbd1de01f': { coingeckoId: "bitcoin", decimals: 8 },
  },
  bsc: {
    '0x55CBAC75C1af769eB7FD37d27A5cb6437EB29abB': { coingeckoId: "zeepr", decimals: 18, },
  },
  manta: {
    '0x0863C7BcdB6Cf6edd5dc4bbd181A8D555AedbfBd': { coingeckoId: "zeepr", decimals: 18, },
  },
  polygon: {
    '0x49fdEA2192b04e54E6D1cB5E3B3b996BAA6f621F': { coingeckoId: "zeepr", decimals: 18, },
  },
  zkfair: {
    '0x5d26DeA980716e4aBa19F5B73Eb3DCcE1889F042': { coingeckoId: "zeepr", decimals: 18, },
  },
  scroll: {
    "0x80137510979822322193fc997d400d5a6c747bf7": { coingeckoId: "ethereum:0x7122985656e38bdc0302db86685bb972b145bd3c", decimals: 0 },
    "0xa25b25548B4C98B0c7d3d27dcA5D5ca743d68b7F": { coingeckoId: "kelp-dao-restaked-eth", decimals: 18 }
  },
  velas: {
    '0xaadbaa6758fc00dec9b43a0364a372605d8f1883': { coingeckoId: "staked-vlx", decimals: 18, },
    '0x2b1abeb48f875465bf0d3a262a2080ab1c7a3e39': { coingeckoId: "velas", decimals: 18, },
    '0x380f73bad5e7396b260f737291ae5a8100baabcd': { coingeckoId: "ethereum", decimals: 18, },
    '0x4b773e1ae1baa4894e51cc1d1faf485c91b1012f': { coingeckoId: "tether", decimals: 6, },
  },
  merlin: {
    '0x4dcb91cc19aadfe5a6672781eb09abad00c19e4c': { coingeckoId: "sats-ordinals", decimals: 18, },
    '0x69181a1f082ea83a152621e4fa527c936abfa501': { coingeckoId: "rats", decimals: 18, },
    '0x0726523eba12edad467c55a962842ef358865559': { coingeckoId: "ordinals", decimals: 18, },
    '0x0000000000000000000000000000000000000000': { coingeckoId: "bitcoin", decimals: 18, },
    '0x967aec3276b63c5e2262da9641db9dbebb07dc0d': { coingeckoId: "tether", decimals: 6, },
    '0x6b4ecada640f1b30dbdb68f77821a03a5f282ebe': { coingeckoId: "usd-coin", decimals: 6, },
  },
  zeta: {
    [ADDRESSES.zeta.WZETA]: { decimals: 18, coingeckoId: "zetachain" },
    [ADDRESSES.null]: { decimals: 18, coingeckoId: "zetachain" },
    "0x05BA149A7bd6dC1F937fA9046A9e05C05f3b18b0": { decimals: 18, coingeckoId: "usd-coin" },
    "0x0cbe0dF132a6c6B4a2974Fa1b7Fb953CF0Cc798a": { decimals: 18, coingeckoId: "usd-coin" },
    "0x7c8dDa80bbBE1254a7aACf3219EBe1481c6E01d7": { decimals: 18, coingeckoId: "tether" },
    "0x91d4F0D54090Df2D81e834c3c8CE71C6c865e79F": { decimals: 18, coingeckoId: "tether" },
    "0xd97b1de3619ed2c6beb3860147e30ca8a7dc9891": { decimals: 18, coingeckoId: "ethereum" },
    "0x48f80608b672dc30dc7e3dbbd0343c5f02c738eb": { decimals: 18, coingeckoId: "binancecoin" },
    "0x13A0c5930C028511Dc02665E7285134B6d11A5f4": { decimals: 18, coingeckoId: "bitcoin" }
  },
  mode: {
    '0x80137510979822322193fc997d400d5a6c747bf7': { coingeckoId: "stakestone-ether", decimals: 18 },
  },
  zklink: {
    '0x0000000000000000000000000000000000000000': { coingeckoId: "ethereum", decimals: 18, },
    '0xda4aaed3a53962c83b35697cd138cc6df43af71f': { coingeckoId: "wrapped-bitcoin", decimals: 8, },
    '0x2f8a25ac62179b31d62d7f80884ae57464699059': { coingeckoId: "tether", decimals: 6, },
    '0x1a1a3b2ff016332e866787b311fcb63928464509': { coingeckoId: "usd-coin", decimals: 6, },
  },
  bsquared: {
    '0x0000000000000000000000000000000000000000': { coingeckoId: "bitcoin", decimals: 18, },
    '0x4200000000000000000000000000000000000006': { coingeckoId: "bitcoin", decimals: 18, },
    '0x681202351a488040fa4fdcc24188afb582c9dd62': { coingeckoId: "tether", decimals: 6, },
    '0xe544e8a38add9b1abf21922090445ba93f74b9e5': { coingeckoId: "usd-coin", decimals: 6, },
  },
  planq: {
    '0x5ebcdf1de1781e8b5d41c016b0574ad53e2f6e1a': { coingeckoId: "planq", decimals: 18, },
  },
  xlayer: {
    [ADDRESSES.xlayer.WOKB]: { coingeckoId: "okb", decimals: 18, },
    [ADDRESSES.xlayer.WBTC]: { coingeckoId: "wrapped-bitcoin", decimals: 8, },
    [ADDRESSES.xlayer.WETH]: { coingeckoId: "ethereum", decimals: 18, },
    [ADDRESSES.xlayer.USDT]: { coingeckoId: "tether", decimals: 6, },
    [ADDRESSES.xlayer.USDC]: { coingeckoId: "usd-coin", decimals: 6, },
  },
  lac: {
    '0x2911a1ab18546cb501628be8625c7503a2a7db54': { coingeckoId: "la-coin", decimals: 18, },
  },
  rpg: {
    '0xdaa6a6919c9543d8787490f5e9ad532c4d7ce9e8': { coingeckoId: "deherogame-amazing-token", decimals: 18, },
    '0x36426b7bf5709e5c2160411c6e8b1832e3404fe1': { coingeckoId: "mixmarvel", decimals: 18, },
  },
  genesys: {
    [ADDRESSES.genesys.WGSYS]: { coingeckoId: "genesys", decimals: 18 },
  },
  zora: {
    [ADDRESSES.null]: { coingeckoId: "ethereum", decimals: 18, },
    [ADDRESSES.zora.USDzC]: { coingeckoId: "usd-coin", decimals: 6, },
  },
  acala: {
    ACA: { coingeckoId: "acala", decimals: 12 },
    LDOT: { coingeckoId: "liquid-staking-dot", decimals: 10 },
    DOT: { coingeckoId: "polkadot", decimals: 10 },
  },
  karura: {
    KSM: { coingeckoId: "kusama", decimals: 12 },
    LKSM: { coingeckoId: "liquid-ksm", decimals: 12 },
    KAR: { coingeckoId: "karura", decimals: 12 },
    BNC: { coingeckoId: "bifrost-native-coin", decimals: 12 },
    PHA: { coingeckoId: "pha", decimals: 12 },
    KINT: { coingeckoId: "kintsugi", decimals: 12 },
    KBTC: { coingeckoId: "kintsugi-btc", decimals: 8 },
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
  return token.indexOf(":") > -1 ? token.split(":").slice(1).join(':') : token;
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
  ],
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
  eulerTokens,
}
