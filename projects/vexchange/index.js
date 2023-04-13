const { get } = require('../helper/http')
const { toUSDTBalances } = require('../helper/balances');

async function tvl() {
  const data = await get('https://api.vexchange.io/v1/pairs')
  let balance = 0
  Object.values(data).forEach(pair => {
    if (pair.token0.usdPrice && pair.token1.usdPrice) {
      balance += +pair.token0Reserve * pair.token0.usdPrice
      balance += +pair.token1Reserve * pair.token1.usdPrice
    } else if (pair.token0.usdPrice) {
      balance += +pair.token0Reserve * pair.token0.usdPrice * 2
    }else if (pair.token1.usdPrice) {
      balance += +pair.token1Reserve * pair.token1.usdPrice * 2
    }
  })
  return toUSDTBalances(balance)
}
module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  vechain: {
    tvl
  }
};