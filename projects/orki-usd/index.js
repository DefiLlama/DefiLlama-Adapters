const { getLiquityV2Tvl } = require('../helper/liquity')

const config = {
  swellchain: '0xce9f80a0dcd51fb3dd4f0d6bec3afdcaea10c912'
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getLiquityV2Tvl(config[chain])
  }
})