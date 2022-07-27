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
    weth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
  }
  
  const coreTokenWhitelist = {
    bsc: [
     '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // wbnb
    '0xe9e7cea3dedca5984780bafc599bd69add087d56',  // busd
    '0x55d398326f99059ff775485246999027b3197955',  // usdt
    '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'], // usdc
    ethereum:  [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // weth
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',  // usdc
    '0xdac17f958d2ee523a2206206994597c13d831ec7',  // usdt
    '0x6b175474e89094c44da98b954eedeac495271d0f'], // dai
    polygon: [
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',  // wmatic
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',  // usdc
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'], // weth
    avalanche: [
    '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',  // wavax
    '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',  // usdc
    '0xc7198437980c041c805a1edcba50c1ce5db95118'], // usdt
    xdai: [
    '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',  // wxdai
    '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1',  // weth
    '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',  // usdt
    '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83']  // usdc
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
  quickswap: {
    chain: 'polygon',
    locker: '0xadb2437e6f65682b85f814fbc12fec0508a7b1d0',
    factory: '0x5757371414417b8c6caad45baef941abc7d3ab32',
    startingBlock: 11936505
  },
  traderjoe: {
    chain: 'avax',
    locker: '0xa9f6aefa5d56db1205f36c34e6482a6d4979b3bb',
    factory: '0x9ad6c38be94206ca50bb0d90783181662f0cfa10',
    startingBlock: 11933326
  },
  honeyswap: {
    chain: 'xdai',
    locker: '0xe3D32266974f1E8f8549cAf9F54977040e7D1c07',
    factory: '0xa818b4f111ccac7aa31d0bcc0806d64f2e0737d7',
    startBlock: 14476818
  }
}

const ethereumContractData = [
  { // Uniswap v2
    chain: config.uniswapv2.chain,
    contract: config.uniswapv2.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    trackedTokens: coreTokenWhitelist.ethereum,
    pool2: [protocolPairs.uncx_WETH],
    factory: config.uniswapv2.factory
  },
  { // Sushiswap
    chain: config.sushiswap.chain,
    contract: config.sushiswap.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    trackedTokens: coreTokenWhitelist.ethereum,
    pool2: [protocolPairs.uncx_WETH],
    factory: config.sushiswap.factory
  },
  { // Uniswap v2 (mixed contract)
    chain: config.pol.chain,
    contract: config.pol.locker,
    getNumLockedTokensABI: lockedTokensLength,
    getLockedTokenAtIndexABI: lockedToken,
    trackedTokens: coreTokenWhitelist.ethereum,
    pool2: [protocolPairs.uncx_WETH],
    isMixedTokenContract: true,
    factory: config.pol.factory
  }
]

const bscContractData = [
  { // Pancakeswap v2
    chain: config.pancakeswapv2.chain,
    contract: config.pancakeswapv2.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    trackedTokens: coreTokenWhitelist.bsc,
    pool2: [protocolPairs.uncx_BNB],
    factory: config.pancakeswapv2.factory
  },
  { // Pancakeswap v1
    chain: config.pancakeswapv1.chain,
    contract: config.pancakeswapv1.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    trackedTokens: coreTokenWhitelist.bsc,
    pool2: [protocolPairs.uncx_BNB],
    factory: config.pancakeswapv1.factory
  },
  { // Safeswap v1
    chain: config.safeswap.chain,
    contract: config.safeswap.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    trackedTokens: coreTokenWhitelist.bsc,
    pool2: [protocolPairs.uncx_BNB],
    factory: config.safeswap.factory
  },
  { // Julswap
    chain: config.julswap.chain,
    contract: config.julswap.locker,
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    trackedTokens: coreTokenWhitelist.bsc,
    pool2: [protocolPairs.uncx_BNB],
    factory: config.julswap.factory
  },
  { // Biswap
    chain: config.biswap.chain,
    contract: config.biswap.locker,
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    trackedTokens: coreTokenWhitelist.bsc,
    pool2: [protocolPairs.uncx_BNB],
    factory: config.biswap.factory
  }
]


const polygonContractData = [
  { // Quickswap
    chain: config.quickswap.chain,
    contract: config.quickswap.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    trackedTokens: coreTokenWhitelist.polygon,
    factory: config.quickswap.factory
  },
]


const avalancheContractData = [
  { // TraderJoe
    chain: config.traderjoe.chain,
    contract: config.traderjoe.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    trackedTokens: coreTokenWhitelist.avalanche,
    factory: config.traderjoe.factory
  },
  
] 

const gnosisContractData = [
  { // HoneySwap
    chain: config.honeyswap.chain,
    contract: config.honeyswap.locker, 
    getNumLockedTokensABI: getNumLockedTokens,
    getLockedTokenAtIndexABI: getLockedTokenAtIndex,
    trackedTokens: coreTokenWhitelist.xdai,
    pool2: [protocolPairs.uncx_XDAI],
    factory: config.honeyswap.factory
  }

]


module.exports = {
  ethereumContractData,
  bscContractData,
  polygonContractData,
  avalancheContractData,
  gnosisContractData,
  coreTokenWhitelist,
  governanceTokens,
  stakingContracts,
  protocolPairs,
  config,
  topics,
  tokens
}