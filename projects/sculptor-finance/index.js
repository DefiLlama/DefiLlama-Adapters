const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { aaveChainTvl } = require("../helper/aave");
const { transformBscAddress } = require("../helper/portedTokens");

const stakingContract = "0xd4F7F739488f5C9930A60e85afbE26a8B71BA795";
const SCULPT = "0xAd3E02e83b886543D1171FF446C130D52068C106";

const stakingContractPool2 = "0x18542eEe45272a29BC572F0EdB727da4e3506DD2";
const SCULPT_BNB = "0xB1F3bE619648B4a2dF6ddaCFD42B051F21bF3dc8";

function lending(borrowed) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const transform = await transformBscAddress();
    return aaveChainTvl(
      "bsc",
      "0xa1eBB37b5A19050A192c38C82f25f4aBf0158F39",
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
  bsc: {
    tvl: lending(false),
    borrowed: lending(true),
    staking: staking(stakingContract, SCULPT, "bsc"),
    pool2: pool2(stakingContractPool2, SCULPT_BNB, "bsc"),
  },
};
