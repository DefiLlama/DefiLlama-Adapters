const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')


module.exports = {
  methodology: 'USDM in the vault',
  megaeth: {
    tvl: sumTokensExport({ tokens: [ADDRESSES.megaeth.USDm], owner: '0xdf8248fee58e791149e69f6c61129D471EaFC11E' })
  }
}