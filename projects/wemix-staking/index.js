const ADDRESSES = require("../helper/coreAssets.json");
const { staking } = require("../helper/staking");
const { nullAddress } = require("../helper/unwrapLPs");

const wwemix = ADDRESSES.wemix.WWEMIX;
const stakingContractDIOS = "0x6F3f44B0Cf7C751f2a44Faf6bFdd08e499Eb0973";
const stakingContractGRAND = "0xBEd789c6008F788a28fc222C83082D67033Daf7F"


module.exports = {
  hallmarks: [
    [1687478400,"WONDER Staking Live"]
  ],
  wemix: {
    tvl: staking([stakingContractDIOS, stakingContractGRAND],[wwemix, nullAddress]),
  },
};
