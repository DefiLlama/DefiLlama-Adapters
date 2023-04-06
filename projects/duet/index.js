const chains = ["bsc", "arbitrum"];
module.exports = {
  // methodology: "TVL is the sum of the USD value of all tokens in the staking pool"
};

chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: require(`./${chain}`)
  };
});
