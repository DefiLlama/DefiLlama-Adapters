const { sumTokensExport } = require('../helper/unwrapLPs')

const addresses = [
  '0x8283E74dA050F6eE93991Dfb0D823e35515Da8E8',
]

module.exports = {
  base: {
    tvl: sumTokensExport({
      owners: addresses,
      fetchCoValentTokens: true
    })
  }
}
