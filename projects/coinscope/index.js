const { tvlByNetwork, poolByNetwork } = require("./helpers");

module.exports = {
  methodology:
    "TVL is calculated by summing the values of tokens or LP tokens held in lockers for a specific network. The methodology involves retrieving token and LP token data from the locker factory contract, splitting the data into individual tokens or LP tokens and corresponding locker addresses, and then summing their balances.",
  bsc: {
    tvl: tvlByNetwork("bsc"),
    pool2: poolByNetwork("bsc"),
  },
};
