const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  base: {
    tvl: sumTokensExport({ owner: '0x32C222A9A159782aFD7529c87FA34b96CA72C696', tokens: [ADDRESSES.base.USDC] })
  }
}
