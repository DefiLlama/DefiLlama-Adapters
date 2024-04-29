const { staking } = require("../helper/staking");
const { aaveExports, methodology, } = require("../helper/aave");

const stakingContract = "0x2911c3a3b497Af71aAcbB9B1E9FD3ee5D50f959D";
const TOREUS = "0x8549724fcC84ee9ee6c7A676F1Ba2Cc2f43AAF5B";

module.exports = {
  methodology,
  kava: {
    ...aaveExports("kava", "0xcCe311383b0f4A41c82D8d03a1f4214A3c8E70Bd"),
    staking: staking(stakingContract, TOREUS),
  },
};