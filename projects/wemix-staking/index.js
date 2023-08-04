const ADDRESSES = require("../helper/coreAssets.json");
const { staking } = require("../helper/staking");

const wwemix = ADDRESSES.wemix.WWEMIX;
const stakingContract = "0x6F3f44B0Cf7C751f2a44Faf6bFdd08e499Eb0973";

module.exports = {
  wemix: {
    tvl: staking(stakingContract, wwemix),
  },
};
