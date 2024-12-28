const { get } = require('../helper/http');
const { toUSDTBalances } = require('../helper/balances');

const blacklist = ['0xb008022F676a8918299E046c91Af65Fc06b52B1C','0xca907dD0044D673e878E08Af32E2Dc2AdC731369'];

async function tvl() {
  const data = await get('https://api.vexchange.io/v1/pairs');
  let balance = 0;

  Object.entries(data).forEach(([pairAddress, pair]) => {
    // Skip the blacklisted pair
    if (blacklist.includes(pairAddress)) return;

    if (pair.token0.usdPrice && pair.token1.usdPrice) {
      balance += +pair.token0Reserve * pair.token0.usdPrice;
      balance += +pair.token1Reserve * pair.token1.usdPrice;
    } else if (pair.token0.usdPrice) {
      balance += +pair.token0Reserve * pair.token0.usdPrice * 2;
    } else if (pair.token1.usdPrice) {
      balance += +pair.token1Reserve * pair.token1.usdPrice * 2;
    }
  });

  return toUSDTBalances(balance);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  vechain: {
    tvl,
  },
};
