const { staking } = require("../helper/staking.js");
const { getLiquidityTvl, getFarmTvl, addresses } = require("./helper.js");

function tvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const block = chainBlocks[chain];
    const [liquidityTvl, farmTvl] = await Promise.all([
      getLiquidityTvl(chain, block),
      getFarmTvl(chain, block),
    ]);
    // console.log({
    //   liquidityTvl: liquidityTvl.toNumber(),
    //   farmTvl: farmTvl.toNumber(),
    // });
    return { tether: liquidityTvl.plus(farmTvl) };
  };
}

module.exports = {
  astar: {
    tvl: tvl("astar"),
    staking: staking(
      addresses.astar.seanStaking,
      addresses.astar.seanToken,
      "astar",
      "starfish-finance",
      18
    ),
  },
};
