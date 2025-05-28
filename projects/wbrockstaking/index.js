const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");

const stakingContract = "0x1a71F508d536c7Ab1D1B53a5D261abD494524C96";
const BITROCKETHstakingContract = "0x46363C31Be0c677Bd6F3eD429686753794ee8b97";

module.exports = {
  bitrock: {
    tvl: staking(stakingContract, ADDRESSES.bitrock.WBR),
  },
  ethereum: {
    tvl: staking(BITROCKETHstakingContract, ADDRESSES.bitrock.BR),
  },
  methodology: "Wrapped Bitrock tokens locked in staking contract",
};

