const { staking } = require('../helper/staking')
module.exports = {
  base: {
    tvl: () => ({}),
    staking: staking('0x042Fef60aD51f48C65E6106F9b950178910A3300', '0x3B9728bD65Ca2c11a817ce39A6e91808CceeF6FD'),
  }
}
