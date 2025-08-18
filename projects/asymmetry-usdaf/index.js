const { getLiquityV2Tvl } = require('../helper/liquity')
const { mergeExports } = require('../helper/utils')

const config = {
  ethereum: '0xCFf0DcAb01563e5324ef9D0AdB0677d9C167d791'
}
const exportsV1 = {}
const exportsV2 = {}

Object.keys(config).forEach(chain => {
  exportsV1[chain] = {
    tvl: getLiquityV2Tvl(config[chain])
  }
})

const configV2 = {
  ethereum: '0x33D68055Cd54061991B2e98b9ab326fFCE4d60Fe',
}
Object.keys(configV2).forEach(chain => {
  exportsV2[chain] = {
    tvl: getLiquityV2Tvl(configV2[chain])
  }
})

module.exports = mergeExports([exportsV1, exportsV2])