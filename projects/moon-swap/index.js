const { get } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances');

const baseUrl = "https://moonswap.fi/api/route/opt/swap/dashboard/global-data";

async function tvl() {
  const response = (await get(baseUrl)).data;
  return toUSDTBalances(response.uniswapFactories[0].totalLiquidityUSD)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  conflux: {
    tvl,
  }
};
