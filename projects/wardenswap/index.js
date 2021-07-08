const sdk = require("@defillama/sdk");
const tvlOnPairs = require("../helper/processPairs.js");

const factory = "0x3657952d7bA5A0A4799809b5B6fdfF9ec5B46293";
// Masterchef has not been included since they're staking their own LP token from the pools

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
