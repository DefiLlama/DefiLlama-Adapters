const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { aaveChainTvl } = require("../helper/aave");
const { transformFantomAddress } = require("../helper/portedTokens");

const stakingContract = "0x49c93a95dbcc9A6A4D8f77E59c038ce5020e82f8";
const GEIST = "0xd8321aa83fb0a4ecd6348d4577431310a6e0814d";

const stakingContractPool2 = "0xE40b7FA6F5F7FB0Dc7d56f433814227AAaE020B5";
const GEIST_WFTM_spLP = "0x668AE94D0870230AC007a01B471D02b2c94DDcB9";

function lending(borrowed) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const transform = await transformFantomAddress();
    return aaveChainTvl(
      "fantom",
      "0x4CF8E50A5ac16731FA2D8D9591E195A285eCaA82",
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
  fantom: {
    tvl: lending(false),
    borrowed: lending(true),
    staking: staking(stakingContract, GEIST, "fantom"),
    pool2: pool2(stakingContractPool2, GEIST_WFTM_spLP, "fantom"),
  },
};
