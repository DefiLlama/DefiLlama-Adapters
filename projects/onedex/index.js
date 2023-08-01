const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
  timetravel: false,
  elrond: {
    tvl: sumTokensExport({ owner: 'erd1qqqqqqqqqqqqqpgqqz6vp9y50ep867vnr296mqf3dduh6guvmvlsu3sujc', }),
  },
};