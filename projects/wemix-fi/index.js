const { get } = require('../helper/http')
const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require('../helper/balances');

async function fetchLiquidity() {
  const wemixfiPoolInfo = await get('https://openapi.wemix.fi/pool/info_list?pool=all');
  const recentPoolInfo = wemixfiPoolInfo.data;
  var totalLiquidity = new BigNumber('0');

  for (const pool of recentPoolInfo) {
    totalLiquidity = totalLiquidity.plus(pool.liquidity);
  }

  return toUSDTBalances(totalLiquidity.toFixed(2));
}

module.exports = {
  methodology: 'TVL counts the liquidity of WemixFi DEX. Data is pulled from:"https://openapi.wemix.fi/pool/info_list',
  wemix: {
    tvl: fetchLiquidity
  },
  misrepresentedTokens: true,
  timetravel: false,
}