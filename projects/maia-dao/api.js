const { staking } = require('../helper/staking')

module.exports = {
  metis: {
    tvl: () => 0,
    staking: staking('0xD7a586CE5250bEfaB2cc2239F7226B9602536E6A', '0x72c232D56542Ba082592DEE7C77b1C6CFA758BCD')
  },
  arbitrum: {
    staking: staking('0x000000f0C01c6200354f240000b7003668B4D080', '0x00000000ea00F3F4000e7Ed5Ed91965b19f1009B'), // v2
  },
}