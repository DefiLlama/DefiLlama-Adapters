const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
  timetravel: false,
  methodology: 'Total amount of jUSDT locked in the StormTrade vault (EQDynReiCeK8xlKRbYArpp4jyzZuF6-tYfhFM0O5ulOs5H0L)',
  ton: {
    tvl: sumTokensExport({ owner: 'EQDynReiCeK8xlKRbYArpp4jyzZuF6-tYfhFM0O5ulOs5H0L' })
  }
}
