const { staking } = require("../helper/staking.js");
const { getLiquityTvl } = require("../helper/liquity");

// TroveManager holds total system collateral (deposited in HBAR)
const TROVE_MANAGER_ADDRESS = "0x00000000000000000000000000000000005c9f66";
const STAKING_ADDRESS = "0x00000000000000000000000000000000005c9f30";
const HLQT_ADDRESS = "0x00000000000000000000000000000000005c9f70"

module.exports = {
  methodology: 'Total deposits of HBAR for borrowed HCHF',
  hedera: { tvl: getLiquityTvl('0x00000000000000000000000000000000005c9f66')}
};
