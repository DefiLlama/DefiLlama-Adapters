const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
  timetravel: false,
  elrond: {
    tvl: sumTokensExport({ chain: 'elrond', owner: 'erd1qqqqqqqqqqqqqpgqmmxzmktd09gq0hldtczerlv444ykt3pz6avsnys6m9', })
  }
}