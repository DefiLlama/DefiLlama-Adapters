const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
  timetravel: false,
  qubic: {
    tvl: sumTokensExport({ owners: ['BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARMID'] }),
  },
}
