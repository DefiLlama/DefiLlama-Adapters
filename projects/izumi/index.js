const {  unwrapUniswapV3NFTs } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')
const { unwrapiZiswapV3NFTs } = require('./utils')
const config = require('./config.json')

module.exports = {
  ownTokens: ['IZI', 'IUSD'],
}

Object.keys(config).forEach(chain => {
  const { pools, pool2 = {}} = config[chain]
  if (chain == 'bsc'){
    module.exports[chain] = {
      tvl: getTvliZi(),
      pool2: getTvliZi(true)
    } 
  }else{
    module.exports[chain] = {
      tvl: getTvl(),
      pool2: getTvl(true),
    }
  }
  
  function getTvl(isPool2) {
    const poolList = isPool2 ? pool2 : pools
    return async (_, _b, { [chain]: block }) => {
      return unwrapUniswapV3NFTs({ chain, block, owners: poolList, })
    }
  }
  function getTvliZi(isPool2){
    const poolList = isPool2 ? pool2 : pools
      return async (_, _b, { [chain]: block }) => {
        return unwrapiZiswapV3NFTs({ chain, block, owners: poolList, })

      }
  }
})


module.exports.ethereum.staking = staking('0xb56a454d8dac2ad4cb82337887717a2a427fcd00', '0x9ad37205d608b8b219e6a2573f922094cec5c200')
