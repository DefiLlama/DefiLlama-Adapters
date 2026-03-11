const { getLiquityV2Tvl } = require('../helper/liquity')

const config = {
  arbitrum: '0x7f7fbc2711c0d6e8ef757dbb82038032dd168e68'
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getLiquityV2Tvl(config[chain])
  }
})