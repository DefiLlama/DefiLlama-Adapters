const { getLiquityV2Tvl } = require('../helper/liquity')

const config = {
  scroll: '0xcc4f29f9d1b03c8e77fc0057a120e2c370d6863d'
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getLiquityV2Tvl(config[chain])
  }
})