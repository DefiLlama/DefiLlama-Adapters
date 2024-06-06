const {getLiquityTvl} = require('../helper/liquity')

const TROVE_MANAGER_ADDRESS = "0xb283466d09177c5C6507785d600caFDFa538C65C";

module.exports = {
  deadFrom: 1648765747,
  start: 1623145388,
  bsc: {
    tvl: getLiquityTvl(TROVE_MANAGER_ADDRESS)
  },
};
