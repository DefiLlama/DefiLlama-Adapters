const { tvl, borrowed } = require("./lend");

// node test.js projects/alpaca-finance-lend/index.js
module.exports = {
  start: 1602054167,
  methodology: "Sum floating balance and vaultDebtValue in each vault",
  bsc: { tvl, borrowed, },
  fantom: { tvl, borrowed, },
};
