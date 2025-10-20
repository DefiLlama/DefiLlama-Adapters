const { getLiquityV2Tvl } = require('../helper/liquity')

const config = {
  ethereum: '0x5e159fAC2D137F7B83A12B9F30ac6aB2ba6d45E7'
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getLiquityV2Tvl(config[chain])
  }
})