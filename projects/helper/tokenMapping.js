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


const ibcChains = ['ibc', 'terra', 'terra2', 'crescent', 'osmosis', 'kujira', 'stargaze', 'juno', 'injective', 'cosmos', 'comdex', 'umee', 'orai', 'persistence', 'fxcore', 'neutron', 'quasar', 'chihuahua', 'sei', 'archway', 'migaloo', 'secret', 'aura', 'xpla', 'bostrom', 'joltify']
const caseSensitiveChains = [...ibcChains, 'solana', 'tezos', 'ton', 'algorand', 'aptos', 'near', 'bitcoin', 'waves', 'tron', 'litecoin', 'polkadot', 'ripple', 'elrond', 'cardano', 'stacks', 'sui', 'ergo', 'mvc', 'renec', 'doge', 'stellar', 'massa',]

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
  // Sample Code
  ozone: {
    // '0x83048f0bf34feed8ced419455a4320a735a92e9d': { coingeckoId: "ozonechain", decimals: 18 }, // was mapped to wrong chain
  },
  chainflip: {
    Dot: { coingeckoId: 'polkadot', decimals: 10 },
    Usdc: { coingeckoId: 'usd-coin', decimals: 6 },
    Flip: { coingeckoId: 'chainflip', decimals: 18 },
    Btc: { coingeckoId: 'bitcoin', decimals: 8 },
    Eth: { coingeckoId: 'ethereum', decimals: 18 },
    Usdt: { coingeckoId: 'tether', decimals: 6 },
    ArbEth: { coingeckoId: 'ethereum', decimals: 18 },
    ArbUsdc: { coingeckoId: 'usd-coin', decimals: 6 },
  },
  thundercore: {
    '0xc3c857a9e5be042c8acf4f2827aa053e93b5d039': { coingeckoId: 'thunder-token', decimals: 18 },
  },
  oasis: {
    '0x0000000000000000000000000000000000000000': { coingeckoId: 'oasis-network', decimals: 18 },
  },
  heco: {
    '0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f': { coingeckoId: 'huobi-token', decimals: 18 },
  },
  base: {
    '0xb6fe221fe9eef5aba221c348ba20a1bf5e73624c': { coingeckoId: 'rocket-pool-eth', decimals: 18 },
  },
  ftn: {
    '0x780fb5aca83f2e3f57ee18cc3094988ef49d8c3d': { coingeckoId: 'lolik-staked-ftn', decimals: 18 },
    '0x4b7708ee3ccbd3f9af68208e69ad31f611e1befe': { coingeckoId: 'usd-coin', decimals: 6 },
    '0xb7dc5eca6de5cb9b46ac405d3d4596333714f3f7': { coingeckoId: 'tether', decimals: 6 },
  },
  op_bnb: {
    '0x7c6b91d9be155a6db01f749217d76ff02a7227f2': { coingeckoId: 'binance-bitcoin', decimals: 18 },
    '0xe7798f023fc62146e8aa1b36da45fb70855a77ea': { coingeckoId: 'ethereum', decimals: 18 },
    '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': { coingeckoId: 'first-digital-usd', decimals: 18 },
  },
  optimism: {
    '0x5a7facb970d094b6c7ff1df0ea68d99e6e73cbff': { coingeckoId: 'wrapped-eeth', decimals: 18 },
    '0x2416092f143378750bb29b79ed961ab195cceea5': { coingeckoId: "renzo-restaked-eth", decimals: 18 },
  },
  moonriver: {
    '0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c': { coingeckoId: 'ethereum', decimals: 18 },
  },
  zircuit: {
    [ADDRESSES.null]: { coingeckoId: 'ethereum', decimals: 18 },
  },
  islm: {
    '0x0ce35b0d42608ca54eb7bcc8044f7087c18e7717': { coingeckoId: 'usd-coin', decimals: 6 },
  },
  cronos_zkevm: {
    '0xc1bf55ee54e16229d9b369a5502bfe5fc9f20b6d': { coingeckoId: 'crypto-com-chain', decimals: 18 },
    '0x898b3560affd6d955b1574d87ee09e46669c60ea': { coingeckoId: 'ethereum', decimals: 18 },
  },
  lac: {
    [ADDRESSES.null]: { coingeckoId: "la-coin", decimals: 18 },
    [ADDRESSES.lac.LAC]: { coingeckoId: "la-coin", decimals: 18 },
    '0x42c8c9c0f0a98720dacdaeac0c319cb272b00d7e': { coingeckoId: "ethereum", decimals: 18 },
    '0xf54b8cb8eeee3823a55dddf5540ceaddf9724626': { coingeckoId: "wrapped-bitcoin", decimals: 8 },
  },
  blast: {
    '0xf8a5d147a3a3416ab151758d969eff15c27ab743': { coingeckoId: "blast:0x59c159e5a4f4d1c86f7abdc94b7907b7473477f6", decimals: 0 },
  },
  noble: {
    [ADDRESSES.noble.USDC]: { coingeckoId: "usd-coin", decimals: 6 },
    [ADDRESSES.noble.USDY]: { coingeckoId: "ondo-us-dollar-yield", decimals: 18 },
  },
  q: {
    [ADDRESSES.q.WQ]: { coingeckoId: "q-protocol", decimals: 18 },
  },
  taiko: {
    '0x7d02A3E0180451B17e5D7f29eF78d06F8117106C': { coingeckoId: "dai", decimals: 18 },
  },
  neox: {
    [ADDRESSES.null]: { coingeckoId: "gas", decimals: 18 },
    '0x008cd7f573998cb841a5d82a857ed1f0ce03a653': { coingeckoId: "gas", decimals: 18 },
    '0xde41591ed1f8ed1484ac2cd8ca0876428de60eff': { coingeckoId: "gas", decimals: 18 },
  },
  aura: {
    [ADDRESSES.null]: { coingeckoId: "aura-network", decimals: 18 },
    '0xDE47A655a5d9904BD3F7e1A536D8323fBD99993A': { coingeckoId: "aura-network", decimals: 18 },
    [ADDRESSES.functionx.WFX]: { coingeckoId: "tether", decimals: 6 },
  },
  gravity: {
    [ADDRESSES.null]: { coingeckoId: "g-token", decimals: 18 },
    '0xbb859e225ac8fb6be1c7e38d87b767e95fef0ebd': { coingeckoId: "g-token", decimals: 18 },
    '0xf6f832466Cd6C21967E0D954109403f36Bc8ceaA': { coingeckoId: "ethereum", decimals: 18 },
    [ADDRESSES.rari.USDC_e]: { coingeckoId: "usd-coin", decimals: 6 },
  },
  idex: {
    [ADDRESSES.rari.USDC_e]: { coingeckoId: "usd-coin", decimals: 6 },
  },
  xdai: {
    '0x6c76971f98945ae98dd7d4dfca8711ebea946ea6': { coingeckoId: "wrapped-steth", decimals: 18 },
    '0xaf204776c7245bf4147c2612bf6e5972ee483701': { coingeckoId: "savings-dai", decimals: 18 },
  },
  etn: {
    '0x138dafbda0ccb3d8e39c19edb0510fc31b7c1c77': { coingeckoId: "electroneum", decimals: 18 }
  }
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
