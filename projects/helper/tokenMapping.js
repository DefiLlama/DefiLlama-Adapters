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
const caseSensitiveChains = [...ibcChains, 'solana', 'tezos', 'ton', 'algorand', 'aptos', 'near', 'bitcoin', 'waves', 'tron', 'litecoin', 'polkadot', 'ripple', 'elrond', 'cardano', 'stacks', 'sui', 'ergo', 'mvc', 'renec', 'doge', 'stellar', 'massa', ]

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
  ftn: {
    [ADDRESSES.null]: { coingeckoId: 'fasttoken', decimals: 18 },
    '0x4084ab20f8ffca76c19aaf854fb5fe9de6217fbb': { coingeckoId: 'fasttoken', decimals: 18 },
    '0x498d1cf9ad2d66144c98057a5880ee16e801e2f7': { coingeckoId: 'fasttoken', decimals: 18 },
  },
  q: {
      [ADDRESSES.q.ELK]: { coingeckoId: "elk-finance", decimals: 18 },
      [ADDRESSES.q.WETH]: { coingeckoId: "ethereum", decimals: 18 },
  },
  stacks: {
    "SM26NBC8SFHNW4P1Y4DFH27974P56WN86C92HPEHH.token-vlqstx::vlqstx": { coingeckoId: "blockstack", decimals: 6 },
    "SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-abtc::bridged-btc": { coingeckoId: "xlink-bridged-btc-stacks", decimals: 8 },
    "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex::alex": { coingeckoId: "alexgo", decimals: 8 },
  },
  stellar: {
    [ADDRESSES.stellar.XLM]: { coingeckoId: "stellar", decimals: 7},
    [ADDRESSES.stellar.USDC]: { coingeckoId: "usd-coin", decimals: 7},
  },
  defichain_evm: {
    [ADDRESSES.defichain_evm.DFI]: { coingeckoId: "defichain", decimals: 18 },
    [ADDRESSES.defichain_evm.USDT]: { coingeckoId: "usd-coin", decimals: 18 },
    [ADDRESSES.defichain_evm.USDC]: { coingeckoId: "tether", decimals: 18 },
    [ADDRESSES.defichain_evm.ETH]: { coingeckoId: "ethereum", decimals: 18 },
    [ADDRESSES.defichain_evm.DUSD]: { coingeckoId: "decentralized-usd", decimals: 18 },
    '0x66F3Cf265D2D146A0348F6fC67E3Da0835e0968E': { coingeckoId: "javsphere", decimals: 18 },
  },
  ace: {
    [nullAddress]: { coingeckoId: "endurance", decimals: 18 },
    '0x85119527cf38f6ccf7b1b8f8fad05145358aaa81': { coingeckoId: "endurance", decimals: 18 },
  },
  massa: {
    'AS12U4TZfNK7qoLyEERBBRDMu8nm5MKoRzPXDXans4v9wdATZedz9': { coingeckoId: 'wrapped-massa', decimals: 9 },
    'AS1hCJXjndR4c9vekLWsXGnrdigp4AaZ7uYG3UKFzzKnWVsrNLPJ': { coingeckoId: 'massa-bridged-usdc-massa', decimals: 6 },
    'AS1ZGF1upwp9kPRvDKLxFAKRebgg7b3RWDnhgV7VvdZkZsUL7Nuv': { coingeckoId: 'massa-bridged-dai-massa', decimals: 18 },
    'AS124vf3YfAJCSCQVYKczzuWWpXrximFpbTmX4rheLs5uNSftiiRY': { coingeckoId: 'wrapped-ether-massa', decimals: 18 },
  },
  // Sample Code
  ozone: {
    // '0x83048f0bf34feed8ced419455a4320a735a92e9d': { coingeckoId: "ozonechain", decimals: 18 }, // was mapped to wrong chain
  },
  scroll: {
    [ADDRESSES.mode.STONE]: { coingeckoId: "ethereum:0x7122985656e38bdc0302db86685bb972b145bd3c", decimals: 0 },
    '0x3ba89d490ab1c0c9cc2313385b30710e838370a4': { coingeckoId: "solv-btc", decimals: 18 },
    '0x01f0a31698c4d065659b9bdc21b3610292a1c506': { coingeckoId: "ethereum:0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee", decimals: 0 },
  },
  tezos: {
    "KT1PnUZCp3u2KzWr93pn4DD7HAJnm3rWVrgn": { coingeckoId: "tezos", decimals: 6 },
    "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-17": { coingeckoId: "usd-coin", decimals: 6 },
    "KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ-18": { coingeckoId: "tether", decimals: 6 },
  },
  iotaevm: {
    "0x6e47f8d48a01b44DF3fFF35d258A10A3AEdC114c": { coingeckoId: 'iota', decimals: 18 },
  },
  aurora: {
    '0x368ebb46aca6b8d0787c96b2b20bd3cc3f2c45f7': { coingeckoId: 'usd-coin', decimals: 6 },
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
  ham: {
    [ADDRESSES.optimism.WETH_1]: { coingeckoId: 'ethereum', decimals: 18 },
  },
  blast: {
    '0x0000000000000000000000000000000000000001': { coingeckoId: 'ethereum', decimals: 18 },
    '0xf7bc58b8d8f97adc129cfc4c9f45ce3c0e1d2692': { coingeckoId: "wrapped-bitcoin", decimals: 8 },
    '0x9e0d7d79735e1c63333128149c7b616a0dc0bbdb': { coingeckoId: "weth", decimals: 18 }, //pirex eth
    '0xde55b113a27cc0c5893caa6ee1c020b6b46650c0': { coingeckoId: "deus-finance-2", decimals: 18 }, // deus
    [ADDRESSES.arbitrum.USDe]: { coingeckoId: "ethena-usde", decimals: 18 },
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
    [ADDRESSES.null]: { coingeckoId: 'bitcoin', decimals: 18 },
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
    [ADDRESSES.optimism.WETH_1]: { coingeckoId: 'ethereum', decimals: 18 },
  },
  bouncebit: {
    [ADDRESSES.null]: { coingeckoId: 'bouncebit', decimals: 18 },
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
    [ADDRESSES.null]: { coingeckoId: 'bitcoin', decimals: 18 },
    '0x90c6e93849e06ec7478ba24522329d14a5954df4': { coingeckoId: 'ethereum', decimals: 18 },
    '0x75d0cbf342060b14c2fc756fd6e717dfeb5b1b70': { coingeckoId: 'dai', decimals: 18 },
    '0x83fedbc0b85c6e29b589aa6bdefb1cc581935ecd': { coingeckoId: 'mountain-protocol-usdm', decimals: 18 },
  },
  taiko: {
    [ADDRESSES.null]: { coingeckoId: 'ethereum', decimals: 18 },
    [ADDRESSES.taiko.WETH]: { coingeckoId: 'ethereum', decimals: 18 },
    [ADDRESSES.taiko.USDC]: { coingeckoId: 'usd-coin', decimals: 6 },
    [ADDRESSES.taiko.USDC_e]: { coingeckoId: 'usd-coin', decimals: 6 },
    [ADDRESSES.taiko.USDT]: { coingeckoId: 'tether', decimals: 6 },
  },
  sei: {
    '0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1': { coingeckoId: 'usd-coin', decimals: 6 },
    '0xb75d0b03c06a926e488e2659df1a861f860bd3d1': { coingeckoId: 'tether', decimals: 6 },
    [ADDRESSES.null]: { coingeckoId: 'sei-network', decimals: 18 },
    '0x160345fc359604fc6e70e3c5facbde5f7a9342d8': { coingeckoId: 'ethereum', decimals: 18 },
    '0xe30fedd158a2e3b13e9badaeabafc5516e95e8c7': { coingeckoId: 'sei-network', decimals: 18 },
  },
  core: {
    '0x5832f53d147b3d6cd4578b9cbd62425c7ea9d0bd': { coingeckoId: 'wrapped-bitcoin', decimals: 8 },
    '0x5B1Fb849f1F76217246B8AAAC053b5C7b15b7dc3': { coingeckoId: 'solv-btc', decimals: 18 },
  },
  lukso: {
    [ADDRESSES.lukso.WLYX]: { coingeckoId: 'lukso-token-2', decimals: 18 },
  },
  planq: {
    [ADDRESSES.functionx.USDT]: { coingeckoId: 'usd-coin', decimals: 6 },
    [ADDRESSES.planq.USDC_1]: { coingeckoId: 'usd-coin', decimals: 18 },
  },
  zeta: {
    "0x1e4bF3CaBD7707089138dD5a545B077413FA83Fc": { coingeckoId: 'pufeth', decimals: 18 },
  },
  etlk: {
    '0xc9b53ab2679f573e480d01e0f49e2b5cfb7a3eab': { coingeckoId: 'tezos', decimals: 18 },
  },
  sanko: {
    [ADDRESSES.null]: { coingeckoId: 'wrapped-dmt', decimals: 18 },
    "0x754cdad6f5821077d6915004be2ce05f93d176f8": { coingeckoId: 'wrapped-dmt', decimals: 18 },
    "0xe01e3b20c5819cf919f7f1a2b4c18bbfd222f376": { coingeckoId: 'sanko-bridged-weth-sanko', decimals: 18 },
    "0x13d675bc5e659b11cfa331594cf35a20815dcf02": { coingeckoId: 'sanko-bridged-usdc-sanko', decimals: 6 },
    "0x3c84f959f4b8ca0c39847d02f936e13fa8fc4eb9": { coingeckoId: 'beat-the-allegations', decimals: 18 }, // star
  },
  xai: {
    "0x3fb787101dc6be47cfe18aeee15404dcc842e6af": { coingeckoId: 'xai-blockchain', decimals: 18 },
    "0xbee82cfdaff4a6aa4e4793cb81eb1c2e79ac463c": { coingeckoId: 'weth', decimals: 18 },
    "0x1e3769bd5fb2e9e9e7d4ed8667c947661f9a82e3": { coingeckoId: 'usd-coin', decimals: 6 }
  },
  mint: {
    [ADDRESSES.null]: { coingeckoId: 'ethereum', decimals: 18 },
    [ADDRESSES.mint.WETH]: { coingeckoId: 'ethereum', decimals: 18 },
    [ADDRESSES.mint.USDT]: { coingeckoId: 'tether', decimals: 6 },
    [ADDRESSES.mint.USDC]: { coingeckoId: 'usd-coin', decimals: 6 },
    [ADDRESSES.mint.WBTC]: { coingeckoId: 'wrapped-bitcoin', decimals: 8 },

  },
  rari: {
    [ADDRESSES.null]: { coingeckoId: 'ethereum', decimals: 18 },
    "0xf037540e51d71b2d2b1120e8432ba49f29edfbd0": { coingeckoId: 'weth', decimals: 18 },
    "0xfbda5f676cb37624f28265a144a48b0d6e87d3b6": { coingeckoId: 'usd-coin', decimals: 6 },
  },
  ailayer: {
    [ADDRESSES.ailayer.ABTC]: { coingeckoId: 'wrapped-bitcoin', decimals: 18 },
    '0xEAa3C2fa77c306592750C9220a8f52DA8A849Ede': { coingeckoId: 'bouncebit-btc', decimals: 18 },
    '0xc5ed6c946cdc82f4599f0f2f012e1822502e70e3': { coingeckoId: 'artificial-neural-network-ordinals', decimals: 18 },
    '0x0a3bb08b3a15a19b4de82f8acfc862606fb69a2d': { coingeckoId: 'izumi-bond-usd', decimals: 18 },
  },
  fraxtal: {
    [ADDRESSES.fraxtal.WETH]: { coingeckoId: 'ethereum', decimals: 18 },
  },
  aeternity: {
    [ADDRESSES.null]:{ coingeckoId: 'aeternity', decimals: 18 },
    [ADDRESSES.aeternity.WAE]:{ coingeckoId: 'aeternity', decimals: 18 },
    [ADDRESSES.aeternity.WETH]:{ coingeckoId: 'ethereum', decimals: 18 },
    [ADDRESSES.aeternity.USDC]:{ coingeckoId: 'usd-coin', decimals: 18 },
    [ADDRESSES.aeternity.USDT]:{ coingeckoId: 'tether', decimals: 18 },
    [ADDRESSES.aeternity.WBTC]:{ coingeckoId: 'wrapped-bitcoin', decimals: 18 },
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
