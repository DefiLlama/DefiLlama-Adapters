const { getLiquityV2Tvl } = require('../helper/liquity')

const config = {
  ethereum: '0x1ec9287465ef04a7486779e81370c15624c939e8'
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getLiquityV2Tvl(config[chain])
  }
})
