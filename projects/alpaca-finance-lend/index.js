const { tvl, borrowed } = require("./lend");

// node test.js projects/alpaca-finance-lend/index.js
module.exports = {
  start: '2020-10-07',
  methodology: "Sum floating balance and vaultDebtValue in each vault",
  bsc: { tvl, borrowed, },
  fantom: { tvl, borrowed, },
};
