const { sumTokensExport, nullAddress } = require('../helper/sumTokens')

module.exports = {
  tron: { tvl: sumTokensExport({ owner: 'TTfvyrAz86hbZk5iDpKD78pqLGgi8C7AAw', tokens: [nullAddress] }) }
}