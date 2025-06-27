const { getLiquityV2Tvl } = require('../helper/liquity')
const { mergeExports } = require('../helper/utils')

const config = {
  scroll: [
    '0xcc4f29f9d1b03c8e77fc0057a120e2c370d6863d', 
    '0x358d90036e70542ae24b3813c0efecc1f8811442'
  ]
}

const premerged = []
Object.keys(config).map(chain => config[chain].map(
  provider => premerged.push({
    [chain]: { 
      tvl: getLiquityV2Tvl(provider) 
    }
  })
))

module.exports = mergeExports(premerged)