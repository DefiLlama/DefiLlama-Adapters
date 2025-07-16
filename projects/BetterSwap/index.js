const { get } = require('../helper/http');
const { toUSDTBalances } = require('../helper/balances');

async function tvl() {
  const factoryAddress = '0x5970dcbebac33e75eff315c675f1d2654f7bf1f5';
  const data = await get(`https://www.betterswap.io/api/tvl/${factoryAddress}`);

  return toUSDTBalances(data.tvlUsd);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  vechain: {
    tvl,
  },
};
