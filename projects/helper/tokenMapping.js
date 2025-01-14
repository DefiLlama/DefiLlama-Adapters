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


const ibcChains = ['ibc', 'terra', 'terra2', 'crescent', 'osmosis', 'kujira', 'stargaze', 'juno', 'injective', 'cosmos', 'comdex', 'umee', 'orai', 'persistence', 'fxcore', 'neutron', 'quasar', 'chihuahua', 'sei', 'archway', 'migaloo', 'secret', 'aura', 'xpla', 'bostrom', 'joltify', 'nibiru',
  'kopi', 'elys', "pryzm", "mantra", 'agoric', 'band',
  'celestia', 'dydx', 'carbon'

]
const caseSensitiveChains = [...ibcChains, 'solana', 'tezos', 'ton', 'algorand', 'aptos', 'near', 'bitcoin', 'waves', 'tron', 'litecoin', 'polkadot', 'ripple', 'elrond', 'cardano', 'stacks', 'sui', 'ergo', 'mvc', 'renec', 'doge', 'stellar', 'massa',
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
  'ibc:DE63D8AC34B752FB7D4CAA7594145EDE1C9FC256AC6D4043D0F12310EB8FC255': { coingeckoId: 'injective-protocol', decimals: 18, },
  'ibc:25418646C017D377ADF3202FF1E43590D0DAE3346E594E8D78176A139A928F88': { coingeckoId: 'cosmos', decimals: 6, },
  'ibc:D8A36AE90F20FE4843A8D249B1BCF0CCDDE35C4B605C8DED57BED20C639162D0': { coingeckoId: 'tether', decimals: 6, },
  'ibc:45D6B52CAD911A15BD9C2F5FFDA80E26AFCB05C7CD520070790ABC86D2B24229': { coingeckoId: 'celestia', decimals: 6, },
}

