const {polygonContractData, 
  avalancheContractData, cronosContractData, kavaContractData } = require('./config')
const BigNumber = require("bignumber.js");

const { getBlock } = require('../helper/getBlock');
const {
  transformPolygonAddress,
  getChainTransform,
  getFixBalances,
} = require("../helper/portedTokens");
const { getDexPadLpsCoreValue } = require("../helper/dexpad")

function tvl(args){
  return async (timestamp, ethBlock, chainBlocks) => {
    let totalBalances = {}
   
    for (let i = 0; i < args.length; i++) {
      let block = await getBlock(timestamp, args[i].chain, chainBlocks)
      let balances = await getDexPadLpsCoreValue(
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
   //Temp removing cronos chain as verification is failing
  // cronos: {
  //   tvl: tvl(cronosContractData)
  // },
  // polygon: {
  //   tvl: tvl(polygonContractData)
  // },
  avax: {
    tvl: tvl(avalancheContractData)
  },
  kava:{
    tvl: tvl(kavaContractData)
  }
}

