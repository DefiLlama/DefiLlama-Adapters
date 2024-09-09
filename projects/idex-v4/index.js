const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  idex: {
    tvl: sumTokensExport({ owner: '0xF0b08bd86f8479a96B78CfACeb619cfFeCc5FBb5', tokens: [ADDRESSES.rari.USDC_e]}),
  }
}