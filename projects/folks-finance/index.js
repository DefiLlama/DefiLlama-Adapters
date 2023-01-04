const { v1TvlUsdt, v1BorrowedBalancesUsdt } = require("./v1");

/* Get total deposits */
async function tvl() {
  const v1Tvl = await v1TvlUsdt();

  return v1Tvl;
}

async function borrowedBalances() {
  const v1BorrowedBalances = await v1BorrowedBalancesUsdt();

  return v1BorrowedBalances;
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  algorand: {
    tvl,
    borrowed: borrowedBalances,
  },
};
