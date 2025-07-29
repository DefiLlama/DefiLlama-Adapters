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


const ibcChains = ['ibc', 'terra', 'terra2', 'crescent', 'osmosis', 'kujira', 'stargaze', 'juno', 'injective', 'cosmos', 'provenance', 'comdex', 'umee', 'orai', 'persistence', 'fxcore', 'neutron', 'quasar', 'chihuahua', 'sei', 'archway', 'migaloo', 'secret', 'aura', 'xpla', 'bostrom', 'joltify', 'nibiru',
  'kopi', 'elys', "pryzm", "mantra", 'agoric', 'band',
  'celestia', 'dydx', 'carbon', 'milkyway', 'regen', 'sommelier', 'stride', 'prom', 'babylon', 'xion'
]
const caseSensitiveChains = [...ibcChains, 'solana', 'soon', 'tezos', 'ton', 'algorand', 'aptos', 'near', 'bitcoin', 'waves', 'tron', 'litecoin', 'polkadot', 'ripple', 'elrond', 'cardano', 'stacks', 'sui', 'ergo', 'mvc', 'renec', 'doge', 'stellar', 'massa',
  'eclipse', 'acala', 'aelf', 'aeternity', 'alephium', 'bifrost', 'bittensor', 'verus',
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
  ozone: {
    // '0x83048f0bf34feed8ced419455a4320a735a92e9d': { coingeckoId: "ozonechain", decimals: 18 }, // was mapped to wrong chain
  },
  flow: {
    "0x1b97100ea1d7126c4d60027e231ea4cb25314bdb": { coingeckoId: "ankr-staked-flow", decimals: 18 },
  },
  soon: {
    [ADDRESSES.soon.USDT]: { coingeckoId: "tether", decimals: 6 },
    [ADDRESSES.soon.USDC]: { coingeckoId: "usd-coin", decimals: 6 },
    [ADDRESSES.soon.DAI]: { coingeckoId: "dai", decimals: 9 },
    [ADDRESSES.soon.WBTC]: { coingeckoId: "wrapped-bitcoin", decimals: 8 },
    [ADDRESSES.soon.weETH]: { coingeckoId: "wrapped-eeth", decimals: 9 },
    [ADDRESSES.solana.SOL]: { coingeckoId: "ethereum", decimals: 9 },
    [ADDRESSES.soon.ezETH]: { coingeckoId: "renzo-restaked-eth", decimals: 9 },
    [ADDRESSES.soon.STONE]: { coingeckoId: "stakestone-ether", decimals: 9 },
    [ADDRESSES.soon.sUSDe]: { coingeckoId: "ethena-staked-usde", decimals: 9 },
    [ADDRESSES.soon.EIGEN]: { coingeckoId: "eigenlayer", decimals: 9 },
    [ADDRESSES.soon.mUSD]: { coingeckoId: "manta-musd", decimals: 9 },
    [ADDRESSES.soon.mETH]: { coingeckoId: "manta-meth", decimals: 9 },
    [ADDRESSES.soon.rsETH]: { coingeckoId: "kelp-dao-restaked-eth", decimals: 9 },
    [ADDRESSES.soon.pufETH]: { coingeckoId: "pufeth", decimals: 9 },
    [ADDRESSES.soon.SOON]: { coingeckoId: "soon-2", decimals: 9 },
    [ADDRESSES.soon.WETH]: { coingeckoId: "ethereum", decimals: 9 },
    [ADDRESSES.soon.SOL]: { coingeckoId: "solana", decimals: 9 },
    [ADDRESSES.soon.BONK]: { coingeckoId: "bonk", decimals: 5 },
  },
  tac: {
    [ADDRESSES.null]: { coingeckoId: "tac", decimals: 18 },
    '0xB63B9f0eb4A6E6f191529D71d4D88cc8900Df2C9': { coingeckoId: "tac", decimals: 18 },
    '0xb76d91340f5ce3577f0a056d29f6e3eb4e88b140': { coingeckoId: "the-open-network", decimals: 9 },
    '0xd44f691aed69fe43180b95b6f82f89c18fb93094': { coingeckoId: "tonstakers", decimals: 9 },
    '0x61d66bc21fed820938021b06e9b2291f3fb91945': { coingeckoId: "ethereum", decimals: 18 },
    '0xaf368c91793cb22739386dfcbbb2f1a9e4bcbebf': { coingeckoId: "wrapped-steth", decimals: 18 },
    '0x51a30e647d33a044967fa3dbb04d6ed6f45455f6': { coingeckoId: "noon-usn", decimals: 18 },
    '0xaf988c3f7cb2aceabb15f96b19388a259b6c438f': { coingeckoId: "tether", decimals: 6 },
    '0x7048c9e4abd0cf0219e95a17a8c6908dfc4f0ee4': { coingeckoId: "coinbase-wrapped-btc", decimals: 8 },
    '0xecac9c5f704e954931349da37f60e39f515c11c1': { coingeckoId: "lombard-staked-btc", decimals: 8 },
  },
  ripple: {
    'TBL.rJNE2NNz83GJYtWVLwMvchDWEon3huWnFn': { coingeckoId: "openeden-tbill", decimals: 0 },
  },
  hydragon: {
    [ADDRESSES.null]: { coingeckoId: "hydra", decimals: 18 },
    '0x900e563a74be93807e8a4a3b52d72a351badd6bf': { coingeckoId: "hydra", decimals: 18 },
    '0x0000000000000000000000000000000000001013': { coingeckoId: "liquid-hydra", decimals: 18 },
    '0xbbf6f2d2d462185df545c744974b7eb6ddadfcfd': { coingeckoId: "usd-coin", decimals: 6 },
    '0xb8043294eff43bcd01bd33968c7ae9dbc6a4bf8b': { coingeckoId: "wrapped-bitcoin", decimals: 8 },
  },
  provenance: {
    nhash: { coingeckoId: 'hash-2', decimals: 9},
    'uusd.trading': { coingeckoId: 'usd-coin', decimals: 6 },
    'uusdc.figure.se': { coingeckoId: 'usd-coin', decimals: 6 },
    'uylds.fcc': { coingeckoId: 'usd-coin', decimals: 6 },
    'nbtc.figure.se': { coingeckoId: 'bitcoin', decimals: 9 },
    'neth.figure.se': { coingeckoId: 'ethereum', decimals: 9 },
    'uusdt.figure.se': { coingeckoId: 'tether', decimals: 6 },
    'nlink.figure.se': { coingeckoId: 'chainlink', decimals: 9 },
    'nsol.figure.se': { coingeckoId: 'solana', decimals: 9 },
    'nuni.figure.se': { coingeckoId: 'uniswap', decimals: 9 },
    'uxrp.figure.se': { coingeckoId: 'ripple', decimals: 6 },
    'ulrwa.figure.markets': { coingeckoId: 'usd-coin', decimals: 6 },
    'ureit.figure.markets': { coingeckoId: 'usd-coin', decimals: 6 },
    SOL: { coingeckoId: 'solana', decimals: 0 },
    ETH: { coingeckoId: 'ethereum', decimals: 0 },
    USDT: { coingeckoId: 'tether', decimals: 0 },
    BTC: { coingeckoId: 'bitcoin', decimals: 0 },
    USDC: { coingeckoId: 'usd-coin', decimals: 0 },
    USD: { coingeckoId: 'usd-coin', decimals: 0 },
    YLDS: { coingeckoId: 'usd-coin', decimals: 0 },
    'pm.sale.pool.3dxq3fk9llvhrqqwhodiap': { coingeckoId: 'usd-coin', decimals: 0 },
  },
}

ibcChains.forEach(chain => fixBalancesTokens[chain] = { ...ibcMappings, ...(fixBalancesTokens[chain] || {}) })

function getUniqueAddresses(addresses, chain = 'ethereum') {
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
