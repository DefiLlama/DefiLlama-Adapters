const { onChainTvl, v3Tvl, v1Tvl } = require('../projects/helper/balancer')
const { buildProtocolExports } = require('./utils')

/**
 * helperType: 'v2' (default) = onChainTvl(vault, fromBlock, opts)
 * helperType: 'v3' = v3Tvl(vault, fromBlock, opts)
 * helperType: 'v1' = v1Tvl(factory, fromBlock, opts)
 *
 * Chain config:
 *   { vault, fromBlock, blacklistedTokens?, permitFailure?, onlyUseExistingCache?, preLogTokens? }
 *   For v1: { factory, fromBlock, blacklistedTokens? }
 *   null = empty TVL () => ({})
 */
function balancerExportFn(chainConfigs, options = {}) {
  const { helperType = 'v2' } = options
  const result = {}

  Object.entries(chainConfigs).forEach(([chain, config]) => {
    if (config === null) {
      result[chain] = { tvl: () => ({}) }
      return
    }

    const { vault, factory, fromBlock, blacklistedTokens, permitFailure, onlyUseExistingCache, preLogTokens } = config
    const opts = {}
    if (blacklistedTokens) opts.blacklistedTokens = blacklistedTokens
    if (permitFailure) opts.permitFailure = permitFailure
    if (onlyUseExistingCache) opts.onlyUseExistingCache = onlyUseExistingCache
    if (preLogTokens) opts.preLogTokens = preLogTokens

    if (helperType === 'v3') {
      result[chain] = { tvl: v3Tvl(vault, fromBlock, opts) }
    } else if (helperType === 'v1') {
      result[chain] = { tvl: v1Tvl(factory, fromBlock, opts) }
    } else {
      result[chain] = { tvl: onChainTvl(vault, fromBlock, opts) }
    }
  })

  return result
}

// Shared blacklisted tokens for Balancer V2 main deployment
const balancerV2Blacklist = [
  "0xC011A72400E58ecD99Ee497CF89E3775d4bd732F",
  "0x57ab1e02fee23774580c119740129eac7081e9d3", // sUSD_OLD
  "0x00f109f744B5C918b13d4e6a834887Eb7d651535", "0x645F7dd67479663EE7a42feFEC2E55A857cb1833", "0x4922a015c4407F87432B179bb209e125432E4a2A",
  "0xdA16D6F08F20249376d01a09FEBbAd395a246b2C", "0x9be4f6a2558f88A82b46947e3703528919CE6414", "0xa7fd7d83e2d63f093b71c5f3b84c27cff66a7802",
  "0xacfbe6979d58b55a681875fc9adad0da4a37a51b", "0xd6d9bc8e2b894b5c73833947abdb5031cc7a4894",
  // eulerTokens
  "0x1b808f49add4b8c6b5117d9681cf7312fcf0dc1d",
  "0xe025e3ca2be02316033184551d4d3aa22024d9dc",
  "0xeb91861f8a4e1c12333f42dce8fb0ecdc28da716",
  "0x4d19f33948b99800b6113ff3e83bec9b537c85d2",
  "0x5484451a88a35cd0878a1be177435ca8a0e4054e",
  "0x64ad6d2472de5ddd3801fb4027c96c3ee7a7ee82",
  "0x60897720aa966452e8706e74296b018990aec527",
  "0x3c66B18F67CA6C1A71F829E2F6a0c987f97462d0",
  "0x4169Df1B7820702f566cc10938DA51F6F597d264",
  "0xbd1bd5c956684f7eb79da40f582cbe1373a1d593",
]

const balancerV2Vault = '0xBA12222222228d8Ba445958a75a0704d566BF2C8'

function balV2Chain(fromBlock) {
  return { vault: balancerV2Vault, fromBlock, blacklistedTokens: balancerV2Blacklist }
}