const fixBalancesTokens = {

  // Sample Code
  ozone: {
    // '0x83048f0bf34feed8ced419455a4320a735a92e9d': { coingeckoId: "ozonechain", decimals: 18 }, // was mapped to wrong chain
  },
  water: {   
    '0xC807C5FfFf748eF435Ddb99b181846Edd1e70041': { coingeckoId: "water-3", decimals: 18 },
  },
  bittorrent: {   
    [ADDRESSES.null]: { coingeckoId: "bittorrent", decimals: 18 },
  },
  dymension: {   
    [ADDRESSES.null]: { coingeckoId: "dymension", decimals: 18 },
  },
  energyweb: {   
    [ADDRESSES.null]: { coingeckoId: "energy-web-token", decimals: 18 },
  },
  etn: {   
    [ADDRESSES.null]: { coingeckoId: "electroneum", decimals: 18 },
  },
  kopi: {
    'uasusdc': { coingeckoId: 'usd-coin', decimals: 6 },
    'ucusdc': { coingeckoId: 'usd-coin', decimals: 6 },
    'uasusdtinj': { coingeckoId: 'tether', decimals: 6 },
    'ucusdtinj': { coingeckoId: 'tether', decimals: 6 },
  },
  swellchain: {
    [ADDRESSES.null]: { coingeckoId: 'ethereum', decimals: 18 },
    [ADDRESSES.base.WETH]: { coingeckoId: 'ethereum', decimals: 18 },
    "0xb5668713E9BA8bC96f97D691663E70b54CE90b0A": { "coingeckoId": "wrapped-bitcoin-universal", "decimals": 18 },
    "0xf6718b2701D4a6498eF77D7c152b2137Ab28b8A3": { "coingeckoId": "lorenzo-stbtc", "decimals": 18 },
    "0x2826D136F5630adA89C1678b64A61620Aab77Aea": { "coingeckoId": "swell-network", "decimals": 18 },
    "0x1cf7b5f266A0F39d6f9408B90340E3E71dF8BF7B": { "coingeckoId": "swell-restaked-btc", "decimals": 8 },
    "0xb89c6ED617f5F46175E41551350725A09110bbCE": { "coingeckoId": "tether", "decimals": 6 },
    "0x99a38322cAF878Ef55AE4d0Eda535535eF8C7960": { "coingeckoId": "usd-coin", "decimals": 6 },
    "0xA6cB988942610f6731e664379D15fFcfBf282b44": { "coingeckoId": "wrapped-eeth", "decimals": 18 },
    "0x18d33689AE5d02649a859A1CF16c9f0563975258": { "coingeckoId": "restaked-swell-eth", "decimals": 18 },
    "0x09341022ea237a4DB1644DE7CCf8FA0e489D85B7": { "coingeckoId": "sweth", "decimals": 18 },
    "0x9cb41CD74D01ae4b4f640EC40f7A60cA1bCF83E7": { "coingeckoId": "renzo-restaked-lst", "decimals": 18 },
    "0x2416092f143378750bb29b79eD961ab195CcEea5": { "coingeckoId": "renzo-restaked-eth", "decimals": 18 },
    "0xc3eACf0612346366Db554C991D7858716db09f58": { "coingeckoId": "kelp-dao-restaked-eth", "decimals": 18 },
    "0x7c98E0779EB5924b3ba8cE3B17648539ed5b0Ecc": { "coingeckoId": "wrapped-steth", "decimals": 18 },
    "0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34": { "coingeckoId": "ethena-usde", "decimals": 18 },
    "0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2": { "coingeckoId": "ethena-staked-usde", "decimals": 18 },
    "0x58538e6A46E07434d7E7375Bc268D3cb839C0133": { "coingeckoId": "ethena", "decimals": 18 },
  },
  elys: {
    'uelys': { coingeckoId: 'elys-network', decimals: 6 },
  },
  wc: {
    [ADDRESSES.null]: { coingeckoId: 'ethereum', decimals: 18 },
  },
  odyssey: {
    [ADDRESSES.null]: { coingeckoId: 'dione', decimals: 18 },
    '0xf21cbaf7bd040d686bd390957770d2ea652e4013': { coingeckoId: 'dione', decimals: 18 },
  },
  crossfi: {
    [ADDRESSES.null]: { coingeckoId: 'crossfi-2', decimals: 18 },
    [ADDRESSES.crossfi.WXFI]: { coingeckoId: 'crossfi-2', decimals: 18 },
  },
  mantra: {
    uom: { coingeckoId: 'mantra-dao', decimals: 6 },
  },
  verus: {
    'i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV': { coingeckoId: 'verus-coin', decimals: 0 },
    'iGBs4DWztRNvNEJBt4mqHszLxfKTNHTkhM': { coingeckoId: 'dai', decimals: 0 },
    'iCkKJuJScy4Z6NSDK7Mt42ZAB2NEnAE1o4': { coingeckoId: 'maker', decimals: 0 },
    'i9nwxtKuVYX4MSbeULLiK2ttVi6rUEhh4X': { coingeckoId: 'ethereum', decimals: 0 },
    'iS8TfRPfVpKo5FVfSUzfHBQxo9KuzpnqLU': { coingeckoId: 'tbtc', decimals: 0 },
    'i9oCSqKALwJtcv49xUKS2U2i79h1kX6NEY': { coingeckoId: 'tether', decimals: 0 },
  },
  unit0: {
    '0xEb19000D90f17FFbd3AD9CDB8915D928F4980fD1': { coingeckoId: 'usd-coin', decimals: 6 },
    '0xb303d80db8415FD1d3C9FED68A52EEAc9a052671': { coingeckoId: 'tether', decimals: 6 },
    '0x1B100DE3F13E3f8Bb2f66FE58c1949c32E71248B': { coingeckoId: 'ethereum', decimals: 18 },
    '0x9CE808657ba90C65a2700b1cA5D943eC72834B52': { coingeckoId: 'wrapped-bitcoin', decimals: 8 },
  },
  starknet: {
    '0x20ff2f6021ada9edbceaf31b96f9f67b746662a6e6b2bc9d30c0d3e290a71f6': { coingeckoId: 'spiko-us-t-bills-money-market-fund', decimals: 5 },
    '0x4f5e0de717daa6aa8de63b1bf2e8d7823ec5b21a88461b1519d9dbc956fb7f2': { coingeckoId: 'eutbl', decimals: 5 },
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
