const ADDRESSES = require('../helper/coreAssets.json')
// const { ethereum } = require(".")

const { getNumLockedTokens, getLockedTokenAtIndex,
  lockedTokensLength, lockedToken } = require('./abis')


  const topics = {
    v1: 'onDeposit(address,uint256,uint256)',
    v2: 'onDeposit(address,address,uint256,uint256,uint256)'
  }
  
  const protocolPairs = {
    uncx_BNB: '0x489714d52d45d38d0f8d9182a2bd79f7fa8e767e',
    uncx_WETH: '0xc70bb2736e218861dca818d1e9f7a1930fe61e5b',
    uncx_XDAI: '0x40e93143cbc9e3a20fd3d4f3e6fb7ca9e778b571'
  }
  
  const stakingContracts = [
      '0x887E81cab04461620A5fF196048Bba38d9Dc96e4',
      '0x73f5876ECd9fAbF7d359Daf7Be7610B276641549',
      '0xf4868E785457280dd48B10a02D8F03BBfD5B721f'
    ]
  
  
  const tokens = {
    uncx_eth: '0xaDB2437e6F65682B85F814fBc12FeC0508A7B1D0',
    weth: ADDRESSES.ethereum.WETH
  }
  
  const governanceTokens = { // UNCX
    bsc:      ['0x09a6c44c3947b69e2b45f4d51b67e6a39acfb506'],
    ethereum: ['0xadb2437e6f65682b85f814fbc12fec0508a7b1d0'],
    polygon:  ['0x9eecd634c7a934f752af0eb90dda9ecc262f199f'],
  
  }

const config = {
  uniswapv2: {
    chain: "ethereum",
    locker: "0x663a5c229c09b049e36dcc11a9b0d4a8eb9db214", 
    factory: "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f",
    startBlock: 11463946
  },
  pol: {
    chain: "ethereum",
    locker: "0x17e00383a843a9922bca3b280c0ade9f8ba48449",
    factory: "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f",
    startBlock: 10503171
  },
  sushiswap: {
    chain: "ethereum",
    locker: '0xed9180976c2a4742c7a57354fd39d8bec6cbd8ab',
    factory: "0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac",
    startBlock: 12010517
  },
  pancakeswapv2: { 
    chain: "bsc",
    locker: "0xc765bddb93b0d1c1a88282ba0fa6b2d00e3e0c83", 
    factory: "0xca143ce32fe78f1f7019d7d551a6402fc5350c73",
    startBlock: 6878262
  },
  pancakeswapv1: {
    chain: 'bsc',
    locker: '0xc8B839b9226965caf1d9fC1551588AaF553a7BE6',
    factory: '0xbcfccbde45ce874adcb698cc183debcf17952812',
    startBlock: 5155584
  },
  biswap: {
    chain: 'bsc',
    locker: '0x74dee1a3e2b83e1d1f144af2b741bbaffd7305e1',
    factory: '0x858e3312ed3a876947ea49d572a7c42de08af7ee',
    startBlock: 18251487
  },
  safeswap: {
    chain: 'bsc',
    locker: '0x1391b48c996ba2f4f38aee07e369a8f28d38220e',
    factory: '0x86a859773cf6df9c8117f20b0b950ada84e7644d',
    startBlock: 12508447
  },
  julswap: {
    chain: 'bsc',
    locker: '0x1f23742D882ace96baCE4658e0947cCCc07B6a75',
    factory: '0x553990f2cba90272390f62c5bdb1681ffc899675',
    startBlock: 5281114
  },
  babydogeswap: {
    chain: 'bsc',
    locker: '0xb89a15a4f3518c14c21be04b55546162b0cb39f0',
    factory: '0x4693b62e5fc9c0a45f89d62e6300a03c85f43137',
    startBlock: 22263319
  },
  quickswap: {
    chain: 'polygon',
    locker: '0xadb2437e6f65682b85f814fbc12fec0508a7b1d0',
    factory: '0x5757371414417b8c6caad45baef941abc7d3ab32',
    startBlock: 11936505
  },
  traderjoe: {
    chain: 'avax',
    locker: '0xa9f6aefa5d56db1205f36c34e6482a6d4979b3bb',
    factory: '0x9ad6c38be94206ca50bb0d90783181662f0cfa10',
    startBlock: 11933326
  },
  honeyswap: {
    chain: 'xdai',
    locker: '0xe3D32266974f1E8f8549cAf9F54977040e7D1c07',
    factory: '0xa818b4f111ccac7aa31d0bcc0806d64f2e0737d7',
    startBlock: 14476818
  },
  uniswapV2_base: {
    chain: 'base',
    locker: '0xc4E637D37113192F4F1F060DaEbD7758De7F4131',
    factory: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
    startBlock: 12110643
  },
  sushiswapV2_base: {
    chain: 'base',
    locker: '0xBeddF48499788607B4c2e704e9099561ab38Aae8',
    factory: '0x71524B4f93c58fcbF659783284E38825f0622859',
    startBlock: 10577634
  }
}

