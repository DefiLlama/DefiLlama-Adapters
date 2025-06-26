const { getLiquityV2Tvl } = require('../helper/liquity')
const { mergeExports } = require('../helper/utils')

const config = {
  ethereum: '0xd99dE73b95236F69A559117ECD6F519Af780F3f7'
}
const exportsV1 = {}
const exportsV2 = {}

Object.keys(config).forEach(chain => {
  exportsV1[chain] = {
    tvl: getLiquityV2Tvl(config[chain])
  }
})

const configV2 = {
  ethereum: '0xf949982b91c8c61e952b3ba942cbbfaef5386684',
}
Object.keys(configV2).forEach(chain => {
  exportsV2[chain] = {
    tvl: getLiquityV2Tvl(configV2[chain])
  }
})


module.exports = mergeExports([exportsV1, exportsV2])

module.exports.hallmarks = [
  ["2025-02-12", "Issue found in contracts"],
  ["2025-05-19", "Liquity V2 relaunch"]
]
