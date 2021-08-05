const sdk = require("@defillama/sdk");
const tvlOnPairs = require("../helper/processPairs.js");

const factory = "0x670f55c6284c629c23baE99F585e3f17E8b9FC31";

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await tvlOnPairs("bsc", chainBlocks, factory, balances);

  return balances;
};

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  
}
