const terra = require("./terra.js");

module.exports = {
  timetravel: false,
  methodology: "We query Steak smart contracts to get the amount of tokens staked, then use CoinGecko to price them in USD.",
  terra,
  hallmarks:[
    [1651881600, "UST depeg"],
  ]
};
