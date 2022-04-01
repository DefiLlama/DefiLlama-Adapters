const sdk = require("@defillama/sdk");
const tvlOnPairs = require("../helper/processPairs.js");

/* There is a farming portion, where their own lp tokens  
*  are deposited in the farming contracts to earn CSS, but
*  it will be double counting the same tvl coming from the pool contracts
*/

const factory = "0xC2D8d27F3196D9989aBf366230a47384010440c0";

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await tvlOnPairs("bsc", chainBlocks, factory, balances);

  return balances;
};

module.exports = {
  methodology: 'TVL counts the liquidity of the DEX. The factory address(0xC2D8d27F3196D9989aBf366230a47384010440c0) is used to find every LP pair that has been created.',
  bsc: {
    tvl: bscTvl,
  },
};
