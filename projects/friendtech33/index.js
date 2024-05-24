const { staking } = require('../helper/staking')

module.exports = {
  base: {
    tvl: () => ({}),
    staking: staking('0x6F82D82e6FEcB6d0dAF08b8fFD9772d596582F4A', '0x3347453Ced85bd288D783d85cDEC9b01Ab90f9D8')
  }
}