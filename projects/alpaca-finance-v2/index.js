const {lendingTvl, borrowTvl} = require("./moneyMarket");


module.exports = {
    start: 1602054167,
    timetravel: true,
    doublecounted: false,
    methodology: "Sum floating balance and borrow for each token",
    bsc: {
      tvl: lendingTvl,
      borrowed: borrowTvl
    },
  };