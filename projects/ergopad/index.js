const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
  timetravel: false,
  ergo: {
    tvl: () => ({}),
    staking: sumTokensExport({
      owners: [
        '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',
      ]
    })
  },
}
