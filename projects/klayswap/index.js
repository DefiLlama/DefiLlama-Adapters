const retry = require('async-retry')
const axios = require("axios");
const BigNumber = require("bignumber.js");

async function fetchLiquidity() {
  const klayswapInfo = await retry(async bail => await axios.get('https://s.klayswap.com/stat/klayswapInfo.json'))
  const recentPoolInfo = klayswapInfo.data.recentPoolInfo;
  var totalLiquidity = new BigNumber('0');

  for(const pool of recentPoolInfo){
    totalLiquidity = totalLiquidity.plus(pool.poolVolume);
  }
  return totalLiquidity.toFixed(2);
}

async function fetchStakedToken() {
  const klayswapInfo = await retry(async bail => await axios.get('https://s.klayswap.com/stat/klayswapInfo.json'))
  const recentPoolInfo = klayswapInfo.data.recentPoolInfo;
  var totalLiquidity = new BigNumber('0');

  for(const pool of recentPoolInfo){
    totalLiquidity = totalLiquidity.plus(pool.poolVolume);
  }
  const dayTvl = klayswapInfo.data.dayTvl;
  const tvl = new BigNumber(dayTvl[dayTvl.length-1].amount);

  const stakedKsp = tvl.minus(totalLiquidity);
  return stakedKsp.toFixed(2);
}

module.exports = {
  methodology: 'TVL counts the liquidity of KlaySwap DEX and staking counts the KSP that has been staked. Data is pulled from:"https://s.klayswap.com/stat/klayswapInfo.json".',
  fetch: fetchLiquidity,
  staking: {
    fetch: fetchStakedToken
  }
}