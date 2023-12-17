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

const distressedAssts = new Set(Object.values({
  CRK: '0x065de42e28e42d90c2052a1b49e7f83806af0e1f',
  aBNBc: ADDRESSES.bsc.ankrBNB,
  aBNBb: ADDRESSES.bsc.aBNBb,
  XRPC: '0xd4ca5c2aff1eefb0bea9e9eab16f88db2990c183',
  FLEET: '0xfd56a3dcfc0690881a466ae432d71bb2db588083',
  YAKU: 'NGK3iHqqQkyRZUj4uhJDQqEyKKcZ7mdawWpqwMffM3s',
  JEFE: '0x80fa6d5384bdde296a28a321f73ab70977575129',
  SNS: 'SNSNkV9zfG5ZKWQs6x4hxvBRV6s8SqMfSGCtECDvdMd',
  BASED: 'fantom:0x8d7d3409881b51466b483b11ea1b8a03cded89ae',
  LORT: 'bsc:0xd24616870ca41bc01074446988faeb0085a71190',
  BSHARE: '0x49C290Ff692149A4E16611c694fdED42C954ab7a',
  PEEP: 'n54ZwXEcLnc3o7zK48nhrLV4KTU5wWD4iq7Gvdt5tik',
  WIF: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
  GUAC: 'AZsHEMXd36Bj1EMNXhowJajpUXzrKcK57wW4ZGXVa7yR',
  OVOL: '4v3UTV9jibkhPfHi5amevropw6vFKVWo7BmxwQzwEwq6',
}).map(i => i.toLowerCase()))

const transformTokens = {
  // Sample Code
  // cronos: {
  //   "0x065de42e28e42d90c2052a1b49e7f83806af0e1f": "0x123", // CRK token is mispriced
  //   [ADDRESSES.cronos.TUSD]: ADDRESSES.ethereum.TUSD,
  // },

  lightlink_phoenix: {
    [ADDRESSES.lightlink_phoenix.USDC]: ADDRESSES.ethereum.USDC,
    [ADDRESSES.lightlink_phoenix.USDT]: ADDRESSES.ethereum.USDT,
    [ADDRESSES.lightlink_phoenix.WBTC]: ADDRESSES.ethereum.WBTC,
    [ADDRESSES.lightlink_phoenix.WETH]: ADDRESSES.ethereum.WETH,
  }
}
const ibcMappings = {
  // Sample Code
  // 'ibc/CA1261224952DF089EFD363D8DBB30A8AB6D8CD181E60EE9E68E432F8DE14FE3': { coingeckoId: 'inter-stable-token', decimals: 6, },
  // 'ibc/5A76568E079A31FA12165E4559BA9F1E9D4C97F9C2060B538C84DCD503815E30': { coingeckoId: 'injective-protocol', decimals: 18, },
}

const fixBalancesTokens = {
  ethf: {
    [ADDRESSES.ethf.WETH]: { coingeckoId: 'ethereumfair', decimals: 18 },
    [ADDRESSES.null]: { coingeckoId: 'ethereumfair', decimals: 18 },
  },
  chz: {
    [ADDRESSES.null]: { coingeckoId: 'chiliz', decimals: 18 },
  },
  // Sample Code
  ozone: {
    // '0x83048f0bf34feed8ced419455a4320a735a92e9d': { coingeckoId: "ozonechain", decimals: 18 }, // was mapped to wrong chain
  },
  radixdlt: {
    [ADDRESSES.radixdlt.XRD]: { coingeckoId: 'radix', decimals: 0 },
    [ADDRESSES.radixdlt.WETH]: { coingeckoId: 'ethereum', decimals: 0 },
  },
  meer: {
    [ADDRESSES.null]: { coingeckoId: 'qitmeer-network', decimals: 18 },
    [ADDRESSES.meer.MEER_1]: { coingeckoId: 'qitmeer-network', decimals: 18 },
    [ADDRESSES.meer.MEER_2]: { coingeckoId: 'qitmeer-network', decimals: 18 },
  },
  edg: {
    [ADDRESSES.null]: { coingeckoId: 'edgeware', decimals: 18 },
    [ADDRESSES.edg.WEDG]: { coingeckoId: 'edgeware', decimals: 18 },
  },
  elsm: {
    [ADDRESSES.null]: { coingeckoId: 'lava', decimals: 18 },
    [ADDRESSES.elsm.WLAVA]: { coingeckoId: 'lava', decimals: 18 },
    [ADDRESSES.elsm.PYR]: { coingeckoId: 'vulcan-forged', decimals: 18 },
  },
  arbitrum: {
    [ADDRESSES.arbitrum.CHG]: { coingeckoId: 'changer', decimals: 18 },
  },
  neon_evm: {
    [ADDRESSES.null]: { coingeckoId: 'neon', decimals: 18 },
  },
  xdai: {
    [ADDRESSES.xdai.XHOPR]: { coingeckoId: 'xdai:0xD057604A14982FE8D88c5fC25Aac3267eA142a08', decimals: 0 },
  },
  bfc: {
    [ADDRESSES.bfc.WBFC]: { coingeckoId: 'bifrost', decimals: 18 },
    [ADDRESSES.bfc.BIFI]: { coingeckoId: 'bifi', decimals: 18 },
    [ADDRESSES.bfc.WITCH]: { coingeckoId: 'witch-token', decimals: 18 },
    [ADDRESSES.bfc.SAT]: { coingeckoId: 'super-athletes-token', decimals: 18 }
  },
  eon: {
    [ADDRESSES.eon.ZEN]: { coingeckoId: 'zencash', decimals: 18 },
    '0x38c2a6953f86a7453622b1e7103b738239728754': { coingeckoId: 'dai', decimals: 18 },
    [ADDRESSES.eon.WBTC]: { coingeckoId: 'wrapped-bitcoin', decimals: 8 },
  },
  nos: {
    [ADDRESSES.nos.ETH]: { coingeckoId: 'ethereum', decimals: 18 },
    [ADDRESSES.nos.USDT]: { coingeckoId: 'tether', decimals: 18 },
  },
  mode: {
    [ADDRESSES.mode.WETH]: { coingeckoId: 'ethereum', decimals: 18 },
  },
  zilliqa: {
    [ADDRESSES.zilliqa.WZIL]: { coingeckoId: 'zilliqa', decimals: 18 },
    [ADDRESSES.zilliqa.USDT]: { coingeckoId: 'tether', decimals: 6 },
  },
  linea: {
    [ADDRESSES.linea.WETH_1]: { coingeckoId: 'ethereum', decimals: 18 },
  },
  fsc: {
    [ADDRESSES.null]: { coingeckoId: 'fonsmartchain', decimals: 18 },
    [ADDRESSES.fsc.WFSC]: { coingeckoId: 'fonsmartchain', decimals: 18 },
  },
  new: {
    '0xf4905b9bc02ce21c98eac1803693a9357d5253bf': { coingeckoId: 'newton-project', decimals: 18 },
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
