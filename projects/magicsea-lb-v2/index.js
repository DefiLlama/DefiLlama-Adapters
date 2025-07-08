const { joeV2Export } = require('../helper/traderJoeV2')

module.exports = joeV2Export({
  // shimmer_evm: '0xEE0616a2DEAa5331e2047Bc61E0b588195A49cEa', // excluded since tvl is already counted in swapline
  iotaevm: '0x8Cce20D17aB9C6F60574e678ca96711D907fD08c'
})