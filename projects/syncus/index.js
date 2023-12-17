const { ohmTvl } = require("../helper/ohm");

const stakingAddress = "0xc738CDb5140d6b7F688ba05a25c8a51568622D96";
const syncAddress = "0xa41d2f8Ee4F47D3B860A149765A7dF8c3287b7F0";
const treasuryAddress = "0xC00EC94e7746C6b695869580d6D2DB50cda86094";
const treasuryTokens = [
  ["0x197d7010147df7b99e9025c724f13723b29313f8", true], // SYNC/ETH LP
];

module.exports = {
  ...ohmTvl(
    treasuryAddress,
    treasuryTokens,
    "ethereum",
    stakingAddress,
    syncAddress
  ),
  methodology:
    "Tracks the amount of SYNC staked in the Staking contract & reserve tokens held in the Treasury contract",
};
