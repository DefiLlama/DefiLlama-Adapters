const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
  bitcoin: { tvl: sumTokensExport({owner: '32ixEdVJWo3kmvJGMTZq5jAQVZZeuwnqzo'}) }
}