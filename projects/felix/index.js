const { getLiquityV2Tvl } = require('../helper/liquity')

const config = {
  hyperliquid: '0x9De1e57049c475736289Cb006212F3E1DCe4711B'
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getLiquityV2Tvl(config[chain])
  }
})