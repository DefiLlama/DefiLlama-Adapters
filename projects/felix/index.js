const { getLiquityV2Tvl } = require('../helper/liquity')

module.exports = {
  hyperliquid: {
    tvl: getLiquityV2Tvl('0x9De1e57049c475736289Cb006212F3E1DCe4711B')
  },
}