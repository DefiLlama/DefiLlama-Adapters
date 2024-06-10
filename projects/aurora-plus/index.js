const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");

const AURORA = ADDRESSES.aurora.AURORA;
const stakingContract = "0xf075c896cbbb625e7911e284cd23ee19bdccf299";

module.exports = {
  aurora: {
    tvl: staking(stakingContract, AURORA),
  },
  methodology: "Aurora tokens locked in staking contract",
};

