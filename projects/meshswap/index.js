const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetchLiquidity() {
  const meshswapInfo = await retry(async bail => await axios.get('https://s.meshswap.fi/stat/meshswapInfo.json'))
  const recentPoolInfo = meshswapInfo.data.recentPoolInfo;
  var totalLiquidity = new BigNumber('0');

  for(const pool of recentPoolInfo){
    totalLiquidity = totalLiquidity.plus(pool.poolVolume);
  }
  return totalLiquidity.toFixed(2);
}

async function fetchSinglePoolLiquidity() {
  const meshswapInfo = await retry(async bail => await axios.get('https://s.meshswap.fi/stat/meshswapInfo.json'))
  const SinglePoolInfo = meshswapInfo.data.leveragePoolInfo.single;
  const tokenInfoObj = meshswapInfo.data.tokenInfo;
  var tokenInfo = {};
  for(const token of tokenInfoObj){
    tokenInfo[token.address] = token
  } 
  var totalLiquidity = new BigNumber('0');

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

async function fetchStakedToken() {
  const meshswapInfo = await retry(async bail => await axios.get('https://s.meshswap.fi/stat/meshswapInfo.json'))
  var totalStaking = new BigNumber(meshswapInfo.data.common.stakingVol);

  return totalStaking.toFixed(2);
}

module.exports = {
  fetchLiquidity,
  fetchSinglePoolLiquidity,
  fetchStakedToken
}
