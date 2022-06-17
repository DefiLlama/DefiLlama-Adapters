const sdk = require('@defillama/sdk');
const { config, coreTokenWhitelist, protocolPairs, tokens, stakingContracts,
  ethereumContractData, bscContractData, polygonContractData, 
  avalancheContractData, gnosisContractData } = require('./config')
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
        args[i].isMixedTokenContract, //use when locker mixes LPs with other tokens
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
  tvl: tvl(ethereumContractData),

  pool2: pool2s([config.uniswapv2.locker, config.pol.locker], 
    [protocolPairs.uncx_WETH], 
     config.uniswapv2.chain)
  },
  bsc: {
  tvl: tvl(bscContractData),

  pool2: pool2s([config.pancakeswapv2.locker, config.pancakeswapv1.locker, config.safeswap.locker,
    config.julswap.locker, config.biswap.locker], 
      [protocolPairs.uncx_BNB], config.pancakeswapv2.chain)
  },
  polygon: {
    tvl: tvl(polygonContractData)
  },
  avax: {
    tvl: tvl(avalancheContractData)
  },
  xdai: {
    tvl: tvl(gnosisContractData),
    pool2: pool2s([config.honeyswap.locker], 
      [protocolPairs.uncx_XDAI], 
       config.honeyswap.chain)
    },
}

