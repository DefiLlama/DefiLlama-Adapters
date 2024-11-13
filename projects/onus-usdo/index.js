const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  onus: {
    tvl: sumTokensExport({ owner: '0x3D513abc13f53A1E18Ae59A7B5B0930E55733C87', tokens: [ADDRESSES.onus.BUSD]})
  }
}