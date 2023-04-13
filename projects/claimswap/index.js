const { get } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances');

async function fetchLiquidity() {
  const claimswapInfo = await get('https://data-api.claimswap.org/dashboard/v2/allpool');
  let totalValue = 0;
  for (const pool of claimswapInfo) {
    totalValue = totalValue + pool.liquidity;
  }

  return toUSDTBalances(totalValue.toFixed(2));
}

async function fetchCls() {
  const claimswapInfo = await get('https://data-api.claimswap.org/dashboard/v2/index');
  const clsValue = claimswapInfo.claPrice * claimswapInfo.totalClaStaked;
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
