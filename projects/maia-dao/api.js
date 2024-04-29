const { staking } = require('../helper/staking')

module.exports = {
  metis: {
    tvl: () => 0,
    staking: staking('0xD7a586CE5250bEfaB2cc2239F7226B9602536E6A', '0x72c232D56542Ba082592DEE7C77b1C6CFA758BCD')
  }
}