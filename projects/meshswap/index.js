const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require('../helper/balances');

async function tvl() {
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
  return toUSDTBalances(totalLiquidity);
}

async function staking() {
  const meshswapInfo = await retry(async bail => await axios.get('https://s.meshswap.fi/stat/meshswapInfo.json'))
  var totalStaking = new BigNumber(meshswapInfo.data.common.stakingVol);
  return toUSDTBalances(totalStaking);
}

module.exports = {
  methodology: "meshswap is an AMM-based Instant Swap Protocol",
  timetravel: false,
  misrepresentedTokens: true,
  polygon: {
    staking,
    tvl
  }
}