const configs = {
  // ===== Balancer V2 (onChainTvl) =====
  'balancer': {
    ethereum: balV2Chain(12272146),
    polygon: balV2Chain(15832990),
    arbitrum: balV2Chain(222832),
    xdai: balV2Chain(24821598),
    polygon_zkevm: balV2Chain(203079),
    base: balV2Chain(1196036),
    avax: balV2Chain(26386141),
    mode: balV2Chain(8110317),
    fraxtal: balV2Chain(4708596),
  },
  'swaap-v2': {
    ethereum: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 17598578 },
    arbitrum: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 137451745, permitFailure: true },
    polygon: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 44520023 },
    optimism: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 120693792 },
    bsc: { vault: '0x03c01acae3d0173a93d819efdc832c7c4f153b06', fromBlock: 39148730 },
    base: { vault: '0x03c01acae3d0173a93d819efdc832c7c4f153b06', fromBlock: 14451361 },
    mode: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 7242549 },
    mantle: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 65689171 },
    scroll: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 6934854 },
    linea: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 6052579 },
    monad: { vault: '0xd315a9c38ec871068fec378e4ce78af528c76293', fromBlock: 32389136 },
  },
  'gaming-dex': {
    defiverse: null,
    oas: { vault: '0xfb6f8FEdE0Cb63674Ab964affB93D65a4a7D55eA', fromBlock: 4522800 },
  },
  'sobal': {
    neon_evm: { vault: '0x7122e35ceC2eED4A989D9b0A71998534A203972C', fromBlock: 206166057, blacklistedTokens: ['0x4440000000000000000000000000000000000002'] },
    base: { vault: '0x7122e35ceC2eED4A989D9b0A71998534A203972C', fromBlock: 2029566, blacklistedTokens: ['0x4440000000000000000000000000000000000002'] },
  },
  'mondrian': {
    abstract: { vault: '0x48cD08ad2065e0cD2dcD56434e393D55A59a4F64', fromBlock: 1199036 },
  },
  'burrbear': {
    berachain: { vault: '0xBE09E71BDc7b8a50A05F7291920590505e3C7744', fromBlock: 1 },
  },
  'beraswap': {
    berachain: { vault: '0x4Be03f781C497A489E3cB0287833452cA9B9E80B', fromBlock: 9384 },
  },
  'beethovenx': {
    fantom: { vault: '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce', fromBlock: 16896080 },
    optimism: { vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8', fromBlock: 7003431 },
    sonic: { vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8', fromBlock: 368312 },
  },
  'wavelength': {
    velas: { vault: '0xa4a48dfcae6490afe9c779bf0f324b48683e488c', fromBlock: 56062385, onlyUseExistingCache: true },
  },
  'tanukix': {
    methodology: "Sum of all the tokens locked in TanukiX vault",
    taiko: { vault: '0x3251e99cEf4b9bA03a6434B767aa5Ad11ca6cc31', fromBlock: 204741 },
  },
  'phux': {
    pulse: { vault: '0x7F51AC3df6A034273FB09BB29e383FCF655e473c', fromBlock: 17500116 },
  },
  'hummus-weighted': {
    metis: { vault: '0x95B4F64c2a96F770C1b4216e18ED692C01506437', fromBlock: 7066703 },
  },
  'holdr-fi': {
    aurora: { vault: '0x364d44dFc31b3d7b607797B514348d57Ad0D784E', fromBlock: 78113009 },
  },
  'embr': {
    avax: { vault: '0xad68ea482860cd7077a5d0684313dd3a9bc70fbb', fromBlock: 8169253 },
  },
  'ducata': {
    methodology: 'TVL counts the external assets deposited in the vaults',
    arbitrum: { vault: '0x25898DEe0634106C2FcBB51B3DB5b14aA1c238a4', fromBlock: 230182440 },
  },

  // ===== Balancer V3 (v3Tvl) =====
  'balancer-v3': {
    _options: { helperType: 'v3' },
    xdai: { vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9', fromBlock: 37360338 },
    ethereum: { vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9', fromBlock: 21332121 },
    arbitrum: { vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9', fromBlock: 297810187 },
    base: { vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9', fromBlock: 25343854 },
    optimism: { vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9', fromBlock: 133969439 },
    avax: { vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9', fromBlock: 59955604 },
    hyperliquid: { vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9', fromBlock: 6132445 },
    plasma: { vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9', fromBlock: 782595 },
  },
  'beethovenx-v3': {
    _options: { helperType: 'v3' },
    sonic: { vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9', fromBlock: 368135 },
  },
  'coinhain': {
    _options: { helperType: 'v3' },
    bsc: { vault: '0xb61cb1E8EF4BB1b74bB858B8B60d82d79488F13D', fromBlock: 60471472 },
  },

  // ===== Balancer V1 (v1Tvl) =====
  'valueliquid': {
    _options: { helperType: 'v1' },
    start: '2020-09-30',
    ethereum: { factory: '0xebc44681c125d63210a33d30c55fd3d37762675b', fromBlock: 10961776 },
  },
  'balancer-v1': {
    _options: { helperType: 'v1' },
    ethereum: { factory: '0x9424B1412450D0f8Fc2255FAf6046b98213B76Bd', fromBlock: 9562480, blacklistedTokens: [
      "0xC011A72400E58ecD99Ee497CF89E3775d4bd732F",
      "0x57ab1e02fee23774580c119740129eac7081e9d3",
      "0x00f109f744B5C918b13d4e6a834887Eb7d651535", "0x645F7dd67479663EE7a42feFEC2E55A857cb1833", "0x4922a015c4407F87432B179bb209e125432E4a2A",
      "0xdA16D6F08F20249376d01a09FEBbAd395a246b2C", "0x9be4f6a2558f88A82b46947e3703528919CE6414",
    ]},
  },
}

module.exports = buildProtocolExports(configs, balancerExportFn)
