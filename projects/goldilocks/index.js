const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  berachain: {
    tvl: sumTokensExport({ owner: '0xb7E448E5677D212B8C8Da7D6312E8Afc49800466', token: '0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce'})
  }
}