const ADDRESSES = require('../helper/coreAssets.json')
const {getLiquityTvl} = require('../helper/liquity')

const BNB_ADDRESS = ADDRESSES.bsc.WBNB;

// TroveManager holds total system collateral (deposited BNB)
const TROVE_MANAGER_ADDRESS = "0xb283466d09177c5C6507785d600caFDFa538C65C";

module.exports = {
  deadFrom: 1648765747,
  start: 1623145388,
  bsc: {
    tvl: getLiquityTvl(BNB_ADDRESS, TROVE_MANAGER_ADDRESS, "bsc")
  },
  
};
