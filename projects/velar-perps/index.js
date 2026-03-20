const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens')

const config = {
  stacks: { owners: [
    'SP3YBY0BH4ANC0Q35QB6PD163F943FVFVDFM1SH7S.gl-core',
    'SP1SATBEBG20HT1J9YNEXN2SPT7Q82H29P8AXKF0K.gl-core',
    'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.gl-core',
    'SP1JZ89NV29EEGKJ10TH5ZQVRV9N9392FAQCMB5X8.gl-core',
  ] },
  bob: {
    ownerTokens: [
      [[ADDRESSES.bob.USDT, ADDRESSES.bob.WBTC], '0xaDF42f686bDF89B2B252c1A0681fE12BE13dB133']
    ]
  },
  mezo: {
    ownerTokens: [
      [[ADDRESSES.mezo.BTC, ADDRESSES.mezo.MUSD], '0xCCf7D09B9BC8Ce832E6CD71256FAd4208AAe2CcE']
    ]
  },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport(config[chain])
  }
})