const ethereumContractData = [
  { // Uniswap v2
    chain: config.uniswapv2.chain,
    contract: config.uniswapv2.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    pool2: [protocolPairs.uncx_WETH],
    factory: config.uniswapv2.factory
  },
  { // Sushiswap
    chain: config.sushiswap.chain,
    contract: config.sushiswap.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    pool2: [protocolPairs.uncx_WETH],
    factory: config.sushiswap.factory
  },
  { // Uniswap v2 (mixed contract)
    chain: config.pol.chain,
    contract: config.pol.locker,
    getNumLockedTokensABI: lockedTokensLength,
    getLockedTokenAtIndexABI: lockedToken,
    pool2: [protocolPairs.uncx_WETH],
    isMixedTokenContract: true,
    factory: config.pol.factory
  }
]

const baseContractData = [
  { // Uniswap v2
    chain: config.uniswapV2_base.chain,
    contract: config.uniswapV2_base.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    factory: config.uniswapV2_base.factory
  },
  { // Sushiswap
    chain: config.sushiswapV2_base.chain,
    contract: config.sushiswapV2_base.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    factory: config.sushiswapV2_base.factory
  },
]

const bscContractData = [
  { // Pancakeswap v2
    chain: config.pancakeswapv2.chain,
    contract: config.pancakeswapv2.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    pool2: [protocolPairs.uncx_BNB],
    factory: config.pancakeswapv2.factory
  },
  { // Pancakeswap v1
    chain: config.pancakeswapv1.chain,
    contract: config.pancakeswapv1.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    pool2: [protocolPairs.uncx_BNB],
    factory: config.pancakeswapv1.factory
  },
  { // Safeswap v1
    chain: config.safeswap.chain,
    contract: config.safeswap.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    pool2: [protocolPairs.uncx_BNB],
    factory: config.safeswap.factory
  },
  { // Julswap
    chain: config.julswap.chain,
    contract: config.julswap.locker,
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    pool2: [protocolPairs.uncx_BNB],
    factory: config.julswap.factory
  },
  { // Biswap
    chain: config.biswap.chain,
    contract: config.biswap.locker,
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    pool2: [protocolPairs.uncx_BNB],
    factory: config.biswap.factory
  },
  { // BabyDogeSwap  
    chain: config.babydogeswap.chain,
    contract: config.babydogeswap.locker,
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    pool2: [protocolPairs.uncx_BNB],
    factory: config.babydogeswap.factory
  }
]


const polygonContractData = [
  { // Quickswap
    chain: config.quickswap.chain,
    contract: config.quickswap.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    factory: config.quickswap.factory
  },
]


const avalancheContractData = [
  { // TraderJoe
    chain: config.traderjoe.chain,
    contract: config.traderjoe.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    factory: config.traderjoe.factory
  },
  
] 

const gnosisContractData = [
  { // HoneySwap
    chain: config.honeyswap.chain,
    contract: config.honeyswap.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    pool2: [protocolPairs.uncx_XDAI],
    factory: config.honeyswap.factory
  }

]
const arbitrumContractData = [
  {
    chain: 'arbitrum',
    contract: '0x275720567E5955F5f2D53A7A1Ab8a0Fc643dE50E', 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    pool2: [],
  }

]


module.exports = {
  baseContractData,
  ethereumContractData,
  bscContractData,
  polygonContractData,
  avalancheContractData,
  gnosisContractData,
  arbitrumContractData,
  governanceTokens,
  stakingContracts,
  protocolPairs,
  config,
  topics,
  tokens
}