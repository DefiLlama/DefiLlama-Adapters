const { getLiquityTvl } = require("../helper/liquity");

const TROVE_MANAGER_ADDRESS = {
  "linea": "0xE06F4754e94E2b6A462E616Ca3Ec78c6f4674A61",
  "neon_evm": "0x24c36094aB3C4Ca62252d3bFA47599E668187669",
}

module.exports = {
  start: '2023-11-14', // Tuesday, November 14, 2023 10:13:20 PM
};

Object.keys(TROVE_MANAGER_ADDRESS).forEach(chain => {
  module.exports[chain] = {
    tvl: getLiquityTvl(TROVE_MANAGER_ADDRESS[chain])
  }
})