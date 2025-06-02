const { lendingTvl, borrowTvl } = require("./moneyMarket");

module.exports = {
  start: '2020-10-07',
  methodology: "Sum floating balance and borrow for each token",
  bsc: {
    tvl: lendingTvl,
    borrowed: borrowTvl
  },
};