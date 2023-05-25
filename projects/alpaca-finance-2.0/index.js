const {lendingTvl, borrowTvl} = require("./moneyMarket");

async function lendingCal(ts, _, _1, {api}) {
  return await lendingTvl(api.block, api.chain)
}

async function borrowCal(ts, _, _1, {api}) {
  return await borrowTvl(api.block, api.chain)
}

module.exports = {
    start: 1602054167,
    timetravel: true,
    doublecounted: false,
    methodology: "Sum floating balance and borrow for each token",
    bsc: {
      tvl: lendingCal,
      borrowed: borrowCal
    },
  };