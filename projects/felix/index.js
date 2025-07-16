const { getLiquityV2Tvl } = require('../helper/liquity')
const { staking } = require("../helper/staking");

module.exports = {
  hyperliquid: {
    tvl: getLiquityV2Tvl('0x9De1e57049c475736289Cb006212F3E1DCe4711B')
  },
  ethereum: {
    tvl: staking('0x36f586A30502AE3afb555b8aA4dCc05d233c2ecE', '0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b')

  }
}