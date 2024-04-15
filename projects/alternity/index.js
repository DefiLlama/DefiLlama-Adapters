const { staking } = require("../helper/staking.js");
const { getLiquityTvl } = require("../helper/liquity");

// TroveManager holds total system collateral (deposited ETH)
const STAKING_ADDRESS = "0x424891f1D6D4De5c07B6E3F74B3709D6BD9E77ea";
const ALTR_ADDRESS = "0xD1ffCacFc630CE68d3cd3369F5db829a3ed01fE2"

module.exports = {
  start: 1692423851,
  ethereum: {
    tvl: getLiquityTvl('0x51c014510A5AdA43408b40D49eF52094014ef3A7'),
    staking: staking(STAKING_ADDRESS, ALTR_ADDRESS)
  }
};
