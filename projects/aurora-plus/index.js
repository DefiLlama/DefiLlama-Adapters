const { staking } = require("../helper/staking");

const AURORA = "0x8bec47865ade3b172a928df8f990bc7f2a3b9f79";
const stakingContract = "0xf075c896cbbb625e7911e284cd23ee19bdccf299";

module.exports = {
  aurora: {
    tvl: staking(stakingContract, AURORA, "aurora"),
  },
  methodology: "Aurora tokens locked in staking contract",
};

