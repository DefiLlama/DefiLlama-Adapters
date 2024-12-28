const { get } = require('../helper/http')
const BigNumber = require("bignumber.js");
const { toUSDTBalances } = require('../helper/balances')

const APIs = {
  rings: 'https://rings-api.pando.im/api/v1/statistic/markets/all/overview',
}

async function tvl() {
  const data = await get(APIs.rings)
  let sum = new BigNumber(data.total_supply).minus(data.total_borrow);
  return toUSDTBalances(sum);
}

async function borrowed() {
    const data = await get(APIs.rings)
    let borrowed = new BigNumber(data.total_borrow)
    return toUSDTBalances(borrowed);
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  mixin: {
    tvl,
    borrowed: borrowed
  }
}