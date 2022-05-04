const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function tvl(){
  const meshswapInfo = await retry(async bail => await axios.get('https://s.meshswap.fi/stat/meshswapInfo.json'))
  const recentPoolInfo = meshswapInfo.data.recentPoolInfo;
  const SinglePoolInfo = meshswapInfo.data.leveragePoolInfo.single;
  const tokenInfoObj = meshswapInfo.data.tokenInfo;
  const totalStaking = new BigNumber(meshswapInfo.data.common.stakingVol);

  var tvl = new BigNumber('0');
  var tokenInfo = {};
  for(const token of tokenInfoObj){
    tokenInfo[token.address] = token
  }

  for(const spool of SinglePoolInfo){
    const totalDeposit = new BigNumber(spool.totalDeposit);
    const totalBorrow = new BigNumber(spool.totalBorrow);
    const singlePoolAmount =  totalDeposit.minus(totalBorrow);
    
    const tokenPrice = tokenInfo[spool.token].price;
    const tokenDecimal = tokenInfo[spool.token].decimal;
    const singlePoolVol = singlePoolAmount.div(10**tokenDecimal).times(tokenPrice);

    tvl = tvl.plus(singlePoolVol);
  }

  for(const pool of recentPoolInfo){
    tvl = tvl.plus(pool.poolVolume);
  }
  tvl =tvl.plus(totalStaking);
  return tvl.toFixed(2);
}
async function fetch() {
  const meshswapInfo = await retry(async bail => await axios.get('https://s.meshswap.fi/stat/meshswapInfo.json'))
  const recentPoolInfo = meshswapInfo.data.recentPoolInfo;
  const tokenInfoObj = meshswapInfo.data.tokenInfo;
  const SinglePoolInfo = meshswapInfo.data.leveragePoolInfo.single;

  var totalLiquidity = new BigNumber('0');

  for(const pool of recentPoolInfo){
    totalLiquidity = totalLiquidity.plus(pool.poolVolume);
  }
  var tokenInfo = {};
  for(const token of tokenInfoObj){
    tokenInfo[token.address] = token
  }

  for(const spool of SinglePoolInfo){
    const totalDeposit = new BigNumber(spool.totalDeposit);
    const totalBorrow = new BigNumber(spool.totalBorrow);
    const singlePoolAmount =  totalDeposit.minus(totalBorrow);
    
    const tokenPrice = tokenInfo[spool.token].price;
    const tokenDecimal = tokenInfo[spool.token].decimal;
    const singlePoolVol = singlePoolAmount.div(10**tokenDecimal).times(tokenPrice);

    totalLiquidity = totalLiquidity.plus(singlePoolVol);
  }
  return totalLiquidity.toFixed(2);
}

async function staking() {
  const meshswapInfo = await retry(async bail => await axios.get('https://s.meshswap.fi/stat/meshswapInfo.json'))
  var totalStaking = new BigNumber(meshswapInfo.data.common.stakingVol);
  return totalStaking.toFixed(2);
}

module.exports = {
  methodology: "meshswap is an AMM-based Instant Swap Protocol",
  polygon: {
    staking,
    tvl,
    fetch
  },
}