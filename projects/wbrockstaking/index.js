const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");

const WBROCK = ADDRESSES.bitrock.WBR;
const stakingContract = "0x1a71F508d536c7Ab1D1B53a5D261abD494524C96";
const BITROCKETH = ADDRESSES.bitrock.BR;
const BITROCKETHstakingContract = "0x46363C31Be0c677Bd6F3eD429686753794ee8b97";

module.exports = {
  bitrock: {
    tvl: staking(stakingContract, WBROCK, "bitrock"),
  },
  ethereum: {
    tvl: staking(BITROCKETHstakingContract, BITROCKETH, "ethereum"),
  },
  
  methodology: "Wrapped Bitrock tokens locked in staking contract",
};

