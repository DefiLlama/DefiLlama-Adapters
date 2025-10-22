const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: '0x5Dc76fD132354be5567ad617fD1fE8fB79421D82', fetchCoValentTokens: true, })
  }
}