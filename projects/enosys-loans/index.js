const { getLiquityV2Tvl } = require('../helper/liquity')

const config = {
  flare: '0x9474206bc035D03d142264fd9913d1D51246d3AC',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getLiquityV2Tvl(config[chain])
  }
})