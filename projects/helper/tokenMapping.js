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
const caseSensitiveChains = [...ibcChains, 'solana', 'tezos', 'ton', 'algorand', 'aptos', 'near', 'bitcoin', 'waves', 'tron', 'litecoin', 'polkadot', 'ripple', 'elrond', 'cardano', 'stacks', 'sui', 'ergo', 'mvc', 'renec', 'doge']

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
  defichain_evm: {
    '0x49febbf9626b2d39aba11c01d83ef59b3d56d2a4': { coingeckoId: "defichain", decimals: 18 },
    '0xff0000000000000000000000000000000000000d': { coingeckoId: "usd-coin", decimals: 18 },
    '0xff00000000000000000000000000000000000003': { coingeckoId: "tether", decimals: 18 },
    '0xff00000000000000000000000000000000000001': { coingeckoId: "ethereum", decimals: 18 },
    '0xff0000000000000000000000000000000000000f': { coingeckoId: "decentralized-usd", decimals: 18 },
    '0x66F3Cf265D2D146A0348F6fC67E3Da0835e0968E': { coingeckoId: "javsphere", decimals: 18 },
  },
  ace: {
    [nullAddress]: { coingeckoId: "endurance", decimals: 18 },
    '0x85119527cf38f6ccf7b1b8f8fad05145358aaa81': { coingeckoId: "endurance", decimals: 18 },
  },
  // Sample Code
  ozone: {
    // '0x83048f0bf34feed8ced419455a4320a735a92e9d': { coingeckoId: "ozonechain", decimals: 18 }, // was mapped to wrong chain
  },
  scroll: {
    [ADDRESSES.mode.STONE]: { coingeckoId: "ethereum:0x7122985656e38bdc0302db86685bb972b145bd3c", decimals: 0 },
  },
  tezos: {
    "KT1PnUZCp3u2KzWr93pn4DD7HAJnm3rWVrgn": { coingeckoId: "tezos", decimals: 6 },
    "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-17": { coingeckoId: "usd-coin", decimals: 6 },
    "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-18": { coingeckoId: "tether", decimals: 6 },
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
  },
  blast: {
    '0xf7bc58b8d8f97adc129cfc4c9f45ce3c0e1d2692': { coingeckoId: "wrapped-bitcoin", decimals: 8 },
    '0x9e0d7d79735e1c63333128149c7b616a0dc0bbdb': { coingeckoId: "weth", decimals: 18 }, //pirex eth
    '0xde55b113a27cc0c5893caa6ee1c020b6b46650c0': { coingeckoId: "deus-finance-2", decimals: 18 }, // deus
    '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34': { coingeckoId: "ethena-usde", decimals: 18 },
  },
  solana: {
    'AZsHEMXd36Bj1EMNXhowJajpUXzrKcK57wW4ZGXVa7yR': { coingeckoId: "guacamole", decimals: 5 },
  },
  chz: {
    '0x677F7e16C7Dd57be1D4C8aD1244883214953DC47': { coingeckoId: "wrapped-chiliz", decimals: 18 }
  },
  zklink: {
    '0xbEAf16cFD8eFe0FC97C2a07E349B9411F5dC272C': { coingeckoId: "solv-btc", decimals: 18 },
    '0xFb8dBdc644eb54dAe0D7A9757f1e6444a07F8067': { coingeckoId: "bitcoin-trc20", decimals: 18 },
    '0x85D431A3a56FDf2d2970635fF627f386b4ae49CC': { coingeckoId: "merlin-s-seal-btc", decimals: 18 },
  },
  btr: {
    '0x0000000000000000000000000000000000000000': { coingeckoId: 'bitcoin', decimals: 18 },
    '0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f': { coingeckoId: 'wrapped-bitcoin', decimals: 18 },
    '0xfe9f969faf8ad72a83b761138bf25de87eff9dd2': { coingeckoId: 'tether', decimals: 6 },
    '0x9827431e8b77e87c9894bd50b055d6be56be0030': { coingeckoId: 'usd-coin', decimals: 6 },

    // fix these by pricing the tokens in coins repo
    '0xd53E6f1d37f430d84eFad8060F9Fec558B36F6fa': { coingeckoId: 'wrapped-bitcoin', decimals: 18 },
    '0xf6718b2701d4a6498ef77d7c152b2137ab28b8a3': { coingeckoId: 'wrapped-bitcoin', decimals: 18 },
   //REMOVE '0x9a6ae5622990ba5ec1691648c3a2872469d161f9': { coingeckoId: 'wrapped-bitcoin', decimals: 18 },
   //REMOVE '0xA984b70f7B41EE736B487D5F3D9C1e1026476Ea3': { coingeckoId: 'wrapped-bitcoin', decimals: 18 },
  },
  cyeth: {
    '0x4200000000000000000000000000000000000006': { coingeckoId: 'ethereum', decimals: 18 },
  },
  bouncebit: {
    '0x0000000000000000000000000000000000000000': { coingeckoId: 'bouncebit', decimals: 18 },
    '0xf4c20e5004c6fdcdda920bdd491ba8c98a9c5863': { coingeckoId: 'bouncebit', decimals: 18 },
    '0x77776b40c3d75cb07ce54dea4b2fd1d07f865222': { coingeckoId: 'tether', decimals: 18 },
    '0xF5e11df1ebCf78b6b6D26E04FF19cD786a1e81dC': { coingeckoId: 'bitcoin', decimals: 18 },
  },
  linea: {
    '0x63ba74893621d3d12f13cec1e86517ec3d329837': { coingeckoId: 'liquity-usd', decimals: 18 },
  },
  bevm: {
    '0x2967e7bb9daa5711ac332caf874bd47ef99b3820': { coingeckoId: 'wrapped-stbtc', decimals: 18 },
  },
  real: {
    '0x0000000000000000000000000000000000000000': { coingeckoId: 'bitcoin', decimals: 18 },
    '0x90c6e93849e06ec7478ba24522329d14a5954df4': { coingeckoId: 'ethereum', decimals: 18 },
    '0x75d0cbf342060b14c2fc756fd6e717dfeb5b1b70': { coingeckoId: 'dai', decimals: 18 },
    '0x83fedbc0b85c6e29b589aa6bdefb1cc581935ecd': { coingeckoId: 'mountain-protocol-usdm', decimals: 18 },
  },
  taiko: {
    '0xA51894664A773981C6C112C43ce576f315d5b1B6': { coingeckoId: 'ethereum', decimals: 18 },
    '0x07d83526730c7438048d55a4fc0b850e2aab6f0b': { coingeckoId: 'usd-coin', decimals: 6 },
  },
  sei: {
    '0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1': { coingeckoId: 'usd-coin', decimals: 6 },
  },
  core: {
    '0x5832f53d147b3d6cd4578b9cbd62425c7ea9d0bd': { coingeckoId: 'wrapped-bitcoin', decimals: 8 },
    '0x5B1Fb849f1F76217246B8AAAC053b5C7b15b7dc3': { coingeckoId: 'solv-btc', decimals: 18 },
  },
  lukso: {
    '0x2db41674f2b882889e5e1bd09a3f3613952bc472': { coingeckoId: 'wrapped-lyx-universalswaps-2', decimals: 18 },
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
