const { staking } = require("../helper/staking.js");
const { getLiquidityTvl, addresses } = require("./helper.js");

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  return getLiquidityTvl(api)
}

module.exports = {
  astar: {
    tvl,
    staking: staking(addresses.astar.seanStaking, addresses.astar.seanToken,),
  },
};
