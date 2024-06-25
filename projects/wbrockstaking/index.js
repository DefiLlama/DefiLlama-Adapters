const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");

const WBROCK = ADDRESSES.bitrock.WBR;
const stakingContract = "0x1a71F508d536c7Ab1D1B53a5D261abD494524C96";

module.exports = {
  bitrock: {
    tvl: staking(stakingContract, WBROCK, "bitrock"),
  },
  methodology: "Wrapped Bitrock tokens locked in staking contract",
};

