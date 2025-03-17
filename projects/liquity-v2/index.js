const { getLiquityV2Tvl } = require('../helper/liquity')

const config = {
  ethereum: '0xd99dE73b95236F69A559117ECD6F519Af780F3f7'
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getLiquityV2Tvl(config[chain])
  }
})