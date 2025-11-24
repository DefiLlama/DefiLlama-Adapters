let coreAssets = require('./coreAssets.json')
const { svmChains } = require('./svmChainConfig')
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
  'celestia', 'dydx', 'carbon', 'milkyway', 'regen', 'sommelier', 'stride', 'prom', 'babylon', 'xion', 'zigchain'
]
const caseSensitiveChains = [...ibcChains, ...svmChains, 'tezos', 'ton', 'algorand', 'aptos', 'near', 'bitcoin', 'waves', 'tron', 'litecoin', 'polkadot', 'ripple', 'elrond', 'cardano', 'stacks', 'sui', 'ergo', 'mvc', 'renec', 'doge', 'stellar', 'massa',
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
  camp: {
    [ADDRESSES.camp.WCAMP]: { coingeckoId: "camp-network", decimals: 18 }, // Wrapped CAMP (ERC-20 wrapper of native CAMP)
    [ADDRESSES.camp.ETH]: { coingeckoId: "ethereum", decimals: 18 }, // Wrapped ETH
    [ADDRESSES.camp.USDC]: { coingeckoId: "usd-coin", decimals: 18 }, // Wrapped USDC
  },
  mezo: {
    [ADDRESSES.mezo.MUSD]: { coingeckoId: "mezo-usd", decimals: 18 },
    [ADDRESSES.mezo.BTC]: { coingeckoId: "bitcoin", decimals: 18 },
    [ADDRESSES.mezo.mUSDC]: { coingeckoId: "usd-coin", decimals: 18 },
    [ADDRESSES.mezo.mUSDT]: { coingeckoId: "tether", decimals: 18 },
    [ADDRESSES.mezo.mDAI]: { coingeckoId: "dai", decimals: 18 },
    [ADDRESSES.mezo.mSolvBTC]: { coingeckoId: "solv-btc", decimals: 18 },
    [ADDRESSES.mezo.mT]: { coingeckoId: "threshold-network-token", decimals: 18 },
    [ADDRESSES.mezo.mUSDe]: { coingeckoId: "ethena-usde", decimals: 18 },
    [ADDRESSES.mezo.mcbBTC]: { coingeckoId: "coinbase-wrapped-btc", decimals: 18 },
  },
  plasma: {
    [nullAddress]: { coingeckoId: "plasma", decimals: 18 }, // Native XPL
    '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': { coingeckoId: "plasma", decimals: 18 }, // Native XPL
    '0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb': { coingeckoId: "usdt0", decimals: 6 }, // USDT0
    '0x9895D81bB462A195b4922ED7De0e3ACD007c32CB': { coingeckoId: "ethereum", decimals: 18 }, // Wrapped ETH
  },
  goat: {
    '0x3a1293Bdb83bBbDd5Ebf4fAc96605aD2021BbC0f': { coingeckoId: "ethereum", decimals: 18 }, // Wrapped ETH
  },
  botanix: {
    '0x3292c42e8E9Ab3C6a12CFdA556BbCB6f113B1E28': { coingeckoId: "ethereum", decimals: 18 }, // Wrapped ETH
  },
  provenance: {
    nhash: { coingeckoId: 'hash-2', decimals: 9 },
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
  neo: {
    '0x68b938cc42b6a2d54fb9040f5facf4290ebb8c5f': { coingeckoId: 'tether', decimals: 6 },
    '0xd3a41b53888a733b549f5d4146e7a98d3285fa21': { coingeckoId: 'ethereum', decimals: 18 },
    '0xd2a4cff31913016155e38e474a2c06d08be276cf': { coingeckoId: 'gas', decimals: 8 },
    '0x4548a3bcb3c2b5ce42bf0559b1cf2f1ec97a51d0': { coingeckoId: 'wrapped-bitcoin', decimals: 8 },
  },
  besc: {
    '0x33e22f85cc1877697773ca5c85988663388883a0': { coingeckoId: "wrapped-besc-2", decimals: 18 },
    '0xb54ad626e127f0f228dbeab6f2a61e8e6e029a4b': { coingeckoId: "usd-coin", decimals: 18 },
  },
  chromia: {
    '9bacd576f40b6674aa76b8bfa1330077a3b94f581bfdb2ef806122c384dcdf25': { coingeckoId: 'usd-coin', decimals: 18 },
  },
  somnia: {
    '0x936ab8c674bcb567cd5deb85d8a216494704e9d8': { coingeckoId: 'ethereum', decimals: 18 }
  },
  ink: {
    '0xfc421ad3c883bf9e7c4f42de845c4e4405799e73': { coingeckoId: 'gho', decimals: 18 }
  },
  kasplex: {
    '0x2c2Ae87Ba178F48637acAe54B87c3924F544a83e': { coingeckoId: 'kaspa', decimals: 18 },
  },
  '0g': {
    '0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c': { coingeckoId: 'zero-gravity', decimals: 18 }, // W0G (Wrapped 0G)
    '0x7bbc63d01ca42491c3e084c941c3e86e55951404': { coingeckoId: 'zero-gravity', decimals: 18 }, // st0G (Liquid Staking 0G from Gimo)
    '0x9cc1d782e6dfe5936204c3295cb430e641dcf300': { coingeckoId: 'ethereum', decimals: 18 }, // WETH (Wrapped ETH)
    '0x1f3aa82227281ca364bfb3d253b0f1af1da6473e': { coingeckoId: 'usd-coin', decimals: 6 }, // USDCe (Bridged USDC)
    '0x1217bfe6c773eec6cc4a38b5dc45b92292b6e189': { coingeckoId: 'tether', decimals: 6 }, // oUSDT (OpenUSDT)
  },
  'eclipse': {
    'GU7NS9xCwgNPiAdJ69iusFrRfawjDDPjeMBovhV1d4kn': { coingeckoId: 'ethereum', decimals: 18 }, // tETH (Turbo ETH)
    '27Kkn8PWJbKJsRZrxbsYDdedpUQKnJ5vNfserCxNEJ3R': { coingeckoId: 'usd-coin', decimals: 6 }, // tUSD (Turbo USD)
  },
  'hedera': {
    '0x00000000000000000000000000000000000F7e89': { coingeckoId: 'hedera-hashgraph', decimals: 8 },
    '0x00000000000000000000000000000000002cc823': { coingeckoId: 'hedera-hashgraph', decimals: 8 },
  },
  ethereal: {
    [ADDRESSES.null]: { coingeckoId: 'ethena-usde', decimals: 18 },
    '0xb6fc4b1bff391e5f6b4a3d2c7bda1fee3524692d': { coingeckoId: 'ethena-usde', decimals: 18 },
  },
  'zigchain': {
    'uzig': { coingeckoId: 'zignaly', decimals: 6 }, // Native ZIG token
  },
  monad: {
    [nullAddress]: { coingeckoId: 'monad', decimals: 18 },
    '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a': { coingeckoId: 'agora-dollar', decimals: 6 },
    '0x754704Bc059F8C67012fEd69BC8A327a5aafb603': { coingeckoId: 'usd-coin', decimals: 6 },
    '0xe7cd86e13AC4309349F30B3435a9d337750fC82D': { coingeckoId: 'usdt0', decimals: 6 },
    '0xEE8c0E9f1BFFb4Eb878d8f15f368A02a35481242': { coingeckoId: 'weth', decimals: 18 },
    '0x3bd359C1119dA7Da1D913D1C4D2B7c461115433A': { coingeckoId: 'monad', decimals: 18 },
    '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c': { coingeckoId: 'wrapped-bitcoin', decimals: 8 },
    '0xea17E5a9efEBf1477dB45082d67010E2245217f1': { coingeckoId: 'wrapped-solana', decimals: 9 },
    '0x10Aeaf63194db8d453d4D85a06E5eFE1dd0b5417': { coingeckoId: 'wrapped-steth', decimals: 18 },
    '0x01bFF41798a0BcF287b996046Ca68b395DbC1071': { coingeckoId: 'tether-gold-tokens', decimals: 6 },
  },
  bob: {
      [ADDRESSES.bob.BOB]: { coingeckoId: "bob-build-on-bitcoin", decimals: 18 },
      [ADDRESSES.bob.WBTC]: { coingeckoId: "wrapped-bitcoin", decimals: 8 },
      [ADDRESSES.bob.WBTC_OFT]: { coingeckoId: "wrapped-bitcoin", decimals: 8 },
      [ADDRESSES.bob.SolvBTC]: { coingeckoId: "solv-btc", decimals: 18 },
      [ADDRESSES.bob.SolvBTC_BBN]: { coingeckoId: "solv-protocol-solvbtc-bbn", decimals: 18 },
    }
}

ibcChains.forEach(chain => fixBalancesTokens[chain] = { ...ibcMappings, ...(fixBalancesTokens[chain] || {}) })

function getUniqueAddresses(addresses, chain = 'ethereum') {

  const toLowerCase = !caseSensitiveChains.includes(chain)
  const set = new Set()
  addresses.forEach(i => {
    if (typeof i !== 'string') i = i.toString()
    set.add(toLowerCase ? i.toLowerCase() : i)
  })
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
