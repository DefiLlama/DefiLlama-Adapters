const { lendingTvl, borrowTvl } = require("./moneyMarket");

module.exports = {
  start: 1602054167,
  methodology: "Sum floating balance and borrow for each token",
  bsc: {
    tvl: lendingTvl,
    borrowed: borrowTvl
  },
};