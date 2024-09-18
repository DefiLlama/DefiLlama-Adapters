const { sumTokensExport } = require('../helper/sumTokens')
const ADDRESSES = require("../helper/coreAssets.json");

const AQUA_ADDRESS = 'EQAWDyxARSl3ol2G1RMLMwepr3v6Ter5ls3jiAlheKshgg0K'

module.exports = {
  methodology: 'Total amount of collateral locked in the Aqua Protocol (EQAWDyxARSl3ol2G1RMLMwepr3v6Ter5ls3jiAlheKshgg0K)',
  start: 1726506000,
  ton: {
    tvl: sumTokensExport({ owner: AQUA_ADDRESS, tokens: [ADDRESSES.null]}),
  }
}
