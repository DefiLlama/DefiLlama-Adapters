const { staking } = require("../helper/staking");
const { aaveChainTvl } = require("../helper/aave");
const { transformArbitrumAddress } = require("../helper/portedTokens");

const stakingContract = "0xc2054A8C33bfce28De8aF4aF548C48915c455c13";
const RADIANT = "0x0C4681e6C0235179ec3D4F4fc4DF3d14FDD96017";

function lending(borrowed) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const transform = await transformArbitrumAddress();
    return aaveChainTvl(
      "arbitrum",
      "0x7BB843f889e3a0B307299c3B65e089bFfe9c0bE0",
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
  arbitrum: {
    tvl: lending(false),
    borrowed: lending(true),
    staking: staking(stakingContract, RADIANT, "arbitrum"),
  },
};
