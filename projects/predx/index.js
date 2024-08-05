const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
  zklink: {
    tvl: sumTokensExport({
      owners: ["0x986Ca3A4F05AA7EA5733d81Da6649043f43cB9A8"],
      tokens: ["0x2F8A25ac62179B31D62D7F80884AE57464699059"]
    }),
  },
}