const config = {
  uniswapv2: {
    chain: "ethereum",
    locker: "0x663a5c229c09b049e36dcc11a9b0d4a8eb9db214", 
    startBlock: 11463946
  },
  pol: {
    chain: "ethereum",
    locker: "0x17e00383a843a9922bca3b280c0ade9f8ba48449",
    startBlock: 10503171
  },
  sushiswap: {
    chain: "ethereum",
    locker: '0xed9180976c2a4742c7a57354fd39d8bec6cbd8ab',
    startBlock: 12010517
  },
  pancakeswapv2: { 
    chain: "bsc",
    locker: "0xc765bddb93b0d1c1a88282ba0fa6b2d00e3e0c83", 
    startBlock: 6878262
  },
  pancakeswapv1: {
    chain: 'bsc',
    locker: '0xc8B839b9226965caf1d9fC1551588AaF553a7BE6',
    startBlock: 5155584
  },
  safeswap: {
    chain: 'bsc',
    locker: '0x1391b48c996ba2f4f38aee07e369a8f28d38220e',
    startBlock: 12508447
  },
  julswap: {
    chain: 'bsc',
    locker: '0x1f23742D882ace96baCE4658e0947cCCc07B6a75',
    startBlock: 5281114
  },
  quickswap: {
    chain: 'polygon',
    locker: '0xadb2437e6f65682b85f814fbc12fec0508a7b1d0',
    startingBlock: 11936505
  },
  traderjoe: {
    chain: 'avalanche',
    locker: '0xa9f6aefa5d56db1205f36c34e6482a6d4979b3bb',
    startingBlock: 	11933326
  }
}

const topics = {
  v1: 'onDeposit(address,uint256,uint256)',
  v2: 'onDeposit(address,address,uint256,uint256,uint256)'
}

const protocolPairs = {
  uncx_BNB: '0x489714d52d45d38d0f8d9182a2bd79f7fa8e767e',
  uncx_WETH: '0xc70bb2736e218861dca818d1e9f7a1930fe61e5b',
  uncl_WETH: '0x43fdbee01a1f6698766a51a69d4a849ec09cbe81',
  // uncl_WAVAX: '0xa4d164340136505408262bcda711845d7107e55c',
  unc_WETH: '0x5e64cd6f84d0ee2ad2a84cadc464184e36274e0c'
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

const whitelist = [
'bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', 'bsc:0xe9e7cea3dedca5984780bafc599bd69add087d56',
'bsc:0x55d398326f99059ff775485246999027b3197955', 'bsc:0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
'ethereum:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 'ethereum:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
'ethereum:0xdac17f958d2ee523a2206206994597c13d831ec7', 'ethereum:0x6b175474e89094c44da98b954eedeac495271d0f',
'polygon:0x2791bca1f2de4661ed88a30c99a7a9449aa84174', 'polygon:0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
'polygon:0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', 'avalanche:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'];


const getNumLockedTokens = {
  "inputs": [],
  "name": "getNumLockedTokens",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const getLockedTokenAtIndex =  {
  "inputs": [
    {
      "internalType": "uint256",
      "name": "_index",
      "type": "uint256"
    }
  ],
  "name": "getLockedTokenAtIndex",
  "outputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const lockedTokensLength = {
  "inputs": [],
  "name": "lockedTokensLength",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}

const lockedToken = 
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "lockedTokens",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }



module.exports = {
 config,
 whitelist,
 protocolPairs,
 topics,
 getNumLockedTokens,
 getLockedTokenAtIndex,
 lockedTokensLength,
 lockedToken,
 stakingContracts,
 tokens
}