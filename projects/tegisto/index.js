const { staking } = require("../helper/staking")

module.exports = {
  kava: {
    tvl: () => 0,
    staking: staking('0x744Dd9f79b80437a9e5eb0292128045F51C48b6d', '0x87F1E00d6bcD3712031e5edD26DFcdB0FEd35D20', undefined, 'tegisto', 18),
  }
}