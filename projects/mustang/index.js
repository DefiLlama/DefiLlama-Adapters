const { getLiquityV2Tvl } = require('../helper/liquity')

const config = {
  saga: '0xF39bdCfB55374dDb0948a28af00b6474A566Ac22'
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getLiquityV2Tvl(config[chain])
  }
})