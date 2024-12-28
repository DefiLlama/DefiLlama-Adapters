const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
  timetravel: false,
  elrond: {
    tvl: sumTokensExport({ owner: 'erd1qqqqqqqqqqqqqpgqr8z5hkwek0pmytcvla86qjusn4hkufjlrp8s7hhkjk', })
  }
}