const { getLiquityTvl } = require("../helper/liquity.js");

// TroveManager holds total system collateral (deposited ETH)
const TROVE_MANAGER_ADDRESS = "0x94AfB503dBca74aC3E4929BACEeDfCe19B93c193"

module.exports = {
  start: '2025-05-12',
  mezo: {
    tvl: getLiquityTvl(TROVE_MANAGER_ADDRESS),
  }
}