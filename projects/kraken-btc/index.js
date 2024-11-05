const { sumTokensExport } = require('../helper/sumTokens')

// https://www.kraken.com/kbtc
module.exports = {
  bitcoin: { tvl: sumTokensExport({ owners: ['bc1qqwf6hexnnswmj6yuhz5xyj20frtp8exv7mclck'] }) }
}