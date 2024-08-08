const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
  bsquared: {
    tvl: sumTokensExport({ owner: '0x5b1399B8b97fBC3601D8B60Cc0F535844C411Bd5', tokens: ['0x796e4D53067FF374B89b2Ac101ce0c1f72ccaAc2']})
  }
}