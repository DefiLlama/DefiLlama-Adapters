const sdk = require("@defillama/sdk");
const tvlOnPairs = require("../helper/processPairs.js");

const factoryBSC = "0xb5b4aE9413dFD4d1489350dCA09B1aE6B76BD3a8";

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  await tvlOnPairs("bsc", chainBlocks, factoryBSC, balances);
  return balances;
};


module.exports = {
  bsc: {
    tvl: bscTvl, 
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
  methodology: 'TVL counts the liquidity in each of the Tendie swap pairs. Pairs are found using the factory address'
};