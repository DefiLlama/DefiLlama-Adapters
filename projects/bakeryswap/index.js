const sdk = require("@defillama/sdk");
const tvlOnPairs = require("../helper/processPairs.js");

const factory = "0x01bF7C66c6BD861915CdaaE475042d3c4BaE16A7";

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await tvlOnPairs("bsc", chainBlocks, factory, balances);

  return balances;
};

module.exports = {
  bsc: {
    tvl: bscTvl, //   individually outputs >1B    ---   breakdown per token             (OK)
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
};
