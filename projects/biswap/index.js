const sdk = require("@defillama/sdk");
const tvlOnPairs = require("../helper/processPairs.js");

const factory = "0x858e3312ed3a876947ea49d572a7c42de08af7ee";

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await tvlOnPairs("bsc", chainBlocks, factory, balances);

  return balances;
};

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
};