const { staking } = require("../helper/staking");
const { aaveExports } = require("../helper/aave");

const stakingContract = "0x2911c3a3b497Af71aAcbB9B1E9FD3ee5D50f959D";
const TOREUS = "0x8549724fcC84ee9ee6c7A676F1Ba2Cc2f43AAF5B";

module.exports = {
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
  kava: {
    ...aaveExports("kava", "0xcCe311383b0f4A41c82D8d03a1f4214A3c8E70Bd"),
    staking: staking(stakingContract, TOREUS, "kava"),
  },
};