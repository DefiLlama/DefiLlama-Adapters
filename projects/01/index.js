const { sumTokensExport } = require('../helper/solana')

module.exports = {
  hallmarks:[
    [1667865600, "FTX collapse"]
  ],
  timetravel: false,
  solana: {
    tvl: sumTokensExport({ owner: 'HjHSNe8hhvZ8hKCRrhKg1DGiGPd9NYQbUjT1SQRDo4kZ' }),
  },
  methodology: `To obtain the tvl we're getting the vault accounts information where user deposited collateral is stored.`,
}
