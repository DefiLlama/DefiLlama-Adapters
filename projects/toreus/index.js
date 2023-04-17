const { staking } = require("../helper/staking");
const { aaveExports } = require("../helper/aave");

const stakingContract = "0x8634b181f937B279E76DDc9a00C914Aab8fE559f";
const TOREUS = "0x443aB8d6Ab303Ce28f9031BE91c19c6B92e59C8a";

module.exports = {
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
  kava: {
    ...aaveExports("kava", "0xE97a88d372b5c4b8F124176f03cb5c7502a28401"),
    staking: staking(stakingContract, TOREUS, "kava"),
  },
};