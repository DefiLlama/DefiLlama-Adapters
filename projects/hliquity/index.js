const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking.js");
const { getLiquityTvl } = require("../helper/liquity");

// TroveManager holds total system collateral (deposited HBAR)
const TROVE_MANAGER_ADDRESS = "0x00000000000000000000000000000000005c9f66";
const STAKING_ADDRESS = "0x00000000000000000000000000000000005c9f30";
const HLQT_ADDRESS = ADDRESSES.hedera.HLQT

module.exports = {
  start: '2024-06-05',  //start date; when protocol went live
  methodology: 'Total deposits of HBAR for borrowed HCHF',
  hedera: {
    tvl: getLiquityTvl(TROVE_MANAGER_ADDRESS),
    staking: staking(STAKING_ADDRESS, HLQT_ADDRESS)
  }
};
