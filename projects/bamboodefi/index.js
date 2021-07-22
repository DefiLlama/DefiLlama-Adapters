const sdk = require("@defillama/sdk");
const tvlOnPairs = require("../helper/processPairs.js");

const factoryETH = "0x3823Ac41b77e51bf0E6536CE465479cBdedcaEa9";
const factoryBSC = "0xFC2604a3BCB3BA6016003806A288E7aBF75c8Aa3";

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await tvlOnPairs("bsc", chainBlocks, factoryBSC, balances);

  return balances;
};

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
  
    await tvlOnPairs("ethereum", chainBlocks, factoryETH, balances);
  
    return balances;
  };

module.exports = {
  bsc: {
    tvl: bscTvl, //   individually outputs >1B    ---   breakdown per token             (OK)
  },
  ethereum: {
    tvl: ethTvl, //   individually outputs >1B    ---   breakdown per token             (OK)
  },
  tvl: sdk.util.sumChainTvls([bscTvl, ethTvl]),
};
