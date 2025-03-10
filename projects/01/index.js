const { sumTokensExport } = require('../helper/solana')

// The sumTokensExport function is used to sum the tokens held in a specific Solana account.
module.exports = {
  hallmarks:[
    [1667865600, "FTX collapse"]
  ],
  timetravel: false,
  solana: {
    // The tvl function calculates the total value locked in the specified Solana account.
    tvl: sumTokensExport({ owner: 'HjHSNe8hhvZ8hKCRrhKg1DGiGPd9NYQbUjT1SQRDo4kZ' }),
  },
  // The methodology property explains how the TVL is calculated.
  methodology: `To obtain the tvl we're getting the vault accounts information where user deposited collateral is stored.`,
}
