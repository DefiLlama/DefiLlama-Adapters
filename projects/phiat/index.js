const { staking } = require("../helper/staking");
const { aaveChainTvl } = require("../helper/aave");


const stakingContract = "0xeAa92F835757a8B3fA4cbCA3Db9D2Ea342651D44";
const PHIAT = "0x96e035ae0905efac8f733f133462f971cfa45db1";


function lending(borrowed) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const transform = (i) => `pulse:${i}`;
    return aaveChainTvl(
      "pulse",
      "0x9B979a359410544236343Dfa11b8e1401e4DdCd6",
      transform,
      undefined,
      borrowed
    )(timestamp, ethBlock, chainBlocks);
  };
}


module.exports = {
  timetravel: true,
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
  pulse: {
    tvl: lending(false),
    borrowed: lending(true),
    staking: staking(stakingContract, PHIAT, "pulse"),
  },
};
