const sdk = require('@defillama/sdk');
const { config, coreTokenWhitelist, protocolPairs, tokens,
  getNumLockedTokens, getLockedTokenAtIndex,
  lockedTokensLength, lockedToken, stakingContracts } = require('./config')
const BigNumber = require("bignumber.js");

const { stakings } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");
const { getBlock } = require('../helper/getBlock');

const { getUnicryptLpsCoreValue } = require("../helper/unicrypt")

function tvl(args){
  return async (timestamp, ethBlock, chainBlocks) => {
    let totalBalances = {}
    for (let i = 0; i < args.length; i++) {
      let block = await getBlock(timestamp, args[i].chain, chainBlocks)
      
      let balances = await getUnicryptLpsCoreValue(
        block, 
        args[i].chain, 
        args[i].contract, 
        args[i].getNumLockedTokensABI, 
        args[i].getLockedTokenAtIndexABI, 
        args[i].trackedTokens,
        args[i].pool2,
        args[i].isMixedTokenContract, //use when locker mixes Tokens and LPs
        args[i].factory
        );

      for (const [token, balance] of Object.entries(balances)) {
        if (!totalBalances[token]) totalBalances[token] = '0'
          totalBalances[token] = BigNumber(totalBalances[token]).plus(BigNumber(balance)).toFixed(0) 
        }
    }
    return totalBalances
  }
}

module.exports = {
  timetravel: true,
  methodology: 
  `Counts each LP pair's native token and 
   stable balance, adjusted to reflect locked pair's value. 
   Balances and merged across multiple 
   locker and staking contracts to return sum TVL per chain`,

  ethereum: {
  staking: stakings(
    stakingContracts, 
    tokens.uncx_eth, 
    config.uniswapv2.chain
    ),
  tvl: tvl([
    { // Uniswap v2
      chain: config.uniswapv2.chain,
      contract: config.uniswapv2.locker, 
      getNumLockedTokensABI: getNumLockedTokens,
      getLockedTokenAtIndexABI: getLockedTokenAtIndex,
      trackedTokens: coreTokenWhitelist.ethereum,
      pool2: [protocolPairs.uncx_WETH]
    },
    { // Sushiswap
      chain: config.sushiswap.chain,
      contract: config.sushiswap.locker, 
      getNumLockedTokensABI: getNumLockedTokens,
      getLockedTokenAtIndexABI: getLockedTokenAtIndex,
      trackedTokens: coreTokenWhitelist.ethereum,
      pool2: [protocolPairs.uncx_WETH]
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
  ]),

  pool2: pool2s([config.uniswapv2.locker, config.pol.locker], 
    [protocolPairs.uncx_WETH], 
     config.uniswapv2.chain)
  },
  bsc: {
  tvl: tvl([
    { // Pancakeswap v2
      chain: config.pancakeswapv2.chain,
      contract: config.pancakeswapv2.locker, 
      getNumLockedTokensABI: getNumLockedTokens,
      getLockedTokenAtIndexABI: getLockedTokenAtIndex,
      trackedTokens: coreTokenWhitelist.bsc,
      pool2: [protocolPairs.uncx_BNB],
    },
    { // Pancakeswap v1
      chain: config.pancakeswapv1.chain,
      contract: config.pancakeswapv1.locker, 
      getNumLockedTokensABI: getNumLockedTokens,
      getLockedTokenAtIndexABI: getLockedTokenAtIndex,
      trackedTokens: coreTokenWhitelist.bsc,
      pool2: [protocolPairs.uncx_BNB],
    },
    { // Safeswap v1
      chain: config.safeswap.chain,
      contract: config.safeswap.locker, 
      getNumLockedTokensABI: getNumLockedTokens,
      getLockedTokenAtIndexABI: getLockedTokenAtIndex,
      trackedTokens: coreTokenWhitelist.bsc,
      pool2: [protocolPairs.uncx_BNB],
    },
    { // Julswap
      chain: config.julswap.chain,
      contract: config.julswap.locker,
      getNumLockedTokensABI: getNumLockedTokens,
      getLockedTokenAtIndexABI: getLockedTokenAtIndex,
      trackedTokens: coreTokenWhitelist.bsc,
      pool2: [protocolPairs.uncx_BNB],
    },
    { // Biswap
      chain: config.biswap.chain,
      contract: config.biswap.locker,
      getNumLockedTokensABI: getNumLockedTokens,
      getLockedTokenAtIndexABI: getLockedTokenAtIndex,
      trackedTokens: coreTokenWhitelist.bsc,
      pool2: [protocolPairs.uncx_BNB],
    }
  ]),

  pool2: pool2s([config.pancakeswapv2.locker, config.pancakeswapv1.locker, config.safeswap.locker,
    config.julswap.locker, config.biswap.locker], 
      [protocolPairs.uncx_BNB], config.pancakeswapv2.chain)
  },
  polygon: {
    tvl: tvl([
      { // Quickswap
        chain: config.quickswap.chain,
        contract: config.quickswap.locker, 
        getNumLockedTokensABI: getNumLockedTokens,
        getLockedTokenAtIndexABI: getLockedTokenAtIndex,
        trackedTokens: coreTokenWhitelist.polygon,
      },
    ])
  },
  avax: {
    tvl: tvl([
      { // TraderJoe
        chain: config.traderjoe.chain,
        contract: config.traderjoe.locker, 
        getNumLockedTokensABI: getNumLockedTokens,
        getLockedTokenAtIndexABI: getLockedTokenAtIndex,
        trackedTokens: coreTokenWhitelist.avalanche,
      },
    ])
  },
  xdai: {
    tvl: tvl([
      { // HoneySwap
        chain: config.honeyswap.chain,
        contract: config.honeyswap.locker, 
        getNumLockedTokensABI: getNumLockedTokens,
        getLockedTokenAtIndexABI: getLockedTokenAtIndex,
        trackedTokens: coreTokenWhitelist.xdai,
        pool2: [protocolPairs.uncx_XDAI]
      }
    ]),
    pool2: pool2s([config.honeyswap.locker], 
      [protocolPairs.uncx_XDAI], 
       config.honeyswap.chain)
    },
}

