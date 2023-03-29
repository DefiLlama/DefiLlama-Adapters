const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
  timetravel: false,
  elrond: {
    tvl: sumTokensExport({ chain: 'elrond', owner: 'erd1qqqqqqqqqqqqqpgqawkm2tlyyz6vtg02fcr5w02dyejp8yrw0y8qlucnj2', })
  }
}