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

const ibcChains = ['ibc', 'terra', 'terra2', 'crescent', 'osmosis', 'kujira', 'stargaze', 'juno', 'injective', 'cosmos', 'comdex', 'stargaze', 'umee', 'orai', 'persistence', 'fxcore', 'neutron', 'quasar', 'chihuahua',]
const caseSensitiveChains = [...ibcChains, 'solana', 'tezos', 'ton', 'algorand', 'aptos', 'near', 'bitcoin', 'waves', 'tron', 'litecoin', 'polkadot', 'ripple', 'elrond', 'cardano', 'stacks', 'sui', 'ergo',]

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
  neon_evm: {
    '0xb14760c064a1b9eaf9ec5a8a421971e40a51b59c': { coingeckoId: 'neon', decimals:18},
  },
  rpg: {
    '0x8e8816a1747fddc5f8b45d2e140a425d3788f659': { coingeckoId: "tether", decimals: 18 },
  },
  tenet: {
    '0xd6cb8a253e12893b0cf39ca78f7d858652cca1fe': { coingeckoId: "tenet-1b000f7b-59cb-4e06-89ce-d62b32d362b9", decimals: 18 },
  },
  ultron: {
    '0xb1183357745d3fd7d291e42a2c4b478cdb5710c6': { coingeckoId: "ultron", decimals: 18 },
  },
  avax: {
    '0x8fdcf51d1aaeb9f031838ebeb15884a0d5efcda3': { coingeckoId: "wrapped-bitcoin", decimals: 18 },
    '0xaa44678304cc1a848bfc31dc013afcc6c9feae11': { coingeckoId: "benqi", decimals: 18 },
  },
  ozone: {
    // '0x83048f0bf34feed8ced419455a4320a735a92e9d': { coingeckoId: "ozonechain", decimals: 18 }, // was mapped to wrong chain
  },
  mantle: {
    '0x201eba5cc46d216ce6dc03f6a759e8e766e956ae': { coingeckoId: "tether", decimals: 6 },
    '0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8': { coingeckoId: "mantle", decimals: 18 },
    '0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111': { coingeckoId: "ethereum", decimals: 18 },
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
  if (ibcChains.includes(chain)) addresses.push(...coreAssets.ibc)
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
  ethereum: ['0x4e15361fd6b4bb609fa63c81a2be19d873717870'],
  fantom: [
    '0x95bf7e307bc1ab0ba38ae10fc27084bc36fcd605',
    '0x049d68029688eabf473097a2fc38ef61633a3c7a',
    '0x04068da6c83afcfa0e13ba15a6696662335d5b75',
    '0x049d68029688eabf473097a2fc38ef61633a3c7a',
    '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e',
    '0x82f0b8b456c1a451378467398982d4834b6829c1',
    '0x7f620d7d0b3479b1655cefb1b0bc67fb0ef4e443'
  ],
  harmony: ['0xb12c13e66ade1f72f71834f2fc5082db8c091358'],
  kcc: [
    '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d',
    '0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c',
    '0xc9baa8cfdde8e328787e29b4b078abf2dadc2055',
    '0x218c3c3d49d0e7b37aff0d8bb079de36ae61a4c0'
  ],
  moonriver: [
    '0xb44a9b6905af7c801311e8f4e76932ee959c663c',
    '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d',
    '0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c'
  ],
  arbitrum: ['0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a'],
  shiden: [
    '0xfa9343c3897324496a05fc75abed6bac29f8a40f',
    '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b',
    '0x735abe48e8782948a37c7765ecb76b98cde97b0f',
    '0x765277eebeca2e31912c9946eae1021199b39c61',
    '0x332730a4f6e03d9c55829435f10360e13cfa41ff',
    '0x65e66a61d0a8f1e686c2d6083ad611a10d84d97a'
  ],
  telos: [
    '0xfa9343c3897324496a05fc75abed6bac29f8a40f',
    '0xf390830df829cf22c53c8840554b98eafc5dcbc2',
    '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b',
    '0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73'
  ],
  syscoin: [
    '0x2bf9b864cdc97b08b6d79ad4663e71b8ab65c45c',
    '0x7c598c96d02398d89fbcb9d41eab3df0c16f227d',
    '0x922d641a426dcffaef11680e5358f34d97d112e1'
  ],
  boba: ['0x461d52769884ca6235b685ef2040f47d30c94eb5'],
  velas: [
    '0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c',
    '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d'
  ],
  dogechain: [
    '0xb44a9b6905af7c801311e8f4e76932ee959c663c',
    '0x332730a4f6e03d9c55829435f10360e13cfa41ff',
    '0xdc42728b0ea910349ed3c6e1c9dc06b5fb591f98'
  ],
  kava: [
    '0xfa9343c3897324496a05fc75abed6bac29f8a40f',
    '0xb44a9b6905af7c801311e8f4e76932ee959c663c',
    '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b',
    '0x765277eebeca2e31912c9946eae1021199b39c61',
    '0x7c598c96d02398d89fbcb9d41eab3df0c16f227d',
    '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d',
    '0x332730a4f6e03d9c55829435f10360e13cfa41ff'
  ],
  step: [
    '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d',
    '0xfa9343c3897324496a05fc75abed6bac29f8a40f',
    '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b',
    '0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73'
  ],
  godwoken_v1: [
    '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d',
    '0x765277eebeca2e31912c9946eae1021199b39c61',
    '0xfa9343c3897324496a05fc75abed6bac29f8a40f',
    '0xb44a9b6905af7c801311e8f4e76932ee959c663c'
  ],
  milkomeda_a1: ['0xfa9343c3897324496a05fc75abed6bac29f8a40f'],
  wemix: [
    '0x461d52769884ca6235b685ef2040f47d30c94eb5',
    '0x765277eebeca2e31912c9946eae1021199b39c61',
    '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d'
  ],
  eos_evm: [
    '0x922d641a426dcffaef11680e5358f34d97d112e1',
    '0x765277eebeca2e31912c9946eae1021199b39c61',
    '0xfa9343c3897324496a05fc75abed6bac29f8a40f',
    '0xefaeee334f0fd1712f9a8cc375f427d9cdd40d73'
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
