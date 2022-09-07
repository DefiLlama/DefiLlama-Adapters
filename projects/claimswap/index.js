const retry = require('async-retry')
const axios = require('axios')
const { toUSDTBalances } = require('../helper/balances');

async function fetchLiquidity() {
  const claimswapInfo = await retry(async bail => axios.get('https://data-api.claimswap.org/dashboard/allpool'));
  let totalValue = 0;
  for (const pool of claimswapInfo.data) {
    totalValue = totalValue + pool.liquidity;
  }

  return toUSDTBalances(totalValue.toFixed(2));
}

async function fetchCls() {
  const claimswapInfo = await retry(async bail => await axios.get('https://data-api.claimswap.org/dashboard/index'));
  const clsValue = claimswapInfo.data.claPrice * claimswapInfo.data.totalClaStaked;
  return toUSDTBalances(clsValue.toFixed(2));
}

module.exports = {
  methodology: `Tvl counts the tokens locked on AMM pools and staking counts the CLA that has been staked. Data is pulled from the 'dashboard.claimswap.org'`,
  klaytn: {
    tvl: fetchLiquidity,
    staking: fetchCls,
  },
  misrepresentedTokens: true,
  timetravel: false,
}