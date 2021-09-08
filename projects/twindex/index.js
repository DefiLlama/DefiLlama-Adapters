const sdk = require("@defillama/sdk");
const tvlOnPairs = require("../helper/processPairs.js");

const factory = "0x4E66Fda7820c53C1a2F601F84918C375205Eac3E";
// Masterchef has not been included since they're staking their own LP token from the pools

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await tvlOnPairs("bsc", chainBlocks, factory, balances);

  return balances;
};

module.exports = {
  
    tvl: bscTvl,
  
};
