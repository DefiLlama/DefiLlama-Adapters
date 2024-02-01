const { toUSDTBalances } = require("../helper/balances");
const { v1TvlUsd, v1BorrowedBalancesUsd } = require("./v1");
const { v2BorrowedBalancesUsd, v2TvlUsd } = require("./v2");

/* Get total deposits */
async function tvl() {
  const v1Tvl = await v1TvlUsd();
  const v2Tvl = await v2TvlUsd();

  return toUSDTBalances(v1Tvl + v2Tvl);
}

async function borrowedBalances() {
  const v1BorrowedBalances = await v1BorrowedBalancesUsd();
  const v2BorrowedBalances = await v2BorrowedBalancesUsd();

  return toUSDTBalances(v1BorrowedBalances + v2BorrowedBalances);
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  algorand: {
    tvl,
    borrowed: borrowedBalances,
  },
};
