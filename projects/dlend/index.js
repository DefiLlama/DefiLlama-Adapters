const { dLendTvl, dLendBorrowed } = require('../dtrinity/helper');

module.exports = {
  fraxtal: {
    tvl: dLendTvl,
    borrowed: dLendBorrowed
  },
  methodology: "Includes total supplied liquidity plus total debt.",
  hallmarks: []
};