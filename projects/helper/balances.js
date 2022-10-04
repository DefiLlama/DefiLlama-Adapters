const BigNumber = require("bignumber.js");

const usdtAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7";

const toUSDT = (value, times = 1e6) => BigNumber(value).times(times).toFixed(0);

const toUSDTBalances = (value, times = 1e6) => ({
  [usdtAddress]: toUSDT(value, times),
});

module.exports = {
  toUSDT,
  toUSDTBalances,
  usdtAddress,
};
