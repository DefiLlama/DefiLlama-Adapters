const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  idex: {
    tvl: sumTokensExport({ owners: ['0xF0b08bd86f8479a96B78CfACeb619cfFeCc5FBb5', '0xEE5eB68fa8D213BF12Ed9C21B9d4a04912E569aC'], tokens: [ADDRESSES.rari.USDC_e, '0xD56768A659D4c7e2a0a18b6D96F1f74Ce3566b97',] }),
  }
}