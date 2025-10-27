const { getLiquityV2Tvl } = require('../helper/liquity')

const config = {
  ethereum: '0x5e159fAC2D137F7B83A12B9F30ac6aB2ba6d45E7',
  plasma: '0x602096a2f43b43d11dcb3713702dda963c45adc6',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getLiquityV2Tvl(config[chain])
  }
})