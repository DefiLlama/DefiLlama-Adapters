const { sumTokensExport, } = require('../helper/solana')

module.exports = {
  timetravel: false, 
  solana: {
    tvl: sumTokensExport({ owner: '37YxD3yze3v92pFdER4X5ymUbLSmRoMP99WDgA18Gt8k' }),
  },
  deadFrom: '2022-11-13',
  methodology: 'TVL consists of staked tokens',
}
