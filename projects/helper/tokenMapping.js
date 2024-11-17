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
const caseSensitiveChains = [...ibcChains, 'solana', 'tezos', 'ton', 'algorand', 'aptos', 'near', 'bitcoin', 'waves', 'tron', 'litecoin', 'polkadot', 'ripple', 'elrond', 'cardano', 'stacks', 'sui', 'ergo', 'mvc', 'renec', 'doge', 'stellar', 'massa',
  'eclipse',
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
  // Sample Code
  ozone: {
    // '0x83048f0bf34feed8ced419455a4320a735a92e9d': { coingeckoId: "ozonechain", decimals: 18 }, // was mapped to wrong chain
  },
  stellar: {
    "CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV": { coingeckoId: "euro-coin", decimals: 7 },
    "CAUIKL3IYGMERDRUN6YSCLWVAKIFG5Q4YJHUKM4S4NJZQIA3BAS6OJPK": { coingeckoId: "aquarius", decimals: 7 },

  },
  shape: {
    [ADDRESSES.optimism.WETH_1]: { coingeckoId: 'ethereum', decimals: 18 },
    '0x48A9B22b80F566E88f0f1DcC90Ea15A8A3bAE8a4': { coingeckoId: 'ethereum', decimals: 18 },
  },
  hela: {
    '0xf5b85320a772b436cb8105441a3db9ba29437b4a': { coingeckoId: "usd-coin", decimals: 6 },
    '0xd3442073fa7ccf8a7c39d95dc125cd59497aa078': { coingeckoId: "tether", decimals: 6 },
    '0x3a035615e101373fa9ba21c5bea7fe4026fc40b4': { coingeckoId: "hela-usd", decimals: 18 },
  },
  heco: {
    [ADDRESSES.heco.WHT]: { coingeckoId: 'huobi-token', decimals: 18 },
  },
  base: {
    [ADDRESSES.base.rETH]: { coingeckoId: 'rocket-pool-eth', decimals: 18 },
    '0x0a27e060c0406f8ab7b64e3bee036a37e5a62853': { coingeckoId: 'zai-stablecoin', decimals: 18 },
    '0xc26c9099bd3789107888c35bb41178079b282561': { coingeckoId: 'solv-protocol-solvbtc-bbn', decimals: 18 },
  },
  op_bnb: {
    [ADDRESSES.defiverse.USDC]: { coingeckoId: 'binance-bitcoin', decimals: 18 },
  },
  lac: {
    [ADDRESSES.null]: { coingeckoId: "la-coin", decimals: 18 },
    [ADDRESSES.lac.LAC]: { coingeckoId: "la-coin", decimals: 18 },
    '0x7dc8b9e3b083c26c68f0b124ca923aaec7fbee39': { coingeckoId: 'tether', decimals: 6 },
    '0x51115241c7b8361eee88d8610f71d0a92cee5323': { coingeckoId: 'usd-coin', decimals: 6 },
  },
  lisk: {
    [ADDRESSES.bob.USDT]: { coingeckoId: 'tether', decimals: 6 },
    [ADDRESSES.optimism.WETH_1]: { coingeckoId: 'ethereum', decimals: 18 },
    '0xac485391eb2d7d88253a7f1ef18c37f4242d1a24': { coingeckoId: 'lisk', decimals: 18 },
  },
  bob: {
    [ADDRESSES.bob.SolvBTC]: { coingeckoId: "solv-btc", decimals: 18 },
    [ADDRESSES.bob.SolvBTC_BBN]: { coingeckoId: "solv-protocol-solvbtc-bbn", decimals: 18 },
    [ADDRESSES.bob.uniBTC]: { coingeckoId: "universal-btc", decimals: 8 }
  },
  flow: {
    '0xd3bF53DAC106A0290B0483EcBC89d40FcC961f3e': { coingeckoId: 'flow', decimals: 18 },
    '0x1b97100eA1D7126C4d60027e231EA4CB25314bdb': { coingeckoId: 'ankr-staked-flow', decimals: 18 },
    [ADDRESSES.milkomeda.BNB]: { coingeckoId: 'usd-coin', decimals: 6 },
  },
  core: {
    '0x782e2b85fda9a8224c17b191fc5de1e085a962b2': { coingeckoId: "wrapped-bitcoin-universal", decimals: 18 },
  },
  matchain: {
    [ADDRESSES.null]: { coingeckoId: 'binancecoin', decimals: 18 },
    [ADDRESSES.optimism.WETH_1]: { coingeckoId: 'binancecoin', decimals: 18 },
  },
  rollux: {
    '0x570baA32dB74279a50491E88D712C957F4C9E409': { coingeckoId: 'uno-re', decimals: 18 },
    [ADDRESSES.rollux.WETH]: { coingeckoId: 'weth', decimals: 18 },
    [ADDRESSES.rollux.WBTC]: { coingeckoId: 'wrapped-bitcoin', decimals: 8 },
  },
  taiko: {
    [ADDRESSES.taiko.LRC]: { coingeckoId: "loopring", decimals: 18 },
  },
  bitkub: {
    [ADDRESSES.bitkub.KKUB]: { coingeckoId: 'bitkub-coin', decimals: 18 },
  },
  fuel: {
    // https://docs.fuel.network/docs/verified-addresses/assets/
    '0x286c479da40dc953bddc3bb4c453b608bba2e0ac483b077bd475174115395e6b': { coingeckoId: 'usd-coin', decimals: 6 },
    '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07': { coingeckoId: 'ethereum', decimals: 9 },
    '0xa0265fb5c32f6e8db3197af3c7eb05c48ae373605b8165b6f4a51c5b0ba4812e': { coingeckoId: 'tether', decimals: 6 },
    '0x9e46f919fbf978f3cad7cd34cca982d5613af63ff8aab6c379e4faa179552958': { coingeckoId: 'savings-dai', decimals: 9 },
    '0xaf3111a248ff7a3238cdeea845bb2d43cf3835f1f6b8c9d28360728b55b9ce5b': { coingeckoId: 'manta-mbtc', decimals: 9 },
    '0xafd219f513317b1750783c6581f55530d6cf189a5863fd18bd1b3ffcec1714b4': { coingeckoId: 'manta-meth', decimals: 9 },
    '0x91b3559edb2619cde8ffb2aa7b3c3be97efd794ea46700db7092abeee62281b0': { coingeckoId: 'renzo-restaked-eth', decimals: 9 },
  },
  wc: {
    '0x79A02482A880bCE3F13e09Da970dC34db4CD24d1': { coingeckoId: 'usd-coin', decimals: 6 },
    '0x2cFc85d8E48F8EAB294be644d9E25C3030863003': { coingeckoId: 'worldcoin-wld', decimals: 18 },
    [ADDRESSES.bob.WBTC]: { coingeckoId: 'bitcoin', decimals: 8 },
    [ADDRESSES.optimism.WETH_1]: { coingeckoId: 'weth', decimals: 18 }
  },
  apechain: {
    '0x48b62137EdfA95a428D35C09E44256a739F6B557': { coingeckoId: 'apecoin', decimals: 18 },
    '0xA2235d059F80e176D931Ef76b6C51953Eb3fBEf4': { coingeckoId: 'savings-dai', decimals: 18 },
    '0xcF800F4948D16F23333508191B1B1591daF70438': { coingeckoId: 'staked-ether', decimals: 18 },
  },
  zircuit: {
    [ADDRESSES.optimism.WETH_1]: { coingeckoId: 'ethereum', decimals: 18 },
  },
  bsquared: {
    '0xf6718b2701D4a6498eF77D7c152b2137Ab28b8A3': { coingeckoId: 'lorenzo-stbtc', decimals: 18 }
  },
  hedera: {
    '0x00000000000000000000000000000000001647e8': { coingeckoId: 'xsauce', decimals: 6 },
    '0x000000000000000000000000000000000006f89a': { coingeckoId: 'usd-coin', decimals: 6 },
    '0x000000000000000000000000000000000022d6de': { coingeckoId: 'karate-combat', decimals: 8 },
    '0x00000000000000000000000000000000000cba44': { coingeckoId: 'hbarx', decimals: 8 },
    '0x00000000000000000000000000000000000b2ad5': { coingeckoId: 'saucerswap', decimals: 6 },
    '0x0000000000000000000000000000000000000000': { coingeckoId: 'hedera-hashgraph', decimals: 18 },
    '0x0000000000000000000000000000000000163b5a': { coingeckoId: 'hedera-hashgraph', decimals: 8 },
    '0x000000000000000000000000000000000038b3db': { coingeckoId: 'dovu-2', decimals: 8 },
    '0x00000000000000000000000000000000005c9f70': { coingeckoId: 'hedera-liquity', decimals: 8 },
    '0x00000000000000000000000000000000000ec585': { coingeckoId: 'headstarter', decimals: 8 },
    '0x0000000000000000000000000000000000492a28': { coingeckoId: 'hashpack', decimals: 6 },
    '0x000000000000000000000000000000000030fb8b': { coingeckoId: 'steam', decimals: 2 },
  },
  morph: {
    '0x5300000000000000000000000000000000000011': { coingeckoId: 'ethereum', decimals: 18 },
    '0xc7d67a9cbb121b3b0b9c053dd9f469523243379a': { coingeckoId: 'tether', decimals: 6 },
    '0x803dce4d3f4ae2e17af6c51343040dee320c149d': { coingeckoId: 'wrapped-bitcoin', decimals: 8 },
  },
  btr: {
    '0xC39E757dCb2b17B79A411eA1C2810735dc9032F8': { coingeckoId: 'solv-protocol-solvbtc', decimals: 18 },
  },
  iotex: {
    '0x236f8c0a61da474db21b693fb2ea7aab0c803894': { coingeckoId: 'iotex', decimals: 18 },
  },
  mantle: {
    '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e': { coingeckoId: 'universal-btc', decimals: 18 },
    '0xC75D7767F2EdFbc6a5b18Fc1fA5d51ffB57c2B37': { coingeckoId: 'pumpbtc', decimals: 18 },
    '0xCAbAE6f6Ea1ecaB08Ad02fE02ce9A44F09aebfA2': { coingeckoId: 'wrapped-bitcoin', decimals: 8 },
  },
  bsc: {
    '0x6B2a01A5f79dEb4c2f3c0eDa7b01DF456FbD726a': { coingeckoId: 'universal-btc', decimals: 8 },
  },
  arbitrum: {
    '0x6B2a01A5f79dEb4c2f3c0eDa7b01DF456FbD726a': { coingeckoId: 'universal-btc', decimals: 8 },
  },
  eclipse: {
    'So11111111111111111111111111111111111111112': { coingeckoId: 'ethereum', decimals: 9 },
    '9pan9bMn5HatX4EJdBwg9VgCa7Uz5HL8N1m5D3NdXejP': { coingeckoId: 'ethereum', decimals: 9 },
    'BeRUj3h7BqkbdfFU7FBNYbodgf8GCHodzKvF9aVjNNfL': { coingeckoId: 'solana', decimals: 9 },
    'AKEWE7Bgh87GPp171b4cJPSSZfmZwQ3KaqYqXoKLNAEE': { coingeckoId: 'usd-coin', decimals: 6 },
    '841P4tebEgNux2jaWSjCoi9LhrVr9eHGjLc758Va3RPH': { coingeckoId: 'dogwifcoin', decimals: 6 },
  },
  unit0: {
    '0xcf43f7703d9b4e8835f977ef364b4014fa7e856e': { coingeckoId: 'unit0', decimals: 18 },
  },
  rbn: {
    '0x6ed1f491e2d31536d6561f6bdb2adc8f092a6076': { coingeckoId: 'redbelly-network-token', decimals: 18 },
  },
  shido: {
    '0x8cbaffd9b658997e7bf87e98febf6ea6917166f7': { coingeckoId: 'shido', decimals: 18 },
    '0x80b5a32e4f032b2a058b4f29ec95eefeeb87adcd': { coingeckoId: 'usd-coin', decimals: 6 },
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
