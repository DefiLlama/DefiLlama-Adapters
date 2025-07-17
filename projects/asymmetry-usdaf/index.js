const { getLiquityV2Tvl } = require('../helper/liquity')

const config = {
  ethereum: '0xCFf0DcAb01563e5324ef9D0AdB0677d9C167d791'
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getLiquityV2Tvl(config[chain])
  }
})