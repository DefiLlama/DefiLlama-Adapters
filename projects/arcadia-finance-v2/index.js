const { tvl } = require("./helper");

module.exports = {
  methodology:
    "TVL includes all assets within Accounts and the balance of the liquidity pools.",
  base: { tvl },
  start: 1711389600, // Mon Mar 25 2024 18:00:00 GMT+0000
  hallmarks: [
    [Math.floor(new Date("2024-04-03") / 1e3), "Points program announced."],
  ],
};
